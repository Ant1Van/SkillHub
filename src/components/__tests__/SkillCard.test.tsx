import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SkillCard } from "../SkillCard";
import { SkillItem } from "../../types";

const mockSkill: SkillItem = {
  id: "test-runner",
  name: "test-runner",
  display_name: "Test Runner Pro",
  description: "Runs tests fast and cleanly",
  path: "/home/user/.claude/skills/test-runner",
  is_enabled: true,
  scope: "global",
  files_count: 3,
  raw_content: "---\nname: test-runner\n---\n",
  files: [],
};

describe("SkillCard Component", () => {
  it("renders display name, id and description correctly", () => {
    render(
      <SkillCard
        skill={mockSkill}
        onToggle={vi.fn()}
        onDelete={vi.fn()}
        onClick={vi.fn()}
      />
    );

    expect(screen.getByText("Test Runner Pro")).toBeInTheDocument();
    expect(screen.getByText("test-runner")).toBeInTheDocument();
    expect(screen.getByText("Runs tests fast and cleanly")).toBeInTheDocument();
    expect(screen.getByText("3 files")).toBeInTheDocument();
  });

  it("calls onClick when card is clicked", () => {
    const onClick = vi.fn();

    render(
      <SkillCard
        skill={mockSkill}
        onToggle={vi.fn()}
        onDelete={vi.fn()}
        onClick={onClick}
      />
    );

    fireEvent.click(screen.getByText("Test Runner Pro"));
    expect(onClick).toHaveBeenCalled();
  });

  it("calls onDelete when delete button is pressed", () => {
    const onDelete = vi.fn();

    render(
      <SkillCard
        skill={mockSkill}
        onToggle={vi.fn()}
        onDelete={onDelete}
        onClick={vi.fn()}
      />
    );

    const deleteBtn = screen.getByTitle("Delete Skill");
    fireEvent.click(deleteBtn);
    expect(onDelete).toHaveBeenCalledWith("test-runner", "Test Runner Pro");
  });
});
