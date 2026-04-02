/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Target, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

export function GoalsOverviewWidget() {
  const [goals, setGoals] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/goals")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setGoals(data.slice(0, 3));
      })
      .catch(() => {});
  }, []);

  if (goals.length === 0) {
    return (
      <div className="text-xs text-muted-foreground text-center py-8">
        <Target className="h-6 w-6 mx-auto mb-2 opacity-30" />
        No active goals
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {goals.map((goal, i) => (
        <Link href="/dashboard/goals" key={goal.id || i} className="block space-y-1.5 group/goal cursor-pointer hover:bg-muted/5 p-2 -mx-2 rounded-lg transition-colors">
          <div className="flex justify-between items-center">
             <div className="flex items-center gap-2">
               <Target className="h-3.5 w-3.5 text-primary opacity-60 group-hover/goal:opacity-100 transition-opacity" />
               <span className="text-[11px] font-black tracking-tight">{goal.title}</span>
             </div>
             <span className="text-[9px] font-black uppercase tracking-tighter text-muted-foreground/60">{goal.progress}%</span>
          </div>
          <div className="h-1.5 w-full bg-muted/10 rounded-full overflow-hidden border border-white/5">
            <div
              className="h-full bg-primary/60 group-hover/goal:bg-primary transition-all duration-1000"
              style={{ width: `${goal.progress}%` }}
            />
          </div>
          <div className="flex items-center gap-1.5 opacity-40 group-hover/goal:opacity-100 transition-opacity">
             <TrendingUp className="h-2.5 w-2.5 text-emerald-500" />
             <span className="text-[8px] font-black uppercase tracking-widest">{goal.status}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
