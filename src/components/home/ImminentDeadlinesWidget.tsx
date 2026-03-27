/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { Clock, AlertCircle, CheckCircle2, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ImminentDeadlinesWidgetProps {
  projectProgress: any[];
  deadlines: any[];
  onTaskClick: (task: any) => void;
}

export function ImminentDeadlinesWidget({ projectProgress, deadlines, onTaskClick }: ImminentDeadlinesWidgetProps) {
  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Project Progress Section */}
      <div className="space-y-3">
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
           <Target className="h-3 w-3" /> Initiative Progress
        </h4>
        <div className="space-y-4">
          {projectProgress?.slice(0, 3).map((project) => (
            <div key={project.id} className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="truncate max-w-[150px]">{project.name}</span>
                <span className="text-primary">{project.progress}%</span>
              </div>
              <div className="relative h-1.5 w-full bg-primary/10 rounded-full overflow-hidden">
                 <div 
                   className="absolute left-0 top-0 h-full transition-all duration-1000 ease-out"
                   style={{ 
                     width: `${project.progress}%`, 
                     backgroundColor: project.color || '#5252ff',
                     boxShadow: `0 0 10px ${project.color || '#5252ff'}40`
                   }} 
                 />
              </div>
            </div>
          ))}
          {projectProgress?.length === 0 && (
            <p className="text-[10px] text-muted-foreground italic">No active projects found.</p>
          )}
        </div>
      </div>

      {/* Imminent Deadlines Section */}
      <div className="space-y-3 flex-1 overflow-hidden flex flex-col">
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
           <AlertCircle className="h-3 w-3" /> Critical Deadlines
        </h4>
        <div className="space-y-2 flex-1 overflow-y-auto pr-1 custom-scrollbar">
          {deadlines?.map((task) => {
            const dueDate = new Date(task.dueDate);
            const now = new Date();
            const diffTime = dueDate.getTime() - now.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            const isOverdue = diffDays < 0;
            const isSoon = diffDays <= 3 && diffDays >= 0;

            return (
              <div 
                key={task.id} 
                onClick={() => onTaskClick(task)}
                className="flex items-center gap-3 p-2 rounded-lg bg-muted/5 hover:bg-primary/5 cursor-pointer transition-all border border-transparent hover:border-primary/10 group/task"
              >
                <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${isOverdue ? 'bg-red-500/10 text-red-500' : isSoon ? 'bg-orange-500/10 text-orange-500' : 'bg-primary/10 text-primary'}`}>
                  {isOverdue ? <AlertCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold truncate group-hover/task:text-primary transition-colors leading-tight">{task.title}</p>
                  <p className="text-[9px] text-muted-foreground font-medium uppercase truncate opacity-60">
                    {task.project?.name}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-[10px] font-black ${isOverdue ? 'text-red-500' : isSoon ? 'text-orange-500' : 'text-primary'}`}>
                    {isOverdue ? 'Overdue' : diffDays === 0 ? 'Today' : diffDays === 1 ? 'Tomorrow' : `In ${diffDays}d`}
                  </p>
                </div>
              </div>
            );
          })}
          {deadlines?.length === 0 && (
            <div className="flex flex-col items-center justify-center py-4 space-y-1 opacity-40">
               <CheckCircle2 className="h-5 w-5" />
               <p className="text-[10px] font-medium">No imminent deadlines.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
