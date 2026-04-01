/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Play, Pause, Square, Clock, History } from "lucide-react";

export default function TimeTrackingPage() {
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [taskName, setTaskName] = useState("");
  const [recentEntries, setRecentEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/time-entries")
      .then(res => res.json())
      .then(data => {
        setRecentEntries(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => { setRecentEntries([]); setLoading(false); });
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => setElapsedTime(prev => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return [h, m, s].map(v => v.toString().padStart(2, "0")).join(":");
  };

  const saveTimeEntry = useCallback(async () => {
    if (elapsedTime < 10) {
      setElapsedTime(0);
      setTaskName("");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/time-entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ duration: elapsedTime, description: taskName || "Manual time entry" }),
      });
      if (res.ok) {
        const entry = await res.json();
        setRecentEntries(prev => [entry, ...prev]);
      }
    } catch { /* ignore */ }
    finally {
      setSaving(false);
      setElapsedTime(0);
      setTaskName("");
    }
  }, [elapsedTime, taskName]);

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  const totalThisWeek = recentEntries.reduce((sum, e) => sum + (e.duration || 0), 0);
  const weeklyTarget = 40 * 3600; // 40h in seconds
  const weeklyPercent = Math.min(Math.round((totalThisWeek / weeklyTarget) * 100), 100);

  if (loading) return <div className="p-8 italic">Chargement...</div>;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Time Tracking</h1>
        <p className="text-muted-foreground">Track how much time you spend on each task.</p>
      </div>

      <Card className="border-primary/50 shadow-lg shadow-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5 text-primary" />Current Session</CardTitle>
          <CardDescription>What are you working on right now?</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <Input placeholder="Enter task name..." value={taskName} onChange={e => setTaskName(e.target.value)} className="flex-1 text-lg h-12" disabled={isTimerRunning || saving} />
            <div className="flex items-center gap-4 min-w-[300px] justify-between bg-muted/50 p-2 rounded-lg px-6 h-12">
              <span className="text-2xl font-mono font-bold tracking-wider">{formatTime(elapsedTime)}</span>
              <div className="flex gap-2">
                {!isTimerRunning ? (
                  <Button size="icon" className="rounded-full h-10 w-10" onClick={() => setIsTimerRunning(true)} disabled={saving}><Play className="h-5 w-5 fill-current" /></Button>
                ) : (
                  <Button size="icon" variant="outline" className="rounded-full h-10 w-10 border-orange-500 text-orange-500 hover:bg-orange-50" onClick={() => setIsTimerRunning(false)}><Pause className="h-5 w-5 fill-current" /></Button>
                )}
                <Button size="icon" variant="outline" className="rounded-full h-10 w-10 border-destructive text-destructive hover:bg-destructive/10" onClick={saveTimeEntry} disabled={saving || elapsedTime === 0}>
                  {saving ? <div className="h-5 w-5 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Square className="h-5 w-5 fill-current" />}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-8 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader><CardTitle className="flex items-center gap-2"><History className="h-5 w-5" />Recent Entries</CardTitle></CardHeader>
          <CardContent>
            <div className="divide-y">
              {recentEntries.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No time entries yet.</p>
              ) : recentEntries.map((entry) => (
                <div key={entry.id} className="py-4 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-medium">{entry.description || "Time entry"}</p>
                    <p className="text-xs text-muted-foreground">{entry.date || "Today"}</p>
                  </div>
                  <span className="font-mono font-medium">{formatDuration(entry.duration)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Weekly Summary</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total This Week</span>
                <span className="font-bold">{formatDuration(totalThisWeek)}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div className="bg-primary h-full rounded-full" style={{ width: `${weeklyPercent}%` }} />
              </div>
              <p className="text-[10px] text-muted-foreground">Target: 40h</p>
            </div>
            <div className="text-xs text-muted-foreground text-center">
              {recentEntries.length} entries logged this week
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
