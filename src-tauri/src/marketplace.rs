use crate::skills::get_agent_skills_dir;
use std::fs;

#[tauri::command]
pub fn install_skill_direct(
    id: String,
    content: String,
    agent_id: Option<String>,
    custom_path: Option<String>,
) -> Result<String, String> {
    let skills_dir = get_agent_skills_dir(agent_id.as_deref(), custom_path.as_deref());
    let target_dir = skills_dir.join(&id);

    if target_dir.exists() {
        return Err(format!("Skill '{}' is already installed.", id));
    }

    fs::create_dir_all(&target_dir).map_err(|e| e.to_string())?;
    let skill_md_path = target_dir.join("SKILL.md");
    fs::write(skill_md_path, content).map_err(|e| e.to_string())?;

    Ok(id)
}

#[tauri::command]
pub fn install_from_url(
    repo_url: String,
    custom_name: Option<String>,
    agent_id: Option<String>,
    custom_path: Option<String>,
) -> Result<String, String> {
    let skills_dir = get_agent_skills_dir(agent_id.as_deref(), custom_path.as_deref());
    let clean_url = repo_url.trim();

    let folder_name = if let Some(c) = custom_name {
        c.trim().to_lowercase().replace(' ', "-")
    } else {
        let last_part = clean_url.split('/').last().unwrap_or("downloaded-skill");
        last_part.trim_end_matches(".git").to_lowercase().replace(' ', "-")
    };

    let target_dir = skills_dir.join(&folder_name);
    if target_dir.exists() {
        return Err(format!("Skill '{}' is already installed.", folder_name));
    }

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

    let git_dir = target_dir.join(".git");
    if git_dir.exists() {
        let _ = fs::remove_dir_all(git_dir);
    }

    let skill_md = target_dir.join("SKILL.md");
    if !skill_md.exists() {
        let readme = target_dir.join("README.md");
        let content = if readme.exists() {
            fs::read_to_string(&readme).unwrap_or_default()
        } else {
            format!("# {}\n\nImported skill from {}", folder_name, clean_url)
        };

        let formatted = format!(
            "---\nname: \"{}\"\ndescription: \"Imported from {}\"\n---\n\n{}",
            folder_name, clean_url, content
        );
        let _ = fs::write(skill_md, formatted);
    }

    Ok(folder_name)
}
