use crate::models::{AgentTarget, SkillFile, SkillItem};
use std::fs;
use std::path::{Path, PathBuf};

pub fn get_agent_skills_dir(agent_id: Option<&str>, custom_path: Option<&str>) -> PathBuf {
    if let Some(cp) = custom_path {
        let trimmed = cp.trim();
        if !trimmed.is_empty() {
            return PathBuf::from(trimmed);
        }
    }

    let home = dirs::home_dir().unwrap_or_else(|| PathBuf::from("/"));
    match agent_id.unwrap_or("claude") {
        "codex" => home.join(".codex").join("skills"),
        "cursor" => home.join(".cursor").join("skills"),
        "cline" => home.join(".cline").join("skills"),
        "windsurf" => home.join(".windsurf").join("skills"),
        _ => home.join(".claude").join("skills"),
    }
}

pub fn get_claude_skills_dir() -> PathBuf {
    get_agent_skills_dir(Some("claude"), None)
}

pub fn copy_dir_all(src: impl AsRef<Path>, dst: impl AsRef<Path>) -> std::io::Result<()> {
    fs::create_dir_all(&dst)?;
    for entry in fs::read_dir(src)? {
        let entry = entry?;
        let ty = entry.file_type()?;
        if ty.is_dir() {
            copy_dir_all(entry.path(), dst.as_ref().join(entry.file_name()))?;
        } else {
            fs::copy(entry.path(), dst.as_ref().join(entry.file_name()))?;
        }
    }
    Ok(())
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

fn count_skills_in_dir(dir: &Path) -> (usize, usize) {
    if !dir.exists() {
        return (0, 0);
    }

    let entries = match fs::read_dir(dir) {
        Ok(e) => e,
        Err(_) => return (0, 0),
    };

    let mut total = 0;
    let mut active = 0;

    for entry in entries.flatten() {
        let path = entry.path();
        if !path.is_dir() {
            continue;
        }

        let folder_name = entry.file_name().to_string_lossy().to_string();
        if folder_name.starts_with('.') && !folder_name.ends_with(".disabled") {
            continue;
        }

        total += 1;
        if !folder_name.ends_with(".disabled") {
            active += 1;
        }
    }

    (total, active)
}

#[tauri::command]
pub fn get_agents(custom_path: Option<String>) -> Result<Vec<AgentTarget>, String> {
    let raw_defs = vec![
        ("claude", "Claude Code", "Anthropic Claude Code CLI skills (~/.claude/skills)"),
        ("codex", "OpenAI Codex", "OpenAI Codex & ChatGPT developer skills (~/.codex/skills)"),
        ("cursor", "Cursor", "Cursor IDE Agent & custom skills (~/.cursor/skills)"),
        ("cline", "Cline / Roo Code", "Autonomous VS Code coding agent (~/.cline/skills)"),
        ("windsurf", "Windsurf", "Codeium Windsurf Cascade skills (~/.windsurf/skills)"),
    ];

    let mut agents = Vec::new();

    for (id, name, desc) in raw_defs {
        let path_buf = get_agent_skills_dir(Some(id), None);
        let exists = path_buf.exists();
        let (total, active) = count_skills_in_dir(&path_buf);

        agents.push(AgentTarget {
            id: id.to_string(),
            name: name.to_string(),
            path: path_buf.to_string_lossy().to_string(),
            description: desc.to_string(),
            exists,
            skills_count: total,
            active_count: active,
        });
    }

    if let Some(cp) = custom_path {
        let trimmed = cp.trim();
        if !trimmed.is_empty() {
            let custom_buf = PathBuf::from(trimmed);
            let exists = custom_buf.exists();
            let (total, active) = count_skills_in_dir(&custom_buf);

            agents.push(AgentTarget {
                id: "custom".to_string(),
                name: "Custom Folder".to_string(),
                path: custom_buf.to_string_lossy().to_string(),
                description: "Custom project or workspace skills directory".to_string(),
                exists,
                skills_count: total,
                active_count: active,
            });
        }
    }

    Ok(agents)
}

#[tauri::command]
pub fn get_skills(agent_id: Option<String>, custom_path: Option<String>) -> Result<Vec<SkillItem>, String> {
    let skills_dir = get_agent_skills_dir(agent_id.as_deref(), custom_path.as_deref());
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
pub fn toggle_skill(
    id: String,
    enabled: bool,
    agent_id: Option<String>,
    custom_path: Option<String>,
) -> Result<SkillItem, String> {
    let skills_dir = get_agent_skills_dir(agent_id.as_deref(), custom_path.as_deref());
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
pub fn save_skill_content(
    id: String,
    content: String,
    agent_id: Option<String>,
    custom_path: Option<String>,
) -> Result<(), String> {
    let skills_dir = get_agent_skills_dir(agent_id.as_deref(), custom_path.as_deref());
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
pub fn create_skill(
    name: String,
    description: String,
    initial_instructions: String,
    agent_id: Option<String>,
    custom_path: Option<String>,
) -> Result<String, String> {
    let safe_id = name.trim().to_lowercase().replace(' ', "-");
    let skills_dir = get_agent_skills_dir(agent_id.as_deref(), custom_path.as_deref());
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
            "## Instructions\n\nAdd your skill instructions and prompts here."
        } else {
            initial_instructions.trim()
        }
    );

    let skill_md_path = new_skill_dir.join("SKILL.md");
    fs::write(skill_md_path, template).map_err(|e| e.to_string())?;

    Ok(safe_id)
}

#[tauri::command]
pub fn delete_skill(
    id: String,
    agent_id: Option<String>,
    custom_path: Option<String>,
) -> Result<(), String> {
    let skills_dir = get_agent_skills_dir(agent_id.as_deref(), custom_path.as_deref());
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

#[tauri::command]
pub fn copy_skill_to_agent(
    id: String,
    from_agent: Option<String>,
    to_agent: String,
    custom_path_from: Option<String>,
    custom_path_to: Option<String>,
) -> Result<String, String> {
    let src_root = get_agent_skills_dir(from_agent.as_deref(), custom_path_from.as_deref());
    let dst_root = get_agent_skills_dir(Some(&to_agent), custom_path_to.as_deref());

    let mut src_dir = src_root.join(&id);
    if !src_dir.exists() {
        src_dir = src_root.join(format!("{}.disabled", id));
    }

    if !src_dir.exists() {
        return Err(format!("Source skill '{}' not found in source agent.", id));
    }

    let dst_dir = dst_root.join(&id);
    if dst_dir.exists() || dst_root.join(format!("{}.disabled", id)).exists() {
        return Err(format!("Skill '{}' already exists in target agent.", id));
    }

    fs::create_dir_all(&dst_root).map_err(|e| e.to_string())?;
    copy_dir_all(&src_dir, &dst_dir).map_err(|e| format!("Failed to copy skill: {}", e))?;

    Ok(id)
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

    #[test]
    fn test_get_agent_skills_dir_codex_cursor() {
        let codex_path = get_agent_skills_dir(Some("codex"), None);
        assert!(codex_path.to_string_lossy().contains(".codex"));

        let cursor_path = get_agent_skills_dir(Some("cursor"), None);
        assert!(cursor_path.to_string_lossy().contains(".cursor"));

        let cline_path = get_agent_skills_dir(Some("cline"), None);
        assert!(cline_path.to_string_lossy().contains(".cline"));

        let windsurf_path = get_agent_skills_dir(Some("windsurf"), None);
        assert!(windsurf_path.to_string_lossy().contains(".windsurf"));

        let custom_path = get_agent_skills_dir(None, Some("/tmp/my-custom-skills"));
        assert_eq!(custom_path, PathBuf::from("/tmp/my-custom-skills"));
    }

    #[test]
    fn test_get_agents_list() {
        let agents = get_agents(None).expect("Failed to get agents");
        assert!(agents.len() >= 5);
        let ids: Vec<String> = agents.into_iter().map(|a| a.id).collect();
        assert!(ids.contains(&"claude".to_string()));
        assert!(ids.contains(&"codex".to_string()));
        assert!(ids.contains(&"cursor".to_string()));
    }
}
