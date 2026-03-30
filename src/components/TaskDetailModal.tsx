"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect, useCallback } from "react";
import { Calendar, CheckCircle2, MoreHorizontal, User, MessageSquare, History as HistoryIcon, Send, X, Timer, Clock } from "lucide-react";
import { TaskTimer } from "./TaskTimer";
import { useToast } from "@/components/ToastProvider";
import { useSocket } from "@/hooks/useSocket";

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
    timeEntries?: Record<string, unknown>[];
  };
}

export function TaskDetailModal({ open, onOpenChange, task: initialTask, onUpdate }: TaskDetailModalProps) {
  const { toast } = useToast();
  const { emit } = useSocket();
  const [activeTab, setActiveTab] = useState<"comments" | "activity" | "time">("comments");
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<Record<string, unknown>[]>([]);
  const [task, setTask] = useState<Record<string, unknown> | null>(initialTask as Record<string, unknown> | null);
  const [users, setUsers] = useState<Record<string, unknown>[]>([]);
  const [timeEntries, setTimeEntries] = useState<Record<string, unknown>[]>([]);

  const fetchComments = useCallback(async (taskId: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}/comments`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setComments(data);
      }
    } catch { /* ignore */ }
  }, []);

  const fetchTimeEntries = useCallback(async (taskId: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}/time-entries`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setTimeEntries(data);
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (open) {
      fetch("/api/users")
        .then(res => res.json())
        .then(data => { if (Array.isArray(data)) setUsers(data); })
        .catch(() => {});
    }
  }, [open]);

  useEffect(() => {
    if (initialTask) setTask(initialTask as Record<string, unknown>);
  }, [initialTask]);

  useEffect(() => {
    if (open && initialTask?.id) {
      fetch(`/api/tasks/${initialTask.id}`)
        .then(res => res.json())
        .then(data => { if (data && !data.error) setTask(data); })
        .catch(() => {});
      fetchComments(initialTask.id);
      fetchTimeEntries(initialTask.id);
    }
  }, [open, initialTask?.id, fetchComments, fetchTimeEntries]);

  if (!task) return null;

  const handleUpdate = async (updates: Record<string, unknown>) => {
    try {
      const res = await fetch(`/api/projects/${task.projectId || 'any'}/tasks`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: task.id, ...updates }),
      });
      if (res.ok) {
        const updated = await res.json();
        setTask(updated);
        onUpdate?.();
        emit("task-updated", { taskId: task.id, projectId: task.projectId, updates });
        toast({ type: "success", title: "Task updated" });
      }
    } catch {
      toast({ type: "error", title: "Failed to update task" });
    }
  };

  const handlePostComment = async () => {
    if (!comment.trim()) return;
    try {
      const res = await fetch(`/api/tasks/${task.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: comment }),
      });
      if (res.ok) {
        const newComment = await res.json();
        setComments([...comments, newComment]);
        setComment("");
        toast({ type: "info", title: "Comment posted" });
      }
    } catch {
      toast({ type: "error", title: "Failed to post comment" });
    }
  };

  const totalTimeLogged = timeEntries.reduce((sum, e) => sum + (e.duration as number || 0), 0);

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)} className="max-w-4xl h-[85vh] flex flex-col p-0 overflow-hidden">
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
          </div>
          <div className="flex items-center gap-2 mr-6 text-xs text-muted-foreground uppercase font-bold tracking-tight">
            ID: {(task.id as string)?.slice(0, 8) || '...'}
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-8 py-8 border-r bg-background">
            <div className="space-y-8">
              <textarea
                className="w-full text-3xl font-bold border-none resize-none focus:ring-0 p-0 bg-transparent outline-none h-auto placeholder:text-muted-foreground leading-tight"
                value={task.title as string}
                onChange={(e) => setTask({ ...task, title: e.target.value })}
                onBlur={(e) => handleUpdate({ title: e.target.value })}
                placeholder="Task name"
                rows={2}
              />

              <div className="grid grid-cols-[140px_1fr] items-center gap-y-6 text-sm">
                <div className="text-muted-foreground font-medium flex items-center gap-2">
                  <User className="h-4 w-4" /> Assignee
                </div>
                <select
                  className="w-fit p-1.5 bg-transparent border-none font-semibold hover:bg-muted/50 rounded-md outline-none cursor-pointer appearance-none pr-6"
                  value={(task.assignees as Record<string, unknown>[])?.[0]?.userId as string || ""}
                  onChange={(e) => handleUpdate({ assigneeIds: e.target.value ? [e.target.value] : [] })}
                >
                  <option value="">Unassigned</option>
                  {users.map(u => (
                    <option key={u.id as string} value={u.id as string}>{u.name as string}</option>
                  ))}
                </select>

                <div className="text-muted-foreground font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" /> Dates
                </div>
                <div className="flex items-center gap-2">
                  <Input type="date" className="h-8 w-fit text-xs border-none bg-muted/30 focus-visible:ring-1"
                    value={task.startDate ? new Date(task.startDate as string).toISOString().split('T')[0] : ""}
                    onChange={(e) => handleUpdate({ startDate: e.target.value })}
                  />
                  <span className="text-muted-foreground">→</span>
                  <Input type="date" className="h-8 w-fit text-xs border-none bg-muted/30 focus-visible:ring-1"
                    value={task.dueDate ? new Date(task.dueDate as string).toISOString().split('T')[0] : ""}
                    onChange={(e) => handleUpdate({ dueDate: e.target.value })}
                  />
                </div>

                <div className="text-muted-foreground font-medium flex items-center gap-2">
                  <MoreHorizontal className="h-4 w-4" /> Priority
                </div>
                <select
                  className="bg-transparent border-none focus:ring-0 font-semibold cursor-pointer w-fit p-1.5 hover:bg-muted/50 rounded-md outline-none appearance-none"
                  value={task.priority as string}
                  onChange={(e) => handleUpdate({ priority: e.target.value })}
                >
                  <option value="NONE">None</option>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>

                <div className="text-muted-foreground font-medium flex items-center gap-2">
                  <Timer className="h-4 w-4" /> Estimation
                </div>
                <div className="flex items-center gap-2">
                  <Input type="number" className="h-8 w-20 text-xs border-none bg-muted/30 focus-visible:ring-1 font-bold"
                    value={(task.effort as number) || ""}
                    onChange={(e) => setTask({ ...task, effort: parseFloat(e.target.value) || 0 })}
                    onBlur={(e) => handleUpdate({ effort: parseFloat(e.target.value) || 0 })}
                    placeholder="0"
                  />
                  <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-50">Hours</span>
                </div>
              </div>

              <div className="space-y-3 pt-4">
                <Label className="text-muted-foreground font-semibold">Description</Label>
                <textarea
                  className="w-full min-h-[120px] border rounded-lg p-4 bg-muted/5 text-sm focus:bg-muted/10 transition-colors outline-none resize-none"
                  value={(task.description as string) || ""}
                  onChange={(e) => setTask({ ...task, description: e.target.value })}
                  onBlur={(e) => handleUpdate({ description: e.target.value })}
                  placeholder="Add more details..."
                />
              </div>

              <div className="pt-4 border-t border-dashed">
                <TaskTimer
                  initialDuration={totalTimeLogged}
                  onTimeSave={async (duration) => {
                    const res = await fetch(`/api/tasks/${task.id}/time-entries`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ duration, description: "Worked on task" }),
                    });
                    if (res.ok) {
                      const entry = await res.json();
                      setTimeEntries(prev => [...prev, entry]);
                      toast({ type: "success", title: `Logged ${formatDuration(duration)}` });
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
                    {((task.assignees as Record<string, unknown>[]) || []).map((a) => (
                      <div key={a.id as string} className="flex items-center gap-1.5 bg-muted/30 px-2 py-1 rounded-full text-xs border group">
                        <span>{(a.user as Record<string, unknown>)?.name as string}</span>
                        <button
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => {
                            const remaining = ((task.assignees as Record<string, unknown>[]) || [])
                              .filter((x) => x.userId !== a.userId)
                              .map((x) => x.userId);
                            handleUpdate({ assigneeIds: remaining });
                          }}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    <select
                      className="bg-transparent border-dashed border-2 rounded-full px-2 py-1 text-xs outline-none cursor-pointer hover:border-primary transition-colors appearance-none"
                      onChange={(e) => {
                        if (e.target.value) {
                          const currentIds = ((task.assignees as Record<string, unknown>[]) || []).map((a) => a.userId);
                          if (!currentIds.includes(e.target.value)) {
                            handleUpdate({ assigneeIds: [...currentIds, e.target.value] });
                          }
                          e.target.value = "";
                        }
                      }}
                    >
                      <option value="">+ Add collaborator</option>
                      {users.map(u => (
                        <option key={u.id as string} value={u.id as string}>{u.name as string}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="w-[350px] shrink-0 flex flex-col bg-muted/10">
            <div className="flex border-b">
              <button onClick={() => setActiveTab("comments")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-semibold uppercase tracking-wider transition-colors ${activeTab === 'comments' ? 'bg-background border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
                <MessageSquare className="h-3.5 w-3.5" /> Comments
              </button>
              <button onClick={() => setActiveTab("time")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-semibold uppercase tracking-wider transition-colors ${activeTab === 'time' ? 'bg-background border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
                <Clock className="h-3.5 w-3.5" /> Time
              </button>
              <button onClick={() => setActiveTab("activity")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-semibold uppercase tracking-wider transition-colors ${activeTab === 'activity' ? 'bg-background border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
                <HistoryIcon className="h-3.5 w-3.5" /> Log
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {activeTab === "comments" ? (
                comments.length > 0 ? comments.map((c) => (
                  <div key={c.id as string} className="flex gap-3 text-sm">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                      {((c.user as Record<string, unknown>)?.name as string)?.charAt(0) || "U"}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{(c.user as Record<string, unknown>)?.name as string || "User"}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(c.createdAt as string).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">{c.content as string}</p>
                    </div>
                  </div>
                )) : (
                  <div className="text-xs text-muted-foreground text-center pt-10">No comments yet.</div>
                )
              ) : activeTab === "time" ? (
                timeEntries.length > 0 ? (
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-muted-foreground uppercase mb-3">
                      Total: {formatDuration(totalTimeLogged)}
                    </div>
                    {timeEntries.map((e) => (
                      <div key={e.id as string} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg text-sm">
                        <div>
                          <div className="font-medium">{e.description as string || "Work"}</div>
                          <div className="text-[10px] text-muted-foreground">
                            {new Date(e.date as string).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="font-mono font-bold text-primary">
                          {formatDuration(e.duration as number)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground text-center pt-10">No time logged yet.</div>
                )
              ) : (
                <div className="text-xs text-muted-foreground text-center pt-10">
                  Activity log for this task will appear here.
                </div>
              )}
            </div>

            {activeTab === "comments" && (
              <div className="p-4 border-t bg-background">
                <div className="relative">
                  <Input placeholder="Write a comment..." className="pr-10" value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handlePostComment()}
                  />
                  <Button size="icon" variant="ghost"
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
