import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Header } from "../Header";
import { AgentTarget } from "../../types";

const mockAgents: AgentTarget[] = [
  {
    id: "claude",
    name: "Claude Code",
    path: "/home/user/.claude/skills",
    description: "Claude Code CLI skills",
    exists: true,
    skills_count: 10,
    active_count: 8,
  },
  {
    id: "codex",
    name: "OpenAI Codex",
    path: "/home/user/.codex/skills",
    description: "OpenAI Codex skills",
    exists: true,
    skills_count: 3,
    active_count: 3,
  },
];

describe("Header Component with Agent Switcher", () => {
  it("renders active agent and counts", () => {
    const onSelectAgent = vi.fn();
    render(
      <Header
        currentAgent={mockAgents[0]}
        agents={mockAgents}
        onSelectAgent={onSelectAgent}
        onSetCustomPath={vi.fn()}
        customPath=""
        activeCount={8}
        disabledCount={2}
        isLoading={false}
        windowMode="popover"
        onExplore={vi.fn()}
        onRevealFolder={vi.fn()}
        onRefresh={vi.fn()}
        onCreateSkill={vi.fn()}
        onToggleWindowMode={vi.fn()}
      />
    );

    expect(screen.getByText("Claude Code")).toBeInTheDocument();
    expect(screen.getByText("8 active · 2 off")).toBeInTheDocument();
  });

  it("opens dropdown and allows selecting another agent", () => {
    const onSelectAgent = vi.fn();
    render(
      <Header
        currentAgent={mockAgents[0]}
        agents={mockAgents}
        onSelectAgent={onSelectAgent}
        onSetCustomPath={vi.fn()}
        customPath=""
        activeCount={8}
        disabledCount={2}
        isLoading={false}
        windowMode="popover"
        onExplore={vi.fn()}
        onRevealFolder={vi.fn()}
        onRefresh={vi.fn()}
        onCreateSkill={vi.fn()}
        onToggleWindowMode={vi.fn()}
      />
    );

    // Click dropdown button
    fireEvent.click(screen.getByText("Claude Code"));

    // Check if dropdown items are shown
    expect(screen.getByText("OpenAI Codex")).toBeInTheDocument();

    // Select OpenAI Codex
    fireEvent.click(screen.getByText("OpenAI Codex"));
    expect(onSelectAgent).toHaveBeenCalledWith("codex");
  });
});
