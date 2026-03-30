"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { FileText, Loader2, CheckCircle2, ChevronRight, Sparkles, Clipboard } from "lucide-react";
import { useRouter } from "next/navigation";

interface ParsedTask {
  title: string;
  priority: string;
}

interface ParsedSection {
  name: string;
  tasks: ParsedTask[];
}

interface Preview {
  name: string;
  sections: ParsedSection[];
  totalTasks: number;
}

interface CreateFromPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
}

async function extractPdfText(file: File): Promise<{ text: string; pages: number }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfjsLib: any = await loadPdfjs();
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const pages = pdf.numPages;

  let fullText = "";
  for (let i = 1; i <= pages; i++) {
    const page = await pdf.getPage(i);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const textContent: any = await page.getTextContent();
    const pageText = textContent.items
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((item: any) => item.str || "")
      .join("\n");
    fullText += pageText + "\n";
  }

  return { text: fullText, pages };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let pdfjsLibCache: any = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function loadPdfjs(): Promise<any> {
  if (pdfjsLibCache) return pdfjsLibCache;

  await new Promise<void>((resolve) => {
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.min.mjs";
    script.type = "module";
    document.head.appendChild(script);

    const check = () => {
      if ((window as unknown as Record<string, unknown>).pdfjsLib) {
        resolve();
      } else {
        setTimeout(check, 100);
      }
    };
    script.onload = () => setTimeout(check, 300);
  });

  pdfjsLibCache = (window as unknown as Record<string, unknown>).pdfjsLib;
  return pdfjsLibCache;
}

function parseText(text: string, fileName: string): Preview {
  const lines = text.split("\n").map(l => l.trim()).filter(l => l.length > 3);
  const projectName = fileName.replace(/\.pdf$/i, "").replace(/[-_]/g, " ");

  const sectionPatterns = [
    /^(?:phase|étape|step|stage|sprint)\s*\d+/i,
    /^q[1-4]\s*(?:20\d{2})?/i,
    /^(?:janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre|january|february|march|april|may|june|july|august|september|october|november|december)/i,
    /^\d+[\.\)]\s+[A-ZÀ-Ü]/,
    /^[A-ZÀ-Ü][A-ZÀ-Ü\s]{4,}$/,
    /^#{1,3}\s+/,
    /:$/,
  ];

  const taskPatterns = [
    /^[\s]*[-*•●○▪▸▹→➜►]\s+(.+)/,
    /^[\s]*\[?\s?\]\s+(.+)/,
    /^[\s]*\d+[\.\)]\s+(.+)/,
  ];

  const sections: ParsedSection[] = [];
  let currentTasks: ParsedTask[] = [];
  let currentName = "General";

  for (const line of lines) {
    const isSection = sectionPatterns.some(p => p.test(line));
    if (isSection) {
      if (currentTasks.length > 0) {
        sections.push({ name: currentName, tasks: currentTasks });
      }
      currentName = line.replace(/^#+\s*/, "").replace(/[:\-–—]+$/, "").trim().slice(0, 80);
      currentTasks = [];
      continue;
    }

    let taskText = "";
    for (const p of taskPatterns) {
      const m = line.match(p);
      if (m) { taskText = m[1].trim(); break; }
    }

    if (taskText && taskText.length > 3) {
      const lower = taskText.toLowerCase();
      const priority = lower.includes("urgent") || lower.includes("critical") ? "URGENT"
        : lower.includes("high") || lower.includes("important") ? "HIGH"
        : lower.includes("low") || lower.includes("minor") ? "LOW"
        : "MEDIUM";
      currentTasks.push({ title: taskText.slice(0, 200), priority });
    }
  }

  if (currentTasks.length > 0) {
    sections.push({ name: currentName, tasks: currentTasks });
  }

  if (sections.length === 0) {
    const tasks = lines.slice(0, 30).map(l => ({ title: l.slice(0, 200), priority: "MEDIUM" }));
    if (tasks.length > 0) {
      sections.push({ name: "Tasks", tasks });
    }
  }

  const totalTasks = sections.reduce((s, sec) => s + sec.tasks.length, 0);
  return { name: projectName, sections, totalTasks };
}

export function CreateFromPdfModal({ isOpen, onClose }: CreateFromPdfModalProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<"upload" | "preview" | "creating">("upload");
  const [preview, setPreview] = useState<Preview | null>(null);
  const [projectName, setProjectName] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ id: string; name: string; tasksCreated: number } | null>(null);
  const [textInput, setTextInput] = useState("");
  const [mode, setMode] = useState<"file" | "text">("file");

  const reset = () => {
    setStep("upload");
    setPreview(null);
    setProjectName("");
    setError("");
    setResult(null);
    setTextInput("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (selected.type !== "application/pdf") {
      setError("Please select a PDF file.");
      return;
    }
    setError("");
    setStep("creating");

    try {
      const { text } = await extractPdfText(selected);
      if (text.trim().length < 20) {
        setError("Could not extract text. The PDF may be image-based. Try pasting the text instead.");
        setStep("upload");
        return;
      }
      const parsed = parseText(text, selected.name);
      setPreview(parsed);
      setProjectName(parsed.name);
      setStep("preview");
    } catch {
      setError("Failed to read PDF. Try pasting the text instead.");
      setStep("upload");
    }
  };

  const handleTextParse = () => {
    if (textInput.trim().length < 20) {
      setError("Please paste at least some text content.");
      return;
    }
    const parsed = parseText(textInput, "Imported Roadmap");
    if (parsed.totalTasks === 0) {
      setError("No tasks found. Make sure the text has bullet points or numbered lists.");
      return;
    }
    setPreview(parsed);
    setProjectName(parsed.name);
    setStep("preview");
  };

  const handleCreate = async () => {
    if (!preview) return;
    setStep("creating");

    try {
      const projRes = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: projectName, color: "#6366f1" }),
      });
      const project = await projRes.json();
      if (!projRes.ok) throw new Error(project.error);

      let totalCreated = 0;
      for (let i = 0; i < preview.sections.length; i++) {
        const sec = preview.sections[i];
        const sectionRes = await fetch(`/api/projects/${project.id}/sections`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: sec.name, order: i }),
        });
        const section = await sectionRes.json();
        if (!sectionRes.ok) continue;

        for (const task of sec.tasks) {
          await fetch(`/api/projects/${project.id}/tasks`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: task.title, priority: task.priority, status: "TODO", sectionId: section.id }),
          });
          totalCreated++;
        }
      }

      setResult({ id: project.id, name: project.name, tasksCreated: totalCreated });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create project.");
      setStep("preview");
    }
  };

  const priorityColor = (p: string) => {
    switch (p) {
      case "URGENT": return "text-red-500";
      case "HIGH": return "text-orange-500";
      case "MEDIUM": return "text-blue-500";
      default: return "text-muted-foreground";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col" onClose={handleClose}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Create Project from Roadmap
          </DialogTitle>
          <DialogDescription>
            Upload a PDF or paste your roadmap text to auto-create a project.
          </DialogDescription>
        </DialogHeader>

        {step === "upload" && (
          <div className="space-y-4">
            {error && (
              <div className="p-3 rounded-md bg-destructive/10 text-sm font-medium text-destructive border border-destructive/20">{error}</div>
            )}

            <div className="flex gap-2 p-1 bg-muted/30 rounded-xl w-max">
              <button onClick={() => setMode("file")} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${mode === "file" ? "bg-background shadow text-foreground" : "text-muted-foreground"}`}>
                <FileText className="h-3 w-3 inline mr-1" /> PDF File
              </button>
              <button onClick={() => setMode("text")} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${mode === "text" ? "bg-background shadow text-foreground" : "text-muted-foreground"}`}>
                <Clipboard className="h-3 w-3 inline mr-1" /> Paste Text
              </button>
            </div>

            {mode === "file" ? (
              <div className="border-2 border-dashed rounded-xl p-12 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all" onClick={() => fileInputRef.current?.click()}>
                <FileText className="h-10 w-10 mx-auto mb-4 text-muted-foreground/40" />
                <p className="text-sm font-semibold mb-1">Click to upload a PDF</p>
                <p className="text-xs text-muted-foreground">Roadmaps, project plans, sprint documents</p>
                <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={handleFileSelect} />
              </div>
            ) : (
              <div className="space-y-2">
                <textarea value={textInput} onChange={(e) => setTextInput(e.target.value)} placeholder={"Phase 1: Setup\n- Create repository\n- Configure CI/CD\n\nPhase 2: Development\n- Build auth module\n- Design database\n\nPhase 3: Launch\n- Deploy to production"} className="w-full h-48 p-4 border rounded-xl text-sm font-mono resize-none focus:ring-1 focus:ring-primary focus:outline-none" />
                <Button onClick={handleTextParse} disabled={textInput.trim().length < 20} className="w-full">Parse Roadmap</Button>
              </div>
            )}
          </div>
        )}

        {step === "creating" && !result && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-medium text-muted-foreground">Analyzing structure...</p>
          </div>
        )}

        {step === "preview" && preview && (
          <div className="space-y-4 overflow-y-auto flex-1">
            {error && <div className="p-3 rounded-md bg-destructive/10 text-sm font-medium text-destructive border border-destructive/20">{error}</div>}
            <div className="space-y-2">
              <Label>Project Name</Label>
              <Input value={projectName} onChange={(e) => setProjectName(e.target.value)} />
            </div>
            <div className="text-xs text-muted-foreground">{preview.totalTasks} tasks found in {preview.sections.length} sections</div>
            <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2">
              {preview.sections.map((section, i) => (
                <div key={i} className="border rounded-lg overflow-hidden">
                  <div className="px-4 py-2 bg-muted/50 font-semibold text-sm flex items-center gap-2">
                    <ChevronRight className="h-3 w-3" />
                    {section.name}
                    <span className="text-xs text-muted-foreground font-normal ml-auto">{section.tasks.length} tasks</span>
                  </div>
                  {section.tasks.length > 0 && (
                    <div className="divide-y">
                      {section.tasks.slice(0, 5).map((task, j) => (
                        <div key={j} className="px-4 py-2 text-xs flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30 shrink-0" />
                          <span className="flex-1 truncate">{task.title}</span>
                          <span className={`text-[10px] font-bold uppercase ${priorityColor(task.priority)}`}>{task.priority}</span>
                        </div>
                      ))}
                      {section.tasks.length > 5 && <div className="px-4 py-1.5 text-[10px] text-muted-foreground italic">+{section.tasks.length - 5} more</div>}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => { setStep("upload"); setPreview(null); }}>Back</Button>
              <Button onClick={handleCreate} disabled={!projectName.trim()}>Create Project ({preview.totalTasks} tasks)</Button>
            </div>
          </div>
        )}

        {result && (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center"><CheckCircle2 className="h-8 w-8 text-emerald-600" /></div>
            <h3 className="text-lg font-bold">Project Created!</h3>
            <p className="text-sm text-muted-foreground"><strong>{result.name}</strong> with {result.tasksCreated} tasks</p>
            <Button onClick={() => { handleClose(); router.push(`/dashboard/projects/${result.id}`); }}>Open Project</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
