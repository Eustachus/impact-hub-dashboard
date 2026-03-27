/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState, useEffect } from "react";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CopyPlus, MoreHorizontal, LayoutGrid, List as ListIcon, FolderIcon, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export default function ProjectsPage() {
  const { data: _session } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/login");
    },
  });
  const [view, setView] = useState<"grid" | "list">("grid");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [projects, setProjects] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [newProject, setNewProject] = useState({ name: "", description: "", color: "#3b82f6" });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      if (Array.isArray(data)) setProjects(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newProject, workspaceId: "default" }),
      });
      if (res.ok) {
        setIsCreateModalOpen(false);
        setNewProject({ name: "", description: "", color: "#3b82f6" });
        fetchProjects();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-8">Chargement des projets...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projets</h1>
          <p className="text-muted-foreground">Gérez et suivez l'avancement de vos projets d'équipe.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-md border p-1 bg-card">
            <Button variant={view === "grid" ? "default" : "ghost"} size="sm" onClick={() => setView("grid")} className="h-7 px-2">
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button variant={view === "list" ? "default" : "ghost"} size="sm" onClick={() => setView("list")} className="h-7 px-2">
              <ListIcon className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <CopyPlus className="mr-2 h-4 w-4" /> Nouveau Projet
          </Button>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="border-2 border-dashed rounded-xl p-12 text-center space-y-4">
          <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto text-primary">
            <FolderIcon className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-lg">Aucun projet trouvé</h3>
                    <p className="text-muted-foreground text-sm flex items-center gap-2">You haven&apos;t started any projects yet. Let&apos;s build something impactful.</p>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)} variant="outline">
            Créer un projet
          </Button>
        </div>
      ) : view === "grid" ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {(projects as any[]).map((p) => (
            <Link key={p.id} href={`/dashboard/projects/${p.id}`}>
              <Card className="hover:shadow-md transition-shadow flex flex-col h-full cursor-pointer overflow-hidden group border-t-4" style={{ borderTopColor: p.color }}>
                <CardHeader className="pb-3 flex-row items-start justify-between space-y-0">
                  <div className="space-y-1">
                    <CardTitle className="group-hover:text-primary transition-colors">{p.name}</CardTitle>
                    <p className="text-xs text-muted-foreground truncate max-w-[200px]">{p.description || "Pas de description"}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="mt-auto">
                  <div className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle className="h-3.5 w-3.5" />
                      <span>{p._count?.tasks || 0} Tâches</span>
                    </div>
                    <Badge variant={p.status === "AT_RISK" ? "destructive" : "secondary"}>
                      {p.status || "ON_TRACK"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-md border bg-card overflow-hidden">
          <div className="divide-y">
            {(projects as any[]).map((p) => (
              <Link key={p.id} href={`/dashboard/projects/${p.id}`}>
                <div className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                    <span className="font-medium">{p.name}</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-sm text-muted-foreground hidden md:inline-block">
                      {p._count?.tasks || 0} tâches
                    </span>
                    <Badge variant={p.status === "AT_RISK" ? "destructive" : "secondary"}>
                      {p.status || "ON_TRACK"}
                    </Badge>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95">
            <CardHeader>
              <CardTitle>Créer un nouveau projet</CardTitle>
            </CardHeader>
            <form onSubmit={handleCreateProject}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Nom du projet</Label>
                  <Input 
                    required 
                    placeholder="ex: Refonte Site Web" 
                    value={newProject.name}
                    onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <textarea 
                    className="w-full min-h-[100px] p-3 text-sm rounded-md border bg-transparent outline-none focus:ring-2 focus:ring-ring"
                    placeholder="En quelques mots..."
                    value={newProject.description}
                    onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Couleur</Label>
                  <div className="flex gap-2">
                    {["#3b82f6", "#ef4444", "#22c55e", "#f59e0b", "#a855f7"].map(c => (
                      <button
                        key={c}
                        type="button"
                        className={cn(
                          "w-8 h-8 rounded-full border-2",
                          newProject.color === c ? "border-primary" : "border-transparent"
                        )}
                        style={{ backgroundColor: c }}
                        onClick={() => setNewProject({...newProject, color: c})}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
              <div className="p-6 pt-0 flex justify-end gap-3">
                <Button variant="ghost" type="button" onClick={() => setIsCreateModalOpen(false)}>Annuler</Button>
                <Button type="submit">Créer le projet</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
