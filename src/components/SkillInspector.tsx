import React, { useState } from "react";
import { 
  Folder, 
  ExternalLink, 
  Save, 
  Check, 
  X, 
  FileCode,
  Trash2,
  Copy
} from "lucide-react";
import { SkillItem, AgentTarget } from "../types";
import { Switch } from "./Switch";
import { api } from "../services/api";

interface SkillInspectorProps {
  skill: SkillItem;
  agents: AgentTarget[];
  currentAgentId: string;
  onClose: () => void;
  onToggle: (id: string, currentStatus: boolean) => void;
  onDelete: (id: string, name: string) => void;
  onSaveContent: (id: string, newContent: string) => Promise<void>;
  onRevealInFinder: (path: string) => void;
  onCopyToAgent: (skillId: string, toAgentId: string) => Promise<void>;
}

export const SkillInspector: React.FC<SkillInspectorProps> = ({
  skill,
  agents,
  currentAgentId,
  onClose,
  onToggle,
  onDelete,
  onSaveContent,
  onRevealInFinder,
  onCopyToAgent,
}) => {
  const [activeTab, setActiveTab] = useState<"overview" | "editor" | "files">("overview");
  const [editorContent, setEditorContent] = useState(skill.raw_content);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [copySuccessMessage, setCopySuccessMessage] = useState<string | null>(null);

  React.useEffect(() => {
    setEditorContent(skill.raw_content);
    setSaveSuccess(false);
    setCopySuccessMessage(null);
  }, [skill.id, skill.raw_content]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSaveContent(skill.id, editorContent);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopy = async (targetAgentId: string) => {
    try {
      setIsCopying(true);
      await onCopyToAgent(skill.id, targetAgentId);
      const targetName = agents.find((a) => a.id === targetAgentId)?.name || targetAgentId;
      setCopySuccessMessage(`Copied to ${targetName}!`);
      setTimeout(() => setCopySuccessMessage(null), 3000);
    } catch (err: any) {
      alert(`Failed to copy: ${err}`);
    } finally {
      setIsCopying(false);
    }
  };

  const otherAgents = agents.filter((a) => a.id !== currentAgentId && a.id !== "custom");

  return (
    <div className="flex flex-col h-full bg-[#111214] border-l border-zinc-800/80 text-zinc-100">
      {/* Top Header */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-800/80 bg-[#141517]">
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            className={`flex h-2.5 w-2.5 rounded-full shrink-0 ${
              skill.is_enabled ? "bg-emerald-500 ring-2 ring-emerald-500/20" : "bg-zinc-600"
            }`}
          />
          <div className="truncate">
            <h2 className="text-sm font-semibold tracking-tight truncate">{skill.display_name}</h2>
            <p className="font-mono text-[11px] text-zinc-400 truncate">{skill.id}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            title="Delete Skill"
            onClick={() => onDelete(skill.id, skill.display_name)}
            className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-950/30 rounded transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <Switch
            checked={skill.is_enabled}
            onChange={() => onToggle(skill.id, skill.is_enabled)}
            ariaLabel={`Toggle ${skill.display_name}`}
          />
          <button
            onClick={onClose}
            aria-label="Close Inspector"
            className="p-1 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded transition-colors ml-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-zinc-800/80 bg-[#0e0f11] px-4">
        {(["overview", "editor", "files"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`
              px-3 py-2 text-xs font-medium border-b-2 capitalize transition-colors duration-150
              ${
                activeTab === tab
                  ? "border-zinc-200 text-zinc-100"
                  : "border-transparent text-zinc-400 hover:text-zinc-300"
              }
            `}
          >
            {tab === "editor" ? "SKILL.md Editor" : tab}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === "overview" && (
          <div className="space-y-4">
            <div>
              <label className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider block mb-1">
                Description
              </label>
              <div className="p-3 bg-[#18191c] rounded-md border border-zinc-800 text-xs leading-relaxed text-zinc-300">
                {skill.description || "No description provided."}
              </div>
            </div>

            <div>
              <label className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider block mb-1">
                Location on Disk
              </label>
              <div className="flex items-center justify-between p-2.5 bg-[#18191c] rounded-md border border-zinc-800 gap-2">
                <span className="font-mono text-[11px] text-zinc-400 truncate select-all">
                  {skill.path}
                </span>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => {
                      const match = skill.raw_content.match(/https:\/\/github\.com\/[a-zA-Z0-9_\-\.\/]+/);
                      const targetUrl = match ? match[0].replace(/[\)\"\'>\s]+$/, "") : `https://github.com/search?q=${encodeURIComponent(skill.id + " skill")}&type=code`;
                      api.openBrowserUrl(targetUrl);
                    }}
                    title="Find / Open on GitHub"
                    className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded border border-zinc-700/60 transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    GitHub
                  </button>
                  <button
                    onClick={() => onRevealInFinder(skill.path)}
                    title="Reveal in Finder / Explorer"
                    className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded border border-zinc-700/60 transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Finder
                  </button>
                </div>
              </div>
            </div>

            {/* Cross-Agent Sharing */}
            {otherAgents.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider block">
                    Copy to Other AI Agents
                  </label>
                  {copySuccessMessage && (
                    <span className="text-[11px] text-emerald-400 font-medium animate-in fade-in">
                      {copySuccessMessage}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {otherAgents.map((target) => (
                    <button
                      key={target.id}
                      onClick={() => handleCopy(target.id)}
                      disabled={isCopying}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded border border-zinc-700/60 transition-colors disabled:opacity-50"
                      title={`Copy this skill into ${target.name} (${target.path})`}
                    >
                      <Copy className="w-3 h-3 text-zinc-400" />
                      <span>Copy to {target.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 bg-[#18191c] rounded-md border border-zinc-800">
                <span className="text-[11px] text-zinc-400 block mb-0.5">Status</span>
                <span className={`text-xs font-semibold ${skill.is_enabled ? "text-emerald-400" : "text-zinc-500"}`}>
                  {skill.is_enabled ? "Enabled" : "Disabled (.disabled)"}
                </span>
              </div>
              <div className="p-3 bg-[#18191c] rounded-md border border-zinc-800">
                <span className="text-[11px] text-zinc-400 block mb-0.5">Total Assets</span>
                <span className="text-xs font-semibold text-zinc-200">{skill.files_count} files</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === "editor" && (
          <div className="flex flex-col h-full space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-zinc-400">SKILL.md</span>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-zinc-100 hover:bg-white text-zinc-950 rounded transition-colors disabled:opacity-50"
              >
                {saveSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    Saved!
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
            <textarea
              value={editorContent}
              onChange={(e) => setEditorContent(e.target.value)}
              className="w-full flex-1 min-h-[300px] p-3 font-mono text-xs bg-[#18191c] border border-zinc-800 rounded-md text-zinc-200 focus:outline-hidden focus:border-zinc-600 resize-none"
              spellCheck={false}
            />
          </div>
        )}

        {activeTab === "files" && (
          <div className="space-y-2">
            <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider block mb-1">
              File Tree ({skill.files.length})
            </span>
            <div className="border border-zinc-800 rounded-md bg-[#18191c] divide-y divide-zinc-800/60 max-h-[320px] overflow-y-auto">
              {skill.files.length === 0 ? (
                <div className="p-3 text-xs text-zinc-500 italic">No additional files found.</div>
              ) : (
                skill.files.map((file) => (
                  <div key={file.rel_path} className="flex items-center justify-between px-3 py-2 text-xs">
                    <div className="flex items-center gap-2 truncate">
                      {file.is_dir ? (
                        <Folder className="w-3.5 h-3.5 text-amber-500/80 shrink-0" />
                      ) : (
                        <FileCode className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      )}
                      <span className="font-mono text-zinc-300 truncate">{file.rel_path}</span>
                    </div>
                    {!file.is_dir && (
                      <span className="text-[10px] font-mono text-zinc-500 shrink-0 ml-2">
                        {(file.size_bytes / 1024).toFixed(1)} KB
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
