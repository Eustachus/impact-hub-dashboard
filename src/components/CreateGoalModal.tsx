"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Plus, Trash2, Target } from "lucide-react";

interface KeyResultInput {
  title: string;
  targetValue: number;
  unit: string;
}

interface CreateGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function CreateGoalModal({ isOpen, onClose, onCreated }: CreateGoalModalProps) {
  const [title, setTitle] = useState("");
  const [period, setPeriod] = useState("");
  const [keyResults, setKeyResults] = useState<KeyResultInput[]>([
    { title: "", targetValue: 100, unit: "%" }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const addKeyResult = () => {
    setKeyResults([...keyResults, { title: "", targetValue: 100, unit: "%" }]);
  };

  const removeKeyResult = (index: number) => {
    if (keyResults.length > 1) {
      setKeyResults(keyResults.filter((_, i) => i !== index));
    }
  };

  const updateKeyResult = (index: number, field: keyof KeyResultInput, value: string | number) => {
    const updated = [...keyResults];
    const item = updated[index];
    if (!item) return;
    if (field === "targetValue") {
      item.targetValue = value as number;
    } else if (field === "title") {
      item.title = value as string;
    } else if (field === "unit") {
      item.unit = value as string;
    }
    setKeyResults(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Le titre est requis");
      return;
    }

    const validKRs = keyResults.filter(kr => kr.title.trim());
    if (validKRs.length === 0) {
      setError("Au moins un key result est requis");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          period: period.trim() || null,
          keyResults: validKRs.map(kr => ({
            title: kr.title.trim(),
            targetValue: kr.targetValue,
            unit: kr.unit || null,
          })),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur lors de la création");
      }

      setTitle("");
      setPeriod("");
      setKeyResults([{ title: "", targetValue: 100, unit: "%" }]);
      onCreated();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Nouvel Objectif
          </DialogTitle>
          <DialogDescription>
            Définissez un objectif avec des résultats mesurables.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 rounded-md bg-destructive/10 text-sm font-medium text-destructive border border-destructive/20">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="goal-title">Titre de l&apos;objectif</Label>
            <Input
              id="goal-title"
              placeholder="Ex: Augmenter la satisfaction client"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="goal-period">Période (optionnel)</Label>
            <Input
              id="goal-period"
              placeholder="Ex: Q1 2026"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Key Results</Label>
              <Button type="button" variant="outline" size="sm" onClick={addKeyResult} disabled={loading}>
                <Plus className="h-3 w-3 mr-1" /> Ajouter
              </Button>
            </div>

            {keyResults.map((kr, index) => (
              <div key={index} className="flex gap-2 items-start">
                <div className="flex-1 space-y-1">
                  <Input
                    placeholder="Résultat mesurable"
                    value={kr.title}
                    onChange={(e) => updateKeyResult(index, "title", e.target.value)}
                    disabled={loading}
                  />
                </div>
                <Input
                  className="w-20"
                  type="number"
                  placeholder="Cible"
                  value={kr.targetValue}
                  onChange={(e) => updateKeyResult(index, "targetValue", parseFloat(e.target.value) || 0)}
                  disabled={loading}
                />
                <Input
                  className="w-16"
                  placeholder="%"
                  value={kr.unit}
                  onChange={(e) => updateKeyResult(index, "unit", e.target.value)}
                  disabled={loading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-muted-foreground hover:text-destructive shrink-0"
                  onClick={() => removeKeyResult(index)}
                  disabled={loading || keyResults.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Création..." : "Créer l'objectif"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
