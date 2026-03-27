/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import Link from "next/link";
import { Folder, ChevronRight, Star } from "lucide-react";

interface RecentProjectsWidgetProps {
  projects: any[];
}

export function RecentProjectsWidget({ projects }: RecentProjectsWidgetProps) {
  const recent = projects.slice(0, 6);

  if (recent.length === 0) {
    return (
      <div className="text-center py-10 opacity-40 italic text-sm">
        No projects yet. Start creating!
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-2">
      {recent.map((project) => (
        <Link 
          key={project.id} 
          href={`/dashboard/projects/${project.id}`}
          className="flex items-center justify-between p-2.5 rounded-xl bg-muted/5 hover:bg-primary/10 border border-transparent hover:border-primary/20 transition-all group/proj"
        >
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-white shadow-lg shadow-${project.color || 'primary'}/20`} style={{ backgroundColor: project.color || '#3b82f6' }}>
              <span className="text-lg">{project.icon || "📁"}</span>
            </div>
            <div>
              <p className="text-sm font-black tracking-tight">{project.name}</p>
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest leading-none mt-0.5">
                {project.status || "ACTIVE"}
              </p>
            </div>
          </div>
          <div className="opacity-0 group-hover/proj:opacity-100 transition-all transform translate-x-[-4px] group-hover/proj:translate-x-0">
            <ChevronRight className="h-4 w-4 text-primary" />
          </div>
        </Link>
      ))}
    </div>
  );
}
