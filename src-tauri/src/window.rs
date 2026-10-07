use std::path::PathBuf;
use tauri::{AppHandle, Manager};

fn resolve_path(path: &str) -> PathBuf {
    if path.starts_with("~/") {
        let home = dirs::home_dir().unwrap_or_else(|| PathBuf::from("/"));
        home.join(&path[2..])
    } else {
        PathBuf::from(path)
    }
}

#[tauri::command]
pub fn reveal_in_finder(path: String) -> Result<(), String> {
    let target_path = resolve_path(&path);

    #[cfg(target_os = "macos")]
    {
        std::process::Command::new("open")
            .arg("-R")
            .arg(&target_path)
            .spawn()
            .map_err(|e| e.to_string())?;
    }

    #[cfg(target_os = "windows")]
    {
        std::process::Command::new("explorer")
            .arg(format!("/select,\"{}\"", target_path.to_string_lossy()))
            .spawn()
            .map_err(|e| e.to_string())?;
    }

    #[cfg(target_os = "linux")]
    {
        std::process::Command::new("xdg-open")
            .arg(&target_path)
            .spawn()
            .map_err(|e| e.to_string())?;
    }

    Ok(())
}

#[tauri::command]
pub fn open_browser_url(url: String) -> Result<(), String> {
    #[cfg(target_os = "macos")]
    {
        std::process::Command::new("open")
            .arg(&url)
            .spawn()
            .map_err(|e| e.to_string())?;
    }

    #[cfg(target_os = "windows")]
    {
        std::process::Command::new("cmd")
            .args(["/C", "start", "", &url])
            .spawn()
            .map_err(|e| e.to_string())?;
    }

    #[cfg(target_os = "linux")]
    {
        std::process::Command::new("xdg-open")
            .arg(&url)
            .spawn()
            .map_err(|e| e.to_string())?;
    }

    Ok(())
}

#[tauri::command]
pub fn set_window_size(app_handle: AppHandle, mode: String) -> Result<(), String> {
    if let Some(window) = app_handle.get_webview_window("main") {
        if mode == "studio" {
            let _ = window.set_size(tauri::Size::Logical(tauri::LogicalSize {
                width: 1040.0,
                height: 720.0,
            }));
            let _ = window.set_resizable(true);
            let _ = window.center();
        } else {
            let _ = window.set_size(tauri::Size::Logical(tauri::LogicalSize {
                width: 380.0,
                height: 560.0,
            }));
            let _ = window.set_resizable(false);
        }
    }
    Ok(())
}
