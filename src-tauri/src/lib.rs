mod commands;
mod fs_commands;
mod protocol;
mod vfs_state;
mod watcher;

use fs_commands::RecentWritesState;
use vfs_state::VfsState;
use watcher::WatcherState;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .plugin(tauri_plugin_dialog::init())
        .manage(VfsState::default())
        .manage(RecentWritesState::default())
        .manage(WatcherState::default())
        .register_uri_scheme_protocol("wecode", protocol::handle)
        .invoke_handler(tauri::generate_handler![
            commands::sync_vfs,
            fs_commands::fs_default_projects_root,
            fs_commands::fs_ensure_dir,
            fs_commands::fs_list_project,
            fs_commands::fs_read_file,
            fs_commands::fs_write_file,
            fs_commands::fs_create_file,
            fs_commands::fs_delete_file,
            fs_commands::fs_rename_file,
            watcher::watcher_start,
            watcher::watcher_stop,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
