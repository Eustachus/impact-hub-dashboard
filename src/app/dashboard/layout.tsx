import type { Metadata } from "next";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your Focus dashboard — overview of projects, tasks, and productivity stats.",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ErrorBoundary>
      <div className="flex h-screen bg-background overflow-hidden">
        <Sidebar className="hidden lg:flex" />
        
        <div className="flex-1 flex flex-col overflow-hidden w-full">
          <Topbar />

          <main className="flex-1 overflow-auto p-4 md:p-6 bg-muted/10">
            {children}
          </main>
        </div>
      </div>
    </ErrorBoundary>
  );
}
