import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your Focus profile, preferences, and account settings.",
};

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
