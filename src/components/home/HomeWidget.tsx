/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GripVertical, X, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HomeWidgetProps {
  id: string;
  title: string;
  subtitle?: string;
  icon?: any;
  children: ReactNode;
  onRemove?: (id: string) => void;
  onResize?: (id: string) => void;
  isDraggable?: boolean;
  dragHandleProps?: any;
  className?: string;
}

export function HomeWidget({ 
  id, 
  title, 
  subtitle, 
  icon: Icon, 
  children, 
  onRemove,
  onResize,
  isDraggable = true,
  dragHandleProps,
  className = ""
}: HomeWidgetProps) {
  return (
    <Card className={`group relative overflow-hidden bg-card/70 backdrop-blur-2xl border border-white/10 border-t-white/20 shadow-2xl transition-all hover:shadow-primary/10 hover:border-primary/30 h-[420px] flex flex-col ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-white/5 flex-shrink-0 border-b border-white/5">
        <div className="flex items-center gap-2">
          {isDraggable && (
            <div 
              {...dragHandleProps}
              className="cursor-grab active:cursor-grabbing p-1 -ml-1 opacity-40 hover:opacity-100 transition-opacity"
            >
              <GripVertical className="h-4 w-4" />
            </div>
          )}
          {Icon && <Icon className="h-4 w-4 text-primary" />}
          <div>
            <CardTitle className="text-sm font-bold tracking-tight">{title}</CardTitle>
            {subtitle && <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">{subtitle}</p>}
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onResize && (
            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:bg-primary/10" onClick={() => onResize(id)}>
              <Maximize2 className="h-3 w-3" />
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:bg-destructive/10 hover:text-destructive" onClick={() => onRemove?.(id)}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-4 flex-1 overflow-y-auto custom-scrollbar">
        {children}
      </CardContent>
    </Card>
  );
}
