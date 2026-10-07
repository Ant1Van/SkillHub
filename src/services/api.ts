import { invoke } from "@tauri-apps/api/core";
import { SkillItem, WindowMode } from "../types";

export const api = {
  getSkills: () => invoke<SkillItem[]>("get_skills"),
  
  toggleSkill: (id: string, enabled: boolean) => 
    invoke<SkillItem>("toggle_skill", { id, enabled }),

  saveSkillContent: (id: string, content: string) =>
    invoke<void>("save_skill_content", { id, content }),

  createSkill: (name: string, description: string, instructions: string) =>
    invoke<string>("create_skill", {
      name,
      description,
      initialInstructions: instructions,
    }),

  deleteSkill: (id: string) =>
    invoke<void>("delete_skill", { id }),

  installSkillDirect: (id: string, content: string) =>
    invoke<string>("install_skill_direct", { id, content }),

  installFromUrl: (repoUrl: string, customName?: string) =>
    invoke<string>("install_from_url", {
      repoUrl,
      customName: customName || null,
    }),

  revealInFinder: (path: string) =>
    invoke<void>("reveal_in_finder", { path }),

  openBrowserUrl: (url: string) =>
    invoke<void>("open_browser_url", { url }),

  setWindowSize: (mode: WindowMode) =>
    invoke<void>("set_window_size", { mode }),
};
