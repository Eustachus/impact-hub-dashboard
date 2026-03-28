/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { Button } from "@/components/ui/button";
import { Plus, Target, TrendingUp } from "lucide-react";

import { useState, useEffect } from "react";

export default function GoalsPage() {
  const [goals, setGoals] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/goals")
      .then(res => res.json())
      .then(data => {
        setGoals(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        console.error(err);
        setGoals([]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8">Chargement des objectifs...</div>;

  const avgProgress = Array.isArray(goals) && goals.length > 0 
    ? Math.round((goals as any[]).reduce((acc, g) => acc + g.progress, 0) / goals.length)
    : 0;
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Goals & OKRs</h1>
          <p className="text-muted-foreground">Align your teams around measurable results.</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> New Goal
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <div className="bg-card border rounded-xl p-6 shadow-sm flex items-center gap-4">
           <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
              <Target className="h-6 w-6" />
           </div>
           <div>
              <div className="text-3xl font-bold">{goals.length}</div>
              <div className="text-sm text-muted-foreground">Active Goals</div>
           </div>
        </div>
        <div className="bg-card border rounded-xl p-6 shadow-sm flex items-center gap-4">
           <div className="w-12 h-12 bg-green-100 text-green-700 rounded-full flex items-center justify-center">
              <TrendingUp className="h-6 w-6" />
           </div>
           <div>
              <div className="text-3xl font-bold">{avgProgress}%</div>
              <div className="text-sm text-muted-foreground">Average Progress</div>
           </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold mt-8 mb-4">Company Objectives</h2>
        {Array.isArray(goals) && (goals as any[]).map((goal) => (
          <div key={goal.id} className="bg-card border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold">{goal.title}</h3>
                <p className="text-sm text-muted-foreground">Owned by {goal.owner}</p>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${goal.color}`}>
                {goal.status}
              </span>
            </div>
            
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Progress</span>
                <span>{goal.progress}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                <div 
                  className={`h-2.5 rounded-full ${goal.color}`} 
                  style={{ width: `${goal.progress}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
