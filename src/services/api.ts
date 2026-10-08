import { invoke } from "@tauri-apps/api/core";
import { SkillItem, AgentTarget, WindowMode } from "../types";

export const api = {
  getSkills: (agentId?: string, customPath?: string) =>
    invoke<SkillItem[]>("get_skills", {
      agentId: agentId || null,
      customPath: customPath || null,
    }),

  getAgents: (customPath?: string) =>
    invoke<AgentTarget[]>("get_agents", {
      customPath: customPath || null,
    }),

  copySkillToAgent: (
    id: string,
    fromAgent?: string,
    toAgent?: string,
    customPathFrom?: string,
    customPathTo?: string
  ) =>
    invoke<string>("copy_skill_to_agent", {
      id,
      fromAgent: fromAgent || null,
      toAgent: toAgent || "claude",
      customPathFrom: customPathFrom || null,
      customPathTo: customPathTo || null,
    }),

  toggleSkill: (
    id: string,
    enabled: boolean,
    agentId?: string,
    customPath?: string
  ) =>
    invoke<SkillItem>("toggle_skill", {
      id,
      enabled,
      agentId: agentId || null,
      customPath: customPath || null,
    }),

  saveSkillContent: (
    id: string,
    content: string,
    agentId?: string,
    customPath?: string
  ) =>
    invoke<void>("save_skill_content", {
      id,
      content,
      agentId: agentId || null,
      customPath: customPath || null,
    }),

  createSkill: (
    name: string,
    description: string,
    instructions: string,
    agentId?: string,
    customPath?: string
  ) =>
    invoke<string>("create_skill", {
      name,
      description,
      initialInstructions: instructions,
      agentId: agentId || null,
      customPath: customPath || null,
    }),

  deleteSkill: (id: string, agentId?: string, customPath?: string) =>
    invoke<void>("delete_skill", {
      id,
      agentId: agentId || null,
      customPath: customPath || null,
    }),

  installSkillDirect: (
    id: string,
    content: string,
    agentId?: string,
    customPath?: string
  ) =>
    invoke<string>("install_skill_direct", {
      id,
      content,
      agentId: agentId || null,
      customPath: customPath || null,
    }),

  installFromUrl: (
    repoUrl: string,
    customName?: string,
    agentId?: string,
    customPath?: string
  ) =>
    invoke<string>("install_from_url", {
      repoUrl,
      customName: customName || null,
      agentId: agentId || null,
      customPath: customPath || null,
    }),

  revealInFinder: (path: string) =>
    invoke<void>("reveal_in_finder", { path }),

  openBrowserUrl: (url: string) =>
    invoke<void>("open_browser_url", { url }),

  setWindowSize: (mode: WindowMode) =>
    invoke<void>("set_window_size", { mode }),
};
