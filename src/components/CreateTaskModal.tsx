"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, ChevronDown } from "lucide-react";


interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated?: () => void;
}

export function CreateTaskModal({ isOpen, onClose, onTaskCreated }: CreateTaskModalProps) {
  const [projects, setProjects] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [taskName, setTaskName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [projectId, setProjectId] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [requiresApproval, setRequiresApproval] = useState(false);
  const [subtasks, setSubtasks] = useState<string[]>([]);
  const [newSubtask, setNewSubtask] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetch("/api/projects")
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setProjects(data);
            if (data.length > 0) setProjectId(data[0].id);
          }
        });
      
      fetch("/api/users")
        .then(res => res.json())
        .then(data => setUsers(data))
        .catch(err => console.error(err));
    }
  }, [isOpen]);

  const addSubtask = () => {
    if (newSubtask.trim()) {
      setSubtasks([...subtasks, newSubtask.trim()]);
      setNewSubtask("");
    }
  };

  const removeSubtask = (index: number) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) return;

    setLoading(true);
    try {
      // 1. Create main task
      const res = await fetch(`/api/projects/${projectId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: taskName,
          description,
          startDate: startDate || null,
          dueDate: dueDate || null,
          status: requiresApproval ? "AWAITING_APPROVAL" : "TODO",
          priority,
          assigneeIds: assigneeId ? [assigneeId] : [],
          order: 0,
        }),
      });

      if (res.ok) {
        const mainTask = await res.json();
        
        // 2. Create subtasks if any
        if (subtasks.length > 0) {
          await Promise.all(subtasks.map(st => 
            fetch(`/api/projects/${projectId}/tasks`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                title: st,
                parentId: mainTask.id,
                status: "TODO",
                priority: "NONE",
                order: 0,
              }),
            })
          ));
        }

        onTaskCreated?.();
        onClose();
        resetForm();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTaskName("");
    setDescription("");
    setStartDate("");
    setDueDate("");
    setSubtasks([]);
    setNewSubtask("");
    setAssigneeId("");
    setPriority("MEDIUM");
    setRequiresApproval(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <Card className="w-full max-w-lg shadow-2xl max-h-[90vh] overflow-auto">
        <CardHeader className="flex flex-row items-center justify-between pb-2 border-b mb-4">
          <CardTitle className="text-xl">Nouvelle tâche</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full">
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label className="text-xs uppercase text-muted-foreground font-bold tracking-wider">Titre de la tâche</Label>
              <Input 
                required 
                placeholder="Qu'y a-t-il à faire ?" 
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                autoFocus
                className="text-xl py-6 border-none bg-muted/20 focus-visible:ring-1 focus-visible:bg-muted/40 transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-xs uppercase text-muted-foreground font-bold">Responsable</Label>
                <div className="relative">
                   <select 
                    className="w-full h-10 rounded-md border bg-transparent px-3 py-1 text-sm outline-none appearance-none hover:bg-muted/30 transition-colors"
                    value={assigneeId}
                    onChange={(e) => setAssigneeId(e.target.value)}
                   >
                     <option value="">Non assigné</option>
                     {users.map(u => (
                       <option key={u.id} value={u.id}>{u.name}</option>
                     ))}
                   </select>
                   <ChevronDown className="absolute right-3 top-3 h-4 w-4 opacity-50 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs uppercase text-muted-foreground font-bold">Projet</Label>
                <div className="relative">
                  <select 
                    className="w-full h-10 rounded-md border bg-transparent px-3 py-1 text-sm outline-none appearance-none hover:bg-muted/30 transition-colors"
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    required
                  >
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-3 h-4 w-4 opacity-50 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-xs uppercase text-muted-foreground font-bold">Date de début</Label>
                <Input 
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-10 border-muted bg-muted/10"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs uppercase text-muted-foreground font-bold">Échéance</Label>
                <Input 
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="h-10 border-muted bg-muted/10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase text-muted-foreground font-bold">Description du travail</Label>
              <textarea 
                className="w-full min-h-[100px] p-4 text-sm rounded-md border bg-muted/10 outline-none focus:ring-1 focus:ring-primary/50 resize-none transition-all focus:bg-transparent"
                placeholder="Décrivez le travail, ajoutez des liens ou des instructions..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/10 rounded-lg border border-transparent hover:border-muted-foreground/20 transition-all">
              <div className="space-y-0.5">
                <Label className="text-sm font-bold">Workflow d'approbation</Label>
                <p className="text-xs text-muted-foreground">Demander une validation une fois le travail achevé.</p>
              </div>
              <input 
                type="checkbox"
                className="h-5 w-5 rounded border-muted bg-muted/20 text-primary focus:ring-primary"
                checked={requiresApproval}
                onChange={(e) => setRequiresApproval(e.target.checked)}
              />
            </div>

            <div className="space-y-3 pt-2 border-t">
              <Label className="text-xs uppercase text-muted-foreground font-bold">Sous-tâches</Label>
              <div className="flex gap-2">
                <Input 
                  placeholder="Ajouter une étape..." 
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSubtask())}
                  className="h-8 text-xs"
                />
                <Button type="button" size="sm" onClick={addSubtask} className="h-8">Plus</Button>
              </div>
              
              {subtasks.length > 0 && (
                <div className="space-y-1 bg-muted/20 p-2 rounded-md">
                  {subtasks.map((st, i) => (
                    <div key={i} className="flex items-center justify-between group">
                      <span className="text-xs">• {st}</span>
                      <button 
                        type="button" 
                        onClick={() => removeSubtask(i)}
                        className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
          <div className="p-6 flex justify-end gap-3 border-t bg-muted/5">
            <Button variant="ghost" type="button" onClick={onClose} className="hover:bg-background">Annuler</Button>
            <Button type="submit" disabled={loading || !projectId} className="px-10 h-10 shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 font-bold">
              {loading ? "Création..." : "Enregistrer la tâche"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

