import { useState, useEffect, useCallback, useMemo } from "react";
import { SkillItem, AgentTarget, FilterStatus } from "../types";
import { api } from "../services/api";

export function useSkills() {
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [agents, setAgents] = useState<AgentTarget[]>([]);
  const [currentAgentId, setCurrentAgentIdState] = useState<string>(() => {
    return localStorage.getItem("skillhub_agent") || "claude";
  });
  const [customPath, setCustomPathState] = useState<string>(() => {
    return localStorage.getItem("skillhub_custom_path") || "";
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);

  const setCurrentAgentId = (id: string) => {
    setCurrentAgentIdState(id);
    localStorage.setItem("skillhub_agent", id);
    setSelectedSkillId(null);
  };

  const setCustomPath = (path: string) => {
    setCustomPathState(path);
    localStorage.setItem("skillhub_custom_path", path);
  };

  const loadAgents = useCallback(async () => {
    try {
      const data = await api.getAgents(customPath);
      setAgents(data);
    } catch (err) {
      console.error("Failed to load agents:", err);
    }
  }, [customPath]);

  const loadSkills = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await api.getSkills(currentAgentId, customPath);
      setSkills(data);
      await loadAgents();
    } catch (err: any) {
      setError(err?.toString() || "Failed to load skills.");
    } finally {
      setIsLoading(false);
    }
  }, [currentAgentId, customPath, loadAgents]);

  useEffect(() => {
    loadSkills();
  }, [loadSkills]);

  const toggleSkill = async (id: string, currentStatus: boolean) => {
    try {
      const updatedSkill = await api.toggleSkill(id, !currentStatus, currentAgentId, customPath);
      setSkills((prev) => prev.map((s) => (s.id === id ? updatedSkill : s)));
      await loadAgents();
    } catch (err: any) {
      alert(`Error toggling skill: ${err}`);
    }
  };

  const saveSkillContent = async (id: string, content: string) => {
    await api.saveSkillContent(id, content, currentAgentId, customPath);
    setSkills((prev) =>
      prev.map((s) => (s.id === id ? { ...s, raw_content: content } : s))
    );
  };

  const createSkill = async (name: string, description: string, instructions: string, targetAgent?: string) => {
    const destAgent = targetAgent || currentAgentId;
    await api.createSkill(name, description, instructions, destAgent, customPath);
    await loadSkills();
  };

  const deleteSkill = async (id: string) => {
    await api.deleteSkill(id, currentAgentId, customPath);
    if (selectedSkillId === id) {
      setSelectedSkillId(null);
    }
    await loadSkills();
  };

  const copySkillToAgent = async (id: string, toAgent: string) => {
    await api.copySkillToAgent(id, currentAgentId, toAgent, customPath, customPath);
    await loadAgents();
  };

  const installDirect = async (id: string, content: string, targetAgent?: string) => {
    const destAgent = targetAgent || currentAgentId;
    await api.installSkillDirect(id, content, destAgent, customPath);
    await loadSkills();
  };

  const installFromUrl = async (url: string, customName?: string, targetAgent?: string) => {
    const destAgent = targetAgent || currentAgentId;
    await api.installFromUrl(url, customName, destAgent, customPath);
    await loadSkills();
  };

  const filteredSkills = useMemo(() => {
    return skills.filter((skill) => {
      const matchesSearch =
        skill.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        skill.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        skill.description.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (filterStatus === "active") return skill.is_enabled;
      if (filterStatus === "disabled") return !skill.is_enabled;
      return true;
    });
  }, [skills, searchQuery, filterStatus]);

  const activeCount = skills.filter((s) => s.is_enabled).length;
  const disabledCount = skills.length - activeCount;
  const selectedSkill = skills.find((s) => s.id === selectedSkillId);

  const currentAgent = useMemo(() => {
    return agents.find((a) => a.id === currentAgentId) || {
      id: currentAgentId,
      name: currentAgentId === "codex" ? "OpenAI Codex" : currentAgentId === "cursor" ? "Cursor" : "Claude Code",
      path: "",
      description: "",
      exists: true,
      skills_count: skills.length,
      active_count: activeCount,
    };
  }, [agents, currentAgentId, skills.length, activeCount]);

  return {
    skills,
    filteredSkills,
    agents,
    currentAgentId,
    currentAgent,
    setCurrentAgentId,
    customPath,
    setCustomPath,
    selectedSkill,
    selectedSkillId,
    setSelectedSkillId,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    filterStatus,
    setFilterStatus,
    activeCount,
    disabledCount,
    loadSkills,
    loadAgents,
    toggleSkill,
    saveSkillContent,
    createSkill,
    deleteSkill,
    copySkillToAgent,
    installDirect,
    installFromUrl,
  };
}
