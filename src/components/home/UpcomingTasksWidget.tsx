"use client";

import { Clock, AlertCircle, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface UpcomingTasksWidgetProps {
  tasks: any[];
  onTaskClick: (task: any) => void;
}

export function UpcomingTasksWidget({ tasks, onTaskClick }: UpcomingTasksWidgetProps) {
  const upcoming = tasks
    .filter(t => t.status !== "DONE" && t.dueDate)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);

  if (upcoming.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center space-y-2 opacity-50">
        <CheckCircle2 className="h-8 w-8 text-muted-foreground/20" />
        <p className="text-xs font-medium italic">All caught up! No upcoming tasks.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {upcoming.map((task) => {
        const isOverdue = new Date(task.dueDate) < new Date() && task.status !== "DONE";
        
        return (
          <div 
            key={task.id} 
            onClick={() => onTaskClick(task)}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-primary/5 cursor-pointer transition-colors group/item"
          >
            <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isOverdue ? 'bg-red-500/10 text-red-500' : 'bg-primary/10 text-primary'}`}>
              {isOverdue ? <AlertCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate group-hover/item:text-primary transition-colors">{task.title}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-muted-foreground font-medium">
                  {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
                {task.priority !== "NONE" && (
                  <Badge variant="outline" className="text-[8px] h-3 px-1 font-black uppercase tracking-tighter opacity-60">
                    {task.priority}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
