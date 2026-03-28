/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useSocket } from "@/hooks/useSocket";
import { useEffect, useState, useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, CheckCircle2, Check, Clock, Mail, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TaskDetailModal } from "@/components/TaskDetailModal";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type TabType = "ALL" | "UNREAD" | "MENTIONS" | "EMAILS";

interface Email {
  id: string;
  sender: string;
  subject: string;
  snippet: string;
  date: string;
}

export default function InboxPage() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notifLoading, setNotifLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("ALL");
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [emails, setEmails] = useState<any[]>([]);
  const [emailStatus, setEmailStatus] = useState<"loading" | "disconnected" | "connected">("loading");
  const [isSyncing, setIsSyncing] = useState(false);
  
  const { socket } = useSocket();

  useEffect(() => {
    // 1. Auth check
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
      } else {
        setUser(user);
        setAuthLoading(false);
      }
    };
    checkUser();

    // 2. Notifications
    fetch("/api/notifications")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setNotifications(data);
      })
      .catch(err => console.error(err))
      .finally(() => setNotifLoading(false));

    // 3. Emails
    fetch("/api/emails/sync")
      .then(res => {
        if (res.status === 403 || res.status === 401) {
          setEmailStatus("disconnected");
          return null;
        }
        return res.json();
      })
      .then(data => {
        if (data && Array.isArray(data)) {
           setEmails(data);
           setEmailStatus("connected");
        }
      })
      .catch(err => {
        console.error("Email fetch error:", err);
        setEmailStatus("disconnected");
      });
  }, [router, supabase.auth]);

  useEffect(() => {
    if (!socket) return;
    socket.on("notification", (newNotification) => {
      setNotifications(prev => [newNotification, ...prev]);
    });
    return () => {
      socket.off("notification");
    };
  }, [socket]);

  const syncEmails = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch("/api/emails/sync", { method: "POST" });
      if (res.status === 403 || res.status === 401) {
        setEmailStatus("disconnected");
      } else {
        const result = await res.json();
        if (result.success) {
          // Refetch fresh emails
          const getRes = await fetch("/api/emails/sync");
          const data = await getRes.json();
          setEmails(data);
          setEmailStatus("connected");
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSyncing(false);
    }
  };

  const connectGoogle = async () => {
    // In Supabase, we use signInWithOAuth to connect/link social accounts
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/dashboard/inbox',
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    });
    if (error) console.error("Google connect error:", error);
  };

  const markAllAsRead = () => {
    setReadIds(new Set(notifications.map(n => n.id)));
  };

  const markAsRead = (id: string) => {
    setReadIds(prev => {
      const copy = new Set(prev);
      copy.add(id);
      return copy;
    });
  };

  const handleNotificationClick = (notif: any) => {
    markAsRead(notif.id);
    if (notif.task) {
      setSelectedTask(notif.task);
    }
  };

  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      const isRead = readIds.has(n.id);
      if (activeTab === "UNREAD" && isRead) return false;
      if (activeTab === "MENTIONS" && !n.action?.toLowerCase().includes("mention")) return false;
      return true;
    });
  }, [notifications, activeTab, readIds]);

  const unreadCount = notifications.filter(n => !readIds.has(n.id)).length;

  if (authLoading || notifLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
           <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
           <p className="text-xs font-black uppercase tracking-[0.2em] opacity-40 animate-pulse">Syncing Inbox</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative">
        <div className="space-y-2">
          <Badge variant="outline" className="text-[10px] font-black uppercase tracking-[0.2em] border-primary/30 text-primary bg-primary/5 px-2 py-0.5 mb-2">
            Command Center
          </Badge>
          <h1 className="text-4xl font-black tracking-tighter flex items-center gap-3">
            Inbox {unreadCount > 0 && <span className="bg-primary text-primary-foreground text-sm flex items-center justify-center h-6 min-w-[24px] rounded-full px-2">{unreadCount}</span>}
          </h1>
          <p className="text-muted-foreground font-medium text-lg leading-none pt-1">
            Catch up on the latest changes across your projects.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllAsRead} className="gap-2 rounded-xl h-10 border-primary/20 hover:bg-primary/5 text-primary">
            <Check className="h-4 w-4" /> Mark all read
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1 bg-muted/30 border border-white/5 rounded-2xl w-max">
        <button 
          onClick={() => setActiveTab("ALL")}
          className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all ${activeTab === "ALL" ? "bg-background shadow-md text-foreground" : "text-muted-foreground hover:text-foreground"}`}
        >
          All Activity
        </button>
        <button 
          onClick={() => setActiveTab("UNREAD")}
          className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all ${activeTab === "UNREAD" ? "bg-background shadow-md text-foreground" : "text-muted-foreground hover:text-foreground"}`}
        >
          Unread
        </button>
        <button 
          onClick={() => setActiveTab("MENTIONS")}
          className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all ${activeTab === "MENTIONS" ? "bg-background shadow-md text-foreground" : "text-muted-foreground hover:text-foreground"}`}
        >
          Mentions
        </button>
        <button 
          onClick={() => setActiveTab("EMAILS")}
          className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all flex items-center gap-1.5 ${activeTab === "EMAILS" ? "bg-background shadow-md text-foreground" : "text-muted-foreground hover:text-foreground"}`}
        >
          <Mail className="h-3.5 w-3.5" /> Emails
        </button>
      </div>

      {activeTab === "EMAILS" && emailStatus === "connected" ? (
         <div className="flex justify-end">
           <Button variant="outline" size="sm" onClick={syncEmails} disabled={isSyncing} className="gap-2 rounded-xl h-9 text-xs">
              <RefreshCw className={`h-3 w-3 ${isSyncing ? "animate-spin" : ""}`} /> 
              {isSyncing ? "Syncing..." : "Sync latest emails"}
           </Button>
         </div>
      ) : null}

      {/* Notification / Email List */}
      <div className="bg-card/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        {activeTab === "EMAILS" ? (
          emailStatus === "disconnected" ? (
            <div className="flex flex-col items-center justify-center p-16 text-center">
              <div className="w-24 h-24 rounded-full bg-blue-500/10 flex items-center justify-center mb-6">
                 <Mail className="h-10 w-10 text-blue-500" />
              </div>
              <h3 className="text-2xl font-black tracking-tight mb-2">Connect your inbox</h3>
              <p className="text-muted-foreground max-w-[300px] leading-relaxed mb-6">
                Authorize your Google Workspace account to read, triage, and convert emails into tasks directly from Focus.
              </p>
              <Button onClick={connectGoogle} className="rounded-xl px-8 h-12 shadow-md shadow-primary/20 bg-blue-600 hover:bg-blue-700 text-white gap-3">
                 <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48"><path fill="#fbc02d" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12	s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20	s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#e53935" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039	l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4caf50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36	c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1565c0" d="M43.611,20.083L43.595,20L42,20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571	c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path></svg>
                 Connect Google Mail
              </Button>
              <p className="text-[10px] text-muted-foreground/60 mt-4 max-w-[200px]">Secure OAuth connection. We only request read access to your inbox.</p>
            </div>
          ) : emailStatus === "loading" ? (
            <div className="p-16 text-center text-muted-foreground italic">Fetching your emails...</div>
          ) : emails.length > 0 ? (
            <div className="divide-y divide-white/5">
               {emails.map((email: any) => (
                 <div key={email.id} className="p-5 flex gap-4 transition-all cursor-pointer group hover:bg-muted/10 bg-blue-500/5 hover:bg-blue-500/10">
                    <Avatar className="h-10 w-10 shrink-0">
                       <AvatarFallback className="bg-blue-500/20 text-blue-500 font-bold">{email.sender?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                       <div className="flex items-center justify-between">
                         <span className="font-bold text-sm truncate pr-4">{email.sender?.slice(0, Math.max(0, email.sender.indexOf('<'))) || email.sender}</span>
                         <span className="text-[10px] text-muted-foreground font-black uppercase tracking-wider shrink-0">
                           {new Date(email.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric'})}
                         </span>
                       </div>
                       <p className="text-[13px] font-semibold text-foreground/90 mt-0.5 truncate">{email.subject}</p>
                       <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{email.snippet?.replace(/&#39;/g, "'").replace(/&quot;/g, '"')}</p>
                    </div>
                 </div>
               ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-16 text-center">
              <div className="w-24 h-24 rounded-full bg-muted/10 flex items-center justify-center mb-6">
                 <CheckCircle2 className="h-10 w-10 text-muted-foreground/30" />
              </div>
              <h3 className="text-xl font-bold tracking-tight mb-2">Inbox Zero</h3>
              <p className="text-muted-foreground max-w-[250px] leading-relaxed">
                 You have no recent emails.
              </p>
            </div>
          )
        ) : filteredNotifications.length > 0 ? (
          <div className="divide-y divide-white/5">
            {filteredNotifications.map(notif => {
              const isRead = readIds.has(notif.id);
              return (
                <div 
                  key={notif.id} 
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-5 flex gap-4 transition-all cursor-pointer group hover:bg-muted/10 ${!isRead ? 'bg-primary/5 hover:bg-primary/10' : ''}`}
                >
                  <Avatar className="h-12 w-12 border-2 border-background shadow-lg shadow-black/5">
                    <AvatarImage src={notif.userImage} />
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5 text-primary font-black text-lg">
                      {notif.user?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 space-y-1.5 min-w-0">
                    <p className="text-sm leading-snug">
                       <span className="font-black text-foreground drop-shadow-sm">{notif.user}</span>{" "}
                       <span className="text-muted-foreground">{notif.action}</span>{" "}
                       <span className="font-bold text-primary italic hover:underline">#{notif.target}</span>
                    </p>
                    
                    {/* Task Context Preview */}
                    {!!notif.task && (
                      <div className="mt-2 p-3 rounded-xl bg-background/50 border border-white/5 flex items-center justify-between group-hover:border-primary/20 transition-colors">
                         <div className="flex items-center gap-3 truncate">
                            {notif.task.status === "DONE" ? <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" /> : <Clock className="h-4 w-4 text-muted-foreground shrink-0" />}
                            <span className="text-xs font-medium truncate">{notif.task.title}</span>
                         </div>
                         <Badge variant="secondary" className="text-[9px] uppercase font-black shrink-0 ml-4">
                           {notif.task.project?.name || "Global"}
                         </Badge>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 pt-1 opacity-60">
                       <Clock className="h-3 w-3" />
                       <span className="text-[10px] font-bold uppercase tracking-widest">{notif.time}</span>
                    </div>
                  </div>
                  
                  {!isRead && (
                    <div className="flex flex-col items-center justify-center shrink-0 w-8">
                       <div className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-16 text-center">
            <div className="w-24 h-24 rounded-full bg-muted/10 flex items-center justify-center mb-6">
               <Bell className="h-10 w-10 text-muted-foreground/30" />
            </div>
            <h3 className="text-2xl font-black tracking-tight mb-2">Nothing to see here</h3>
            <p className="text-muted-foreground max-w-[250px] leading-relaxed">
              {activeTab === "UNREAD" ? "You&apos;ve read all your notifications. Great job!" : "Your inbox is completely empty right now."}
            </p>
            {activeTab !== "ALL" && (
              <Button variant="outline" onClick={() => setActiveTab("ALL")} className="mt-6 rounded-xl border-dashed">
                View All Activity
              </Button>
            )}
          </div>
        )}
      </div>

      {!!selectedTask && (
        <TaskDetailModal 
          open={!!selectedTask} 
          onOpenChange={(open) => !open && setSelectedTask(null)} 
          task={selectedTask as any}
          onUpdate={() => {}}
        />
      )}
    </div>
  );
}
