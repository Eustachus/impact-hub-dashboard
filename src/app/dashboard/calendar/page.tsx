/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import { format, addDays, startOfWeek, addWeeks, subWeeks } from "date-fns";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { TaskDetailModal } from "@/components/TaskDetailModal";

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<unknown>(null);

  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(startDate, i));

  useEffect(() => {
    fetch(`/api/tasks?date=${format(currentDate, 'yyyy-MM-dd')}`)
      .then(res => res.json())
      .then(data => {
        setTasks(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        console.error(err);
        setTasks([]);
      })
      .finally(() => setLoading(false));
  }, [currentDate]);

  if (loading) return <div className="p-8">Chargement du calendrier...</div>;

  const events = (Array.isArray(tasks) ? tasks : [])
    .filter((t: any) => t.dueDate)
    .map((t: any) => ({
      task: t,
      title: t.title,
      date: new Date(t.dueDate),
      type: t.priority === 'HIGH' ? 'deadline' : 'meeting'
    }));

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground">Track important deadlines and meetings.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => setCurrentDate(subWeeks(currentDate, 1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-semibold text-lg min-w-[140px] text-center">
              {format(currentDate, "MMMM yyyy")}
            </span>
            <Button variant="outline" size="icon" onClick={() => setCurrentDate(addWeeks(currentDate, 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button>
            <CalendarIcon className="mr-2 h-4 w-4" /> Today
          </Button>
        </div>
      </div>

      {/* Basic Weekly Calendar Grid */}
      <div className="border rounded-xl bg-card flex-1 flex flex-col overflow-hidden">
        <div className="grid grid-cols-7 border-b bg-muted/20">
          {weekDays.map((day, i) => (
            <div key={i} className="p-3 text-center border-r last:border-r-0">
              <div className="text-xs font-semibold text-muted-foreground uppercase">{format(day, "EEE")}</div>
              <div className={`text-xl font-bold mt-1 ${format(day, "d") === format(new Date(), "d") ? "text-primary" : ""}`}>
                {format(day, "d")}
              </div>
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 flex-1">
          {weekDays.map((day, i) => {
            const dayEvents = events.filter(e => format(e.date, "yyyy-MM-dd") === format(day, "yyyy-MM-dd"));
            
            return (
              <div key={i} className="border-r last:border-r-0 p-2 min-h-[400px]">
                <div className="space-y-2">
                  {dayEvents.map((evt: any, j) => (
                    <div 
                      key={j} 
                      className={`p-2 text-sm rounded-md border text-left cursor-pointer transition-colors ${
                        evt.type === 'meeting' ? 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800' :
                        'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800'
                      }`}
                      onClick={() => setSelectedTask(evt.task)}
                    >
                      <div className="font-semibold">{evt.title}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <TaskDetailModal 
        open={!!selectedTask}
        onOpenChange={(op) => !op && setSelectedTask(null)}
        task={selectedTask as any}
      />
    </div>
  );
}
