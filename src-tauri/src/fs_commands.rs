use std::collections::HashMap;
use std::fs;
use std::path::{Component, Path, PathBuf};
use std::sync::Mutex;
use std::time::{SystemTime, UNIX_EPOCH};

use serde::Serialize;
use tauri::State;

const MAX_TEXT_FILE_BYTES: u64 = 1_048_576;
const SKIP_DIR_NAMES: &[&str] = &["node_modules", ".git", ".DS_Store"];

#[derive(Default)]
pub struct RecentWritesState(pub Mutex<HashMap<String, u128>>);

impl RecentWritesState {
    pub fn record(&self, absolute_path: &Path) {
        let Ok(mut guard) = self.0.lock() else {
            return;
        };
        let key = absolute_path.to_string_lossy().to_string();
        guard.insert(key, now_ms());
    }

    #[allow(dead_code)] // wired up by the watcher module in a following commit
    pub fn was_recent(&self, absolute_path: &Path, within_ms: u128) -> bool {
        let Ok(guard) = self.0.lock() else {
            return false;
        };
        let key = absolute_path.to_string_lossy().to_string();
        match guard.get(&key) {
            Some(stamp) => now_ms().saturating_sub(*stamp) <= within_ms,
            None => false,
        }
    }
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

#[tauri::command]
pub fn fs_default_projects_root() -> Result<String, String> {
    let docs = dirs::document_dir().ok_or("could not resolve Documents directory")?;
    Ok(docs.join("WeCode").to_string_lossy().to_string())
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
    let root = PathBuf::from(&project_path);
    fs::create_dir_all(&root).map_err(|e| format!("ensure root failed: {e}"))?;
    let rel = validate_rel(&rel_path)?;
    let abs = root.join(&rel);
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
pub fn fs_rename_file(
    project_path: String,
    from_rel: String,
    to_rel: String,
    recent_writes: State<'_, RecentWritesState>,
) -> Result<(), String> {
    let (_, from_abs) = resolve_inside(&project_path, &from_rel)?;
    let (_, to_abs) = resolve_inside(&project_path, &to_rel)?;
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
    use super::validate_rel;

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
}
