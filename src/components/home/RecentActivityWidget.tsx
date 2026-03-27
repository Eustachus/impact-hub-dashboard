/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";

interface RecentActivityWidgetProps {
  activities: any[];
}

export function RecentActivityWidget({ activities = [] }: RecentActivityWidgetProps) {
  if (activities.length === 0) {
    return (
      <div className="text-center py-10 opacity-30 italic text-xs font-medium">
        No recent pulses detected.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((act: any, i: number) => (
        <Link href="/dashboard/timeline" key={i} className="flex gap-3 text-xs leading-relaxed group/act cursor-pointer hover:bg-muted/5 p-2 -mx-2 rounded-lg transition-colors">
          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-black border border-primary/20 shadow-lg shadow-primary/5">
            {act.user.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-foreground/80">
              <span className="font-black text-foreground">{act.user}</span> {act.action}{" "}
              <span className="text-primary font-black italic">#{act.target}</span>
            </p>
            <div className="flex items-center gap-2 mt-1 opacity-50 font-bold uppercase tracking-widest text-[8px]">
               <span>{act.time}</span>
               <div className="w-1 h-1 rounded-full bg-muted-foreground/40" />
               <span>{act.project || 'Global'}</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
