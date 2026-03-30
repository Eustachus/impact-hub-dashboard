/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/ui/button";
import { Plus, Target, TrendingUp } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { CreateGoalModal } from "@/components/CreateGoalModal";

export default function GoalsPage() {
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchGoals = useCallback(() => {
    setLoading(true);
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

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  if (loading) return <div className="p-8">Chargement des objectifs...</div>;

  const avgProgress = goals.length > 0
    ? Math.round(goals.reduce((acc, g) => acc + g.progress, 0) / goals.length)
    : 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Goals & OKRs</h1>
          <p className="text-muted-foreground">Align your teams around measurable results.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
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
        {goals.length === 0 && (
          <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">
            <Target className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Aucun objectif pour le moment</p>
            <p className="text-sm mt-1">Créez votre premier objectif pour commencer le suivi.</p>
          </div>
        )}
        {goals.map((goal) => (
          <div key={goal.id} className="bg-card border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold">{goal.title}</h3>
                <p className="text-sm text-muted-foreground">
                  Owned by {goal.owner}
                  {goal.period && ` · ${goal.period}`}
                </p>
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

            {goal.keyResults && goal.keyResults.length > 0 && (
              <div className="mt-4 pt-4 border-t space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Key Results</p>
                {goal.keyResults.map((kr: any) => (
                  <div key={kr.id} className="flex items-center justify-between text-sm">
                    <span>{kr.title}</span>
                    <span className="text-muted-foreground font-mono text-xs">
                      {kr.currentValue}/{kr.targetValue}{kr.unit || ''}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <CreateGoalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={fetchGoals}
      />
    </div>
  );
}
