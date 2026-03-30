import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create a free Focus account to start managing your projects and collaborating with your team.",
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
