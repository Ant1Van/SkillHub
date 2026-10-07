import { useState, useEffect, useCallback, useMemo } from "react";
import { SkillItem, FilterStatus } from "../types";
import { api } from "../services/api";

export function useSkills() {
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);

  const loadSkills = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await api.getSkills();
      setSkills(data);
    } catch (err: any) {
      setError(err?.toString() || "Failed to load skills.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSkills();
  }, [loadSkills]);

  const toggleSkill = async (id: string, currentStatus: boolean) => {
    try {
      const updatedSkill = await api.toggleSkill(id, !currentStatus);
      setSkills((prev) => prev.map((s) => (s.id === id ? updatedSkill : s)));
    } catch (err: any) {
      alert(`Error toggling skill: ${err}`);
    }
  };

  const saveSkillContent = async (id: string, content: string) => {
    await api.saveSkillContent(id, content);
    setSkills((prev) =>
      prev.map((s) => (s.id === id ? { ...s, raw_content: content } : s))
    );
  };

  const createSkill = async (name: string, description: string, instructions: string) => {
    await api.createSkill(name, description, instructions);
    await loadSkills();
  };

  const deleteSkill = async (id: string) => {
    await api.deleteSkill(id);
    if (selectedSkillId === id) {
      setSelectedSkillId(null);
    }
    await loadSkills();
  };

  const installDirect = async (id: string, content: string) => {
    await api.installSkillDirect(id, content);
    await loadSkills();
  };

  const installFromUrl = async (url: string, customName?: string) => {
    await api.installFromUrl(url, customName);
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

  return {
    skills,
    filteredSkills,
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
    toggleSkill,
    saveSkillContent,
    createSkill,
    deleteSkill,
    installDirect,
    installFromUrl,
  };
}
