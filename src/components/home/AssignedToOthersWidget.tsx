/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { UserCheck, MessageSquare, Clock } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AssignedToOthersWidgetProps {
  tasks: any[];
  onTaskClick: (task: any) => void;
}

export function AssignedToOthersWidget({ tasks, onTaskClick }: AssignedToOthersWidgetProps) {
  // Mock logic: Filter tasks that are not assigned to current user (assuming current user is not in the list for now or use session)
  const assigned = tasks
    .filter(t => t.status !== "DONE" && t.assignees?.length > 0)
    .slice(0, 4);

  if (assigned.length === 0) {
    return (
      <div className="text-center py-10 opacity-30 italic text-xs font-medium">
        No pending tasks assigned to others.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {assigned.map((task) => (
        <div 
          key={task.id} 
          onClick={() => onTaskClick(task)}
          className="flex items-center gap-3 group/item cursor-pointer"
        >
          <div className="flex -space-x-2">
            {task.assignees.slice(0, 2).map((a: any) => (
              <Avatar key={a.userId} className="h-7 w-7 border-2 border-background ring-1 ring-white/10">
                <AvatarImage src={a.user?.image} />
                <AvatarFallback className="text-[8px] bg-primary/20 text-primary font-black uppercase">
                  {a.user?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold truncate group-hover/item:text-primary transition-colors">{task.title}</p>
            <div className="flex items-center gap-2 mt-0.5 opacity-50 text-[9px] font-bold uppercase tracking-widest">
               <UserCheck className="h-2.5 w-2.5" />
               <span>{task.assignees[0]?.user?.name || "Assignee"}</span>
               <div className="w-0.5 h-0.5 rounded-full bg-current" />
               <Clock className="h-2.5 w-2.5" />
               <span>{task.status}</span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-muted/5 flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-opacity">
             <MessageSquare className="h-3 w-3 text-primary" />
          </div>
        </div>
      ))}
    </div>
  );
}
