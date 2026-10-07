import React from "react";
import { FileText, ChevronRight, Trash2 } from "lucide-react";
import { SkillItem } from "../types";
import { Switch } from "./Switch";

interface SkillCardProps {
  skill: SkillItem;
  isSelected?: boolean;
  onToggle: (id: string, currentStatus: boolean) => void;
  onDelete: (id: string, name: string) => void;
  onClick: () => void;
}

export const SkillCard: React.FC<SkillCardProps> = ({
  skill,
  isSelected,
  onToggle,
  onDelete,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className={`
        group relative flex items-start justify-between gap-3 p-3.5 rounded-lg border 
        transition-colors duration-150 ease-out cursor-pointer outline-none
        focus-visible:ring-1 focus-visible:ring-zinc-400
        ${
          isSelected
            ? "bg-zinc-800/80 border-zinc-600 shadow-sm"
            : "bg-[#141517] border-zinc-800/80 hover:bg-zinc-800/40 hover:border-zinc-700/80"
        }
      `}
    >
      <div className="flex-1 min-w-0 pr-1">
        <div className="flex items-center gap-2 mb-1">
          {skill.is_enabled ? (
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 shrink-0" title="Active" />
          ) : (
            <span className="flex h-2 w-2 rounded-full bg-zinc-600 shrink-0" title="Disabled" />
          )}

          <h3 className="text-[13px] font-semibold text-zinc-100 truncate tracking-tight">
            {skill.display_name}
          </h3>

          <span className="font-mono text-[10px] text-zinc-400 bg-zinc-800/90 px-1.5 py-0.5 rounded border border-zinc-700/50 shrink-0">
            {skill.id}
          </span>
        </div>

        <p className="text-[12px] text-zinc-400 line-clamp-2 leading-relaxed mb-2">
          {skill.description || "No description provided."}
        </p>

        <div className="flex items-center gap-3 text-[11px] text-zinc-400 font-mono">
          <span className="inline-flex items-center gap-1">
            <FileText className="w-3 h-3 text-zinc-400" />
            {skill.files_count} file{skill.files_count === 1 ? "" : "s"}
          </span>
          <span className="text-zinc-500">·</span>
          <span className="capitalize">{skill.scope}</span>
        </div>
      </div>

      <div className="flex flex-col items-end justify-between h-full shrink-0 gap-3 pt-0.5">
        <div className="flex items-center gap-2">
          <button
            type="button"
            title="Delete Skill"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(skill.id, skill.display_name);
            }}
            className="opacity-0 group-hover:opacity-100 p-1 text-zinc-500 hover:text-rose-400 hover:bg-rose-950/30 rounded transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <Switch
            checked={skill.is_enabled}
            onChange={() => onToggle(skill.id, skill.is_enabled)}
            ariaLabel={`Toggle ${skill.display_name}`}
          />
        </div>
        <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors duration-150" />
      </div>
    </div>
  );
};
