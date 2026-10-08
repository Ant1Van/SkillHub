use crate::skills::{get_agent_skills_dir, sanitize_skill_id};
use std::fs;
use std::path::Path;

pub fn validate_git_url(url: &str) -> Result<&str, String> {
    let trimmed = url.trim();

    // Prevent git argument injection (e.g. --upload-pack)
    if trimmed.starts_with('-') {
        return Err("Security error: URL cannot start with a dash.".to_string());
    }

    if !trimmed.starts_with("https://github.com/") && !trimmed.starts_with("https://gitlab.com/") {
        return Err("Security error: Only HTTPS URLs from github.com and gitlab.com are permitted.".to_string());
    }

    if trimmed.contains('\n')
        || trimmed.contains('\r')
        || trimmed.contains('\0')
        || trimmed.contains(' ')
        || trimmed.contains(';')
        || trimmed.contains('&')
        || trimmed.contains('|')
        || trimmed.contains('`')
        || trimmed.contains('$')
    {
        return Err("Security error: URL contains illegal characters.".to_string());
    }

    Ok(trimmed)
}

/// Security scan that purges dangerous binaries and inspects for malicious scripts
pub fn scan_and_sanitize_skill_directory(dir: &Path) -> Result<Vec<String>, String> {
    let mut warnings = Vec::new();
    let dangerous_extensions = ["exe", "dll", "so", "dylib", "bin", "com", "msi", "scr"];
    let suspicious_patterns = [
        "rm -rf /",
        "rm -rf /*",
        ":(){ :|:& };:",
        "curl | bash",
        "curl | sh",
        "wget | bash",
        "wget | sh",
        "nc -e",
        "/bin/sh -i",
        "certutil -urlcache",
        "Invoke-Expression",
        "IEX (New-Object",
        "DownloadString(",
    ];

    if let Ok(entries) = walkdir::WalkDir::new(dir)
        .max_depth(5)
        .into_iter()
        .collect::<Result<Vec<_>, _>>()
    {
        for entry in entries {
            let path = entry.path();

            // 1. Delete and flag dangerous binary executables
            if let Some(ext) = path.extension().and_then(|e| e.to_str()) {
                if dangerous_extensions.contains(&ext.to_lowercase().as_str()) {
                    let _ = fs::remove_file(path);
                    warnings.push(format!("Removed untrusted binary executable: {:?}", path.file_name()));
                    continue;
                }
            }

            // 2. Scan script and markdown text for dangerous patterns
            if entry.file_type().is_file() {
                if let Ok(content) = fs::read_to_string(path) {
                    for pattern in &suspicious_patterns {
                        if content.contains(pattern) {
                            warnings.push(format!(
                                "Suspicious pattern detected in {:?}: '{}'",
                                path.file_name().unwrap_or_default(),
                                pattern
                            ));
                            break;
                        }
                    }
                }
            }
        }
    }

    Ok(warnings)
}

#[tauri::command]
pub fn install_skill_direct(
    id: String,
    content: String,
    agent_id: Option<String>,
    custom_path: Option<String>,
) -> Result<String, String> {
    let safe_id = sanitize_skill_id(&id)?;
    let skills_dir = get_agent_skills_dir(agent_id.as_deref(), custom_path.as_deref());
    let target_dir = skills_dir.join(&safe_id);

    if target_dir.exists() || skills_dir.join(format!("{}.disabled", safe_id)).exists() {
        return Err(format!("Skill '{}' is already installed.", safe_id));
    }

    fs::create_dir_all(&target_dir).map_err(|e| e.to_string())?;
    let skill_md_path = target_dir.join("SKILL.md");
    fs::write(skill_md_path, content).map_err(|e| e.to_string())?;

    // Scan the created skill
    let _ = scan_and_sanitize_skill_directory(&target_dir);

    Ok(safe_id)
}

#[tauri::command]
pub fn install_from_url(
    repo_url: String,
    custom_name: Option<String>,
    agent_id: Option<String>,
    custom_path: Option<String>,
) -> Result<String, String> {
    let clean_url = validate_git_url(&repo_url)?;
    let skills_dir = get_agent_skills_dir(agent_id.as_deref(), custom_path.as_deref());

    let raw_name = if let Some(c) = custom_name {
        c.trim().to_lowercase().replace(' ', "-")
    } else {
        let last_part = clean_url.split('/').last().unwrap_or("downloaded-skill");
        last_part.trim_end_matches(".git").to_lowercase().replace(' ', "-")
    };

    let safe_folder_name = sanitize_skill_id(&raw_name)?;
    let target_dir = skills_dir.join(&safe_folder_name);

    if target_dir.exists() || skills_dir.join(format!("{}.disabled", safe_folder_name)).exists() {
        return Err(format!("Skill '{}' is already installed.", safe_folder_name));
    }

    // Clone cleanly without shell invocation
    let output = std::process::Command::new("git")
        .arg("clone")
        .arg("--depth=1")
        .arg(clean_url)
        .arg(&target_dir)
        .output()
        .map_err(|e| format!("Failed to run git: {}", e))?;

    if !output.status.success() {
        let err_msg = String::from_utf8_lossy(&output.stderr);
        return Err(format!("Git clone failed: {}", err_msg));
    }

    // Remove .git metadata
    let git_dir = target_dir.join(".git");
    if git_dir.exists() {
        let _ = fs::remove_dir_all(git_dir);
    }

    // Run security scan on downloaded repository
    let warnings = scan_and_sanitize_skill_directory(&target_dir).unwrap_or_default();

    // Ensure SKILL.md exists
    let skill_md = target_dir.join("SKILL.md");
    if !skill_md.exists() {
        let readme = target_dir.join("README.md");
        let content = if readme.exists() {
            fs::read_to_string(&readme).unwrap_or_default()
        } else {
            format!("# {}\n\nImported skill from {}", safe_folder_name, clean_url)
        };

        let formatted = format!(
            "---\nname: \"{}\"\ndescription: \"Imported from {}\"\n---\n\n{}",
            safe_folder_name, clean_url, content
        );
        let _ = fs::write(skill_md, formatted);
    }

    // If severe warnings were detected, quarantine skill by renaming to .disabled
    if !warnings.is_empty() {
        let quarantined = skills_dir.join(format!("{}.disabled", safe_folder_name));
        let _ = fs::rename(&target_dir, quarantined);
        return Ok(format!(
            "{} (Security alert: {} risks neutralized; installed as disabled for review)",
            safe_folder_name,
            warnings.len()
        ));
    }

    Ok(safe_folder_name)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_validate_git_url_valid() {
        assert!(validate_git_url("https://github.com/Ant1Van/SkillHub").is_ok());
        assert!(validate_git_url("https://gitlab.com/group/project.git").is_ok());
    }

    #[test]
    fn test_validate_git_url_blocks_attacks() {
        assert!(validate_git_url("--upload-pack=evil").is_err());
        assert!(validate_git_url("ssh://git@github.com/repo").is_err());
        assert!(validate_git_url("file:///etc/passwd").is_err());
        assert!(validate_git_url("https://evil.com/repo").is_err());
        assert!(validate_git_url("https://github.com/repo; calc.exe").is_err());
    }
}
