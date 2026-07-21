/**
 * Render-layer tests for ProjectList (Phase 3, follows Phase 2 pattern).
 *
 * Behavior-relevant tests (not shape-only per closed n=9 rule): mount
 * ProjectList with fixture projects and assert DOM presence/absence
 * for:
 * - project.year "Started YYYY" eyebrow renders only when year is set.
 * - project.note footer line renders only when note is set.
 * - project.chips rendered one <li> per chip.
 * - project.name / oneLiner / href all rendered.
 *
 * A refactor that always renders year / note (breaking the "optional
 * field absent = nothing rendered" contract) fails these tests via
 * observable DOM, not source-shape regex. A behavior-equivalent
 * ternary -> && refactor passes because the observable DOM is
 * identical.
 */
import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import type { Project } from "@/lib/content";
import { ProjectList } from "@/components/project-list";

afterEach(cleanup);

const baseProject: Project = {
  name: "Test Project",
  href: "https://example.com",
  oneLiner: "A test one-liner.",
  chips: ["Chip A", "Chip B"],
};

describe("ProjectList conditional render (Phase 3)", () => {
  it("skips the project-year eyebrow when year is absent", () => {
    const { container } = render(<ProjectList projects={[baseProject]} />);
    expect(container.querySelector('[data-testid="project-year"]')).toBeNull();
    // Name still renders so we know the component ran.
    expect(container.textContent).toContain("Test Project");
  });

  it("renders the project-year eyebrow with 'Started YYYY' when year is set", () => {
    const projects: Project[] = [{ ...baseProject, year: "2024" }];
    const { container } = render(<ProjectList projects={projects} />);
    const yearNode = container.querySelector('[data-testid="project-year"]');
    expect(yearNode).not.toBeNull();
    expect(yearNode!.textContent).toContain("Started 2024");
  });

  it("skips the project-note footer line when note is absent", () => {
    const { container } = render(<ProjectList projects={[baseProject]} />);
    expect(container.querySelector('[data-testid="project-note"]')).toBeNull();
  });

  it("renders the project-note footer line with the given text when note is set", () => {
    const projects: Project[] = [
      { ...baseProject, note: "Migration to Vercel pending" },
    ];
    const { container } = render(<ProjectList projects={projects} />);
    const note = container.querySelector('[data-testid="project-note"]');
    expect(note).not.toBeNull();
    expect(note!.textContent).toContain("Migration to Vercel pending");
  });

  it("renders one chip per project.chips item + name + oneLiner + external href", () => {
    const projects: Project[] = [
      {
        ...baseProject,
        chips: ["React", "TypeScript", "Vercel"],
      },
    ];
    const { container } = render(<ProjectList projects={projects} />);
    const chipsList = container.querySelector('[data-testid="project-chips"]');
    expect(chipsList).not.toBeNull();
    const chipItems = chipsList!.querySelectorAll("li");
    expect(chipItems.length).toBe(3);
    expect(chipsList!.textContent).toContain("React");
    expect(chipsList!.textContent).toContain("TypeScript");
    expect(chipsList!.textContent).toContain("Vercel");
    // Name + one-liner rendered.
    expect(container.textContent).toContain("Test Project");
    expect(container.textContent).toContain("A test one-liner.");
    // External anchor with correct href + rel + target for external
    // links (no next/link overhead + safe target=_blank).
    const anchor = container.querySelector('a[href="https://example.com"]');
    expect(anchor).not.toBeNull();
    expect(anchor!.getAttribute("target")).toBe("_blank");
    expect(anchor!.getAttribute("rel")).toBe("noopener noreferrer");
  });
});
