"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, useMemo } from "react";
import { redirect } from "next/navigation";
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects
} from "@dnd-kit/core";
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy,
  rectSortingStrategy
} from "@dnd-kit/sortable";
import { 
  CheckCircle2, 
  Clock, 
  ListTodo, 
  Users, 
  Settings2, 
  Layout, 
  Plus, 
  Palette,
  Sparkles,
  Search,
  Zap,
  Target,
  FileText,
  MousePointer2,
  AlertCircle
} from "lucide-react";

import { HomeWidget } from "@/components/home/HomeWidget";
import { UpcomingTasksWidget } from "@/components/home/UpcomingTasksWidget";
import { PrivateNotepadWidget } from "@/components/home/PrivateNotepadWidget";
import { RecentProjectsWidget } from "@/components/home/RecentProjectsWidget";
import { StatsOverviewWidget } from "@/components/home/StatsOverviewWidget";
import { TaskVelocityWidget } from "@/components/home/TaskVelocityWidget";
import { ProjectHealthWidget } from "@/components/home/ProjectHealthWidget";
import { RecentActivityWidget } from "@/components/home/RecentActivityWidget";
import { GoalsOverviewWidget } from "@/components/home/GoalsOverviewWidget";
import { AssignedToOthersWidget } from "@/components/home/AssignedToOthersWidget";
import { ImminentDeadlinesWidget } from "@/components/home/ImminentDeadlinesWidget";
import { TaskDetailModal } from "@/components/TaskDetailModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const DEFAULT_WIDGETS = [
  { id: "stats", title: "Overview", subtitle: "Key Metrics", icon: "Zap", size: "col-span-1 border-primary/20" },
  { id: "deadlines", title: "Impact Deadlines", subtitle: "Critical Timing", icon: "AlertCircle", size: "col-span-1 border-orange-500/20 shadow-orange-500/5 shadow-xl" },
  { id: "upcoming", title: "Focus This Week", subtitle: "My Tasks", icon: "Target", size: "col-span-1" },
  { id: "recent_projects", title: "Jump Back In", subtitle: "Projects", icon: "Layout", size: "col-span-1" },
  { id: "velocity", title: "Task Velocity", subtitle: "Last 7 Days", icon: "CheckCircle2", size: "col-span-1" },
  { id: "notepad", title: "Private Notes", subtitle: "Daily Reflection", icon: "FileText", size: "col-span-1" },
  { id: "assigned_others", title: "Team Oversight", subtitle: "Monitoring", icon: "Users", size: "col-span-1" },
  { id: "health", title: "Project Health", subtitle: "Global Status", icon: "Sparkles", size: "col-span-1" },
  { id: "activity", title: "Global Pulse", subtitle: "Latest Activity", icon: "MousePointer2", size: "col-span-1" },
  { id: "goals", title: "Strategic Goals", subtitle: "Alignment", icon: "Target", size: "col-span-1" },
];

const ICON_MAP: Record<string, any> = {
  Zap,
  Target,
  Layout,
  CheckCircle2,
  FileText,
  Users,
  Sparkles,
  MousePointer2,
  AlertCircle,
};

const BACKGROUNDS = [
  { id: "minimal", class: "bg-background", label: "Minimalist" },
  { id: "dusk", class: "bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#312e81]", label: "Dusk" },
  { id: "aurora", class: "bg-gradient-to-tr from-[#134e4a] via-[#0f172a] to-[#581c87]", label: "Aurora" },
  { id: "midnight", class: "bg-[#020617]", label: "Midnight Silk" },
];

export default function DashboardPage() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/login");
    },
  });

  const [stats, setStats] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeBackground, setActiveBackground] = useState("minimal");
  const [widgets, setWidgets] = useState(DEFAULT_WIDGETS);
  const [selectedTask, setSelectedTask] = useState<any>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    // Load preferences
    const savedBg = localStorage.getItem("focus_home_bg");
    if (savedBg) setActiveBackground(savedBg);
    
    const savedWidgets = localStorage.getItem("focus_home_widgets");
    if (savedWidgets) setWidgets(JSON.parse(savedWidgets));

    // Fetch data
    Promise.all([
      fetch("/api/stats").then(res => res.json()),
      fetch("/api/tasks").then(res => res.json()),
      fetch("/api/projects").then(res => res.json()),
    ]).then(([statsData, tasksData, projectsData]) => {
      setStats(statsData);
      setTasks(tasksData);
      setProjects(projectsData);
    }).catch(err => {
      console.error("Dashboard initialization error:", err);
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setWidgets((items) => {
        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        localStorage.setItem("focus_home_widgets", JSON.stringify(newItems));
        return newItems;
      });
    }
  };

  const removeWidget = (id: string) => {
    const newWidgets = widgets.filter(w => w.id !== id);
    setWidgets(newWidgets);
    localStorage.setItem("focus_home_widgets", JSON.stringify(newWidgets));
  };

  const resetWidgets = () => {
    setWidgets(DEFAULT_WIDGETS);
    localStorage.removeItem("focus_home_widgets");
  };

  const changeBackground = (id: string) => {
    setActiveBackground(id);
    localStorage.setItem("focus_home_bg", id);
  };

  const toggleWidgetSize = (id: string) => {
    setWidgets(prev => {
      const newWidgets = prev.map(w => {
        if (w.id === id) {
          return { ...w, size: w.size?.includes("col-span-2") ? "col-span-1" : "col-span-1 lg:col-span-2" };
        }
        return w;
      });
      localStorage.setItem("focus_home_widgets", JSON.stringify(newWidgets));
      return newWidgets;
    });
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
           <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
           <p className="text-sm font-black uppercase tracking-[0.3em] opacity-40 animate-pulse">Initializing Focus</p>
        </div>
      </div>
    );
  }

  const bgClass = BACKGROUNDS.find(b => b.id === activeBackground)?.class || "bg-background";

  return (
    <div className={`-m-8 min-h-screen transition-all duration-1000 ease-in-out p-8 ${bgClass} font-sans`}>
      <div className="max-w-[1400px] mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative">
          <div className="space-y-2">
            <Badge variant="outline" className="text-[10px] font-black uppercase tracking-[0.2em] border-primary/30 text-primary bg-primary/5 px-2 py-0.5 mb-2">
              Impact Dashboard
            </Badge>
            <h1 className="text-5xl font-black tracking-tighter text-foreground drop-shadow-sm">
              {new Date().getHours() < 12 ? "Good morning," : "Hello,"} <span className="text-primary">{session?.user?.name?.split(' ')[0]}</span>.
            </h1>
            <p className="text-muted-foreground font-medium text-lg leading-none pt-1">
              You are driving <span className="text-foreground font-bold">{projects.length} social initiatives</span>. {tasks.filter(t => t.status !== 'DONE').length} tasks need your attention.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-card/20 backdrop-blur-md p-1.5 rounded-2xl border border-white/5 shadow-inner">
             {BACKGROUNDS.map(bg => (
               <button 
                key={bg.id}
                onClick={() => changeBackground(bg.id)}
                className={`w-10 h-10 rounded-xl transition-all border-2 ${activeBackground === bg.id ? 'border-primary scale-110 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}`}
                title={bg.label}
               >
                 <div className={`w-full h-full rounded-lg ${bg.class} border border-white/10`} />
               </button>
             ))}
             <div className="w-[1px] h-6 bg-white/10 mx-1" />
             <Button 
                variant={isEditMode ? "default" : "ghost"}
                size="icon" 
                onClick={() => setIsEditMode(!isEditMode)}
                className={`h-10 w-10 rounded-xl ${isEditMode ? 'shadow-lg shadow-primary/20' : 'opacity-60 hover:opacity-100'}`}
             >
               <Layout className="h-4 w-4" />
             </Button>
          </div>
        </div>

        {/* Draggable Widget Grid */}
        <DndContext 
          sensors={sensors} 
          collisionDetection={closestCenter} 
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
            <SortableContext 
              items={widgets.map(w => w.id)} 
              strategy={rectSortingStrategy}
            >
              {widgets.map((w) => (
                <DraggableWidget 
                  key={w.id} 
                  widget={w} 
                  isEditMode={isEditMode}
                  onRemove={removeWidget}
                  onToggleSize={toggleWidgetSize}
                  icon={ICON_MAP[w.icon]}
                >
                  {w.id === "stats" && <StatsOverviewWidget stats={stats} />}
                  {w.id === "deadlines" && (
                    <ImminentDeadlinesWidget 
                      projectProgress={stats?.projectProgress} 
                      deadlines={stats?.upcomingDeadlines} 
                      onTaskClick={setSelectedTask} 
                    />
                  )}
                  {w.id === "upcoming" && <UpcomingTasksWidget tasks={tasks} onTaskClick={setSelectedTask} />}
                  {w.id === "recent_projects" && <RecentProjectsWidget projects={projects} />}
                  {w.id === "velocity" && <TaskVelocityWidget />}
                  {w.id === "notepad" && <PrivateNotepadWidget />}
                  {w.id === "assigned_others" && <AssignedToOthersWidget tasks={tasks} onTaskClick={setSelectedTask} />}
                  {w.id === "health" && <ProjectHealthWidget />}
                  {w.id === "activity" && <RecentActivityWidget activities={stats?.recentActivity} />}
                  {w.id === "goals" && <GoalsOverviewWidget />}
                </DraggableWidget>
              ))}
            </SortableContext>
          </div>
        </DndContext>

        {/* Empty State / Customization Button */}
        {widgets.length < DEFAULT_WIDGETS.length && isEditMode && (
          <div className="flex justify-center pt-8 border-t border-white/5">
             <Button variant="outline" className="rounded-full border-dashed gap-2 opacity-60 hover:opacity-100" onClick={resetWidgets}>
                <Plus className="h-4 w-4" /> Restore Default Widgets
             </Button>
          </div>
        )}
      </div>

      {/* Task Modal Integration */}
      {selectedTask && (
        <TaskDetailModal 
          open={!!selectedTask} 
          onOpenChange={(open) => !open && setSelectedTask(null)} 
          task={selectedTask}
          onUpdate={() => {
             // Refresh tasks after update
             fetch("/api/tasks").then(res => res.json()).then(setTasks);
          }}
        />
      )}
    </div>
  );
}

// Wrapper to make widgets sortable
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function DraggableWidget({ widget, children, isEditMode, onRemove, onToggleSize, icon }: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ 
    id: widget.id,
    disabled: !isEditMode
  });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={widget.size || "col-span-1"}
    >
      <HomeWidget 
        id={widget.id} 
        title={widget.title} 
        subtitle={widget.subtitle} 
        icon={icon}
        onRemove={isEditMode ? onRemove : undefined}
        onResize={isEditMode ? () => onToggleSize(widget.id) : undefined}
        isDraggable={isEditMode}
        dragHandleProps={isEditMode ? { ...attributes, ...listeners } : undefined}
      >
        {children}
      </HomeWidget>
    </div>
  );
}
