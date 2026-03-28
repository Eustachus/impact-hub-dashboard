/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  CheckCircle2, 
  Clock, 
  MoreVertical,
  Plus
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CreateTaskModal } from "@/components/CreateTaskModal";
import { TaskDetailModal } from "@/components/TaskDetailModal";

export default function MyTasksPage() {
  const [tasks, setTasks] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<unknown>(null);

  useEffect(() => {
    fetch("/api/tasks")
      .then(res => res.json())
      .then(data => {
        setTasks(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setTasks([]);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-8">Chargement de vos tâches...</div>;

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mes Tâches</h1>
          <p className="text-muted-foreground">Toutes les tâches qui vous sont assignées à travers vos projets.</p>
        </div>
        <Button className="gap-2" onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4" /> Nouvelle Tâche
        </Button>
      </div>

      <div className="grid gap-4">
        {Array.isArray(tasks) && tasks.length > 0 ? (tasks as any[]).map((task) => (
          <Card key={task.id} className="hover:shadow-md transition-shadow cursor-pointer group border-l-4 border-l-primary/50" onClick={() => setSelectedTask(task)}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <Button variant="ghost" size="icon" className={`h-8 w-8 rounded-full border ${task.status === 'DONE' ? 'bg-green-500 border-green-500 text-white' : 'border-muted-foreground/30'}`} onClick={(e) => { e.stopPropagation(); /* handle complete later if needed */ }}>
                  <CheckCircle2 className="h-4 w-4" />
                </Button>
                <div className="space-y-1">
                  <p className={`font-semibold ${task.status === 'DONE' ? 'line-through text-muted-foreground' : ''}`}>{task.title}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-blue-500" /> {task.project?.name || "Sans projet"}
                    </span>
                    {task.dueDate && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <Badge variant={task.priority === "HIGH" ? "destructive" : "secondary"}>
                  {task.priority || "NORMAL"}
                </Badge>
                <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )) : (
          <div className="text-center py-20 border-2 border-dashed rounded-xl text-muted-foreground">
            Aucune tâche trouvée.
          </div>
        )}
      </div>

      <CreateTaskModal 
        isOpen={isCreateOpen} 
        onClose={() => setIsCreateOpen(false)} 
        onTaskCreated={() => {
          fetch("/api/tasks")
            .then(res => res.json())
            .then(data => setTasks(Array.isArray(data) ? data : []));
        }}
      />

      <TaskDetailModal 
        open={!!selectedTask}
        onOpenChange={(op) => !op && setSelectedTask(null)}
        task={selectedTask as any}
      />
    </div>
  );
}
