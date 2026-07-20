import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = {
  title: "Career",
  alternates: { canonical: "/career" },
};

export default function CareerPage() {
  return <ComingSoon title="Career" />;
}
