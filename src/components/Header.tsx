import React, { useState, useRef, useEffect } from "react";
import { 
  ChevronDown,
  FolderOpen, 
  RefreshCw, 
  Plus, 
  Maximize2, 
  Minimize2,
  Compass,
  Check,
  FolderCog,
  Bot
} from "lucide-react";
import { AgentTarget, WindowMode } from "../types";

interface HeaderProps {
  currentAgent: AgentTarget;
  agents: AgentTarget[];
  onSelectAgent: (agentId: string) => void;
  onSetCustomPath: (path: string) => void;
  customPath: string;
  activeCount: number;
  disabledCount: number;
  isLoading: boolean;
  windowMode: WindowMode;
  onExplore: () => void;
  onRevealFolder: () => void;
  onRefresh: () => void;
  onCreateSkill: () => void;
  onToggleWindowMode: () => void;
}

const AGENT_COLORS: Record<string, { dot: string; badge: string; text: string }> = {
  claude: { dot: "bg-purple-500", badge: "bg-purple-500/10 text-purple-400 border-purple-500/20", text: "Claude Code" },
  codex: { dot: "bg-emerald-500", badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", text: "OpenAI Codex" },
  cursor: { dot: "bg-sky-500", badge: "bg-sky-500/10 text-sky-400 border-sky-500/20", text: "Cursor" },
  cline: { dot: "bg-amber-500", badge: "bg-amber-500/10 text-amber-400 border-amber-500/20", text: "Cline / Roo" },
  windsurf: { dot: "bg-teal-500", badge: "bg-teal-500/10 text-teal-400 border-teal-500/20", text: "Windsurf" },
  custom: { dot: "bg-zinc-400", badge: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20", text: "Custom Folder" },
};

export const Header: React.FC<HeaderProps> = ({
  currentAgent,
  agents,
  onSelectAgent,
  onSetCustomPath,
  customPath,
  activeCount,
  disabledCount,
  isLoading,
  windowMode,
  onExplore,
  onRevealFolder,
  onRefresh,
  onCreateSkill,
  onToggleWindowMode,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCustomPathModalOpen, setIsCustomPathModalOpen] = useState(false);
  const [customInputPath, setCustomInputPath] = useState(customPath);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentTheme = AGENT_COLORS[currentAgent.id] || AGENT_COLORS.claude;

  const handleApplyCustomPath = (e: React.FormEvent) => {
    e.preventDefault();
    onSetCustomPath(customInputPath.trim());
    onSelectAgent("custom");
    setIsCustomPathModalOpen(false);
    setIsDropdownOpen(false);
  };

  return (
    <header className="relative flex items-center justify-between px-3.5 py-2.5 bg-[#141517] border-b border-zinc-800/80 shrink-0">
      {/* Left: Agent Switcher & Status */}
      <div className="flex items-center gap-2" ref={dropdownRef}>
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-1.5 px-2 py-1 rounded bg-zinc-800/90 hover:bg-zinc-700/90 border border-zinc-700/60 text-xs font-medium text-zinc-100 transition-colors duration-150"
            title="Switch Target AI Agent"
          >
            <span className={`w-2 h-2 rounded-full ${currentTheme.dot}`} />
            <span className="font-semibold tracking-tight">{currentAgent.name}</span>
            <ChevronDown className="w-3 h-3 text-zinc-400 ml-0.5" />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute left-0 mt-1.5 w-64 rounded-lg bg-[#18191c] border border-zinc-700/80 shadow-2xl z-50 py-1 overflow-hidden animate-in fade-in duration-150">
              <div className="px-2.5 py-1.5 border-b border-zinc-800/80 text-[10px] font-medium text-zinc-400 uppercase tracking-wider">
                Select Target Agent
              </div>

              {agents.map((agent) => {
                const theme = AGENT_COLORS[agent.id] || AGENT_COLORS.claude;
                const isSelected = agent.id === currentAgent.id;

                return (
                  <button
                    key={agent.id}
                    onClick={() => {
                      onSelectAgent(agent.id);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 text-left text-xs transition-colors duration-100 hover:bg-zinc-800/80 ${
                      isSelected ? "bg-zinc-800/60 text-white" : "text-zinc-300"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${theme.dot}`} />
                      <div className="truncate">
                        <div className="font-medium truncate">{agent.name}</div>
                        <div className="font-mono text-[9px] text-zinc-500 truncate">{agent.path}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <span className="text-[10px] font-mono text-zinc-400">
                        {agent.skills_count}
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                    </div>
                  </button>
                );
              })}

              <div className="border-t border-zinc-800/80 mt-1 pt-1">
                <button
                  onClick={() => {
                    setIsCustomPathModalOpen(true);
                    setIsDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-left text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 transition-colors"
                >
                  <FolderCog className="w-3.5 h-3.5" />
                  <span>Configure Custom Folder...</span>
                </button>
              </div>
            </div>
          )}
        </div>

        <span className="font-mono text-[10px] text-zinc-400">
          {activeCount} active · {disabledCount} off
        </span>
      </div>

      {/* Right Action Buttons */}
      <div className="flex items-center gap-1">
        <button
          onClick={onExplore}
          title="Explore & Install Community Skills"
          className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium text-zinc-200 hover:text-white bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/60 transition-colors duration-150 mr-1"
        >
          <Compass className="w-3.5 h-3.5 text-zinc-400" />
          <span>Explore</span>
        </button>

        <button
          onClick={onRevealFolder}
          title={`Open ${currentAgent.path || "skills"} in Finder`}
          className="p-1.5 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors duration-150"
        >
          <FolderOpen className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onRefresh}
          title="Reload skills from disk"
          className="p-1.5 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors duration-150"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
        </button>

        <button
          onClick={onCreateSkill}
          title={`Create New Skill for ${currentAgent.name}`}
          className="p-1.5 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors duration-150"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onToggleWindowMode}
          title={windowMode === "popover" ? "Expand to Full Studio" : "Collapse to Popover"}
          className="p-1.5 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors duration-150"
        >
          {windowMode === "popover" ? (
            <Maximize2 className="w-3.5 h-3.5" />
          ) : (
            <Minimize2 className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* Custom Path Modal */}
      {isCustomPathModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#18191c] border border-zinc-700 rounded-lg p-4 w-full max-w-sm shadow-2xl">
            <h3 className="text-sm font-semibold text-zinc-100 mb-2 flex items-center gap-2">
              <Bot className="w-4 h-4 text-purple-400" />
              Custom Skills Directory
            </h3>
            <p className="text-xs text-zinc-400 mb-3">
              Set any custom folder path for your workspace or project skills.
            </p>
            <form onSubmit={handleApplyCustomPath}>
              <input
                type="text"
                value={customInputPath}
                onChange={(e) => setCustomInputPath(e.target.value)}
                placeholder="/path/to/custom/skills"
                className="w-full bg-[#111214] border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 mb-3 focus:outline-hidden focus:border-purple-500 font-mono"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCustomPathModalOpen(false)}
                  className="px-2.5 py-1 rounded text-xs text-zinc-400 hover:text-zinc-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 rounded text-xs font-medium bg-purple-600 hover:bg-purple-500 text-white"
                >
                  Save & Switch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
