import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Providers } from "@/components/providers";
import { CommandPalette } from "@/components/CommandPalette";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  metadataBase: new URL("https://focus.app"),
  title: {
    default: "Focus — Project Management & Productivity",
    template: "%s | Focus",
  },
  description:
    "Focus is a project management and productivity platform for teams. Manage tasks, track time, set goals, and collaborate in real-time.",
  keywords: [
    "project management",
    "productivity",
    "task management",
    "team collaboration",
    "kanban",
    "gantt",
    "OKR",
    "time tracking",
  ],
  authors: [{ name: "Focus" }],
  creator: "Focus",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Focus",
    title: "Focus — Project Management & Productivity",
    description:
      "Manage tasks, track time, set goals, and collaborate in real-time.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Focus — Project Management & Productivity",
    description:
      "Manage tasks, track time, set goals, and collaborate in real-time.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", inter.variable)} suppressHydrationWarning>
      <body className="antialiased">
        <Providers attribute="class" defaultTheme="system" enableSystem>
          <CommandPalette />
          {children}
        </Providers>
      </body>
    </html>
  );
}
