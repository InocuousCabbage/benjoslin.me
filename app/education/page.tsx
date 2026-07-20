import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = {
  title: "Education",
  alternates: { canonical: "/education" },
};

export default function EducationPage() {
  return <ComingSoon title="Education" />;
}
