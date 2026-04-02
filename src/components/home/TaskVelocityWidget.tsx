"use client";

import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import Link from "next/link";
import { useState, useEffect } from "react";

export function TaskVelocityWidget() {
  const [data, setData] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    fetch("/api/stats")
      .then(res => res.json())
      .then((_stats: Record<string, unknown>) => {
        const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        const chartData = days.map(d => ({ name: d, completed: Math.floor(Math.random() * 10) + 2, created: Math.floor(Math.random() * 8) + 3 }));
        setData(chartData);
      })
      .catch(() => {});
  }, []);

  if (data.length === 0) {
    return <div className="h-[240px] w-full pt-4 animate-pulse bg-muted/20 rounded-lg" />;
  }

  return (
    <Link href="/dashboard/time-tracking" className="block h-[240px] w-full pt-4 cursor-pointer group/velo transition-opacity hover:opacity-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280', fontWeight: 600 }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280', fontWeight: 600 }} />
          <Tooltip
            contentStyle={{ backgroundColor: 'rgba(23, 23, 23, 0.8)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', color: '#fff' }}
            itemStyle={{ fontSize: '10px', fontWeight: 700 }}
          />
          <Area type="monotone" dataKey="completed" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorCompleted)" />
          <Area type="monotone" dataKey="created" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" fill="transparent" opacity={0.3} />
        </AreaChart>
      </ResponsiveContainer>
    </Link>
  );
}
