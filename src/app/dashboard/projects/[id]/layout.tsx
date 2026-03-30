import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Project Details",
  description: "View and manage tasks, timeline, and workflow for this project in Focus.",
};

export default function ProjectDetailLayout({ children }: { children: React.ReactNode }) {
  return children;
}
