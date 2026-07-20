import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = {
  title: "Music",
  alternates: { canonical: "/music" },
};

export default function MusicPage() {
  return <ComingSoon title="Music" />;
}
