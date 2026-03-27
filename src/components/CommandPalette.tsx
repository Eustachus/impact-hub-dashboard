/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import * as React from "react";
import {
  Calculator,
  Calendar,
  CreditCard,
  Settings,
  Smile,
  User,
  Search,
  Layout,
  Plus,
  CheckCircle,
  FileText,
  Clock,
  Target
} from "lucide-react";
import { useRouter } from "next/navigation";

// Since we are stubbing Shadcn components, we'll build a simplified Command Palette
// That aligns with the existing UI stubs.

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  React.useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  if (!open) return null;

  const staticLinks = [
    { id: "s-1", title: "Aller au Dashboard", type: "Navigation", href: "/dashboard", category: "Raccourcis" },
    { id: "s-2", title: "Mes Projets", type: "Navigation", href: "/dashboard/projects", category: "Raccourcis" },
  ];

  const allResults = query.length < 2 ? staticLinks : results;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-40 px-4 pointer-events-none">
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm pointer-events-auto" onClick={() => setOpen(false)} />
      
      <div className="relative w-full max-w-lg bg-card border rounded-xl shadow-2xl overflow-hidden pointer-events-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center border-b px-4">
          <Search className="h-4 w-4 text-muted-foreground mr-3" />
          <input
            className="flex h-12 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Tapez pour rechercher..."
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="text-[10px] font-mono border rounded px-1.5 py-0.5 text-muted-foreground ml-auto bg-muted">
            ESC
          </div>
        </div>

        <div className="max-h-[400px] overflow-y-auto p-2">
          {loading && <div className="p-4 text-center text-xs text-muted-foreground">Recherche en cours...</div>}
          
          {allResults.length > 0 ? (
            <div className="space-y-1">
              {allResults.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    router.push(item.href);
                    setOpen(false);
                  }}
                  className="flex w-full items-center justify-between gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground text-left transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded border bg-muted group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                      <Layout className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <div className="font-medium">{item.title}</div>
                      {item.subtitle && <div className="text-[10px] text-muted-foreground">{item.subtitle}</div>}
                    </div>
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground opacity-70">
                    {item.type}
                  </div>
                </button>
              ))}
            </div>
          ) : !loading && (
            <div className="py-12 text-center text-sm text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-3 opacity-20" />
              Réfléchissez un peu plus, ou essayez un autre mot-clé.
            </div>
          )}
        </div>

        <div className="border-t px-4 py-2 bg-muted/30 flex items-center justify-between text-[11px] text-muted-foreground">
          <div className="flex gap-4">
            <span className="flex items-center gap-1.5">
              <kbd className="border rounded px-1 bg-background shadow-sm">Enter</kbd> Sélectionner
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="border rounded px-1 bg-background shadow-sm">↑↓</kbd> Naviguer
            </span>
          </div>
          <div>Search focus</div>
        </div>
      </div>
    </div>
  );
}
