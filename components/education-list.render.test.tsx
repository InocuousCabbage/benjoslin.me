/**
 * Render-layer tests for EducationList (iter-M2, ironic-miss n=9 close).
 *
 * Replaces the previous shape-only pins in copy-guards.test.ts that
 * grepped for `school.gradYear ? ... : null` and
 * `school.coursework.length > 0`. Those pins were behavior-equivalent-
 * refactor-brittle (a `school.gradYear && <p>{...}</p>` short-circuit
 * reads the same to a user but broke the regex).
 *
 * Mount EducationList with fixture schools and assert conditional
 * behavior on the DOM: gradYear + coursework sections appear only
 * when their data is present.
 */
import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import type { Education } from "@/lib/content";
import { EducationList } from "@/components/education-list";

afterEach(cleanup);

const schoolBase = {
  school: "Test University",
  degree: "B.S. Test",
  activities: ["Activity one"],
  coursework: [] as string[],
};

describe("EducationList conditional render (iter-M2)", () => {
  it("skips the gradYear <p> when school.gradYear is undefined", () => {
    const schools: Education[] = [schoolBase];
    const { container } = render(<EducationList schools={schools} />);
    expect(container.querySelector('[data-testid="school-gradyear"]')).toBeNull();
    expect(container.textContent).toContain("Test University");
  });

  it("renders the gradYear <p> with the given year when set", () => {
    const schools: Education[] = [{ ...schoolBase, gradYear: "2023" }];
    const { container } = render(<EducationList schools={schools} />);
    const gradYear = container.querySelector('[data-testid="school-gradyear"]');
    expect(gradYear).not.toBeNull();
    expect(gradYear!.textContent).toContain("2023");
  });

  it("skips the coursework section when school.coursework is empty", () => {
    const schools: Education[] = [schoolBase];
    const { container } = render(<EducationList schools={schools} />);
    expect(
      container.querySelector('[data-testid^="school-coursework-"]'),
    ).toBeNull();
    // "Coursework" label text also absent.
    expect(container.textContent).not.toContain("Coursework");
  });

  it("renders the coursework section + chip per item when non-empty", () => {
    const schools: Education[] = [
      {
        ...schoolBase,
        coursework: ["Course A", "Course B", "Course C"],
      },
    ];
    const { container } = render(<EducationList schools={schools} />);
    const section = container.querySelector('[data-testid^="school-coursework-"]');
    expect(section).not.toBeNull();
    const chips = section!.querySelectorAll("li");
    expect(chips.length).toBe(3);
    expect(section!.textContent).toContain("Course A");
    expect(section!.textContent).toContain("Course B");
    expect(section!.textContent).toContain("Course C");
  });
});
