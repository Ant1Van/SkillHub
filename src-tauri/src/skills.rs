use crate::models::{SkillFile, SkillItem};
use std::fs;
use std::path::{Path, PathBuf};

pub fn get_claude_skills_dir() -> PathBuf {
    let home = dirs::home_dir().unwrap_or_else(|| PathBuf::from("/"));
    home.join(".claude").join("skills")
}

pub fn parse_frontmatter(content: &str) -> (Option<String>, Option<String>) {
    if !content.starts_with("---") {
        return (None, None);
    }

    let parts: Vec<&str> = content.splitn(3, "---").collect();
    if parts.len() < 3 {
        return (None, None);
    }

    let yaml_part = parts[1];
    let mut name = None;
    let mut description = None;

    for line in yaml_part.lines() {
        let trimmed = line.trim();
        if trimmed.starts_with("name:") {
            name = Some(
                trimmed
                    .trim_start_matches("name:")
                    .trim()
                    .trim_matches('"')
                    .trim_matches('\'')
                    .to_string(),
            );
        } else if trimmed.starts_with("description:") {
            description = Some(
                trimmed
                    .trim_start_matches("description:")
                    .trim()
                    .trim_matches('"')
                    .trim_matches('\'')
                    .to_string(),
            );
        }
    }

    (name, description)
}

pub fn list_skill_files(dir: &Path) -> Vec<SkillFile> {
    let mut files = Vec::new();
    if let Ok(entries) = walkdir::WalkDir::new(dir)
        .max_depth(3)
        .into_iter()
        .collect::<Result<Vec<_>, _>>()
    {
        for entry in entries {
            if entry.path() == dir {
                continue;
            }
            if let Ok(rel) = entry.path().strip_prefix(dir) {
                let metadata = entry.metadata().ok();
                let size = metadata.as_ref().map(|m| m.len()).unwrap_or(0);
                files.push(SkillFile {
                    name: entry.file_name().to_string_lossy().to_string(),
                    rel_path: rel.to_string_lossy().to_string(),
                    is_dir: entry.file_type().is_dir(),
                    size_bytes: size,
                });
            }
        }
    }
    files
}

#[tauri::command]
pub fn get_skills() -> Result<Vec<SkillItem>, String> {
    let skills_dir = get_claude_skills_dir();
    let mut skills = Vec::new();

    if !skills_dir.exists() {
        let _ = fs::create_dir_all(&skills_dir);
        return Ok(skills);
    }

    let entries = fs::read_dir(&skills_dir).map_err(|e| e.to_string())?;

    for entry in entries.flatten() {
        let path = entry.path();
        if !path.is_dir() {
            continue;
        }

        let folder_name = entry.file_name().to_string_lossy().to_string();
        if folder_name.starts_with('.') && !folder_name.ends_with(".disabled") {
            continue;
        }

        let is_enabled = !folder_name.ends_with(".disabled");
        let base_id = if !is_enabled {
            folder_name.trim_end_matches(".disabled").to_string()
        } else {
            folder_name.clone()
        };

        let skill_md_path = path.join("SKILL.md");
        let raw_content = if skill_md_path.exists() {
            fs::read_to_string(&skill_md_path).unwrap_or_default()
        } else {
            String::new()
        };

        let (parsed_name, parsed_desc) = parse_frontmatter(&raw_content);
        let display_name = parsed_name.unwrap_or_else(|| base_id.clone());
        let description = parsed_desc.unwrap_or_else(|| {
            raw_content
                .lines()
                .find(|l| !l.starts_with("---") && !l.trim().is_empty() && !l.starts_with('#'))
                .unwrap_or("No description provided.")
                .trim()
                .to_string()
        });

        let files = list_skill_files(&path);
        let files_count = files.iter().filter(|f| !f.is_dir).count();

        skills.push(SkillItem {
            id: base_id,
            name: folder_name,
            display_name,
            description,
            path: path.to_string_lossy().to_string(),
            is_enabled,
            scope: "global".to_string(),
            files_count,
            raw_content,
            files,
        });
    }

    skills.sort_by(|a, b| a.display_name.to_lowercase().cmp(&b.display_name.to_lowercase()));
    Ok(skills)
}

#[tauri::command]
pub fn toggle_skill(id: String, enabled: bool) -> Result<SkillItem, String> {
    let skills_dir = get_claude_skills_dir();
    let current_enabled_path = skills_dir.join(&id);
    let current_disabled_path = skills_dir.join(format!("{}.disabled", id));

    let (src, dst) = if enabled {
        (current_disabled_path, current_enabled_path)
    } else {
        (current_enabled_path, current_disabled_path)
    };

    if !src.exists() {
        return Err(format!("Source skill directory does not exist: {:?}", src));
    }

    fs::rename(&src, &dst).map_err(|e| e.to_string())?;

    let skill_md_path = dst.join("SKILL.md");
    let raw_content = if skill_md_path.exists() {
        fs::read_to_string(&skill_md_path).unwrap_or_default()
    } else {
        String::new()
    };

    let (parsed_name, parsed_desc) = parse_frontmatter(&raw_content);
    let display_name = parsed_name.unwrap_or_else(|| id.clone());
    let description = parsed_desc.unwrap_or_default();
    let files = list_skill_files(&dst);
    let files_count = files.iter().filter(|f| !f.is_dir).count();

    Ok(SkillItem {
        id: id.clone(),
        name: dst.file_name().unwrap().to_string_lossy().to_string(),
        display_name,
        description,
        path: dst.to_string_lossy().to_string(),
        is_enabled: enabled,
        scope: "global".to_string(),
        files_count,
        raw_content,
        files,
    })
}

#[tauri::command]
pub fn save_skill_content(id: String, content: String) -> Result<(), String> {
    let skills_dir = get_claude_skills_dir();
    let mut skill_path = skills_dir.join(&id);
    if !skill_path.exists() {
        skill_path = skills_dir.join(format!("{}.disabled", id));
    }

    if !skill_path.exists() {
        return Err("Skill directory not found".to_string());
    }

    let skill_md_path = skill_path.join("SKILL.md");
    fs::write(skill_md_path, content).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn create_skill(name: String, description: String, initial_instructions: String) -> Result<String, String> {
    let safe_id = name.trim().to_lowercase().replace(' ', "-");
    let skills_dir = get_claude_skills_dir();
    let new_skill_dir = skills_dir.join(&safe_id);

    if new_skill_dir.exists() {
        return Err(format!("Skill '{}' already exists", safe_id));
    }

    fs::create_dir_all(&new_skill_dir).map_err(|e| e.to_string())?;

    let template = format!(
        "---\nname: \"{}\"\ndescription: \"{}\"\n---\n\n# {}\n\n{}\n",
        name.trim(),
        description.trim(),
        name.trim(),
        if initial_instructions.trim().is_empty() {
            "## Instructions\n\nAdd your Claude Code skill instructions and prompts here."
        } else {
            initial_instructions.trim()
        }
    );

    let skill_md_path = new_skill_dir.join("SKILL.md");
    fs::write(skill_md_path, template).map_err(|e| e.to_string())?;

    Ok(safe_id)
}

#[tauri::command]
pub fn delete_skill(id: String) -> Result<(), String> {
    let skills_dir = get_claude_skills_dir();
    let mut skill_path = skills_dir.join(&id);
    if !skill_path.exists() {
        skill_path = skills_dir.join(format!("{}.disabled", id));
    }

    if !skill_path.exists() {
        return Err(format!("Skill '{}' does not exist.", id));
    }

    fs::remove_dir_all(&skill_path).map_err(|e| format!("Failed to delete skill directory: {}", e))?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_frontmatter_valid() {
        let content = "---\nname: \"my-skill\"\ndescription: \"Test description for skill\"\n---\n# Title";
        let (name, desc) = parse_frontmatter(content);
        assert_eq!(name, Some("my-skill".to_string()));
        assert_eq!(desc, Some("Test description for skill".to_string()));
    }

    #[test]
    fn test_parse_frontmatter_without_quotes() {
        let content = "---\nname: clean-coder\ndescription: Writes idiomatic code\n---\nContent";
        let (name, desc) = parse_frontmatter(content);
        assert_eq!(name, Some("clean-coder".to_string()));
        assert_eq!(desc, Some("Writes idiomatic code".to_string()));
    }

    #[test]
    fn test_parse_frontmatter_empty_or_invalid() {
        let content = "# No Frontmatter here";
        let (name, desc) = parse_frontmatter(content);
        assert_eq!(name, None);
        assert_eq!(desc, None);
    }

    #[test]
    fn test_get_claude_skills_dir_not_empty() {
        let path = get_claude_skills_dir();
        assert!(path.to_string_lossy().contains(".claude"));
        assert!(path.to_string_lossy().contains("skills"));
    }
}
