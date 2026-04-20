use tauri::http::{Request, Response};
use tauri::{Manager, Runtime, UriSchemeContext};

use crate::vfs_state::VfsState;

pub fn handle<R: Runtime>(
    ctx: UriSchemeContext<'_, R>,
    request: Request<Vec<u8>>,
) -> Response<Vec<u8>> {
    let raw_path = request.uri().path();
    let stripped = raw_path.strip_prefix("/preview").unwrap_or(raw_path);
    let vfs_path = if stripped.is_empty() || stripped == "/" {
        "/index.html".to_string()
    } else {
        stripped.to_string()
    };

    let state = ctx.app_handle().state::<VfsState>();
    let guard = match state.0.lock() {
        Ok(g) => g,
        Err(_) => return error_response(500, "vfs lock poisoned"),
    };

    match guard.get(&vfs_path) {
        Some(content) => Response::builder()
            .header("Content-Type", mime_for(&vfs_path))
            .header("Access-Control-Allow-Origin", "*")
            .header("Cache-Control", "no-store")
            .body(content.as_bytes().to_vec())
            .unwrap_or_else(|_| error_response(500, "response build failed")),
        None => error_response(404, "not found"),
    }
}

fn error_response(status: u16, message: &str) -> Response<Vec<u8>> {
    Response::builder()
        .status(status)
        .header("Content-Type", "text/plain; charset=utf-8")
        .body(message.as_bytes().to_vec())
        .unwrap_or_else(|_| {
            Response::new(message.as_bytes().to_vec())
        })
}

fn mime_for(path: &str) -> &'static str {
    let lower = path.to_ascii_lowercase();
    if lower.ends_with(".html") || lower.ends_with(".htm") {
        "text/html; charset=utf-8"
    } else if lower.ends_with(".css") {
        "text/css; charset=utf-8"
    } else if lower.ends_with(".js") || lower.ends_with(".mjs") {
        "application/javascript; charset=utf-8"
    } else if lower.ends_with(".json") {
        "application/json; charset=utf-8"
    } else if lower.ends_with(".svg") {
        "image/svg+xml"
    } else if lower.ends_with(".png") {
        "image/png"
    } else if lower.ends_with(".jpg") || lower.ends_with(".jpeg") {
        "image/jpeg"
    } else if lower.ends_with(".gif") {
        "image/gif"
    } else if lower.ends_with(".webp") {
        "image/webp"
    } else {
        "application/octet-stream"
    }
}
