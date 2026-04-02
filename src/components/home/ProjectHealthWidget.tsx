"use client";

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import Link from "next/link";
import { useState, useEffect } from "react";

export function ProjectHealthWidget() {
  const [data, setData] = useState<Record<string, unknown>[]>([
    { name: "On Track", value: 0, color: "#10b981" },
    { name: "At Risk", value: 0, color: "#f59e0b" },
    { name: "Off Track", value: 0, color: "#ef4444" },
  ]);

  useEffect(() => {
    fetch("/api/stats")
      .then(res => res.json())
      .then((stats: Record<string, unknown>) => {
        const projects = (stats.projectProgress as Record<string, unknown>[]) || [];
        const onTrack = projects.filter((p: Record<string, unknown>) => (p.progress as number) >= 70).length;
        const atRisk = projects.filter((p: Record<string, unknown>) => (p.progress as number) >= 30 && (p.progress as number) < 70).length;
        const offTrack = projects.filter((p: Record<string, unknown>) => (p.progress as number) < 30).length;
        setData([
          { name: "On Track", value: onTrack || 1, color: "#10b981" },
          { name: "At Risk", value: atRisk || 0, color: "#f59e0b" },
          { name: "Off Track", value: offTrack || 0, color: "#ef4444" },
        ]);
      })
      .catch(() => {});
  }, []);

  return (
    <Link href="/dashboard/projects" className="block h-[220px] w-full cursor-pointer transition-opacity hover:opacity-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color as string} />
            ))}
          </Pie>
          <Tooltip
             contentStyle={{ backgroundColor: 'rgba(23, 23, 23, 0.8)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', color: '#fff' }}
             itemStyle={{ fontSize: '10px', fontWeight: 700 }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex justify-center gap-4 text-[10px] font-black uppercase tracking-tight mt-2 opacity-60">
        {data.map((item, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color as string }} />
            <span>{item.name as string}</span>
          </div>
        ))}
      </div>
    </Link>
  );
}
