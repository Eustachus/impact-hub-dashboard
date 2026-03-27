/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { 
    Zap, Plus, Trash2, Play, Settings, ChevronRight, 
    Slack, Mail, Github, Bell, CheckCircle2, 
    Clock, ArrowRight, MousePointer2, Box, Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

interface WorkflowRule {
    id: string;
    name: string;
    trigger: string;
    action: string;
    active: boolean;
    lastRun?: string;
    icon: any;
}

export function ProjectWorkflowView() {
    const [rules, setRules] = useState<WorkflowRule[]>([
        {
            id: "r1",
            name: "Slack Notification",
            trigger: "Task is completed",
            action: "Send message to #project-updates",
            active: true,
            lastRun: "2 hours ago",
            icon: Slack
        },
        {
            id: "r2",
            name: "Stakeholder Email",
            trigger: "Status changes to Review",
            action: "Email pm@fnd.gov",
            active: true,
            lastRun: "Yesterday",
            icon: Mail
        },
        {
            id: "r3",
            name: "Auto-Archive",
            trigger: "Task is dormant for 30 days",
            action: "Move to Archive",
            active: false,
            lastRun: "N/A",
            icon: Box
        }
    ]);

    return (
        <div className="flex flex-col h-full bg-slate-50/30 overflow-hidden animate-in fade-in duration-500">
            {/* Header / Toolbar */}
            <div className="flex items-center justify-between px-8 py-4 bg-white border-b">
                <div>
                    <h2 className="text-[14px] font-bold text-foreground tracking-tight">Workflow Engine</h2>
                    <p className="text-[11px] text-muted-foreground font-medium">Automate your project management lifecycle with custom rules.</p>
                </div>
                <button className="bg-[#5252ff] hover:bg-[#4040ff] text-white px-4 py-2 rounded-xl text-[11px] font-bold flex items-center gap-2 shadow-lg shadow-[#5252ff]/20 transition-all hover:scale-[1.02]">
                    <Plus className="h-3.5 w-3.5" /> Create Automation
                </button>
            </div>

            <div className="flex-1 overflow-auto p-8 custom-scrollbar">
                <div className="max-w-5xl mx-auto space-y-8">
                    
                    {/* Active Rules Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/50 flex items-center gap-2">
                                <Zap className="h-3 w-3" /> Active Workflows
                            </h3>
                            <Badge variant="outline" className="bg-white border-slate-200 text-slate-500 text-[9px] font-black uppercase px-2 py-0">
                                {rules.filter(r => r.active).length} Running
                            </Badge>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            {rules.map((rule) => (
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
                                            <rule.icon className={cn("h-6 w-6", rule.active ? "text-[#5252ff]" : "text-muted-foreground/40")} />
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
                                                <span className="text-foreground/60">{rule.trigger}</span>
                                                <ArrowRight className="h-3 w-3 opacity-30" />
                                                <span className="text-[#5252ff]">{rule.action}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="text-right pr-6 border-r">
                                            <div className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-widest mb-1">Last Run</div>
                                            <div className="text-[11px] font-bold text-foreground/60">{rule.lastRun}</div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Switch 
                                                checked={rule.active} 
                                                onCheckedChange={(val) => {
                                                    setRules(prev => prev.map(r => r.id === rule.id ? { ...r, active: val } : r));
                                                }}
                                            />
                                            <button className="p-2 hover:bg-red-50 text-muted-foreground/30 hover:text-red-500 rounded-lg transition-colors">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Templates Section */}
                    <div className="space-y-4 pt-4">
                        <h3 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/50 flex items-center gap-2">
                            <Sparkles className="h-3 w-3" /> Quick Templates
                        </h3>
                        <div className="grid grid-cols-3 gap-4">
                            {[
                                { title: "Onboarding Flow", desc: "Automate task creation for new members", icon: Box },
                                { title: "Slack Digest", desc: "Weekly project summary to channel", icon: Slack },
                                { title: "Approval Loop", desc: "Notify managers on review status", icon: Bell }
                            ].map((tpl, i) => (
                                <div key={i} className="bg-white border hover:border-[#5252ff] rounded-2xl p-5 group cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center mb-4 group-hover:bg-[#5252ff]/5 transition-colors">
                                        <tpl.icon className="h-5 w-5 text-muted-foreground group-hover:text-[#5252ff]" />
                                    </div>
                                    <h4 className="text-[12px] font-bold text-foreground mb-1">{tpl.title}</h4>
                                    <p className="text-[10px] text-muted-foreground/70 leading-relaxed font-medium">{tpl.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Visual Builder Sketch (Premium Polish) */}
                    <div className="bg-gradient-to-br from-[#5252ff] to-[#4040ff] rounded-[32px] p-8 text-white relative overflow-hidden shadow-2xl shadow-[#5252ff]/30">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Zap className="h-40 w-40" />
                        </div>
                        <div className="relative z-10 flex items-center justify-between">
                            <div className="max-w-md">
                                <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 text-[10px] uppercase font-black tracking-widest mb-4">
                                    AI Powered
                                </Badge>
                                <h3 className="text-xl font-black tracking-tight mb-2">Build more powerful automation</h3>
                                <p className="text-white/70 text-[13px] font-medium leading-relaxed">
                                    Use our natural language generator to create complex workflows just by describing them. 
                                    &quot;When a high-priority task is finished, notify the team and update the master sheet.&quot;
                                </p>
                            </div>
                            <button className="bg-white text-[#5252ff] px-6 py-3 rounded-2xl font-black text-[12px] uppercase tracking-wider hover:bg-slate-50 transition-all flex items-center gap-2 shadow-xl">
                                Try Magic Builder <MousePointer2 className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
