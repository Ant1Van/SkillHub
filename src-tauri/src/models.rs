use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SkillFile {
    pub name: String,
    pub rel_path: String,
    pub is_dir: bool,
    pub size_bytes: u64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SkillItem {
    pub id: String,
    pub name: String,
    pub display_name: String,
    pub description: String,
    pub path: String,
    pub is_enabled: bool,
    pub scope: String,
    pub files_count: usize,
    pub raw_content: String,
    pub files: Vec<SkillFile>,
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq, Eq)]
pub struct AgentTarget {
    pub id: String,
    pub name: String,
    pub path: String,
    pub description: String,
    pub exists: bool,
    pub skills_count: usize,
    pub active_count: usize,
}
