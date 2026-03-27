/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, CheckCircle2, AlertCircle, 
  Calendar as CalendarIcon, MessageSquare, BarChart, 
  Target, TrendingUp, Clock, Plus, Filter, MoreHorizontal,
  FileText, Briefcase, Layout, Link as LinkIcon, Settings, Timer
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

interface ProjectOverviewProps {
  project: any;
  tasks: any[];
  onUpdate: (data: any) => void;
  onTaskClick: (task: any) => void;
}

export function ProjectOverview({ project, tasks = [], onUpdate, onTaskClick }: ProjectOverviewProps) {
  const [isEditingBrief, setIsEditingBrief] = useState(false);
  const [brief, setBrief] = useState(project.brief || "");
  const [isAddingResource, setIsAddingResource] = useState(false);

  const handleSaveBrief = () => {
    onUpdate({ brief });
    setIsEditingBrief(false);
  };

  const members = project.members || [];

  const taskStats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'DONE').length;
    const inProgress = tasks.filter(t => t.status === 'IN_PROGRESS').length;
    const todo = tasks.filter(t => t.status === 'TODO').length;
    return { total, completed, inProgress, todo };
  }, [tasks]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-8 bg-white animate-in fade-in slide-in-from-bottom-4 duration-700 overflow-auto h-full custom-scrollbar">

      {/* Left: Project Brief & Strategy */}
      <div className="lg:col-span-2 space-y-10">
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-3 text-foreground/90">
              <div className="w-8 h-8 rounded-lg bg-[#5252ff]/10 flex items-center justify-center text-[#5252ff]">
                <FileText className="h-4 w-4" />
              </div>
              Project Brief
            </h2>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => isEditingBrief ? handleSaveBrief() : setIsEditingBrief(true)}
              className="text-[#5252ff] hover:bg-[#5252ff]/10 font-bold text-[11px] uppercase tracking-wider px-4 h-9 rounded-lg transition-all"
            >
              {isEditingBrief ? "Save Changes" : "Edit Brief"}
            </Button>
          </div>
          
          {isEditingBrief ? (
            <textarea
              className="w-full min-h-[250px] p-6 rounded-2xl border-[0.5px] border-[#5252ff]/20 bg-slate-50/50 focus:bg-white focus:border-[#5252ff] outline-none transition-all resize-y text-sm leading-relaxed shadow-inner"
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              placeholder="Describe the project's goals, strategy and success criteria..."
            />
          ) : (
            <div className="p-8 rounded-2xl bg-slate-50/50 border-[0.5px] border-slate-200 text-sm leading-relaxed whitespace-pre-wrap text-foreground/70 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#5252ff]/10 group-hover:bg-[#5252ff] transition-all" />
              {project.brief || (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground opacity-30">
                  <Briefcase className="h-12 w-12 mb-4" />
                  <p className="font-bold uppercase tracking-widest text-[10px]">No briefing provided</p>
                </div>
              )}
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center justify-between mb-6">
             <h2 className="text-xl font-bold flex items-center gap-3 text-foreground/90">
               <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                 <Layout className="h-4 w-4" />
               </div>
               Key Resources
             </h2>
             <Button 
               variant="outline" 
               size="sm" 
               className="gap-2 font-bold text-[11px] uppercase tracking-wider px-4 h-9 rounded-lg border-slate-200 hover:bg-slate-50 transition-all"
               onClick={() => setIsAddingResource(true)}
             >
               <Plus className="h-3.5 w-3.5" /> Add Resource
             </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(project.resources || []).length > 0 ? project.resources.map((res: any) => (
              <a 
                key={res.id} 
                href={res.url} 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center gap-4 p-5 rounded-2xl bg-white border-[0.5px] hover:border-[#5252ff]/40 hover:shadow-xl hover:shadow-[#5252ff]/5 transition-all group relative overflow-hidden"
              >
                <div className="p-3 rounded-xl bg-[#5252ff]/5 text-[#5252ff] group-hover:bg-[#5252ff] group-hover:text-white transition-all shadow-sm">
                  <LinkIcon className="h-4 w-4" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="font-bold text-[13px] text-foreground/80 group-hover:text-[#5252ff] transition-colors truncate">{res.title}</p>
                  <p className="text-[10px] text-muted-foreground/50 truncate font-medium">{res.url}</p>
                </div>
              </a>
            )) : (
              <div className="col-span-full p-12 rounded-2xl border-[0.5px] border-dashed border-slate-200 flex flex-col items-center justify-center text-muted-foreground/40 bg-slate-50/20">
                <p className="text-[11px] font-bold uppercase tracking-widest mb-4">No assets connected</p>
                <Button variant="outline" size="sm" className="gap-2 h-9 rounded-lg text-[10px] font-bold uppercase" onClick={() => setIsAddingResource(true)}>
                  <Plus className="h-3.5 w-3.5" /> Link Asset
                </Button>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Resource Creation Modal */}
      {isAddingResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
           <Card className="w-full max-w-md shadow-2xl border-primary/10 animate-in zoom-in-95 duration-300">
             <CardHeader className="bg-muted/30 pb-4">
               <CardTitle className="text-xl font-bold">Add New Resource</CardTitle>
             </CardHeader>
             <form onSubmit={(e) => {
               e.preventDefault();
               const formData = new FormData(e.currentTarget);
               const data = {
                 title: formData.get("title") as string,
                 url: formData.get("url") as string,
                 type: "LINK"
               };
               fetch(`/api/projects/${project.id}/resources`, {
                 method: "POST",
                 headers: { "Content-Type": "application/json" },
                 body: JSON.stringify(data)
               }).then(res => {
                 if (res.ok) {
                   setIsAddingResource(false);
                   window.location.reload(); // Quick refresh
                 }
               });
             }}>
               <CardContent className="space-y-4 pt-6">
                 <div className="space-y-2">
                   <Label className="text-xs font-bold uppercase tracking-wider opacity-60">Resource Name</Label>
                   <Input name="title" required placeholder="e.g. Design Specs, API Docs..." className="h-11" />
                 </div>
                 <div className="space-y-2">
                   <Label className="text-xs font-bold uppercase tracking-wider opacity-60">Link URL</Label>
                   <Input name="url" required type="url" placeholder="https://..." className="h-11" />
                 </div>
               </CardContent>
               <div className="p-6 pt-0 flex justify-end gap-3 bg-muted/30">
                 <Button variant="ghost" type="button" onClick={() => setIsAddingResource(false)} className="font-semibold">Cancel</Button>
                 <Button type="submit" className="font-bold px-8 shadow-lg shadow-primary/20">Add Resource</Button>
               </div>
             </form>
           </Card>
        </div>
      )}

      {/* Right: Team & Insights */}
      <div className="space-y-10">
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-3 text-foreground/90">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <Users className="h-4 w-4" />
              </div>
              Team Roles
            </h2>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground/30 hover:text-foreground">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-3">
            {members.length > 0 ? members.map((member: any) => (
              <div key={member.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-all group border-[0.5px] border-transparent hover:border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar className="h-10 w-10 ring-2 ring-white shadow-md">
                      <AvatarImage src={member.user?.image} />
                      <AvatarFallback className="bg-gradient-to-br from-[#5252ff]/20 to-[#5252ff] text-white text-xs font-bold">
                        {member.user?.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white shadow-sm" />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-foreground/80">{member.user?.name}</p>
                    <p className="text-[10px] text-muted-foreground/50 font-medium">{member.user?.email}</p>
                  </div>
                </div>
                <Badge variant="secondary" className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 bg-slate-100/50 text-muted-foreground/70 border-none shadow-none">
                  {member.role}
                </Badge>
              </div>
            )) : (
              <p className="text-xs text-muted-foreground italic">No members identified.</p>
            )}
            
            <Button variant="outline" className="w-full border-[0.5px] border-dashed bg-white hover:bg-slate-50 border-slate-200 text-muted-foreground/60 h-12 rounded-2xl text-[11px] font-bold uppercase tracking-wider gap-3 transition-all">
              <Plus className="h-4 w-4" /> Invite Partner
            </Button>
          </div>
        </section>

        {/* Workload Insights */}
        <section>
           <div className="rounded-3xl border-[0.5px] border-[#5252ff]/10 shadow-xl shadow-[#5252ff]/5 bg-white p-6 relative overflow-hidden group">
             <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#5252ff]/20 to-transparent" />
             
             <div className="flex items-center justify-between mb-8">
               <h3 className="text-xs font-bold uppercase tracking-widest text-[#5252ff]">Workload Insights</h3>
               <Badge className="bg-[#5252ff]/10 text-[#5252ff] border-none text-[8px] font-bold px-1.5 uppercase tracking-tighter">Live</Badge>
             </div>

             <div className="space-y-8">
               {(() => {
                 const totalEst = tasks.reduce((sum, t) => sum + (t.effort || 0), 0);
                 const totalAct = tasks.reduce((sum, t) => sum + (t.timeEntries?.reduce((s: number, e: any) => s + e.duration, 0) || 0), 0) / 3600;
                 const progress = totalEst > 0 ? (totalAct / totalEst) * 100 : 0;

                 return (
                   <>
                     <div className="space-y-3">
                       <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
                         <span>Project Velocity</span>
                         <span className="text-foreground/80">{totalAct.toFixed(1)} / {totalEst.toFixed(1)} hrs</span>
                       </div>
                       <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden p-[1px]">
                         <div 
                           className={cn(
                             "h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(82,82,255,0.3)]",
                             progress > 100 ? 'bg-red-500' : 'bg-[#5252ff]'
                           )} 
                           style={{ width: `${Math.min(progress, 100)}%` }} 
                         />
                       </div>
                       {progress > 100 && (
                          <div className="flex items-center gap-1.5 text-[9px] text-red-500 font-bold uppercase tracking-tighter animate-pulse">
                            <Timer className="h-3 w-3" /> Over Estimation Limit
                          </div>
                       )}
                     </div>

                     <div className="space-y-6">
                        <Label className="text-[9px] font-bold tracking-widest uppercase text-muted-foreground/30">Member Allocation</Label>
                        {(() => {
                          const memberUsers = project.members?.map((m: any) => m.user) || [];
                          const assigneeUsers = tasks.flatMap(t => t.assignees?.map((a: any) => a.user) || []);
                          const allUsersMap = new Map();
                          [...memberUsers, ...assigneeUsers].forEach(u => u?.id && allUsersMap.set(u.id, u));
                          const allUsers = Array.from(allUsersMap.values());

                          if (allUsers.length === 0) return <p className="text-[10px] text-muted-foreground italic">No data.</p>;

                          return allUsers.slice(0, 3).map((user: any) => {
                            const userTasks = tasks.filter(t => t.assignees?.some((a: any) => a.userId === user.id));
                            const userEst = userTasks.reduce((sum, t) => sum + (t.effort || 0), 0);
                            const userAct = userTasks.reduce((sum, t) => sum + (t.timeEntries?.reduce((s: number, e: any) => s + e.duration, 0) || 0), 0) / 3600;
                            if (userEst === 0 && userAct === 0) return null;

                            return (
                              <div key={user.id} className="space-y-2 group/user flex flex-col">
                                 <div className="flex justify-between items-center text-[10px]">
                                   <span className="font-bold text-foreground/70 flex items-center gap-2">
                                     <div className="w-1.5 h-1.5 rounded-full bg-[#5252ff]/20" />
                                     {user.name}
                                   </span>
                                   <span className="font-bold text-muted-foreground/40">{userAct.toFixed(1)}h</span>
                                 </div>
                                 <div className="h-1 w-full bg-slate-50 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-[#5252ff]/40 group-hover/user:bg-[#5252ff] transition-all" 
                                      style={{ width: `${Math.min((userAct / (userEst || 1)) * 100, 100)}%` }} 
                                    />
                                 </div>
                              </div>
                            );
                          });
                        })()}
                     </div>
                   </>
                 );
               })()}
             </div>
           </div>
        </section>
      </div>

    </div>
  );
}
