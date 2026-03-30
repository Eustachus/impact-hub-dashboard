import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Files",
  description: "Manage and preview all files and attachments across your projects in Focus.",
};

export default function FilesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
