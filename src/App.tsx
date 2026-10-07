import { useState, useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { WindowMode } from "./types";
import { useSkills } from "./hooks/useSkills";
import { api } from "./services/api";

import { Header } from "./components/Header";
import { FilterBar } from "./components/FilterBar";
import { SkillCard } from "./components/SkillCard";
import { SkillInspector } from "./components/SkillInspector";
import { CreateSkillModal } from "./components/CreateSkillModal";
import { MarketplaceModal } from "./components/MarketplaceModal";
import { ConfirmModal } from "./components/ConfirmModal";

export function App() {
  const {
    skills,
    filteredSkills,
    selectedSkill,
    selectedSkillId,
    setSelectedSkillId,
    isLoading,
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
  } = useSkills();

  const [windowMode, setWindowMode] = useState<WindowMode>("popover");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isMarketplaceOpen, setIsMarketplaceOpen] = useState(false);

  // Deletion modal state
  const [skillToDelete, setSkillToDelete] = useState<{ id: string; name: string } | null>(null);

  // Hotkeys: Cmd+K / Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        document.getElementById("skillhub-search")?.focus();
      }
      if (e.key === "Escape") {
        if (skillToDelete) setSkillToDelete(null);
        else if (isMarketplaceOpen) setIsMarketplaceOpen(false);
        else if (isCreateModalOpen) setIsCreateModalOpen(false);
        else if (selectedSkillId) setSelectedSkillId(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedSkillId, isMarketplaceOpen, isCreateModalOpen, skillToDelete]);

  const toggleWindowMode = async () => {
    const nextMode: WindowMode = windowMode === "popover" ? "studio" : "popover";
    setWindowMode(nextMode);
    try {
      await api.setWindowSize(nextMode);
    } catch (err) {
      console.error("Failed to set window size:", err);
    }
  };

  const handleConfirmDelete = async () => {
    if (!skillToDelete) return;
    try {
      await deleteSkill(skillToDelete.id);
    } catch (err: any) {
      alert(`Failed to delete: ${err}`);
    } finally {
      setSkillToDelete(null);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0c0d0e] text-zinc-100 overflow-hidden font-sans border border-zinc-800/80 rounded-lg select-none">
      {/* Top Header */}
      <Header
        activeCount={activeCount}
        disabledCount={disabledCount}
        isLoading={isLoading}
        windowMode={windowMode}
        onExplore={() => setIsMarketplaceOpen(true)}
        onRevealFolder={() => api.revealInFinder("~/.claude/skills")}
        onRefresh={loadSkills}
        onCreateSkill={() => setIsCreateModalOpen(true)}
        onToggleWindowMode={toggleWindowMode}
      />

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left List View */}
        <div
          className={`flex flex-col h-full ${
            windowMode === "studio" && selectedSkill ? "w-1/2 border-r border-zinc-800/80" : "w-full"
          }`}
        >
          {/* Search & Filters */}
          <FilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filterStatus={filterStatus}
            onFilterChange={setFilterStatus}
            totalCount={skills.length}
            activeCount={activeCount}
            disabledCount={disabledCount}
          />

          {/* List of Skills */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {isLoading && skills.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-zinc-500 text-xs">
                <RefreshCw className="w-5 h-5 animate-spin mb-2 text-zinc-400" />
                Scanning ~/.claude/skills...
              </div>
            ) : filteredSkills.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-zinc-500 text-xs text-center p-4">
                <AlertCircle className="w-5 h-5 mb-2 text-zinc-600" />
                No skills found matching your filter.
              </div>
            ) : (
              filteredSkills.map((skill) => (
                <SkillCard
                  key={skill.id}
                  skill={skill}
                  isSelected={selectedSkillId === skill.id}
                  onToggle={toggleSkill}
                  onDelete={(id, name) => setSkillToDelete({ id, name })}
                  onClick={() => {
                    setSelectedSkillId(skill.id);
                    if (windowMode === "popover") {
                      toggleWindowMode();
                    }
                  }}
                />
              ))
            )}
          </div>
        </div>

        {/* Right Inspector (Studio Mode) */}
        {windowMode === "studio" && selectedSkill && (
          <div className="w-1/2 h-full">
            <SkillInspector
              skill={selectedSkill}
              onClose={() => setSelectedSkillId(null)}
              onToggle={toggleSkill}
              onDelete={(id, name) => setSkillToDelete({ id, name })}
              onSaveContent={saveSkillContent}
              onRevealInFinder={(path) => api.revealInFinder(path)}
            />
          </div>
        )}
      </div>

      {/* Footer Quick Bar */}
      <footer className="flex items-center justify-between px-3 py-1.5 bg-[#141517] border-t border-zinc-800/80 text-[10px] text-zinc-400 font-mono shrink-0">
        <span>~/.claude/skills</span>
        <span>Operate Mode · 100% English</span>
      </footer>

      {/* Create Skill Modal */}
      <CreateSkillModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={createSkill}
      />

      {/* Explore & Marketplace Modal */}
      <MarketplaceModal
        isOpen={isMarketplaceOpen}
        onClose={() => setIsMarketplaceOpen(false)}
        installedSkillIds={skills.map((s) => s.id)}
        onInstallDirect={installDirect}
        onInstallUrl={installFromUrl}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!skillToDelete}
        title="Delete Claude Code Skill"
        message={`Are you sure you want to permanently delete "${skillToDelete?.name}"? This will remove its folder from ~/.claude/skills.`}
        confirmLabel="Delete Permanently"
        isDestructive={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setSkillToDelete(null)}
      />
    </div>
  );
}

export default App;
