import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Timeline",
  description: "Visualize your project schedule with a Gantt timeline view in Focus.",
};

export default function TimelineLayout({ children }: { children: React.ReactNode }) {
  return children;
}
