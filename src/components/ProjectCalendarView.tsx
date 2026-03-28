/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight, MoreHorizontal, Calendar as CalendarIcon, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getTaskColor } from "@/lib/colors";
import { cn } from "@/lib/utils";

interface ProjectCalendarViewProps {
  tasks: any[];
  onTaskClick: (task: any) => void;
}

export function ProjectCalendarView({ tasks, onTaskClick }: ProjectCalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const getDayTasks = (day: Date) => {
    if (!Array.isArray(tasks)) return [];
    return tasks.filter(task => {
        if (!task.dueDate) return false;
        return isSameDay(new Date(task.dueDate), day);
    });
  };

  const getStatusConfig = (status: string) => {
    switch (status?.toUpperCase()) {
      case "DONE": return { color: "bg-emerald-500", label: "Done" };
      case "IN_PROGRESS": return { color: "bg-[#5252ff]", label: "In Progress" };
      case "AWAITING_APPROVAL": return { color: "bg-amber-400", label: "Awaiting" };
      default: return { color: "bg-slate-300", label: "To Do" };
    }
  };

  return (
    <div className="flex flex-col h-full bg-white animate-in fade-in duration-1000">
      
      {/* Premium Navigation Header */}
      <div className="flex items-center justify-between px-8 py-4 border-b bg-white relative z-20">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#5252ff]/10 flex items-center justify-center text-[#5252ff]">
            <CalendarIcon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground/90">
              {format(currentDate, "MMMM")}
              <span className="text-[#5252ff] ml-2">{format(currentDate, "yyyy")}</span>
            </h2>
          </div>
        </div>
        
        <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl border">
          <Button variant="ghost" size="icon" onClick={prevMonth} className="h-8 w-8 rounded-lg hover:bg-white hover:shadow-sm">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => setCurrentDate(new Date())} 
            className="text-[11px] font-bold uppercase tracking-wider px-3 hover:bg-white hover:shadow-sm h-8 rounded-lg"
          >
            Today
          </Button>
          <Button variant="ghost" size="icon" onClick={nextMonth} className="h-8 w-8 rounded-lg hover:bg-white hover:shadow-sm">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Modern Grid Container */}
      <div className="flex-1 overflow-auto p-6 bg-slate-50/30">
        <div className="bg-white border-[0.5px] rounded-2xl shadow-sm overflow-hidden">
          {/* Days Weekday Legend */}
          <div className="grid grid-cols-7 border-b bg-slate-50/50">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
              <div key={day} className="py-3 text-center text-[10px] font-bold uppercase text-muted-foreground/40 tracking-wider">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Day Grid */}
          <div className="grid grid-cols-7 auto-rows-[120px]">
            {days.map((day, idx) => {
              const dayTasks = getDayTasks(day);
              const isToday = isSameDay(day, new Date());
              const isCurrentMonth = isSameMonth(day, monthStart);

              return (
                <div 
                  key={idx} 
                  className={cn(
                    "p-2 border-r-[0.5px] border-b-[0.5px] last:border-r-0 group transition-all relative overflow-hidden",
                    !isCurrentMonth ? "bg-slate-50/30 opacity-40" : "bg-white hover:bg-slate-50/50",
                    isToday ? "bg-[#5252ff]/[0.02]" : ""
                  )}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={cn(
                      "text-[11px] font-bold w-6 h-6 flex items-center justify-center rounded-lg transition-all",
                      isToday 
                        ? "bg-[#5252ff] text-white shadow-lg shadow-[#5252ff]/20 scale-110" 
                        : "text-muted-foreground/50 group-hover:text-foreground"
                    )}>
                      {format(day, "d")}
                    </span>
                    {dayTasks.length > 0 && (
                      <div className="w-1.5 h-1.5 rounded-full bg-[#5252ff]/20" />
                    )}
                  </div>

                  <div className="space-y-1.5 overflow-hidden">
                    {dayTasks.map(task => {
                      const status = getStatusConfig(task.status);
                      return (
                        <div 
                          key={task.id}
                          onClick={() => onTaskClick(task)}
                          className={cn(
                            "px-2 py-1 rounded bg-white border-[0.5px] text-[10px] font-semibold truncate cursor-pointer shadow-sm transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-1.5",
                            task.status === 'DONE' && 'opacity-60 grayscale'
                          )}
                        >
                          <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", status.color)} />
                          <span className="truncate text-foreground/80">{task.title}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
