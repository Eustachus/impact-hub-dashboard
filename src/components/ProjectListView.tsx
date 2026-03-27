"use client";

import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, MoreHorizontal, ChevronRight, CheckCircle2, MessageSquare, BarChart3, Calculator, Hash, ChevronDown, Layout, Calendar as CalendarIcon, Plus } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface ProjectListViewProps {
  tasks: any[];
  onTaskClick: (task: any) => void;
}

export function ProjectListView({ tasks, onTaskClick }: ProjectListViewProps) {
  
  // Group tasks by status
  const taskGroups = useMemo(() => {
    const groups: { [key: string]: { id: string, title: string, tasks: any[] } } = {
        "todo": { id: "todo", title: "To Do", tasks: [] },
        "in-progress": { id: "in-progress", title: "In Progress", tasks: [] },
        "awaiting-approval": { id: "awaiting-approval", title: "Awaiting Approval", tasks: [] },
        "done": { id: "done", title: "Done", tasks: [] }
    };
    
    tasks.forEach(t => {
        const status = (t.status || "todo").toLowerCase().replace('_', '-');
        if (groups[status]) groups[status].tasks.push(t);
        else groups["todo"].tasks.push(t);
    });
    
    return Object.values(groups).filter(g => g.tasks.length > 0 || g.id === "todo");
  }, [tasks]);

  const [expandedGroups, setExpandedGroups] = useState<string[]>(["todo", "in-progress", "awaiting-approval", "done"]);

  const toggleGroup = (id: string) => {
    setExpandedGroups(prev => prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]);
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
    <div className="h-full flex flex-col bg-white overflow-hidden animate-in fade-in duration-500">
      <div className="flex-1 overflow-auto custom-scrollbar">
        <table className="w-full text-left border-collapse table-fixed">
          <thead className="sticky top-0 bg-white z-10 border-b shadow-sm">
            <tr className="h-10">
              <th className="px-8 text-[11px] font-bold text-muted-foreground/50 uppercase tracking-wider w-[50%] border-r-[0.5px]">Contributor</th>
              <th className="px-4 text-[11px] font-bold text-muted-foreground/50 uppercase tracking-wider w-[20%] border-r-[0.5px]">Status</th>
              <th className="px-4 text-[11px] font-bold text-muted-foreground/50 uppercase tracking-wider w-[30%]">Date Range</th>
            </tr>
          </thead>
          
          <tbody className="divide-y-[0.5px]">
            {taskGroups.map((group) => {
                const isExpanded = expandedGroups.includes(group.id);
                return (
                    <div key={group.id} className="contents">
                        {/* Group Header */}
                        <tr 
                            className="bg-slate-50/50 hover:bg-slate-100/50 cursor-pointer transition-colors group/header h-10"
                            onClick={() => toggleGroup(group.id)}
                        >
                            <td colSpan={3} className="px-4 relative">
                                <div className="flex items-center gap-2">
                                    <div className={cn("transition-transform duration-200", !isExpanded && "-rotate-90")}>
                                        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground/40" />
                                    </div>
                                    <span className="text-[12px] font-bold text-foreground/80">{group.title}</span>
                                    <span className="text-[10px] font-medium text-muted-foreground/30 ml-1">{group.tasks.length}</span>
                                </div>
                            </td>
                        </tr>

                        {isExpanded && group.tasks.map((task) => {
                            const status = getStatusConfig(task.status);
                            return (
                                <tr 
                                    key={task.id} 
                                    className="hover:bg-[#5252ff]/[0.02] transition-colors group cursor-pointer border-b-[0.5px] h-11"
                                    onClick={() => onTaskClick(task)}
                                >
                                    <td className="px-8 border-r-[0.5px]">
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <div className="w-5 h-5 rounded bg-muted/20 flex items-center justify-center shrink-0">
                                                    <Layout className="h-3 w-3 text-muted-foreground/40" />
                                                </div>
                                                <span className={cn(
                                                    "text-[13px] font-semibold truncate tracking-tight",
                                                    task.status === 'DONE' ? 'text-muted-foreground/50 line-through' : 'text-foreground'
                                                )}>
                                                    {task.title}
                                                </span>
                                            </div>
                                            <div className="flex -space-x-2 shrink-0">
                                                {task.assignees?.map((a: any) => (
                                                    <Avatar key={a.userId} className="h-6 w-6 border-2 border-white ring-1 ring-slate-100">
                                                        <AvatarImage src={a.user?.image} />
                                                        <AvatarFallback className="text-[8px] bg-[#5252ff]/10 text-[#5252ff] font-bold">
                                                            {a.user?.name?.charAt(0)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                ))}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 border-r-[0.5px]">
                                        <div className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-slate-50 transition-colors w-fit">
                                            <div className={cn("w-2 h-2 rounded-full", status.color)} />
                                            <span className="text-[12px] font-medium text-foreground/70">{status.label}</span>
                                        </div>
                                    </td>
                                    <td className="px-4">
                                        <div className="text-[12px] font-medium text-muted-foreground/60 flex items-center gap-2">
                                            <CalendarIcon className="h-3 w-3 opacity-30" />
                                            {task.startDate ? format(new Date(task.startDate), 'MMM d') : "--"} 
                                            <span className="opacity-20">→</span>
                                            {task.dueDate ? format(new Date(task.dueDate), 'MMM d') : "--"}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </div>
                );
            })}
          </tbody>
        </table>
        
        {tasks.length === 0 && (
            <div className="py-20 text-center text-muted-foreground/30 font-bold uppercase tracking-widest text-[10px] space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-slate-50 mx-auto flex items-center justify-center border-2 border-dashed">
                   <Plus className="h-6 w-6" />
                </div>
                <p>Start adding tasks to this project</p>
            </div>
        )}
      </div>
    </div>
  );
}
