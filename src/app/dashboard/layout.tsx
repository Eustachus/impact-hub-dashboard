import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        <Topbar />

        <main className="flex-1 overflow-auto p-4 md:p-6 bg-muted/10">
          {children}
        </main>
      </div>
    </div>
  );
}
