mod commands;
mod protocol;
mod vfs_state;

use vfs_state::VfsState;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .manage(VfsState::default())
        .register_uri_scheme_protocol("wecode", protocol::handle)
        .invoke_handler(tauri::generate_handler![commands::sync_vfs])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
