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

export type FilterStatus = "all" | "active" | "disabled";
export type WindowMode = "popover" | "studio";
