/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { CheckCircle2, Clock, ListTodo, Users } from "lucide-react";
import Link from "next/link";

interface StatsOverviewWidgetProps {
  stats: any;
}

export function StatsOverviewWidget({ stats }: StatsOverviewWidgetProps) {
  const statCards = [
    { label: "Total Tasks", value: stats?.totalTasks || 0, icon: ListTodo, color: "text-blue-500", bg: "bg-blue-500/10", href: "/dashboard/my-tasks" },
    { label: "Completed", value: stats?.completedTasks || 0, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10", href: "/dashboard/my-tasks" },
    { label: "In Progress", value: stats?.inProgressTasks || 0, icon: Clock, color: "text-orange-500", bg: "bg-orange-500/10", href: "/dashboard/my-tasks" },
    { label: "Active Initiatives", value: stats?.totalProjects || 0, icon: Users, color: "text-purple-500", bg: "bg-purple-500/10", href: "/dashboard/projects" },
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {statCards.map((stat, i) => (
        <Link href={stat.href} key={i} className="block p-4 rounded-2xl bg-muted/5 border border-white/5 hover:border-primary/20 transition-all group/stat cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <div className={`p-1.5 rounded-lg ${stat.bg} ${stat.color}`}>
               <stat.icon className="h-4 w-4" />
            </div>
            <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest leading-none">Live</span>
          </div>
          <p className="text-2xl font-black tracking-tighter leading-none">{stat.value}</p>
          <p className="text-[11px] font-bold text-muted-foreground mt-1 group-hover/stat:text-primary transition-colors">{stat.label}</p>
        </Link>
      ))}
    </div>
  );
}
