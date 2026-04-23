use std::collections::HashMap;
use std::fs;
use std::path::{Component, Path, PathBuf};
use std::sync::Mutex;
use std::time::{SystemTime, UNIX_EPOCH};

use serde::Serialize;
use tauri::State;

const MAX_TEXT_FILE_BYTES: u64 = 1_048_576;
const SKIP_DIR_NAMES: &[&str] = &["node_modules", ".git", ".DS_Store"];

// Bound the RecentWrites map: entries older than this are dropped on record().
// Must be comfortably larger than the watcher echo grace window (500 ms) so
// legitimate self-echos are still detected.
const RECENT_WRITE_KEEP_MS: u128 = 2_000;

#[derive(Default)]
pub struct RecentWritesState(pub Mutex<HashMap<String, u128>>);

impl RecentWritesState {
    pub fn record(&self, absolute_path: &Path) {
        let Ok(mut guard) = self.0.lock() else {
            return;
        };
        let now = now_ms();
        let cutoff = now.saturating_sub(RECENT_WRITE_KEEP_MS);
        guard.retain(|_, ts| *ts >= cutoff);
        guard.insert(canonical_key(absolute_path), now);
    }

    pub fn was_recent(&self, absolute_path: &Path, within_ms: u128) -> bool {
        let Ok(guard) = self.0.lock() else {
            return false;
        };
        match guard.get(&canonical_key(absolute_path)) {
            Some(stamp) => now_ms().saturating_sub(*stamp) <= within_ms,
            None => false,
        }
    }

    pub fn clear(&self) {
        let Ok(mut guard) = self.0.lock() else {
            return;
        };
        guard.clear();
    }
}

// Normalise path strings so that `record` and `was_recent` (and the watcher's
// event path) end up with byte-identical keys. On Windows, `canonicalize`
// prepends the `\\?\` verbatim prefix; without going through it, a path
// produced by `PathBuf::from("C:\\…")` never matches the canonical form emitted
// by notify-debouncer-mini. If canonicalize fails (e.g., the file was just
// deleted) we fall back to the raw path — both sides will fall back the same
// way, so lookups still agree.
fn canonical_key(path: &Path) -> String {
    std::fs::canonicalize(path)
        .unwrap_or_else(|_| path.to_path_buf())
        .to_string_lossy()
        .to_string()
}

fn now_ms() -> u128 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_millis())
        .unwrap_or(0)
}

#[derive(Serialize)]
pub struct ListedFile {
    #[serde(rename = "relPath")]
    rel_path: String,
    bytes: u64,
    kind: &'static str,
    binary: bool,
}

fn canonicalise(path: &str) -> Result<PathBuf, String> {
    let p = PathBuf::from(path);
    p.canonicalize().map_err(|e| format!("canonicalize failed for {path}: {e}"))
}

fn validate_rel(rel: &str) -> Result<PathBuf, String> {
    if rel.is_empty() || rel == "/" {
        return Err("rel_path is empty".into());
    }
    if !rel.starts_with('/') {
        return Err("rel_path must start with '/'".into());
    }
    if rel.contains('\\') {
        return Err("rel_path must use forward slashes".into());
    }
    let trimmed = rel.trim_start_matches('/');
    let pb = PathBuf::from(trimmed);
    for comp in pb.components() {
        match comp {
            Component::Normal(_) => {}
            _ => return Err(format!("rel_path contains illegal component: {rel}")),
        }
    }
    Ok(pb)
}

fn resolve_inside(project_path: &str, rel_path: &str) -> Result<(PathBuf, PathBuf), String> {
    let root = canonicalise(project_path)?;
    let rel = validate_rel(rel_path)?;
    let joined = root.join(&rel);
    let parent = joined.parent().unwrap_or(&root).to_path_buf();
    if parent.exists() {
        let canonical_parent = parent
            .canonicalize()
            .map_err(|e| format!("canonicalize parent failed: {e}"))?;
        if !canonical_parent.starts_with(&root) {
            return Err("path escapes project root".into());
        }
    }
    Ok((root, joined))
}

fn default_projects_root_raw() -> Result<PathBuf, String> {
    let docs = dirs::document_dir().ok_or("could not resolve Documents directory")?;
    Ok(docs.join("WeCode"))
}

// Canonicalized WeCode root, creating it on the fly if absent so canonicalize
// succeeds. Used as the anchor for destructive path checks.
fn wecode_root_canonical() -> Result<PathBuf, String> {
    let root = default_projects_root_raw()?;
    fs::create_dir_all(&root).map_err(|e| format!("ensure WeCode root failed: {e}"))?;
    root.canonicalize()
        .map_err(|e| format!("canonicalize WeCode root failed: {e}"))
}

#[tauri::command]
pub fn fs_default_projects_root() -> Result<String, String> {
    Ok(default_projects_root_raw()?.to_string_lossy().to_string())
}

#[tauri::command]
pub fn fs_ensure_dir(dir_path: String) -> Result<(), String> {
    fs::create_dir_all(&dir_path).map_err(|e| format!("create_dir_all failed: {e}"))
}

#[tauri::command]
pub fn fs_list_project(project_path: String) -> Result<Vec<ListedFile>, String> {
    let root = canonicalise(&project_path)?;
    let mut out: Vec<ListedFile> = Vec::new();
    walk(&root, &root, &mut out)?;
    out.sort_by(|a, b| a.rel_path.cmp(&b.rel_path));
    Ok(out)
}

fn walk(root: &Path, dir: &Path, out: &mut Vec<ListedFile>) -> Result<(), String> {
    let entries = fs::read_dir(dir).map_err(|e| format!("read_dir {dir:?} failed: {e}"))?;
    for entry in entries {
        let entry = entry.map_err(|e| format!("dir entry failed: {e}"))?;
        let name = entry.file_name();
        let name_str = name.to_string_lossy().to_string();
        if name_str.starts_with('.') || SKIP_DIR_NAMES.iter().any(|s| *s == name_str) {
            continue;
        }
        let path = entry.path();
        let metadata = entry.metadata().map_err(|e| format!("metadata failed: {e}"))?;
        let rel_native = path
            .strip_prefix(root)
            .map_err(|e| format!("strip_prefix failed: {e}"))?;
        let rel_posix = format!(
            "/{}",
            rel_native
                .components()
                .filter_map(|c| match c {
                    Component::Normal(s) => Some(s.to_string_lossy().to_string()),
                    _ => None,
                })
                .collect::<Vec<_>>()
                .join("/")
        );
        if metadata.is_dir() {
            walk(root, &path, out)?;
            continue;
        }
        let bytes = metadata.len();
        let binary = bytes > MAX_TEXT_FILE_BYTES || !is_likely_text(&path);
        out.push(ListedFile {
            rel_path: rel_posix,
            bytes,
            kind: "file",
            binary,
        });
    }
    Ok(())
}

fn is_likely_text(path: &Path) -> bool {
    match path.extension().and_then(|e| e.to_str()) {
        Some(ext) => matches!(
            ext.to_ascii_lowercase().as_str(),
            "html" | "htm" | "css" | "js" | "mjs" | "json" | "md" | "txt" | "svg" | "xml"
        ),
        None => true,
    }
}

#[tauri::command]
pub fn fs_read_file(project_path: String, rel_path: String) -> Result<String, String> {
    let (_, abs) = resolve_inside(&project_path, &rel_path)?;
    let bytes = fs::read(&abs).map_err(|e| format!("read failed: {e}"))?;
    String::from_utf8(bytes).map_err(|e| format!("utf-8 decode failed: {e}"))
}

#[tauri::command]
pub fn fs_write_file(
    project_path: String,
    rel_path: String,
    content: String,
    recent_writes: State<'_, RecentWritesState>,
) -> Result<(), String> {
    // Ensure root exists so resolve_inside's canonicalize call succeeds.
    fs::create_dir_all(&project_path).map_err(|e| format!("ensure root failed: {e}"))?;
    let (_, abs) = resolve_inside(&project_path, &rel_path)?;
    if let Some(parent) = abs.parent() {
        fs::create_dir_all(parent).map_err(|e| format!("ensure parent failed: {e}"))?;
    }
    fs::write(&abs, content.as_bytes()).map_err(|e| format!("write failed: {e}"))?;
    recent_writes.record(&abs);
    Ok(())
}

#[tauri::command]
pub fn fs_create_file(project_path: String, rel_path: String) -> Result<(), String> {
    let (_, abs) = resolve_inside(&project_path, &rel_path)?;
    if abs.exists() {
        return Err("file already exists".into());
    }
    if let Some(parent) = abs.parent() {
        fs::create_dir_all(parent).map_err(|e| format!("ensure parent failed: {e}"))?;
    }
    fs::write(&abs, []).map_err(|e| format!("create failed: {e}"))
}

#[tauri::command]
pub fn fs_delete_file(
    project_path: String,
    rel_path: String,
    recent_writes: State<'_, RecentWritesState>,
) -> Result<(), String> {
    let (_, abs) = resolve_inside(&project_path, &rel_path)?;
    if !abs.exists() {
        return Err("file not found".into());
    }
    let metadata = fs::metadata(&abs).map_err(|e| format!("metadata failed: {e}"))?;
    if metadata.is_dir() {
        return Err("refusing to delete directory".into());
    }
    fs::remove_file(&abs).map_err(|e| format!("delete failed: {e}"))?;
    recent_writes.record(&abs);
    Ok(())
}

#[tauri::command]
pub fn fs_path_exists(path: String) -> Result<bool, String> {
    Ok(Path::new(&path).exists())
}

// Extracted for unit testing with a temp anchor root.
fn delete_dir_under_anchor(anchor_root: &Path, target: &Path) -> Result<(), String> {
    if !target.is_absolute() {
        return Err("path must be absolute".into());
    }
    if !target.exists() {
        // Idempotent no-op: the folder is already gone (e.g., removed out-of-band).
        return Ok(());
    }
    if !target.is_dir() {
        return Err("path is not a directory".into());
    }
    let canonical = target
        .canonicalize()
        .map_err(|e| format!("canonicalize failed: {e}"))?;
    if canonical == anchor_root {
        return Err("refusing to delete WeCode root itself".into());
    }
    if !canonical.starts_with(anchor_root) {
        return Err("refusing to delete path outside WeCode root".into());
    }
    fs::remove_dir_all(&canonical).map_err(|e| format!("remove_dir_all failed: {e}"))
}

#[tauri::command]
pub fn fs_delete_dir(dir_path: String) -> Result<(), String> {
    let root = wecode_root_canonical()?;
    delete_dir_under_anchor(&root, Path::new(&dir_path))
}

#[tauri::command]
pub fn fs_rename_file(
    project_path: String,
    from_rel: String,
    to_rel: String,
    recent_writes: State<'_, RecentWritesState>,
) -> Result<(), String> {
    let (_, from_abs) = resolve_inside(&project_path, &from_rel)?;
    let (_, to_abs) = resolve_inside(&project_path, &to_rel)?;
    if !from_abs.exists() {
        return Err("source not found".into());
    }
    let metadata = fs::metadata(&from_abs).map_err(|e| format!("metadata failed: {e}"))?;
    if metadata.is_dir() {
        return Err("refusing to rename directory".into());
    }
    if to_abs.exists() {
        return Err("target already exists".into());
    }
    if let Some(parent) = to_abs.parent() {
        fs::create_dir_all(parent).map_err(|e| format!("ensure parent failed: {e}"))?;
    }
    fs::rename(&from_abs, &to_abs).map_err(|e| format!("rename failed: {e}"))?;
    recent_writes.record(&from_abs);
    recent_writes.record(&to_abs);
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::{
        delete_dir_under_anchor, resolve_inside, validate_rel, RecentWritesState,
        RECENT_WRITE_KEEP_MS,
    };
    use std::fs;
    use std::path::{Path, PathBuf};
    use std::sync::atomic::{AtomicU64, Ordering};
    use std::time::{SystemTime, UNIX_EPOCH};

    // Unique temp dir per test case so parallel runs don't collide.
    fn fresh_tempdir(tag: &str) -> PathBuf {
        static COUNTER: AtomicU64 = AtomicU64::new(0);
        let n = COUNTER.fetch_add(1, Ordering::SeqCst);
        let pid = std::process::id();
        let ms = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .map(|d| d.as_nanos())
            .unwrap_or(0);
        let path = std::env::temp_dir().join(format!("wecode-test-{tag}-{pid}-{ms}-{n}"));
        fs::create_dir_all(&path).expect("create tempdir");
        path.canonicalize().expect("canonicalize tempdir")
    }

    #[test]
    fn rejects_empty_and_root() {
        assert!(validate_rel("").is_err());
        assert!(validate_rel("/").is_err());
    }

    #[test]
    fn rejects_missing_leading_slash() {
        assert!(validate_rel("index.html").is_err());
    }

    #[test]
    fn rejects_backslash() {
        assert!(validate_rel("/sub\\path.html").is_err());
    }

    #[test]
    fn rejects_traversal() {
        assert!(validate_rel("/../secrets").is_err());
        assert!(validate_rel("/sub/../escape").is_err());
        assert!(validate_rel("/./weird").is_err());
    }

    #[test]
    fn accepts_normal_paths() {
        assert!(validate_rel("/index.html").is_ok());
        assert!(validate_rel("/src/app.js").is_ok());
    }

    #[test]
    fn resolve_inside_rejects_escape_via_traversal() {
        let root = fresh_tempdir("resolve-traversal");
        // validate_rel already catches this, but resolve_inside must also error.
        let result = resolve_inside(&root.to_string_lossy(), "/../escape.txt");
        assert!(result.is_err());
    }

    #[test]
    fn resolve_inside_accepts_valid_nested_path() {
        let root = fresh_tempdir("resolve-nested");
        fs::create_dir_all(root.join("src")).unwrap();
        let (canonical_root, joined) =
            resolve_inside(&root.to_string_lossy(), "/src/app.js").expect("resolve ok");
        assert_eq!(canonical_root, root);
        assert!(joined.starts_with(&root));
        assert!(joined.to_string_lossy().ends_with("app.js"));
    }

    #[test]
    fn recent_writes_records_and_detects_in_window() {
        let state = RecentWritesState::default();
        let path = std::env::temp_dir().join("wecode-recent-writes-test.txt");
        state.record(&path);
        assert!(state.was_recent(&path, 500));
    }

    #[test]
    fn recent_writes_matches_across_canonicalization_forms() {
        // `record` and `was_recent` must agree even when callers pass the same
        // logical file via different syntactic path forms (a redundant `.`
        // segment here, but on Windows this stands in for the `\\?\` UNC
        // prefix that `canonicalize` prepends). Without normalising the key,
        // watcher events would never match self-writes on Windows.
        let tempdir = fresh_tempdir("recent-canon");
        let file = tempdir.join("echo.txt");
        fs::write(&file, b"hi").expect("seed file");

        let state = RecentWritesState::default();
        let with_dot = tempdir.join(".").join("echo.txt");
        state.record(&with_dot);
        assert!(state.was_recent(&file, 500));

        let _ = fs::remove_dir_all(&tempdir);
    }

    #[test]
    fn recent_writes_returns_false_for_unknown_path() {
        let state = RecentWritesState::default();
        let path = std::env::temp_dir().join("wecode-never-recorded.txt");
        assert!(!state.was_recent(&path, 500));
    }

    #[test]
    fn recent_writes_returns_false_outside_window() {
        use std::thread::sleep;
        use std::time::Duration;
        let state = RecentWritesState::default();
        let path = std::env::temp_dir().join("wecode-recent-outside.txt");
        state.record(&path);
        // Wait longer than the assertion window so the timestamp falls outside.
        sleep(Duration::from_millis(20));
        assert!(!state.was_recent(&path, 5));
    }

    #[test]
    fn recent_writes_clear_drops_all_entries() {
        let state = RecentWritesState::default();
        let a = std::env::temp_dir().join("wecode-clear-a.txt");
        let b = std::env::temp_dir().join("wecode-clear-b.txt");
        state.record(&a);
        state.record(&b);
        state.clear();
        assert!(!state.was_recent(&a, 5000));
        assert!(!state.was_recent(&b, 5000));
    }

    #[test]
    fn recent_writes_record_prunes_entries_beyond_keep_window() {
        use std::thread::sleep;
        use std::time::Duration;
        let state = RecentWritesState::default();
        let stale = std::env::temp_dir().join("wecode-stale.txt");
        state.record(&stale);
        // Force the internal timestamp beyond the keep window by poisoning
        // the map directly.
        {
            let mut guard = state.0.lock().unwrap();
            let key = stale.to_string_lossy().to_string();
            let expired = guard
                .get(&key)
                .copied()
                .unwrap_or(0)
                .saturating_sub(RECENT_WRITE_KEEP_MS + 1000);
            guard.insert(key, expired);
        }
        // A record for any path now should purge the stale entry.
        let fresh = std::env::temp_dir().join("wecode-fresh.txt");
        state.record(&fresh);
        assert!(!state.was_recent(&stale, 10_000));
        // Sleep 1 ms just to keep timing noise bounded.
        sleep(Duration::from_millis(1));
    }

    #[test]
    fn delete_dir_refuses_target_outside_anchor() {
        let anchor = fresh_tempdir("delete-anchor-a");
        let outside = fresh_tempdir("delete-outside");
        // outside is deliberately not under anchor.
        let result = delete_dir_under_anchor(&anchor, &outside);
        assert!(result.is_err());
        assert!(
            result.unwrap_err().contains("outside"),
            "should mention being outside the anchor"
        );
        // The outside directory must still exist.
        assert!(outside.exists());
        // Cleanup.
        let _ = fs::remove_dir_all(&outside);
        let _ = fs::remove_dir_all(&anchor);
    }

    #[test]
    fn delete_dir_refuses_anchor_itself() {
        let anchor = fresh_tempdir("delete-anchor-itself");
        let result = delete_dir_under_anchor(&anchor, &anchor);
        assert!(result.is_err());
        assert!(anchor.exists());
        let _ = fs::remove_dir_all(&anchor);
    }

    #[test]
    fn delete_dir_accepts_subdirectory_of_anchor() {
        let anchor = fresh_tempdir("delete-anchor-sub");
        let project = anchor.join("myproject");
        fs::create_dir_all(&project).unwrap();
        fs::write(project.join("index.html"), b"<!doctype html>").unwrap();
        delete_dir_under_anchor(&anchor, &project).expect("should delete subdir");
        assert!(!project.exists());
        assert!(anchor.exists());
        let _ = fs::remove_dir_all(&anchor);
    }

    #[test]
    fn delete_dir_is_idempotent_when_target_already_gone() {
        let anchor = fresh_tempdir("delete-anchor-idem");
        let gone = anchor.join("never-created");
        let result = delete_dir_under_anchor(&anchor, &gone);
        assert!(result.is_ok(), "absent target should be a no-op");
        let _ = fs::remove_dir_all(&anchor);
    }

    #[test]
    fn delete_dir_rejects_file_target() {
        let anchor = fresh_tempdir("delete-anchor-file");
        let file = anchor.join("oops.txt");
        fs::write(&file, b"hi").unwrap();
        let result = delete_dir_under_anchor(&anchor, &file);
        assert!(result.is_err());
        assert!(file.exists());
        let _ = fs::remove_dir_all(&anchor);
    }

    #[test]
    fn delete_dir_rejects_relative_path() {
        let anchor = fresh_tempdir("delete-anchor-rel");
        let relative = Path::new("relative/path");
        let result = delete_dir_under_anchor(&anchor, relative);
        assert!(result.is_err());
        let _ = fs::remove_dir_all(&anchor);
    }
}
