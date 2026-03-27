/* eslint-disable */
import { useMemo, useRef, useEffect } from "react";
import { format, startOfMonth, addMonths, eachDayOfInterval, isSameDay, addDays, differenceInDays, startOfDay } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Clock, Briefcase, ChevronRight, AlertCircle, Maximize2, GitBranch } from "lucide-react";
import { getTaskColor } from "@/lib/colors";
import { cn } from "@/lib/utils";

interface ProjectTimelineViewProps {
  tasks: any[];
  onTaskClick: (task: any) => void;
}

export function ProjectTimelineView({ tasks, onTaskClick }: ProjectTimelineViewProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollHeaderRef = useRef<HTMLDivElement>(null);

  // Sync scrolling between header and body
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (scrollHeaderRef.current) {
      scrollHeaderRef.current.scrollLeft = (e.currentTarget as HTMLDivElement).scrollLeft;
    }
  };

  const validTasks = useMemo(() => {
    return tasks.filter(t => t.dueDate || t.startDate).sort((a, b) => {
      const dateA = new Date(a.startDate || a.dueDate).getTime();
      const dateB = new Date(b.startDate || b.dueDate).getTime();
      return dateA - dateB;
    });
  }, [tasks]);

  const { startDate, days } = useMemo(() => {
    if (validTasks.length === 0) {
      const start = startOfMonth(new Date());
      const end = addMonths(start, 2);
      return { startDate: start, days: eachDayOfInterval({ start, end }) };
    }

    let min = new Date();
    let max = new Date();

    validTasks.forEach(t => {
      const tStart = new Date(t.startDate || t.dueDate);
      const tEnd = new Date(t.dueDate || t.startDate);
      if (tStart < min) min = tStart;
      if (tEnd > max) max = tEnd;
    });

    const timelineStart = addDays(startOfDay(min), -7);
    const timelineEnd = addDays(startOfDay(max), 30);

    return { 
      startDate: timelineStart, 
      days: eachDayOfInterval({ start: timelineStart, end: timelineEnd }) 
    };
  }, [validTasks]);

  const DAY_WIDTH = 50; // Increased width for better readability

  useEffect(() => {
    if (scrollContainerRef.current) {
        const todayIdx = days.findIndex(d => isSameDay(d, new Date()));
        if (todayIdx !== -1) {
            scrollContainerRef.current.scrollLeft = Math.max(0, todayIdx * DAY_WIDTH - 300);
        }
    }
  }, [days]);

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
      
      {/* Premium Roadmap Header (Sticky) */}
      <div className="flex border-b bg-white z-20 sticky top-0">
        <div className="min-w-[280px] w-[280px] border-r p-6 bg-slate-50/30 flex items-center">
             <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#5252ff]/10 flex items-center justify-center text-[#5252ff]">
                <Briefcase className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/40 leading-none mb-1">Timeline</h3>
                <p className="text-[13px] font-bold text-foreground">{validTasks.length} Tasks</p>
              </div>
            </div>
        </div>
        
        <div className="flex-1 overflow-hidden" ref={scrollHeaderRef}>
          <div className="flex" style={{ width: days.length * DAY_WIDTH }}>
            {days.map((day, idx) => {
              const isFirstOfMonth = day.getDate() === 1;
              const isToday = isSameDay(day, new Date());
              return (
                <div 
                  key={idx} 
                  className={cn(
                    "flex-shrink-0 text-center py-4 h-18 flex flex-col justify-center relative transition-colors border-r-[0.5px] border-slate-100",
                    isToday && "bg-[#5252ff]/[0.02]"
                  )}
                  style={{ width: DAY_WIDTH }}
                >
                  {isFirstOfMonth && (
                    <span className="absolute top-1 left-2 text-[9px] font-bold text-[#5252ff] uppercase tracking-wider whitespace-nowrap">
                       {format(day, 'MMM yyyy')}
                    </span>
                  )}
                  <span className={cn(
                    "text-[10px] font-bold uppercase tracking-tighter mb-0.5",
                    isToday ? "text-[#5252ff]" : "text-muted-foreground/40"
                  )}>
                    {format(day, 'EEE')}
                  </span>
                  <span className={cn(
                    "text-[14px] font-bold tracking-tight",
                    isToday ? "text-[#5252ff]" : "text-foreground/70"
                  )}>
                    {day.getDate()}
                  </span>
                  {isToday && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#5252ff]" />}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Roadmap Content Body */}
      <div className="flex-1 overflow-hidden">
        <div 
          className="flex h-full overflow-auto custom-scrollbar scroll-smooth" 
          onScroll={handleScroll}
          ref={scrollContainerRef}
        >
          {/* Vertical Grid Lines Layer */}
          <div className="absolute pointer-events-none flex" style={{ width: days.length * DAY_WIDTH, height: '100%', left: 280 }}>
            {days.map((_, idx) => (
              <div key={idx} className="h-full border-r-[0.5px] border-slate-100" style={{ width: DAY_WIDTH }} />
            ))}
          </div>

          <div className="relative flex min-h-full" style={{ width: `calc(280px + ${days.length * DAY_WIDTH}px)` }}>
            
            {/* Task Sidebar */}
            <div className="min-w-[280px] w-[280px] border-r bg-white sticky left-0 z-10">
              {validTasks.map((task) => (
                <div 
                  key={task.id} 
                  className="h-12 border-b-[0.5px] px-6 flex items-center hover:bg-slate-50 cursor-pointer transition-all group overflow-hidden"
                  onClick={() => onTaskClick(task)}
                >
                  <div className="flex items-center gap-2 overflow-hidden w-full">
                    <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", getStatusConfig(task.status).color)} />
                    <p className="text-[13px] font-semibold text-foreground/80 group-hover:text-[#5252ff] transition-colors truncate">{task.title}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Bars Canvas */}
            <div className="flex-1 relative">
               {validTasks.map((task) => {
                  const start = new Date(task.startDate || task.dueDate);
                  const end = new Date(task.dueDate || task.startDate);
                  const startOffset = differenceInDays(start, startDate);
                  const duration = Math.max(1, differenceInDays(end, start) + 1);
                  const status = getStatusConfig(task.status);

                  return (
                    <div key={task.id} className="h-12 border-b-[0.5px] relative flex items-center">
                       <div 
                          className={cn(
                            "absolute h-7 rounded flex items-center px-3 cursor-pointer group hover:scale-[1.01] active:scale-95 transition-all shadow-sm border border-white/20",
                            status.color, "text-white"
                          )}
                          style={{ 
                              left: startOffset * DAY_WIDTH + 10, 
                              width: Math.max(40, duration * DAY_WIDTH - 20),
                          }}
                          onClick={() => onTaskClick(task)}
                       >
                          <span className="text-[10px] font-bold truncate drop-shadow-sm pointer-events-none uppercase tracking-tight">
                              {task.title}
                          </span>
                       </div>
                    </div>
                  );
               })}
               
               {/* Today Pointer */}
               <div 
                  className="absolute top-0 bottom-0 w-px bg-[#5252ff] z-10 pointer-events-none"
                  style={{ 
                      left: differenceInDays(new Date(), startDate) * DAY_WIDTH + DAY_WIDTH / 2,
                   }}
               >
                  <div className="w-2 h-2 rounded-full bg-[#5252ff] -ml-[3.5px] mt-2 shadow-[0_0_10px_rgba(82,82,255,0.5)]" />
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
