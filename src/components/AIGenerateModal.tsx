"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sparkles, Loader2, CheckCircle2, ArrowRight } from "lucide-react";

interface AIGenerateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerated: (plan: Record<string, unknown>) => void;
}

export function AIGenerateModal({ isOpen, onClose, onGenerated }: AIGenerateModalProps) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Record<string, unknown> | null>(null);

  const reset = () => {
    setPrompt("");
    setError("");
    setResult(null);
    setLoading(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleGenerate = async () => {
    if (prompt.trim().length < 10) {
      setError("Describe your project in at least 10 characters.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/ai/generate-project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to generate.");
        setLoading(false);
        return;
      }

      setResult(data);
    } catch {
      setError("Network error. Check your connection.");
      setLoading(false);
    }
  };

  const handleUsePlan = () => {
    if (result) {
      onGenerated(result);
      handleClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-xl" onClose={handleClose}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            AI Project Generator
          </DialogTitle>
          <DialogDescription>
            Describe your project and AI will create a full plan with phases and tasks.
          </DialogDescription>
        </DialogHeader>

        {!result ? (
          <div className="space-y-4">
            {error && (
              <div className="p-3 rounded-md bg-destructive/10 text-sm font-medium text-destructive border border-destructive/20">{error}</div>
            )}

            <Textarea
              placeholder={"Ex: Organisation d'un festival culturel à Cotonou en juin 2026 avec 500 participants, gestion des sponsors, logistique et communication..."}
              value={prompt}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPrompt(e.target.value)}
              className="min-h-[120px] text-sm"
              disabled={loading}
            />

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={handleClose} disabled={loading}>Cancel</Button>
              <Button onClick={handleGenerate} disabled={loading || prompt.trim().length < 10}>
                {loading ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...</>
                ) : (
                  <><Sparkles className="h-4 w-4 mr-2" /> Generate Plan</>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <h3 className="font-bold text-emerald-700 dark:text-emerald-400">Plan Generated!</h3>
              </div>
              <p className="text-sm font-semibold">{result.name as string}</p>
              <p className="text-xs text-muted-foreground mt-1">{result.description as string}</p>
            </div>

            <div className="space-y-2 max-h-[40vh] overflow-y-auto">
              {(result.sections as Record<string, unknown>[])?.map((section, i) => (
                <div key={i} className="border rounded-lg overflow-hidden">
                  <div className="px-3 py-2 bg-muted/50 text-xs font-bold flex items-center justify-between">
                    <span>{section.name as string}</span>
                    <span className="text-muted-foreground font-normal">{(section.tasks as Record<string, unknown>[])?.length || 0} tasks</span>
                  </div>
                  <div className="divide-y">
                    {(section.tasks as Record<string, unknown>[])?.map((task, j) => (
                      <div key={j} className="px-3 py-1.5 text-xs flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30 shrink-0" />
                        <span className="flex-1 truncate">{task.title as string}</span>
                        <span className={`text-[10px] font-bold uppercase ${
                          task.priority === "URGENT" ? "text-red-500" :
                          task.priority === "HIGH" ? "text-orange-500" :
                          task.priority === "LOW" ? "text-muted-foreground" : "text-blue-500"
                        }`}>{task.priority as string}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => { setResult(null); setPrompt(prompt); }}>Try Again</Button>
              <Button onClick={handleUsePlan}>
                Use This Plan <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
