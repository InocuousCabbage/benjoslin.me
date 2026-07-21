/**
 * Render-layer tests for CareerLog (iter-M2, ironic-miss n=9 close).
 *
 * Replaces the previous shape-only pins in copy-guards.test.ts that
 * grepped for `role.impact ? ... : null` and `role.initiatives.length
 * > 0`. Those pins were behavior-equivalent-refactor-brittle (a
 * `role.impact && <p>{role.impact}</p>` short-circuit reads the same
 * to a user but broke the regex).
 *
 * Instead, mount CareerLog with fixture roles and assert the
 * conditional rendering behavior directly on the DOM:
 * - fixture role WITHOUT impact -> no [data-testid="role-impact"] node.
 * - fixture role WITH impact    -> impact <p> present with correct text.
 * - fixture role WITHOUT initiatives -> no [data-testid^="role-initiatives-"] node.
 * - fixture role WITH initiatives    -> <ul> present, each initiative rendered.
 *
 * A refactor that always renders the impact <p> (breaking the
 * "leave empty" contract for Ben's placeholder roles) fails these
 * tests. A refactor that switches ternary to && short-circuit
 * (behavior-equivalent) passes. That's the correct behavior boundary
 * per weemeemee's iter-M2 codification.
 */
import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import type { CareerPhase } from "@/lib/content";
import { CareerLog } from "@/components/career-log";

afterEach(cleanup);

const roleBase = {
  title: "Test Role",
  company: "Test Co",
  dates: "Jan 2024 - present",
};

describe("CareerLog conditional render (iter-M2)", () => {
  it("skips the impact <p> when role.impact is absent", () => {
    const phases: CareerPhase[] = [
      {
        label: "Phase A",
        roles: [{ ...roleBase, initiatives: [] }],
      },
    ];
    const { container } = render(<CareerLog phases={phases} />);
    expect(container.querySelector('[data-testid="role-impact"]')).toBeNull();
    // Role title still renders so we know the component ran.
    expect(container.textContent).toContain("Test Role");
  });

  it("renders the impact <p> with the given text when role.impact is set", () => {
    const phases: CareerPhase[] = [
      {
        label: "Phase A",
        roles: [
          {
            ...roleBase,
            impact: "Shipped X, drove Y outcome.",
            initiatives: [],
          },
        ],
      },
    ];
    const { container } = render(<CareerLog phases={phases} />);
    const impact = container.querySelector('[data-testid="role-impact"]');
    expect(impact).not.toBeNull();
    expect(impact!.textContent).toContain("Shipped X, drove Y outcome.");
  });

  it("skips the initiatives <ul> when role.initiatives is empty", () => {
    const phases: CareerPhase[] = [
      {
        label: "Phase A",
        roles: [{ ...roleBase, initiatives: [] }],
      },
    ];
    const { container } = render(<CareerLog phases={phases} />);
    expect(
      container.querySelector('[data-testid^="role-initiatives-"]'),
    ).toBeNull();
  });

  it("renders the initiatives <ul> with a bullet per item when non-empty", () => {
    const phases: CareerPhase[] = [
      {
        label: "Phase A",
        roles: [
          {
            ...roleBase,
            initiatives: ["Initiative one", "Initiative two", "Initiative three"],
          },
        ],
      },
    ];
    const { container } = render(<CareerLog phases={phases} />);
    const list = container.querySelector('[data-testid^="role-initiatives-"]');
    expect(list).not.toBeNull();
    const items = list!.querySelectorAll("li");
    expect(items.length).toBe(3);
    expect(list!.textContent).toContain("Initiative one");
    expect(list!.textContent).toContain("Initiative two");
    expect(list!.textContent).toContain("Initiative three");
  });
});
