import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Goals & OKRs",
  description: "Track your objectives and key results to measure team progress in Focus.",
};

export default function GoalsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
