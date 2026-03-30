import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Tasks",
  description: "View and manage all tasks assigned to you across your projects in Focus.",
};

export default function MyTasksLayout({ children }: { children: React.ReactNode }) {
  return children;
}
