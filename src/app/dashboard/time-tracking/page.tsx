/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Play, Pause, Square, Clock, History, MoreHorizontal } from "lucide-react";
import { format } from "date-fns";

export default function TimeTrackingPage() {
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0); // in seconds
  const [taskName, setTaskName] = useState("");
  const [recentEntries, setRecentEntries] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/time-entries")
      .then(res => res.json())
      .then(data => {
        setRecentEntries(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setRecentEntries([]);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return [h, m, s].map((v) => v.toString().padStart(2, "0")).join(":");
  };

  if (loading) return <div className="p-8 italic">Chargement du temps passé...</div>;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Time Tracking</h1>
        <p className="text-muted-foreground">Track how much time you spend on each task.</p>
      </div>

      {/* active Timer */}
      <Card className="border-primary/50 shadow-lg shadow-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Current Session
          </CardTitle>
          <CardDescription>What are you working on right now?</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <Input 
              placeholder="Enter task name..." 
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              className="flex-1 text-lg h-12"
              disabled={isTimerRunning}
            />
            <div className="flex items-center gap-4 min-w-[300px] justify-between bg-muted/50 p-2 rounded-lg px-6 h-12">
              <span className="text-2xl font-mono font-bold tracking-wider">
                {formatTime(elapsedTime)}
              </span>
              <div className="flex gap-2">
                {!isTimerRunning ? (
                  <Button size="icon" className="rounded-full h-10 w-10" onClick={() => setIsTimerRunning(true)}>
                    <Play className="h-5 w-5 fill-current" />
                  </Button>
                ) : (
                  <Button size="icon" variant="outline" className="rounded-full h-10 w-10 border-orange-500 text-orange-500 hover:bg-orange-50" onClick={() => setIsTimerRunning(false)}>
                    <Pause className="h-5 w-5 fill-current" />
                  </Button>
                )}
                <Button 
                  size="icon" 
                  variant="outline" 
                  className="rounded-full h-10 w-10 border-destructive text-destructive hover:bg-destructive/10"
                  onClick={() => {
                    setIsTimerRunning(false);
                    setElapsedTime(0);
                    setTaskName("");
                  }}
                >
                  <Square className="h-5 w-5 fill-current" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-8 md:grid-cols-3">
        {/* History List */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Recent Entries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {Array.isArray(recentEntries) && (recentEntries as any[]).map((entry) => (
                <div key={(entry as any).id} className="py-4 flex items-center justify-between group">
                  <div className="space-y-1">
                    <p className="font-medium group-hover:text-primary transition-colors cursor-pointer">{(entry as any).task}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-sans">
                      <span className="bg-muted px-2 py-0.5 rounded">{(entry as any).project}</span>
                      <span>•</span>
                      <span>{(entry as any).date}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-mono font-medium">{(entry as any).duration}</span>
                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Weekly Stats Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total This Week</span>
                <span className="font-bold">28h 45m</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div className="bg-primary h-full w-[70%]" />
              </div>
              <p className="text-[10px] text-muted-foreground">Target: 40h</p>
            </div>

            <div className="space-y-4 pt-4">
               {[
                 { label: "focus Redesign", time: "12h 30m", percent: 45 },
                 { label: "Client Meetings", time: "8h 15m", percent: 30 },
                 { label: "Administrative", time: "4h 00m", percent: 15 },
               ].map((item, i) => (
                 <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs font-sans">
                       <span>{item.label}</span>
                       <span className="text-muted-foreground">{item.time}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1 overflow-hidden">
                       <div className="bg-muted-foreground h-full" style={{ width: `${item.percent}%` }} />
                    </div>
                 </div>
               ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
