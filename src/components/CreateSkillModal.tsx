import React, { useState } from "react";
import { X, Sparkles } from "lucide-react";
import { AgentTarget } from "../types";

interface CreateSkillModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAgent: AgentTarget;
  agents: AgentTarget[];
  onCreate: (name: string, description: string, instructions: string, targetAgent?: string) => Promise<void>;
}

export const CreateSkillModal: React.FC<CreateSkillModalProps> = ({
  isOpen,
  onClose,
  currentAgent,
  agents,
  onCreate,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [selectedAgentId, setSelectedAgentId] = useState(currentAgent.id);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    setSelectedAgentId(currentAgent.id);
  }, [currentAgent.id]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Skill name is required.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onCreate(name, description, instructions, selectedAgentId);
      setName("");
      setDescription("");
      setInstructions("");
      onClose();
    } catch (err: any) {
      setError(err?.toString() || "Failed to create skill.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div 
        className="relative w-full max-w-lg bg-[#141517] border border-zinc-800 rounded-xl shadow-2xl p-5 text-zinc-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-800/80">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-zinc-300" />
            <h3 className="text-sm font-semibold tracking-tight">Create AI Agent Skill</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mb-3 p-2.5 text-xs text-rose-300 bg-rose-950/40 border border-rose-800/60 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wider text-zinc-400 mb-1">
              Target Agent
            </label>
            <select
              value={selectedAgentId}
              onChange={(e) => setSelectedAgentId(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-[#0b0c0d] border border-zinc-800 rounded text-zinc-200 focus:outline-hidden focus:border-zinc-500 font-medium"
            >
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name} ({agent.path})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wider text-zinc-400 mb-1">
              Skill Name / ID
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. git-automator, test-runner"
              className="w-full px-3 py-1.5 text-xs bg-[#0b0c0d] border border-zinc-800 rounded text-zinc-200 focus:outline-hidden focus:border-zinc-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wider text-zinc-400 mb-1">
              Description (When agent should invoke it)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Automatically generates clean git commits and PR descriptions"
              className="w-full px-3 py-1.5 text-xs bg-[#0b0c0d] border border-zinc-800 rounded text-zinc-200 focus:outline-hidden focus:border-zinc-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wider text-zinc-400 mb-1">
              Initial Instructions
            </label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="## Guidelines&#10;1. Check git status before committing..."
              rows={4}
              className="w-full p-2.5 text-xs bg-[#0b0c0d] border border-zinc-800 rounded text-zinc-200 focus:outline-hidden focus:border-zinc-500 font-mono resize-none leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800/80">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-3.5 py-1.5 text-xs font-medium bg-zinc-100 hover:bg-white text-zinc-950 rounded transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Creating..." : "Create Skill"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
