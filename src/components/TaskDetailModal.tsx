import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { Calendar, CheckCircle2, MoreHorizontal, User, MessageSquare, History as HistoryIcon, Send, X, Plus, Timer } from "lucide-react";
import { TaskTimer } from "./TaskTimer";

interface TaskDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate?: () => void;
  task?: {
    id: string;
    title: string;
    description?: string;
    status?: string;
    priority?: string;
    projectId?: string;
    dueDate?: string | Date;
    createdAt?: string | Date;
    effort?: number;
    timeEntries?: any[];
  };
}

export function TaskDetailModal({ open, onOpenChange, task: initialTask, onUpdate }: TaskDetailModalProps) {
  const [activeTab, setActiveTab] = useState<"comments" | "activity">("comments");
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<any[]>([]);
  const [task, setTask] = useState<any>(initialTask);

  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    if (open) {
      fetch("/api/users")
        .then(res => res.json())
        .then(data => setUsers(data))
        .catch(err => console.error(err));
    }
  }, [open]);

  useEffect(() => {
    if (open && initialTask) {
      fetch(`/api/tasks/${initialTask.id}`)
        .then(res => res.json())
        .then(data => {
          setTask(data);
          // Also fetch comments
          return fetch(`/api/tasks/${initialTask.id}/comments`);
        })
        .then(res => res?.json())
        .then(data => data && setComments(data))
        .catch(err => console.error(err));
    }
  }, [open, initialTask]);

  if (!task) return null;

  const handleAddSubtask = async (title: string) => {
    if (!title.trim()) return;
    try {
      const res = await fetch(`/api/projects/${task.projectId}/tasks`, {
        method: "POST",
        body: JSON.stringify({ title, parentId: task.id, status: "TODO", priority: "NONE" }),
      });
      if (res.ok) {
        const newSub = await res.json();
        setTask({
          ...task,
          subtasks: [...((task as any).subtasks || []), newSub]
        } as any);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateSubtask = async (stId: string, updates: any) => {
    try {
      const res = await fetch(`/api/projects/${task.projectId}/tasks`, {
        method: "PATCH",
        body: JSON.stringify({ id: stId, ...updates }),
      });
      if (res.ok) {
        setTask({
          ...task,
          subtasks: (task as any).subtasks.map((st: any) => 
            st.id === stId ? { ...st, ...updates } : st
          )
        } as any);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdate = async (updates: any) => {
    try {
      const res = await fetch(`/api/projects/${task.projectId || 'any'}/tasks`, {
        method: "PATCH",
        body: JSON.stringify({ id: task.id, ...updates }),
      });
      if (res.ok) {
        const updated = await res.json();
        setTask(updated);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePostComment = async () => {
    if (!comment.trim()) return;
    try {
      const res = await fetch(`/api/tasks/${task.id}/comments`, {
        method: "POST",
        body: JSON.stringify({ content: comment }),
      });
      if (res.ok) {
        const newComment = await res.json();
        setComments([...comments, newComment]);
        setComment("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const currentAssignee = (task as any).assignees?.[0]?.userId;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)} className="max-w-4xl h-[85vh] flex flex-col p-0 overflow-hidden">
        
        {/* Top Header Actions */}
        <div className="flex items-center justify-between border-b px-6 py-3 bg-muted/20">
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              className={`h-8 gap-1 ${task.status === 'DONE' ? 'text-green-600 border-green-200 bg-green-50' : ''}`}
              onClick={() => handleUpdate({ status: task.status === 'DONE' ? 'TODO' : 'DONE' })}
            >
              <CheckCircle2 className="h-4 w-4" /> {task.status === 'DONE' ? 'Completed' : 'Mark Complete'}
            </Button>

            {task.status === 'AWAITING_APPROVAL' && (
              <div className="flex items-center gap-2 border-l pl-3 ml-1">
                <Button size="sm" variant="outline" className="h-8 bg-green-50 text-green-700 border-green-200 hover:bg-green-100" onClick={() => handleUpdate({ status: 'DONE' })}>Approve</Button>
                <Button size="sm" variant="outline" className="h-8 bg-red-50 text-red-700 border-red-200 hover:bg-red-100" onClick={() => handleUpdate({ status: 'TODO' })}>Reject</Button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 mr-6 text-xs text-muted-foreground uppercase font-bold tracking-tight">
            ID: {task.id.slice(0, 8)}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-1 overflow-hidden">
          
          {/* Left Side: Scrollable Task Details */}
          <div className="flex-1 overflow-y-auto px-8 py-8 border-r bg-background">
            <div className="space-y-8">
              <div>
                <textarea 
                  className="w-full text-3xl font-bold border-none resize-none focus:ring-0 p-0 bg-transparent outline-none h-auto placeholder:text-muted-foreground leading-tight" 
                  value={task.title}
                  onChange={(e) => setTask({ ...task, title: e.target.value })}
                  onBlur={(e) => handleUpdate({ title: e.target.value })}
                  placeholder="Task name"
                  rows={2}
                />
              </div>

              {/* Props Grid */}
              <div className="grid grid-cols-[140px_1fr] items-center gap-y-6 text-sm">
                <div className="text-muted-foreground font-medium flex items-center gap-2">
                  <User className="h-4 w-4" /> Responsible
                </div>
                <div className="relative group">
                   <select 
                    className="w-fit p-1.5 bg-transparent border-none font-semibold hover:bg-muted/50 rounded-md outline-none cursor-pointer appearance-none pr-6"
                    value={currentAssignee || ""}
                    onChange={(e) => handleUpdate({ assigneeIds: e.target.value ? [e.target.value] : [] })}
                   >
                     <option value="">Unassigned</option>
                     {users.map(u => (
                       <option key={u.id} value={u.id}>{u.name}</option>
                     ))}
                   </select>
                </div>

                <div className="text-muted-foreground font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" /> Date Range
                </div>
                <div className="flex items-center gap-2">
                   <Input 
                    type="date"
                    className="h-8 w-fit text-xs border-none bg-muted/30 focus-visible:ring-1"
                    value={(task as any).startDate ? new Date((task as any).startDate).toISOString().split('T')[0] : ""}
                    onChange={(e) => handleUpdate({ startDate: e.target.value })}
                   />
                   <span className="text-muted-foreground">→</span>
                   <Input 
                    type="date"
                    className="h-8 w-fit text-xs border-none bg-muted/30 focus-visible:ring-1"
                    value={task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ""}
                    onChange={(e) => handleUpdate({ dueDate: e.target.value })}
                   />
                </div>

                <div className="text-muted-foreground font-medium flex items-center gap-2">
                  <MoreHorizontal className="h-4 w-4" /> Priority
                </div>
                <select 
                  className="bg-transparent border-none focus:ring-0 font-semibold cursor-pointer w-fit p-1.5 hover:bg-muted/50 rounded-md outline-none appearance-none"
                  value={task.priority}
                  onChange={(e) => handleUpdate({ priority: e.target.value })}
                >
                  <option value="NONE">None</option>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent Priority</option>
                </select>

                <div className="text-muted-foreground font-medium flex items-center gap-2">
                  <Timer className="h-4 w-4" /> Estimation
                </div>
                <div className="flex items-center gap-2">
                  <Input 
                    type="number"
                    className="h-8 w-20 text-xs border-none bg-muted/30 focus-visible:ring-1 font-bold"
                    value={task.effort || ""}
                    onChange={(e) => setTask({ ...task, effort: parseFloat(e.target.value) || 0 } as any)}
                    onBlur={(e) => handleUpdate({ effort: parseFloat(e.target.value) || 0 })}
                    placeholder="0.0"
                  />
                  <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-50">Hours</span>
                </div>

              </div>

              <div className="space-y-3 pt-4">
                <Label className="text-muted-foreground font-semibold">Description</Label>
                <textarea 
                  className="w-full min-h-[120px] border rounded-lg p-4 bg-muted/5 text-sm focus:bg-muted/10 transition-colors outline-none resize-none"
                  value={task.description || ""}
                  onChange={(e) => setTask({ ...task, description: e.target.value })}
                  onBlur={(e) => handleUpdate({ description: e.target.value })}
                  placeholder="Add more details about this task..."
                />
              </div>

              <div className="pt-4 border-t border-dashed mt-4 animate-in fade-in slide-in-from-top-4 duration-700">
                <TaskTimer 
                  taskId={task.id} 
                  initialDuration={task?.timeEntries?.reduce((sum: number, entry: any) => sum + entry.duration, 0) || 0}
                  onTimeSave={async (duration) => {
                    const res = await fetch(`/api/tasks/${task.id}/time-entries`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ duration, description: "Worked on task" }),
                    });
                    if (res.ok) {
                      const newEntry = await res.json();
                      setTask((prev: any) => ({
                        ...prev,
                        timeEntries: [...(prev?.timeEntries || []), newEntry]
                      }));
                    }
                  }}
                />
              </div>

              <div className="space-y-4 pt-4 border-t">
                <div>
                  <Label className="text-muted-foreground font-semibold flex items-center gap-2 mb-2">
                    <User className="h-4 w-4" /> Collaborators
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {(task as any).assignees?.map((a: any) => (
                      <div key={a.id} className="flex items-center gap-1.5 bg-muted/30 px-2 py-1 rounded-full text-xs border group">
                        <span>{a.user?.name}</span>
                        <button className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleUpdate({ assigneeIds: (task as any).assignees.filter((x: any) => x.userId !== a.userId).map((x: any) => x.userId) })}>
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    <select 
                      className="bg-transparent border-dashed border-2 rounded-full px-2 py-1 text-xs outline-none cursor-pointer hover:border-primary transition-colors appearance-none"
                      onChange={(e) => {
                        if (e.target.value) {
                          const currentIds = (task as any).assignees?.map((a: any) => a.userId) || [];
                          if (!currentIds.includes(e.target.value)) {
                            handleUpdate({ assigneeIds: [...currentIds, e.target.value] });
                          }
                          e.target.value = "";
                        }
                      }}
                    >
                      <option value="">+ Add collaborator</option>
                      {users.map(u => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <Label className="text-muted-foreground font-semibold flex items-center gap-2 mb-2">
                    <HistoryIcon className="h-4 w-4" /> Blockers
                  </Label>
                  <div className="text-xs text-muted-foreground italic bg-muted/20 p-3 rounded-lg border border-dashed text-center">
                    Dependencies and blockers management (coming soon)
                  </div>
                </div>

                <div>
                  <Label className="text-muted-foreground font-semibold flex items-center gap-2 mb-2">
                     Attachments
                  </Label>
                  <div className="flex items-center gap-2 p-3 border rounded-lg bg-muted/10 border-dashed text-xs text-muted-foreground cursor-pointer hover:bg-muted/20 transition-colors">
                    <Plus className="h-4 w-4" /> Drop files or click to upload context
                  </div>
                </div>
            </div>
          </div>
        </div>

        {/* Right Side: Comments & Activity Feed */}
          <div className="w-[350px] shrink-0 flex flex-col bg-muted/10">
            <div className="flex border-b">
              <button 
                onClick={() => setActiveTab("comments")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-semibold uppercase tracking-wider transition-colors ${activeTab === 'comments' ? 'bg-background border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <MessageSquare className="h-3.5 w-3.5" />
                Comments
              </button>
              <button 
                onClick={() => setActiveTab("activity")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-semibold uppercase tracking-wider transition-colors ${activeTab === 'activity' ? 'bg-background border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <HistoryIcon className="h-3.5 w-3.5" />
                Activity
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {activeTab === "comments" ? (
                comments.map((c: any) => (
                  <div key={c.id} className="flex gap-3 text-sm">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                      {c.user?.name?.charAt(0) || "U"}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{c.user?.name || "User"}</span>
                        <span className="text-[10px] text-muted-foreground">{new Date(c.createdAt).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">{c.content}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-muted-foreground text-center pt-10 px-4">
                  Activity log aggregates project-level changes in real-time.
                </div>
              )}
            </div>

            {activeTab === "comments" && (
              <div className="p-4 border-t bg-background">
                <div className="relative">
                  <Input 
                    placeholder="Write a comment..." 
                    className="pr-10" 
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handlePostComment()}
                  />
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="absolute right-1 top-1 h-8 w-8 text-primary hover:text-primary hover:bg-primary/5"
                    onClick={handlePostComment}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

      </DialogContent>
    </Dialog>
  );
}

function PlusIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}
