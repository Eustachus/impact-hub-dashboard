"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Zap, Plus, Trash2, ArrowRight, Sparkles,
  CheckCircle2, Clock, UserPlus, Tag, Mail, Bell
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface WorkflowRule {
  id: string;
  name: string;
  trigger: string;
  triggerLabel: string;
  action: string;
  actionLabel: string;
  active: boolean;
  projectId: string;
  lastRun?: string;
  runCount: number;
}

interface ProjectWorkflowViewProps {
  projectId: string;
}

const TRIGGERS = [
  { id: "task_completed", label: "Task is completed", icon: CheckCircle2 },
  { id: "status_review", label: "Status changes to Review", icon: Clock },
  { id: "task_created", label: "New task is created", icon: Plus },
  { id: "assignee_added", label: "Assignee is added", icon: UserPlus },
  { id: "due_soon", label: "Due date is within 2 days", icon: Clock },
  { id: "priority_high", label: "Priority set to Urgent", icon: Zap },
];

const ACTIONS = [
  { id: "notify_team", label: "Notify team members", icon: Bell },
  { id: "log_activity", label: "Log to activity feed", icon: Tag },
  { id: "email_pm", label: "Send email notification", icon: Mail },
  { id: "auto_tag", label: "Auto-tag task", icon: Tag },
  { id: "move_section", label: "Move to next section", icon: ArrowRight },
];

const STORAGE_KEY = "focus-workflow-rules";

export function ProjectWorkflowView({ projectId }: ProjectWorkflowViewProps) {
  const [rules, setRules] = useState<WorkflowRule[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRuleName, setNewRuleName] = useState("");
  const [newTrigger, setNewTrigger] = useState("");
  const [newAction, setNewAction] = useState("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const allRules: WorkflowRule[] = JSON.parse(stored);
        setRules(allRules.filter(r => r.projectId === projectId));
      }
    } catch {
      // ignore
    }
  }, [projectId]);

  const persistRules = useCallback((updated: WorkflowRule[]) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const allRules: WorkflowRule[] = stored ? JSON.parse(stored) : [];
      const otherRules = allRules.filter(r => r.projectId !== projectId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...otherRules, ...updated]));
    } catch {
      // ignore
    }
  }, [projectId]);

  const toggleRule = (id: string, active: boolean) => {
    const updated = rules.map(r => r.id === id ? { ...r, active } : r);
    setRules(updated);
    persistRules(updated);
  };

  const deleteRule = (id: string) => {
    const updated = rules.filter(r => r.id !== id);
    setRules(updated);
    persistRules(updated);
  };

  const createRule = () => {
    if (!newRuleName.trim() || !newTrigger || !newAction) return;

    const triggerDef = TRIGGERS.find(t => t.id === newTrigger);
    const actionDef = ACTIONS.find(a => a.id === newAction);

    const rule: WorkflowRule = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2),
      name: newRuleName.trim(),
      trigger: newTrigger,
      triggerLabel: triggerDef?.label || newTrigger,
      action: newAction,
      actionLabel: actionDef?.label || newAction,
      active: true,
      projectId,
      runCount: 0,
    };

    const updated = [...rules, rule];
    setRules(updated);
    persistRules(updated);

    setNewRuleName("");
    setNewTrigger("");
    setNewAction("");
    setShowCreateModal(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/30 overflow-hidden animate-in fade-in duration-500">
      <div className="flex items-center justify-between px-8 py-4 bg-white border-b">
        <div>
          <h2 className="text-[14px] font-bold text-foreground tracking-tight">Workflow Engine</h2>
          <p className="text-[11px] text-muted-foreground font-medium">
            Automate your project management lifecycle with custom rules.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-[#5252ff] hover:bg-[#4040ff] text-white px-4 py-2 rounded-xl text-[11px] font-bold flex items-center gap-2 shadow-lg shadow-[#5252ff]/20 transition-all hover:scale-[1.02]"
        >
          <Plus className="h-3.5 w-3.5" /> Create Automation
        </button>
      </div>

      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/50 flex items-center gap-2">
                <Zap className="h-3 w-3" /> Active Workflows
              </h3>
              <Badge variant="outline" className="bg-white border-slate-200 text-slate-500 text-[9px] font-black uppercase px-2 py-0">
                {rules.filter(r => r.active).length} Running
              </Badge>
            </div>

            {rules.length === 0 ? (
              <div className="text-center py-16 border-2 border-dashed rounded-2xl">
                <Zap className="h-10 w-10 mx-auto mb-3 text-muted-foreground/20" />
                <p className="text-sm font-bold text-muted-foreground">No automations yet</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Create your first workflow rule.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {rules.map((rule) => {
                  const TriggerIcon = TRIGGERS.find(t => t.id === rule.trigger)?.icon || Zap;
                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                  const _ActionIcon = ACTIONS.find(a => a.id === rule.action)?.icon || Zap;
                  return (
                    <div
                      key={rule.id}
                      className={cn(
                        "group bg-white border rounded-2xl p-5 flex items-center justify-between transition-all hover:shadow-md hover:border-[#5252ff]/20",
                        !rule.active && "opacity-60 border-dashed"
                      )}
                    >
                      <div className="flex items-center gap-5">
                        <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                          rule.active ? "bg-[#5252ff]/5 border border-[#5252ff]/10" : "bg-slate-100 border border-slate-200"
                        )}>
                          <TriggerIcon className={cn("h-6 w-6", rule.active ? "text-[#5252ff]" : "text-muted-foreground/40")} />
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h4 className="text-[13px] font-bold text-foreground">{rule.name}</h4>
                            {rule.active && (
                              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-[9px] font-bold uppercase">
                                <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" /> Live
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-medium">
                            <span className="text-foreground/60">{rule.triggerLabel}</span>
                            <ArrowRight className="h-3 w-3 opacity-30" />
                            <span className="text-[#5252ff]">{rule.actionLabel}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right pr-6 border-r">
                          <div className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-widest mb-1">Runs</div>
                          <div className="text-[11px] font-bold text-foreground/60">{rule.runCount}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Switch
                            checked={rule.active}
                            onCheckedChange={(val) => toggleRule(rule.id, val)}
                          />
                          <button
                            onClick={() => deleteRule(rule.id)}
                            className="p-2 hover:bg-red-50 text-muted-foreground/30 hover:text-red-500 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="space-y-4 pt-4">
            <h3 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/50 flex items-center gap-2">
              <Sparkles className="h-3 w-3" /> Quick Templates
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {[
                { title: "On Completion", desc: "Notify team when a task is marked done", trigger: "task_completed", action: "notify_team", icon: CheckCircle2 },
                { title: "Review Gate", desc: "Email PM when task enters review", trigger: "status_review", action: "email_pm", icon: Mail },
                { title: "Auto-assign", desc: "Log activity when assignee is added", trigger: "assignee_added", action: "log_activity", icon: UserPlus },
              ].map((tpl, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setNewRuleName(tpl.title);
                    setNewTrigger(tpl.trigger);
                    setNewAction(tpl.action);
                    setShowCreateModal(true);
                  }}
                  className="bg-white border hover:border-[#5252ff] rounded-2xl p-5 group cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg text-left"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center mb-4 group-hover:bg-[#5252ff]/5 transition-colors">
                    <tpl.icon className="h-5 w-5 text-muted-foreground group-hover:text-[#5252ff]" />
                  </div>
                  <h4 className="text-[12px] font-bold text-foreground mb-1">{tpl.title}</h4>
                  <p className="text-[10px] text-muted-foreground/70 leading-relaxed font-medium">{tpl.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Create Rule Modal */}
      <Dialog open={showCreateModal} onOpenChange={(open) => !open && setShowCreateModal(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-[#5252ff]" />
              New Automation
            </DialogTitle>
            <DialogDescription>
              Define a trigger and an action to automate your workflow.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            <div className="space-y-2">
              <Label>Rule Name</Label>
              <Input
                placeholder="e.g. Notify on completion"
                value={newRuleName}
                onChange={(e) => setNewRuleName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>When this happens...</Label>
              <div className="grid grid-cols-2 gap-2">
                {TRIGGERS.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setNewTrigger(t.id)}
                    className={cn(
                      "flex items-center gap-2 p-3 rounded-xl border text-xs font-medium text-left transition-all",
                      newTrigger === t.id
                        ? "border-[#5252ff] bg-[#5252ff]/5 text-[#5252ff]"
                        : "hover:bg-muted/50"
                    )}
                  >
                    <t.icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Do this...</Label>
              <div className="grid grid-cols-2 gap-2">
                {ACTIONS.map(a => (
                  <button
                    key={a.id}
                    onClick={() => setNewAction(a.id)}
                    className={cn(
                      "flex items-center gap-2 p-3 rounded-xl border text-xs font-medium text-left transition-all",
                      newAction === a.id
                        ? "border-[#5252ff] bg-[#5252ff]/5 text-[#5252ff]"
                        : "hover:bg-muted/50"
                    )}
                  >
                    <a.icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{a.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
              <Button
                onClick={createRule}
                disabled={!newRuleName.trim() || !newTrigger || !newAction}
                className="bg-[#5252ff] hover:bg-[#4040ff]"
              >
                Create
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
