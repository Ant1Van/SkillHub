import React from "react";
import { Search } from "lucide-react";
import { FilterStatus } from "../types";
import { getSearchShortcutLabel } from "../utils/platform";

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterStatus: FilterStatus;
  onFilterChange: (status: FilterStatus) => void;
  totalCount: number;
  activeCount: number;
  disabledCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  filterStatus,
  onFilterChange,
  totalCount,
  activeCount,
  disabledCount,
}) => {
  return (
    <div className="p-3 space-y-2 border-b border-zinc-800/80 bg-[#111214] shrink-0">
      <div className="relative">
        <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-2.5" />
        <input
          id="skillhub-search"
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={`Search skills (${getSearchShortcutLabel()})...`}
          className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#0b0c0d] border border-zinc-800/90 rounded text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition-colors"
        />
      </div>

      <div className="flex items-center gap-1 bg-[#0b0c0d] p-0.5 rounded border border-zinc-800/80 text-[11px]">
        {(["all", "active", "disabled"] as const).map((status) => (
          <button
            key={status}
            onClick={() => onFilterChange(status)}
            className={`
              flex-1 py-1 rounded text-center capitalize font-medium transition-colors duration-150
              ${
                filterStatus === status
                  ? "bg-zinc-800 text-zinc-100 shadow-xs"
                  : "text-zinc-400 hover:text-zinc-300"
              }
            `}
          >
            {status === "all"
              ? `All (${totalCount})`
              : status === "active"
              ? `Active (${activeCount})`
              : `Off (${disabledCount})`}
          </button>
        ))}
      </div>
    </div>
  );
};
