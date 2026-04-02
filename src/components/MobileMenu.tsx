"use client";

import { useState, useCallback, useEffect } from "react";
import { Menu, X, Home, CheckCircle2, Inbox, Target, CalendarDays, GitCommitHorizontal, FolderKanban, Clock, FileIcon, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    close();
  }, [pathname, close]);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden h-9 w-9"
        onClick={() => setOpen(!open)}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {open && (
        <>
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm lg:hidden" onClick={close} />
          <div className="fixed inset-y-0 left-0 z-50 w-64 bg-card border-r shadow-xl lg:hidden">
            <div className="flex items-center justify-between h-14 px-4 border-b">
              <h2 className="text-lg font-bold tracking-tight">focus</h2>
              <Button variant="ghost" size="icon" onClick={close} className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <nav className="flex-1 overflow-auto py-4 px-2 space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={close}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </>
      )}
    </>
  );
}
