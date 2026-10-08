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

pub fn validate_url(url: &str) -> Result<&str, String> {
    let trimmed = url.trim();
    if !trimmed.starts_with("https://") && !trimmed.starts_with("http://") {
        return Err("Security error: Only http:// and https:// URLs are permitted.".to_string());
    }

    if trimmed.contains('\n')
        || trimmed.contains('\r')
        || trimmed.contains('\0')
        || trimmed.contains('"')
        || trimmed.contains('\'')
    {
        return Err("Security error: URL contains illegal characters.".to_string());
    }

    Ok(trimmed)
}

#[tauri::command]
pub fn reveal_in_finder(path: String) -> Result<(), String> {
    let target_path = resolve_path(&path);
    if !target_path.exists() {
        return Err("Path does not exist.".to_string());
    }

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
            .arg("/select,")
            .arg(&target_path)
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
    let safe_url = validate_url(&url)?;

    #[cfg(target_os = "macos")]
    {
        std::process::Command::new("open")
            .arg(safe_url)
            .spawn()
            .map_err(|e| e.to_string())?;
    }

    #[cfg(target_os = "windows")]
    {
        // Safe browser launcher on Windows: rundll32 url.dll,FileProtocolHandler invokes
        // the system default browser directly WITHOUT running cmd.exe or expanding shell variables
        std::process::Command::new("rundll32")
            .args(["url.dll,FileProtocolHandler", safe_url])
            .spawn()
            .map_err(|e| e.to_string())?;
    }

    #[cfg(target_os = "linux")]
    {
        std::process::Command::new("xdg-open")
            .arg(safe_url)
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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_validate_url_valid() {
        assert!(validate_url("https://github.com/Ant1Van/SkillHub").is_ok());
        assert!(validate_url("http://example.com/test?query=1").is_ok());
    }

    #[test]
    fn test_validate_url_blocks_dangerous_schemes() {
        assert!(validate_url("file:///etc/passwd").is_err());
        assert!(validate_url("javascript:alert(1)").is_err());
        assert!(validate_url("cmd.exe").is_err());
        assert!(validate_url("https://example.com/\"evil\"").is_err());
    }
}
