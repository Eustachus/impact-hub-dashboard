"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";

interface NotificationItem {
  id: string;
  user: string;
  action: string;
  target: string;
  time: string;
}

interface NotificationDropdownProps {
  socket: ReturnType<typeof import("@/hooks/useSocket").useSocket>["socket"] | null;
}

export function NotificationDropdown({ socket }: NotificationDropdownProps) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/notifications")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setNotifications(data.slice(0, 5));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handler = (data: unknown) => {
      const notif = data as NotificationItem;
      setNotifications(prev => [notif, ...prev].slice(0, 5));
    };

    socket.on("notification", handler);
    return () => { socket.off("notification", handler); };
  }, [socket]);

  const unreadCount = notifications.filter(n => !readIds.has(n.id)).length;

  const markAllRead = useCallback(() => {
    setReadIds(new Set(notifications.map(n => n.id)));
  }, [notifications]);

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9 rounded-full relative"
        onClick={() => {
          setOpen(!open);
          if (!open) markAllRead();
        }}
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-[9px] font-bold text-white flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-80 bg-card border rounded-xl shadow-2xl z-50 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h3 className="text-sm font-bold">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-[10px] text-primary font-semibold hover:underline"
                >
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  No notifications
                </div>
              ) : (
                notifications.map(notif => (
                  <div
                    key={notif.id}
                    className={`flex gap-3 px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer ${
                      !readIds.has(notif.id) ? "bg-primary/5" : ""
                    }`}
                    onClick={() => {
                      setReadIds(prev => new Set(Array.from(prev).concat(notif.id)));
                    }}
                  >
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback className="text-[10px] font-bold bg-primary/10 text-primary">
                        {notif.user?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs leading-relaxed">
                        <span className="font-bold">{notif.user}</span>{" "}
                        <span className="text-muted-foreground">{notif.action}</span>{" "}
                        <span className="font-semibold text-primary">{notif.target}</span>
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{notif.time}</p>
                    </div>
                    {!readIds.has(notif.id) && (
                      <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="border-t p-2">
              <Link
                href="/dashboard/inbox"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-1.5 w-full py-2 text-xs font-semibold text-primary hover:bg-primary/5 rounded-lg transition-colors"
              >
                View all <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
