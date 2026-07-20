import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = {
  title: "Photo",
  alternates: { canonical: "/photo" },
};

export default function PhotoPage() {
  return <ComingSoon title="Photo" />;
}
