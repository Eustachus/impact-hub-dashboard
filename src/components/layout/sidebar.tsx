/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, CheckCircle2, Inbox, Target, ChevronLeft, ChevronRight, CalendarDays, GitCommitHorizontal, FolderKanban, Clock, FileIcon } from "lucide-react";
import { useUIStore } from "@/stores/useUIStore";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

const navItems = [
  { name: "Home", href: "/dashboard", icon: Home },
  { name: "My Tasks", href: "/dashboard/my-tasks", icon: CheckCircle2 },
  { name: "Inbox", href: "/dashboard/inbox", icon: Inbox },
  { name: "Projects", href: "/dashboard/projects", icon: FolderKanban },
  { name: "Calendar", href: "/dashboard/calendar", icon: CalendarDays },
  { name: "Timeline", href: "/dashboard/timeline", icon: GitCommitHorizontal },
  { name: "Goals", href: "/dashboard/goals", icon: Target },
  { name: "Time Tracking", href: "/dashboard/time-tracking", icon: Clock },
  { name: "Files", href: "/dashboard/files", icon: FileIcon },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useUIStore();

  return (
    <aside
      className={cn(
        "relative flex flex-col border-r bg-card/70 backdrop-blur-xl transition-all duration-300",
        sidebarOpen ? "w-64" : "w-16"
      )}
    >
      <div className="flex h-14 items-center justify-between border-b px-4">
        {sidebarOpen && <h2 className="text-lg font-bold tracking-tight">focus</h2>}
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="h-8 w-8 rounded-full ml-auto">
          {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>
      </div>
      
      <div className="flex-1 overflow-auto py-4">
        <nav className="space-y-1 px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  !sidebarOpen && "justify-center px-0"
                )}
                title={!sidebarOpen ? item.name : undefined}
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                {sidebarOpen && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>
        
        {sidebarOpen && (
          <div className="mt-8 px-4">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Projects
            </h3>
            <div className="space-y-1 max-h-[300px] overflow-auto pr-1 custom-scrollbar">
              <SidebarProjectList />
            </div>
          </div>
        )}

      </div>

      <div className="border-t p-4">
        <Link
          href="/dashboard/help"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
            !sidebarOpen && "justify-center px-0"
          )}
        >
          <Inbox className="h-4 w-4 flex-shrink-0" />
          {sidebarOpen && <span>Help</span>}
        </Link>
      </div>
    </aside>
  );
}

function SidebarProjectList() {
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    const load = () => {
      fetch("/api/projects")
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setProjects(data);
        })
        .catch(err => console.error("Sidebar fetch err:", err));
    };
    load();
    const interval = setInterval(load, 10000); // 10s refresh
    return () => clearInterval(interval);
  }, []);

  if (projects.length === 0) {
    return <div className="text-xs text-muted-foreground italic px-2">No projects yet</div>;
  }

  return (
    <>
      {projects.map((p) => (
        <Link
          key={p.id}
          href={`/dashboard/projects/${p.id}`}
          className="flex items-center gap-3 rounded-lg px-2 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground group"
        >
          <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.color || "#3b82f6" }} />
          <span className="truncate flex-1">{p.name}</span>
        </Link>
      ))}
    </>
  );
}


