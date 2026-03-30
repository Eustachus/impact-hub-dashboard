import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Calendar",
  description: "View your tasks and deadlines in a weekly calendar view in Focus.",
};

export default function CalendarLayout({ children }: { children: React.ReactNode }) {
  return children;
}
