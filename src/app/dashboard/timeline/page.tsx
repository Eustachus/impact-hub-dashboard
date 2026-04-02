/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import { format, addDays, getDaysInMonth, startOfMonth } from "date-fns";
import { Button } from "@/components/ui/button";

export default function TimelinePage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [zoom, setZoom] = useState(1);
  const [tasks, setTasks] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  
  const daysInMonth = getDaysInMonth(currentDate);
  const startDate = startOfMonth(currentDate);
  const days = Array.from({ length: daysInMonth }).map((_, i) => addDays(startDate, i));

  useEffect(() => {
    fetch("/api/tasks")
      .then(res => res.json())
      .then(data => {
        setTasks(Array.isArray(data) ? data : []);
      })
      .catch(() => { setTasks([]); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8">Chargement de la timeline...</div>;

  const dayWidth = 40 * zoom;

  const timelineTasks = (Array.isArray(tasks) ? tasks : []).map((t: any, idx) => {
    const start = t.startDate ? new Date(t.startDate) : new Date(t.createdAt);
    const end = t.dueDate ? new Date(t.dueDate) : addDays(start, 2);
    
    const startDay = Math.max(1, start.getDate());
    const duration = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    
    const colors = ["bg-blue-500", "bg-purple-500", "bg-green-500", "bg-orange-500", "bg-red-500"];
    return {
      id: t.id,
      title: t.title,
      startDay,
      duration,
      color: colors[idx % colors.length]
    };
  });

  return (
    <div className="space-y-6 flex flex-col h-full pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Timeline</h1>
          <p className="text-muted-foreground">High-level Gantt view of your projects.</p>
        </div>
        <div className="flex items-center gap-2">
           <Button variant="outline" onClick={() => setZoom(z => Math.min(z + 0.25, 3))}>Zoom In</Button>
           <Button variant="outline" onClick={() => setZoom(z => Math.max(z - 0.25, 0.5))}>Zoom Out</Button>
        </div>
      </div>

      <div className="border border-muted rounded-xl bg-card overflow-x-auto flex-1 flex flex-col relative w-full">
        {/* Timeline Header (Days) */}
        <div className="min-w-fit w-full sticky top-0 bg-muted/20 z-10 border-b flex">
          <div className="w-[250px] shrink-0 border-r p-3 font-semibold text-sm sticky left-0 bg-muted/80 backdrop-blur z-20">
             Task
          </div>
          <div className="flex flex-1">
            {days.map((day, i) => (
              <div key={i} className="text-center p-2 border-r text-xs text-muted-foreground shrink-0 border-r-muted/50 flex flex-col items-center" style={{ minWidth: `${dayWidth}px`, width: `${dayWidth}px` }}>
                 <span>{format(day, "EE").charAt(0)}</span>
                 <span className={`font-semibold ${format(day, "d") === format(new Date(), "d") ? 'text-primary bg-primary/10 rounded-full w-6 h-6 flex items-center justify-center' : 'text-foreground'}`}>
                   {format(day, "d")}
                 </span>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline Rows */}
        <div className="min-w-fit w-full flex-1 flex flex-col">
          {timelineTasks.map((task) => (
            <div key={task.id} className="flex border-b border-muted/30 group hover:bg-muted/10 transition-colors">
              <div className="w-[250px] shrink-0 border-r p-3 text-sm font-medium sticky left-0 bg-card z-10 group-hover:bg-muted/30 transition-colors truncate">
                {task.title}
              </div>
              <div className="flex flex-1 relative min-h-[50px] items-center">
                {/* Grid lines inside row */}
                {days.map((day, i) => (
                  <div key={i} className="h-full border-r border-muted/20 shrink-0" style={{ minWidth: `${dayWidth}px`, width: `${dayWidth}px` }} />
                ))}
                
                {/* Gantt Bar */}
                <div 
                  className={`absolute h-8 rounded-md shadow-sm opacity-90 hover:opacity-100 cursor-pointer flex items-center px-3 text-xs text-white font-medium truncate ${task.color}`}
                  style={{
                    left: `${(task.startDay - 1) * dayWidth + 8}px`,
                    width: `${task.duration * dayWidth - 16}px`
                  }}
                >
                  {task.title}
                </div>
              </div>
            </div>
          ))}
          
          {Array.from({length: 5}).map((_, idx) => (
             <div key={`empty-${idx}`} className="flex border-b border-muted/30">
               <div className="w-[250px] shrink-0 border-r p-3 sticky left-0 bg-card z-10" />
               <div className="flex flex-1 relative min-h-[50px]">
                 {days.map((day, i) => (
                   <div key={i} className="h-full border-r border-muted/20 shrink-0" style={{ minWidth: `${dayWidth}px`, width: `${dayWidth}px` }} />
                 ))}
               </div>
             </div>
          ))}
        </div>
      </div>
    </div>
  );
}
