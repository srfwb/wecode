use std::collections::HashMap;

use tauri::State;

use crate::vfs_state::VfsState;

#[tauri::command]
pub fn sync_vfs(files: HashMap<String, String>, state: State<'_, VfsState>) -> Result<(), String> {
    let mut guard = state.0.lock().map_err(|e| e.to_string())?;
    *guard = files;
    Ok(())
}
