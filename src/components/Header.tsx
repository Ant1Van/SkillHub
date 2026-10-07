import React from "react";
import { 
  Terminal, 
  Compass, 
  FolderOpen, 
  RefreshCw, 
  Plus, 
  Maximize2, 
  Minimize2 
} from "lucide-react";
import { WindowMode } from "../types";

interface HeaderProps {
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

export const Header: React.FC<HeaderProps> = ({
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
  return (
    <header className="flex items-center justify-between px-3.5 py-2.5 bg-[#141517] border-b border-zinc-800/80 shrink-0">
      <div className="flex items-center gap-2">
        <div className="p-1 rounded bg-zinc-800 text-zinc-300">
          <Terminal className="w-3.5 h-3.5" />
        </div>
        <div>
          <span className="text-xs font-semibold tracking-tight text-zinc-100">
            Claude SkillHub
          </span>
          <span className="ml-2 font-mono text-[10px] text-zinc-400">
            {activeCount} active · {disabledCount} off
          </span>
        </div>
      </div>

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
          title="Open ~/.claude/skills in Finder"
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
          title="Create New Skill"
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
    </header>
  );
};
