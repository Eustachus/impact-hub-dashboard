import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inbox",
  description: "Your Focus inbox — notifications, mentions, and email messages.",
};

export default function InboxLayout({ children }: { children: React.ReactNode }) {
  return children;
}
