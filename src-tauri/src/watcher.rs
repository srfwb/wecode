use std::path::{Component, Path};
use std::sync::Mutex;
use std::time::Duration;

use notify::RecursiveMode;
use notify_debouncer_mini::{new_debouncer, DebounceEventResult, DebouncedEventKind, Debouncer};
use serde::Serialize;
use tauri::{AppHandle, Emitter, Manager, State};

use crate::fs_commands::RecentWritesState;

const ECHO_GRACE_MS: u128 = 500;
const DEBOUNCE_MS: u64 = 150;

#[derive(Default)]
pub struct WatcherState(pub Mutex<Option<Debouncer<notify::RecommendedWatcher>>>);

#[derive(Serialize, Clone)]
struct FileChangedPayload {
    #[serde(rename = "relPath")]
    rel_path: String,
    exists: bool,
}

#[tauri::command]
pub fn watcher_start(
    project_path: String,
    app: AppHandle,
    state: State<'_, WatcherState>,
) -> Result<(), String> {
    // Tear any previous debouncer down first so notify drops the OS-level watch.
    {
        let mut guard = state.0.lock().map_err(|e| e.to_string())?;
        *guard = None;
    }

    let canonical_root = std::fs::canonicalize(&project_path)
        .map_err(|e| format!("canonicalize project path failed: {e}"))?;

    let app_for_handler = app.clone();
    let root_for_handler = canonical_root.clone();

    let mut debouncer = new_debouncer(
        Duration::from_millis(DEBOUNCE_MS),
        move |events_result: DebounceEventResult| {
            let events = match events_result {
                Ok(events) => events,
                Err(err) => {
                    eprintln!("watcher error: {err}");
                    return;
                }
            };
            let recent = app_for_handler.state::<RecentWritesState>();
            for ev in events {
                if matches!(ev.kind, DebouncedEventKind::AnyContinuous) {
                    continue;
                }
                if recent.was_recent(&ev.path, ECHO_GRACE_MS) {
                    continue;
                }
                let Some(rel_path) = rel_path_posix(&root_for_handler, &ev.path) else {
                    continue;
                };
                let exists = ev.path.exists();
                let payload = FileChangedPayload { rel_path, exists };
                if let Err(err) = app_for_handler.emit("project-file-changed", payload) {
                    eprintln!("failed to emit project-file-changed: {err}");
                }
            }
        },
    )
    .map_err(|e| e.to_string())?;

    debouncer
        .watcher()
        .watch(&canonical_root, RecursiveMode::Recursive)
        .map_err(|e| e.to_string())?;

    let mut guard = state.0.lock().map_err(|e| e.to_string())?;
    *guard = Some(debouncer);
    Ok(())
}

#[tauri::command]
pub fn watcher_stop(state: State<'_, WatcherState>) -> Result<(), String> {
    let mut guard = state.0.lock().map_err(|e| e.to_string())?;
    *guard = None;
    Ok(())
}

fn rel_path_posix(root: &Path, path: &Path) -> Option<String> {
    let stripped = path.strip_prefix(root).ok()?;
    let segments: Vec<String> = stripped
        .components()
        .filter_map(|c| match c {
            Component::Normal(s) => Some(s.to_string_lossy().to_string()),
            _ => None,
        })
        .collect();
    if segments.is_empty() {
        return None;
    }
    Some(format!("/{}", segments.join("/")))
}

#[cfg(test)]
mod tests {
    use super::rel_path_posix;
    use std::path::PathBuf;

    #[test]
    fn computes_relative_posix_path() {
        let root = PathBuf::from("/tmp/project");
        let inner = PathBuf::from("/tmp/project/src/app.js");
        assert_eq!(rel_path_posix(&root, &inner).unwrap(), "/src/app.js");
    }

    #[test]
    fn returns_none_for_root_itself() {
        let root = PathBuf::from("/tmp/project");
        assert!(rel_path_posix(&root, &root).is_none());
    }
}
