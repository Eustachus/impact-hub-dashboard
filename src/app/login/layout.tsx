import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Log In",
  description: "Sign in to your Focus account to manage your projects and tasks.",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
