"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, Timer, Save, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TaskTimerProps {
  onTimeSave: (durationSeconds: number) => Promise<void>;
  initialDuration?: number; // Total seconds already logged
}

export function TaskTimer({ onTimeSave, initialDuration = 0 }: TaskTimerProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0); // Seconds in current session
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleToggle = () => setIsRunning(!isRunning);

  const handleStop = async () => {
    setIsRunning(false);
    if (elapsed > 0) {
      setIsSaving(true);
      try {
        await onTimeSave(elapsed);
        setElapsed(0);
      } catch (error) {
        console.error("Failed to save time:", error);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleReset = () => {
    if (confirm("Reset current session?")) {
      setElapsed(0);
      setIsRunning(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 p-4 bg-muted/30 rounded-xl border border-primary/10 shadow-inner">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Timer className={`h-4 w-4 ${isRunning ? 'animate-pulse text-primary' : 'text-muted-foreground'}`} />
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Live Work Timer</span>
        </div>
        {isRunning && (
            <Badge variant="outline" className="text-[9px] bg-primary/10 text-primary border-primary/20 animate-in fade-in zoom-in h-4 px-1.5 font-bold uppercase">Recording...</Badge>
        )}
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="text-3xl font-mono font-black tracking-tighter text-foreground tabular-nums">
          {formatTime(elapsed)}
        </div>
        
        <div className="flex items-center gap-1.5">
           {!isRunning && elapsed > 0 && (
             <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-full hover:bg-red-500/10 hover:text-red-500" 
                onClick={handleReset}
             >
                <RotateCcw className="h-4 w-4" />
             </Button>
           )}
           
           <Button 
              variant={isRunning ? "secondary" : "default"} 
              size="icon" 
              className={`h-10 w-10 rounded-full shadow-lg transition-all ${isRunning ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'bg-primary hover:scale-105'}`}
              onClick={handleToggle}
              disabled={isSaving}
           >
              {isRunning ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
           </Button>

           {elapsed > 0 && (
             <Button 
                variant="outline" 
                size="icon" 
                className="h-10 w-10 rounded-full border-primary/20 hover:bg-primary/5 hover:border-primary/40 relative shadow-sm"
                onClick={handleStop}
                disabled={isSaving}
             >
                {isSaving ? (
                    <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                ) : (
                    <Save className="h-5 w-5" />
                )}
             </Button>
           )}
        </div>
      </div>
      
      {initialDuration > 0 && (
          <div className="mt-1 flex items-center gap-1.5 opacity-50">
             <span className="text-[9px] font-bold uppercase tracking-tight">Total Tracked:</span>
             <span className="text-[10px] font-mono font-bold italic">{formatTime(initialDuration)}</span>
          </div>
      )}
    </div>
  );
}
