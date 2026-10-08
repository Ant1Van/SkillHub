export interface SkillFile {
  name: string;
  rel_path: string;
  is_dir: boolean;
  size_bytes: number;
}

export interface SkillItem {
  id: string;
  name: string;
  display_name: string;
  description: string;
  path: string;
  is_enabled: boolean;
  scope: string;
  files_count: number;
  raw_content: string;
  files: SkillFile[];
}

export interface AgentTarget {
  id: string;
  name: string;
  path: string;
  description: string;
  exists: boolean;
  skills_count: number;
  active_count: number;
}

export type FilterStatus = "all" | "active" | "disabled";
export type WindowMode = "popover" | "studio";
