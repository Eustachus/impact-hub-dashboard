/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect } from "react";
import { 
  DndContext, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragOverEvent,
  DragEndEvent,
  useDroppable
} from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ProjectOverview } from "@/components/ProjectOverview";
import { ProjectListView } from "@/components/ProjectListView";
import { ProjectTimelineView } from "@/components/ProjectTimelineView";
import { ProjectCalendarView } from "@/components/ProjectCalendarView";
import { ProjectGanttView } from "@/components/ProjectGanttView";
import { ProjectWorkflowView } from "@/components/ProjectWorkflowView";
import { TaskDetailModal } from "@/components/TaskDetailModal";
import { useSocket } from "@/hooks/useSocket";
import { 
  MoreHorizontal, Plus, Clock, Layout, FileText, Info, Users, Settings, Briefcase, 
  Calendar, ChevronRight, ChevronLeft, Search, CheckCircle2, AlertCircle, Trash2, 
  Check, X, GitCommitHorizontal, Workflow, Star, ChevronDown, Share2, Zap, GitBranch
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Task = {
  id: string;
  title: string;
  status: string;
  dueDate?: string | Date;
  _count?: { subtasks: number };
  assignees?: any[];
  sectionId?: string;
  startDate?: string | Date;
  createdAt?: string | Date;
};
type ColumnsType = Record<string, { id: string; title: string; tasks: Task[] }>;

function SortableTaskItem({ task, onClick }: { task: Task, onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ 
    id: task.id,
  });
  
  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 100 : "auto"
  };

  const getStatusConfig = (status: string) => {
    switch (status?.toUpperCase()) {
      case "DONE": return { color: "bg-emerald-500", label: "Done" };
      case "IN_PROGRESS": return { color: "bg-[#5252ff]", label: "In Progress" };
      case "AWAITING_APPROVAL": return { color: "bg-amber-400", label: "Awaiting" };
      default: return { color: "bg-slate-300", label: "To Do" };
    }
  };

  const status = getStatusConfig(task.status);
  const subtasksCount = task._count?.subtasks || 0;
  const assignees = task.assignees || [];

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners} 
      onClick={onClick}
      className={cn(
        "group bg-white p-4 rounded-xl border-[0.5px] border-slate-200 shadow-sm hover:shadow-md hover:border-[#5252ff]/30 transition-all cursor-grab active:cursor-grabbing mb-3 relative overflow-hidden",
        task.status === 'DONE' && "bg-slate-50/50"
      )}
    >
      <div className="absolute top-0 left-0 w-1 h-full bg-[#5252ff]/0 group-hover:bg-[#5252ff] transition-all" />
      
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex flex-col gap-1.5 flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
             <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", status.color)} />
             <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">{status.label}</span>
          </div>
          <h4 className={cn(
            "text-[13px] font-bold leading-tight tracking-tight",
            task.status === 'DONE' ? 'text-muted-foreground line-through' : 'text-foreground/90'
          )}>
            {task.title}
          </h4>
        </div>
      </div>

      <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
        <div className="flex items-center gap-3">
          {task.dueDate && (
            <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground/40 bg-slate-50 px-2 py-1 rounded-lg">
               <Clock className="h-3 w-3" />
               {new Date(task.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
            </div>
          )}
          {subtasksCount > 0 && (
            <div className="text-[10px] text-muted-foreground/40 flex items-center gap-1 font-bold bg-slate-50 px-2 py-1 rounded-lg">
               <GitBranch className="h-3 w-3" />
               {subtasksCount}
            </div>
          )}
        </div>

        <div className="flex -space-x-1.5 border-2 border-white rounded-full">
          {(assignees as any[]).map((a: any) => (
            <Avatar key={a.userId} className="h-6 w-6 border-2 border-white ring-px ring-slate-100 shadow-sm">
              <AvatarImage src={a.user?.image} />
              <AvatarFallback className="text-[7px] bg-[#5252ff]/10 text-[#5252ff] font-bold">
                {a.user?.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
          ))}
        </div>
      </div>
    </div>
  );
}

function Column({ col, children, onAddTask }: { col: { id: string, title: string, tasks: Task[] }, children: React.ReactNode, onAddTask: () => void }) {
  const { setNodeRef } = useDroppable({
    id: col.id,
    data: { type: "Column", col }
  });

  return (
    <div className="min-w-[320px] w-[320px] bg-slate-50/50 p-6 rounded-2xl flex flex-col h-full border-[0.5px] border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-6 group/title">
        <h3 className="text-[13px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          {col.title} 
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-200/50 text-muted-foreground/60 text-[10px] font-bold">
            {col.tasks.length}
          </span>
        </h3>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground/30 opacity-0 group-hover/title:opacity-100 transition-opacity"><MoreHorizontal className="h-4 w-4" /></Button>
      </div>

      <div ref={setNodeRef} className="flex-1 overflow-y-auto min-h-[150px] custom-scrollbar space-y-3 pb-4">
        {children}
        {col.tasks.length === 0 && (
           <div className="h-24 border border-dashed rounded-xl border-slate-200 flex items-center justify-center bg-slate-100/20">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30">Drop here</span>
           </div>
        )}
      </div>

      <Button 
        variant="outline" 
        className="w-full mt-4 justify-center text-[11px] font-bold uppercase tracking-widest gap-2 bg-white border-slate-200 hover:border-[#5252ff]/40 hover:text-[#5252ff] h-10 shadow-sm transition-all rounded-xl" 
        onClick={onAddTask}
      >
        <Plus className="h-3.5 w-3.5" /> Post Task
      </Button>
    </div>
  );
}

export default function ProjectBoardPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState<"overview" | "list" | "board" | "timeline" | "calendar" | "gantt" | "workflow">("gantt");
  const [columns, setColumns] = useState<ColumnsType>({
    "todo": { id: "todo", title: "À faire", tasks: [] },
    "in-progress": { id: "in-progress", title: "En cours", tasks: [] },
    "awaiting-approval": { id: "awaiting-approval", title: "En attente", tasks: [] },
    "done": { id: "done", title: "Terminé", tasks: [] },
  });
  const [project, setProject] = useState<any>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);
  
  const { socket } = useSocket(params.id);

  useEffect(() => {
    fetchBoardData();
  }, [params.id]);

  const fetchBoardData = async () => {
    try {
      const [projRes, tasksRes, sectionsRes] = await Promise.all([
        fetch(`/api/projects/${params.id}`),
        fetch(`/api/projects/${params.id}/tasks`),
        fetch(`/api/projects/${params.id}/sections`)
      ]);
      const projData = await projRes.json();
      const tasksData = await tasksRes.json();
      const sectionsData = await sectionsRes.json();
      
      setProject(projData);
      setTasks(tasksData);
      
      const newCols: ColumnsType = {
        "todo": { id: "todo", title: "À faire", tasks: (tasksData as any[]).filter((t: any) => !t.sectionId && t.status === "TODO") },
        "in-progress": { id: "in-progress", title: "En cours", tasks: (tasksData as any[]).filter((t: any) => !t.sectionId && t.status === "IN_PROGRESS") },
        "done": { id: "done", title: "Terminé", tasks: (tasksData as any[]).filter((t: any) => !t.sectionId && t.status === "DONE") },
      };

      if (Array.isArray(sectionsData)) {
        sectionsData.forEach((sec: any) => {
          newCols[sec.id] = {
            id: sec.id,
            title: sec.name,
            tasks: tasksData.filter((t: any) => t.sectionId === sec.id)
          };
        });
      }

      setColumns(newCols);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProject = async (data: any) => {
    try {
      const res = await fetch(`/api/projects/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        const updated = await res.json();
        setProject((prev: any) => ({ ...prev, ...updated }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProject = async () => {
    try {
      const res = await fetch(`/api/projects/${params.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        window.location.href = "/dashboard";
      } else {
        alert("Failed to delete project");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const findColumnOfTask = (taskId: string) => {
    return Object.keys(columns).find((key) => columns[key].tasks.find(t => t.id === taskId));
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    const activeColumnId = findColumnOfTask(activeId);
    const overColumnId = columns[overId] ? overId : findColumnOfTask(overId);

    if (!activeColumnId || !overColumnId || activeColumnId === overColumnId) return;

    setColumns((prev) => {
      const activeItems = prev[activeColumnId].tasks;
      const overItems = prev[overColumnId].tasks;
      const activeIndex = activeItems.findIndex(t => t.id === activeId);
      const overIndex = columns[overId] ? overItems.length : overItems.findIndex(t => t.id === overId);

      const newActiveContainer = [...prev[activeColumnId].tasks];
      const newOverContainer = [...prev[overColumnId].tasks];
      const [movedItem] = newActiveContainer.splice(activeIndex, 1);
      
      movedItem.status = overColumnId === 'in-progress' ? 'IN_PROGRESS' : overColumnId === 'awaiting-approval' ? 'AWAITING_APPROVAL' : overColumnId.toUpperCase();
      newOverContainer.splice(overIndex, 0, movedItem);

      return {
        ...prev,
        [activeColumnId]: { ...prev[activeColumnId], tasks: newActiveContainer },
        [overColumnId]: { ...prev[overColumnId], tasks: newOverContainer }
      };
    });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    const activeColumnId = findColumnOfTask(activeId);
    const overColumnId = findColumnOfTask(overId) || (columns[overId] ? overId : null);

    if (activeColumnId && overColumnId) {
      if (activeColumnId === overColumnId) {
        const activeIndex = columns[activeColumnId].tasks.findIndex(t => t.id === activeId);
        const overIndex = columns[overColumnId].tasks.findIndex(t => t.id === overId);

        if (activeIndex !== overIndex) {
          setColumns((prev) => {
            const newTasks = arrayMove(prev[activeColumnId].tasks, activeIndex, overIndex);
            return { ...prev, [activeColumnId]: { ...prev[activeColumnId], tasks: newTasks } };
          });
        }
      }

      // Persist change
      try {
        await fetch(`/api/projects/${params.id}/tasks`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            taskId: activeId, 
            status: overColumnId === 'in-progress' ? 'IN_PROGRESS' : overColumnId === 'awaiting-approval' ? 'AWAITING_APPROVAL' : overColumnId.toUpperCase() 
          })
        });
        
        if (socket) {
          socket.emit("task-updated", { roomId: params.id, action: 'move', taskId: activeId, colId: overColumnId });
        }
      } catch (err) {
        console.error("Failed to persist task move", err);
      }
    }
  };

  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [addTaskColumn, setAddTaskColumn] = useState<string | null>(null);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !addTaskColumn) return;

    try {
      const res = await fetch(`/api/projects/${params.id}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          title: newTaskTitle, 
          status: addTaskColumn === 'in-progress' ? 'IN_PROGRESS' : addTaskColumn === 'awaiting-approval' ? 'AWAITING_APPROVAL' : addTaskColumn.toUpperCase() 
        }),
      });
      if (res.ok) {
        setIsAddTaskOpen(false);
        setNewTaskTitle("");
        fetchBoardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const [isAddingSection, setIsAddingSection] = useState(false);
  const [newSectionName, setNewSectionName] = useState("");

  const handleAddSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSectionName.trim()) return;

    try {
      const res = await fetch(`/api/projects/${params.id}/sections`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newSectionName, order: Object.keys(columns).length }),
      });
      if (res.ok) {
        setIsAddingSection(false);
        setNewSectionName("");
        fetchBoardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleShare = () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (url) {
      navigator.clipboard.writeText(url).then(() => {
        alert("Project link copied to clipboard!");
      });
    }
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-card/5">
       <div className="relative">
         <div className="w-12 h-12 border-4 border-primary/20 rounded-full animate-spin border-t-primary" />
       </div>
    </div>
  );

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background font-inter tracking-tight">
      
      {/* Screenshot-Style Header */}
      <header className="px-8 py-4 border-b bg-white">
        <div className="flex items-center justify-between mb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground/60">
                <span className="hover:text-primary transition-colors cursor-pointer">Portfolios</span>
                <ChevronRight className="h-3 w-3" />
                <span className="hover:text-primary transition-colors cursor-pointer">Management Plan 2024</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#5252ff] flex items-center justify-center text-white mr-1 shadow-sm">
                 <Zap className="h-5 w-5 fill-current" />
              </div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
                {project?.name || "Cross-Functional Project Plan"}
                <div className="flex items-center gap-2 ml-1">
                    <button className="text-muted-foreground/40 hover:text-amber-400 transition-colors">
                        <Star className="h-4 w-4" />
                    </button>
                    <button className="text-muted-foreground/40 hover:text-foreground transition-colors">
                        <ChevronDown className="h-4 w-4" />
                    </button>
                </div>
              </h1>
              <div className="ml-3 flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  <span className="text-[11px] font-bold">On track</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
              <Button variant="outline" className="h-[38px] gap-2 rounded-lg border-muted text-foreground/80 font-semibold px-4">
                  <Zap className="h-3.5 w-3.5 fill-muted-foreground/20" /> Automation
                  <ChevronDown className="h-4 w-4 text-muted-foreground/40 border-l pl-1 ml-1" />
              </Button>
              <Button variant="outline" className="h-[38px] gap-2 rounded-lg border-muted text-foreground/80 font-semibold px-4">
                  <Layout className="h-4 w-4 text-muted-foreground/80" /> Customize
              </Button>
              <Button className="h-[38px] gap-2 rounded-lg bg-[#5252ff] hover:bg-[#4040ff] text-white font-semibold px-6 shadow-lg shadow-[#5252ff]/20">
                  <Share2 className="h-4 w-4" /> Share
              </Button>
              <Button variant="ghost" size="icon" className="text-muted-foreground/30 hover:text-red-500 hover:bg-red-50" onClick={() => setConfirmDelete(true)}>
                  <Trash2 className="h-5 w-5" />
              </Button>
          </div>
        </div>

        {/* Professional Tab Bar */}
        <div className="flex items-center gap-1 mt-6 -mb-px">
            {[
                { id: "overview", label: "Workload", icon: Layout },
                { id: "list", label: "List", icon: FileText },
                { id: "board", label: "Kanban", icon: Layout },
                { id: "timeline", label: "Timeline", icon: GitCommitHorizontal },
                { id: "calendar", label: "Calendar", icon: Calendar },
                { id: "gantt", label: "Gantt", icon: GitCommitHorizontal },
                { id: "workflow", label: "Workflow", icon: Workflow },
            ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 text-[13px] font-medium transition-all relative border-b-2 border-transparent",
                            isActive 
                            ? "text-[#5252ff] border-[#5252ff] bg-[#5252ff]/[0.02]" 
                            : "text-muted-foreground/60 hover:text-foreground"
                        )}
                    >
                        <tab.icon className={cn("h-4 w-4", isActive ? "text-[#5252ff]" : "text-muted-foreground/40")} />
                        {tab.label}
                    </button>
                )
            })}
            <button className="p-2 text-muted-foreground/40 hover:text-foreground"><Plus className="h-4 w-4" /></button>
        </div>
      </header>

      {/* View Content Area */}
      <main className="flex-1 overflow-hidden relative">
        <div className="h-full overflow-hidden">
          {activeTab === "overview" && <ProjectOverview project={project as any} tasks={[]} onUpdate={handleUpdateProject} onTaskClick={setSelectedTask} />}
          {activeTab === "board" && (
            <div className="h-full flex flex-col p-8 bg-[#fcfcfc]">
              <DndContext 
                sensors={sensors} 
                collisionDetection={closestCorners} 
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
                onDragStart={({ active }) => setActiveId(String(active.id))}
              >
                <div className="flex gap-6 h-full overflow-x-auto pb-6 custom-scrollbar">
                  {Object.values(columns).map((col) => (
                    <Column key={col.id} col={col} onAddTask={() => { setAddTaskColumn(col.id); setIsAddTaskOpen(true); }}>
                      <SortableContext items={col.tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                        {col.tasks.map((task: Task) => (
                          <SortableTaskItem 
                            key={task.id} 
                            task={task} 
                            onClick={() => setSelectedTask(task)} 
                          />
                        ))}
                      </SortableContext>
                    </Column>
                  ))}
                </div>
              </DndContext>
            </div>
          )}
          {activeTab === "list" && <ProjectListView tasks={tasks} onTaskClick={setSelectedTask} />}
          {activeTab === "timeline" && <ProjectTimelineView tasks={tasks} onTaskClick={setSelectedTask} />}
          {activeTab === "calendar" && <ProjectCalendarView tasks={tasks} onTaskClick={setSelectedTask} />}
          {activeTab === "gantt" && <ProjectGanttView tasks={tasks} onTaskClick={setSelectedTask} />}
          {activeTab === "workflow" && <ProjectWorkflowView />}
        </div>
      </main>

      {/* Modal / Delete Confirmation */}
      {selectedTask && (
        <TaskDetailModal 
          open={!!selectedTask} 
          onOpenChange={(open) => !open && setSelectedTask(undefined)}
          task={selectedTask as any}
        />
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-card w-full max-w-sm p-6 rounded-2xl shadow-2xl border animate-in zoom-in-95 duration-300">
                <h3 className="text-lg font-bold mb-2">Delete Project?</h3>
                <p className="text-muted-foreground text-sm mb-6">Are you sure you want to delete this project? This action cannot be undone.</p>
                <div className="flex justify-end gap-3">
                    <Button variant="ghost" onClick={() => setConfirmDelete(false)}>Cancel</Button>
                    <Button variant="destructive" onClick={handleDeleteProject} className="font-bold shadow-lg shadow-red-500/20">Delete</Button>
                </div>
            </div>
        </div>
      )}

      {isAddTaskOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <Card className="w-full max-w-md shadow-2xl border-primary/10 animate-in zoom-in-95 duration-300">
            <CardHeader className="bg-muted/30 pb-4">
              <CardTitle className="text-xl font-bold">New Task in {columns[addTaskColumn || "todo"]?.title}</CardTitle>
            </CardHeader>
            <form onSubmit={handleAddTask}>
              <CardContent className="space-y-5 pt-6">
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Task Title</Label>
                  <Input 
                    required 
                    autoFocus
                    className="h-12 text-lg font-medium bg-muted/5"
                    placeholder="e.g. Design enterprise dashboard..." 
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                  />
                </div>
              </CardContent>
              <div className="p-6 pt-0 flex justify-end gap-3 bg-muted/30">
                <Button variant="ghost" type="button" onClick={() => setIsAddTaskOpen(false)} className="font-semibold text-muted-foreground hover:text-foreground">Cancel</Button>
                <Button type="submit" className="font-bold px-8 shadow-lg shadow-primary/20">Create Task</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {isAddingSection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <Card className="w-full max-w-md shadow-2xl border-primary/10 animate-in zoom-in-95 duration-300">
            <CardHeader className="bg-muted/30 pb-4">
              <CardTitle className="text-xl font-bold">New Section</CardTitle>
            </CardHeader>
            <form onSubmit={handleAddSection}>
              <CardContent className="space-y-5 pt-6">
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Section Name</Label>
                  <Input 
                    required 
                    autoFocus
                    className="h-12 text-lg font-medium bg-muted/5"
                    placeholder="e.g. Backlog, Sprint 2..." 
                    value={newSectionName}
                    onChange={(e) => setNewSectionName(e.target.value)}
                  />
                </div>
              </CardContent>
              <div className="p-6 pt-0 flex justify-end gap-3 bg-muted/30">
                <Button variant="ghost" type="button" onClick={() => setIsAddingSection(false)} className="font-semibold text-muted-foreground hover:text-foreground">Cancel</Button>
                <Button type="submit" className="font-bold px-8 shadow-lg shadow-primary/20">Add Section</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}

