import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Time Tracking",
  description: "Track your work hours with the Pomodoro timer and time log in Focus.",
};

export default function TimeTrackingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
