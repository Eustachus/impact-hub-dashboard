/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { 
    format, startOfMonth, addMonths, eachDayOfInterval, isSameDay, 
    addDays, differenceInDays, startOfDay, subDays, endOfMonth,
    eachWeekOfInterval, startOfWeek
} from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
    ChevronRight, Calendar, Filter, MoreHorizontal, Plus, GitBranch, ArrowRight,
    Search, LayoutList, ChevronDown, ListFilter, Palette, Settings, ExternalLink,
    Triangle, Slack, Mail, Github, MousePointer2, CheckCircle2, Check, ZoomIn, ZoomOut,
    Clock, Info, X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface ProjectGanttViewProps {
  tasks: any[];
  onTaskClick: (task: any) => void;
}

type ZoomLevel = "days" | "weeks" | "months";

export function ProjectGanttView({ tasks, onTaskClick }: ProjectGanttViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>("days");
  const [hoveredTask, setHoveredTask] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showOnlyActive, setShowOnlyActive] = useState(false);
  const [showDependencies, setShowDependencies] = useState(true);
  const [isAddingWork, setIsAddingWork] = useState(false);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesActive = showOnlyActive ? (task.status !== 'DONE') : true;
        return matchesSearch && matchesActive;
    });
  }, [tasks, searchQuery, showOnlyActive]);

  const groups = useMemo(() => {
    const sections: Record<string, any[]> = {};
    filteredTasks.forEach(task => {
        const groupName = task.section?.name || "General";
        if (!sections[groupName]) sections[groupName] = [];
        sections[groupName].push(task);
    });
    return sections;
  }, [filteredTasks]);

  const COLUMN_WIDTH = useMemo(() => {
    switch(zoomLevel) {
        case "days": return 42;
        case "weeks": return 120;
        case "months": return 240;
        default: return 42;
    }
  }, [zoomLevel]);

  const { startDate, intervals } = useMemo(() => {
    const dates = tasks.flatMap(t => [
      t.startDate ? new Date(t.startDate) : null,
      t.dueDate ? new Date(t.dueDate) : null
    ]).filter(Boolean) as Date[];

    const minDate = dates.length > 0 ? new Date(Math.min(...dates.map(d => d.getTime()))) : new Date();
    const maxDate = dates.length > 0 ? new Date(Math.max(...dates.map(d => d.getTime()))) : addMonths(new Date(), 4);

    const start = subDays(startOfDay(minDate), 30);
    const end = addMonths(maxDate, 3);

    let items: Date[] = [];
    if (zoomLevel === "days") {
        items = eachDayOfInterval({ start, end });
    } else if (zoomLevel === "weeks") {
        items = eachWeekOfInterval({ start, end });
    } else {
        const monthInterval = [];
        let curr = startOfMonth(start);
        while (curr <= end) {
            monthInterval.push(curr);
            curr = addMonths(curr, 1);
        }
        items = monthInterval;
    }

    return {
      startDate: start,
      intervals: items
    };
  }, [tasks, zoomLevel]);

  const toggleGroup = (name: string) => {
    setCollapsedGroups(prev => ({ ...prev, [name]: !prev[name] }));
  };

  // Helper to get X position based on date and zoom
  const getX = (date: Date) => {
    const diff = differenceInDays(startOfDay(date), startOfDay(startDate));
    if (zoomLevel === "days") return diff * COLUMN_WIDTH;
    if (zoomLevel === "weeks") return (diff / 7) * COLUMN_WIDTH;
    if (zoomLevel === "months") {
        const monthsDiff = (date.getFullYear() - startDate.getFullYear()) * 12 + (date.getMonth() - startDate.getMonth());
        const dayOfMonth = date.getDate();
        const daysInMonth = 30; 
        return (monthsDiff + (dayOfMonth / daysInMonth)) * COLUMN_WIDTH;
    }
    return 0;
  };

  const getWidth = (start: Date, end: Date) => {
    const diff = Math.max(1, differenceInDays(end, start) + 1);
    if (zoomLevel === "days") return diff * COLUMN_WIDTH;
    if (zoomLevel === "weeks") return (diff / 7) * COLUMN_WIDTH;
    if (zoomLevel === "months") return (diff / 30) * COLUMN_WIDTH;
    return 0;
  };

  return (
    <div className="flex flex-col h-full bg-white select-none">
      
      {/* Top Filter Bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-muted/30">
        <div className="flex items-center gap-6">
            <button 
                onClick={() => setIsAddingWork(!isAddingWork)}
                className={cn(
                    "bg-[#5252ff] hover:bg-[#4040ff] text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 shadow-sm shadow-[#5252ff]/20 transition-all",
                    isAddingWork && "bg-slate-900 shadow-none scale-95"
                )}
            >
                {isAddingWork ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                {isAddingWork ? "Cancel" : "Add work"}
            </button>
            <div className="flex items-center gap-5 text-[12px] font-medium text-muted-foreground/80">
                <span className="hover:text-primary transition-colors cursor-pointer" onClick={() => {
                     if(scrollRef.current) {
                        const todayOffset = getX(new Date());
                        scrollRef.current.scrollTo({ left: todayOffset - 200, behavior: 'smooth' });
                     }
                }}>Today</span>
                <span 
                    onClick={() => setShowOnlyActive(!showOnlyActive)}
                    className={cn(
                        "flex items-center gap-2 hover:text-primary transition-colors cursor-pointer",
                        showOnlyActive ? "text-[#5252ff] font-bold" : "text-muted-foreground/50"
                    )}
                >
                    <CheckCircle2 className="h-4 w-4" /> 
                    {showOnlyActive ? "Active tasks" : "All tasks"}
                </span>
                <div className="flex items-center bg-slate-100/50 rounded-lg p-0.5 border">
                    {(["days", "weeks", "months"] as ZoomLevel[]).map((level) => (
                        <button
                            key={level}
                            onClick={() => setZoomLevel(level)}
                            className={cn(
                                "px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all",
                                zoomLevel === level ? "bg-white text-primary shadow-sm" : "text-muted-foreground/40 hover:text-muted-foreground/60"
                            )}
                        >
                            {level}
                        </button>
                    ))}
                </div>
            </div>
        </div>
        <div className="flex items-center gap-4 text-[12px] font-medium text-muted-foreground/80">
             <div className="relative flex items-center">
                <Search className="h-3.5 w-3.5 absolute left-3 text-muted-foreground/30" />
                <Input 
                    placeholder="Search tasks..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-8 pl-9 w-48 text-[11px] font-bold border-muted/20 bg-muted/5 focus-visible:ring-1 focus-visible:ring-primary/20 rounded-lg"
                />
             </div>
             <div className="flex items-center gap-1 border-r pr-4 mr-2">
                <button 
                  onClick={() => setZoomLevel(prev => prev === "days" ? "weeks" : prev === "weeks" ? "months" : "months")}
                  className="p-1 hover:bg-slate-50 rounded"
                >
                    <ZoomOut className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => setZoomLevel(prev => prev === "months" ? "weeks" : prev === "weeks" ? "days" : "days")}
                  className="p-1 hover:bg-slate-50 rounded"
                >
                    <ZoomIn className="h-4 w-4" />
                </button>
             </div>
            <button 
                onClick={() => setShowDependencies(!showDependencies)}
                className={cn(
                    "flex items-center gap-2 hover:text-primary transition-colors cursor-pointer px-3 py-1 rounded-md",
                    showDependencies ? "bg-primary/5 text-primary font-bold" : "text-muted-foreground/50"
                )}
            >
                <GitBranch className={cn("h-4 w-4", showDependencies ? "animate-pulse" : "")} /> 
                <span className="hidden xl:inline">Dependencies</span>
            </button>
            <MoreHorizontal className="h-4 w-4 text-muted-foreground/30" />
        </div>
      </div>

      {isAddingWork && (
          <div className="bg-slate-50 border-b px-6 py-4 flex items-center gap-4 animate-in slide-in-from-top duration-300">
              <div className="flex-1">
                  <Input placeholder="Enter task name..." className="h-10 text-sm font-bold border-none bg-white shadow-sm" autoFocus />
              </div>
              <div className="flex items-center gap-2">
                  <Badge variant="outline" className="px-3 py-1 font-black uppercase text-[9px] border-emerald-100 bg-emerald-50 text-emerald-600">Quick Draft</Badge>
                  <button className="bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold" onClick={() => setIsAddingWork(false)}>Create Task</button>
              </div>
          </div>
      )}

      <div className="flex-1 overflow-hidden flex">
        {/* Left Panel: Hierarchical List */}
        <div className="w-[480px] border-r flex flex-col bg-white shrink-0 shadow-xl z-10 relative">
            <div className="h-10 border-b flex items-center px-6 bg-muted/[0.04] text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">
                <div className="flex-1">Task Breakdown</div>
                <div className="w-24 px-4 border-l">Status</div>
                <div className="w-28 px-4 border-l">Timeline</div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {Object.entries(groups).map(([groupName, groupTasks]) => (
                    <div key={groupName} className="border-b last:border-0">
                        <div 
                            className="h-10 flex items-center px-4 bg-muted/[0.02] hover:bg-muted/[0.05] cursor-pointer group transition-colors"
                            onClick={() => toggleGroup(groupName)}
                        >
                            <ChevronDown className={cn("h-4 w-4 text-muted-foreground/40 mr-2 transition-transform", collapsedGroups[groupName] && "-rotate-90")} />
                            <span className="text-[12px] font-bold flex-1">{groupName}</span>
                            <div className="flex items-center gap-2 px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 mr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                <span className="text-[9px] font-bold uppercase truncate">Section OK</span>
                            </div>
                        </div>
                        
                        {!collapsedGroups[groupName] && groupTasks.map((task) => {
                            const statusInfo = {
                                DONE: { label: 'Completed', color: 'bg-emerald-500', text: 'text-emerald-500' },
                                IN_PROGRESS: { label: 'In progress', color: 'bg-[#5252ff]', text: 'text-[#5252ff]' },
                                AWAITING_APPROVAL: { label: 'Review', color: 'bg-amber-400', text: 'text-amber-500' },
                                TODO: { label: 'Pending', color: 'bg-slate-300', text: 'text-slate-400' }
                            };
                            const info = statusInfo[task.status as keyof typeof statusInfo] || statusInfo.TODO;
                            
                            return (
                                <div 
                                    key={task.id} 
                                    onMouseEnter={() => setHoveredTask(task.id)}
                                    onMouseLeave={() => setHoveredTask(null)}
                                    className={cn(
                                        "h-10 flex items-center px-4 hover:bg-[#5252ff]/[0.02] cursor-pointer group transition-colors border-t border-muted/10 first:border-0",
                                        hoveredTask === task.id && "bg-[#5252ff]/[0.02]"
                                    )}
                                    onClick={() => onTaskClick(task)}
                                >
                                    <div className="w-6 shrink-0 flex items-center justify-center ml-2">
                                        <div className="w-4 h-4 rounded-full border border-muted/50 flex items-center justify-center text-[10px] text-muted-foreground/40 group-hover:border-primary group-hover:text-primary transition-all">
                                            {task.status === 'DONE' ? <Check className="h-2.5 w-2.5" /> : null}
                                        </div>
                                    </div>
                                    <span className="text-[12px] font-semibold text-foreground/80 flex-1 truncate px-3">{task.title}</span>
                                    <div className="w-24 px-4 border-l flex items-center gap-2">
                                        <div className={cn("w-2 h-2 rounded-full", info.color)} />
                                        <span className={cn("text-[11px] font-bold", info.text)}>{info.label}</span>
                                    </div>
                                    <div className="w-28 px-4 border-l text-[10px] font-bold text-muted-foreground/50">
                                        {task.startDate ? `${format(new Date(task.startDate), 'MMM d')} - ${format(new Date(task.dueDate), 'd')}` : 'TBD'}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ))}
                {filteredTasks.length === 0 && (
                    <div className="p-20 text-center space-y-3">
                         <Search className="h-10 w-10 text-muted-foreground/10 mx-auto" />
                         <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/30 italic">No tasks match your search</p>
                    </div>
                )}
            </div>
        </div>

        {/* Right Panel: Timeline Grid & Markers */}
        <div className="flex-1 overflow-x-auto overflow-y-auto custom-scrollbar relative bg-slate-50/20" ref={scrollRef}>
            <div className="relative min-h-full" style={{ width: intervals.length * COLUMN_WIDTH }}>
                
                {/* Fixed Timeline Header Cells */}
                <div className="sticky top-0 h-20 bg-white border-b z-30 flex flex-col shadow-sm">
                    {/* Primary Grid Header */}
                    <div className="h-10 flex border-b bg-muted/[0.02] sticky left-0 w-full">
                         {useMemo(() => {
                            const mainHeaders: { label: string, width: number }[] = [];
                            intervals.forEach((item) => {
                                const label = zoomLevel === "months" ? format(item, 'yyyy') : format(item, 'MMMM yyyy');
                                if (mainHeaders.length === 0 || mainHeaders[mainHeaders.length - 1].label !== label) {
                                    mainHeaders.push({ label, width: 1 });
                                } else {
                                    mainHeaders[mainHeaders.length - 1].width++;
                                }
                            });
                            return mainHeaders.map((m, i) => (
                                <div key={i} className="h-full flex items-center px-8 text-[11px] font-black uppercase text-muted-foreground/30 border-r border-muted/10 tracking-widest whitespace-nowrap" style={{ width: m.width * COLUMN_WIDTH }}>
                                    {m.label}
                                </div>
                            ));
                         }, [intervals, zoomLevel])}
                    </div>
                    {/* Secondary Grid Header */}
                    <div className="h-10 flex sticky left-0 w-full bg-white">
                         {intervals.map((item, idx) => {
                            const isToday = zoomLevel === "days" && isSameDay(item, new Date());
                            const label = zoomLevel === "days" ? format(item, 'd') : zoomLevel === "weeks" ? `W${format(item, 'w')}` : format(item, 'MMM');
                            return (
                                <div 
                                    key={idx} 
                                    className={cn(
                                        "h-full border-r border-muted/5 flex items-center justify-center shrink-0 text-[10px] font-bold",
                                        isToday ? "text-[#5252ff] bg-[#5252ff]/5" : "text-muted-foreground/40"
                                    )} 
                                    style={{ width: COLUMN_WIDTH }}
                                >
                                    {label}
                                </div>
                            );
                         })}
                    </div>
                </div>

                {/* Main Grid Content */}
                <div className="relative pt-1">
                    {/* Vertical Grid Lines */}
                    <div className="absolute inset-0 flex pointer-events-none">
                        {intervals.map((_, idx) => (
                            <div 
                                key={idx} 
                                className="h-full border-r border-muted/5 shrink-0"
                                style={{ width: COLUMN_WIDTH }} 
                            />
                        ))}
                    </div>

                    {/* Today Line */}
                    {zoomLevel !== "months" && (
                        <div 
                            className="absolute top-0 bottom-0 w-[2px] bg-[#5252ff] z-20 pointer-events-none shadow-[0_0_10px_rgba(82,82,255,0.3)]"
                            style={{ left: getX(new Date()) + (zoomLevel === "days" ? (COLUMN_WIDTH / 2) : 0) }}
                        >
                            <div className="w-2 h-2 rounded-full bg-white border-2 border-[#5252ff] absolute -top-1 -left-[3px] shadow-sm z-30" />
                        </div>
                    )}

                    <div className="flex flex-col">
                        {Object.entries(groups).map(([groupName, groupTasks]) => (
                            <div key={groupName} className="border-b border-muted/5 last:border-0 relative">
                                {/* Group row - Summary Bar */}
                                <div className="h-10 flex items-center relative bg-muted/[0.01]">
                                    {groupName !== "General" && (
                                        <div 
                                            className="absolute h-1 bg-[#5252ff]/20 rounded-full bottom-2 transition-all"
                                            style={{ 
                                                left: getX(new Date(Math.min(...groupTasks.map(t => new Date(t.startDate || t.dueDate).getTime())))),
                                                width: getWidth(
                                                    new Date(Math.min(...groupTasks.map(t => new Date(t.startDate || t.dueDate).getTime()))),
                                                    new Date(Math.max(...groupTasks.map(t => new Date(t.dueDate || t.startDate).getTime())))
                                                )
                                            }}
                                        >
                                            <div className="absolute inset-y-0 left-0 bg-[#5252ff] rounded-full opacity-60" style={{ width: '40%' }} />
                                        </div>
                                    )}
                                </div>
                                
                                {!collapsedGroups[groupName] && groupTasks.map((task) => {
                                    const start = new Date(task.startDate || task.dueDate || new Date());
                                    const end = new Date(task.dueDate || task.startDate || new Date());
                                    const progress = task.status === 'DONE' ? 100 : task.status === 'IN_PROGRESS' ? 45 : 0;
                                    
                                    const barColors = {
                                        DONE: 'bg-emerald-500 shadow-emerald-500/20',
                                        IN_PROGRESS: 'bg-[#5252ff] shadow-[#5252ff]/20',
                                        AWAITING_APPROVAL: 'bg-amber-400 shadow-amber-400/20',
                                        TODO: 'bg-slate-300'
                                    };
                                    
                                    return (
                                        <div 
                                            key={task.id} 
                                            className="h-10 relative flex items-center border-t border-muted/5 first:border-0 group/row"
                                            onMouseEnter={() => setHoveredTask(task.id)}
                                            onMouseLeave={() => setHoveredTask(null)}
                                        >
                                            <div 
                                                className={cn(
                                                    "absolute h-6 rounded-md flex items-center transition-all cursor-pointer shadow-sm transform hover:scale-[1.02] active:scale-95 z-10 overflow-hidden",
                                                    barColors[task.status as keyof typeof barColors] || barColors.TODO,
                                                    hoveredTask === task.id && "ring-2 ring-offset-2 ring-[#5252ff]/30 shadow-lg"
                                                )}
                                                style={{ 
                                                    left: getX(start) + 4,
                                                    width: Math.max(20, getWidth(start, end) - 8)
                                                }}
                                                onClick={() => onTaskClick(task)}
                                            >
                                                <div 
                                                    className="absolute inset-y-0 left-0 bg-black/10 transition-all duration-1000"
                                                    style={{ width: `${progress}%` }}
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-50" />
                                                {getWidth(start, end) > 100 && (
                                                    <span className="relative z-20 px-3 text-[9px] font-black uppercase tracking-wider text-white truncate w-full">
                                                        {task.title}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Custom Premium Tooltip */}
                                            {hoveredTask === task.id && (
                                                <div 
                                                    className="fixed bg-white border rounded-lg p-3 shadow-2xl z-[100] w-64 pointer-events-none animate-in fade-in zoom-in duration-200"
                                                    style={{ 
                                                        left: Math.min(window.innerWidth - 280, getX(start) + 100),
                                                        top: 150 
                                                    }}
                                                >
                                                    <div className="space-y-2">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <div className={cn("w-2 h-2 rounded-full", barColors[task.status as keyof typeof barColors] || barColors.TODO)} />
                                                                <span className="text-[12px] font-bold truncate max-w-[140px]">{task.title}</span>
                                                            </div>
                                                            <Badge variant="outline" className="text-[9px] font-black px-1.5 py-0 h-4 border-[#5252ff]/20 text-[#5252ff]">
                                                                {progress}%
                                                            </Badge>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4 text-[10px] font-medium text-muted-foreground/80">
                                                            <div className="flex flex-col">
                                                                <span className="text-[8px] uppercase font-black text-muted-foreground/30 tracking-widest">Starts</span>
                                                                <span>{format(start, 'MMM d, yyyy')}</span>
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="text-[8px] uppercase font-black text-muted-foreground/30 tracking-widest">Ends</span>
                                                                <span>{format(end, 'MMM d, yyyy')}</span>
                                                            </div>
                                                        </div>
                                                        <div className="pt-2 border-t mt-1 flex items-center gap-2">
                                                            <Clock className="h-3 w-3 text-muted-foreground/40" />
                                                            <span className="text-[10px] font-bold text-muted-foreground/60">
                                                                {differenceInDays(end, start) + 1} days duration
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Dependency Lines */}
                                            {showDependencies && task.dependencies?.map((depId: string) => {
                                                const depTask = tasks.find(t => t.id === depId);
                                                if (!depTask) return null;
                                                return (
                                                    <svg key={`${task.id}-${depId}`} className="absolute inset-0 w-full h-full pointer-events-none z-0">
                                                        <path 
                                                            d={`M ${getX(new Date(depTask.dueDate))} 0 L ${getX(start)} 20`}
                                                            className="stroke-[#5252ff]/10 fill-none stroke-2 stroke-dashed"
                                                        />
                                                    </svg>
                                                );
                                            })}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
