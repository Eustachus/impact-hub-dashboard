/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  FileIcon,
  ImageIcon,
  FileTextIcon,
  MoreVertical,
  Upload,
  Search,
  Download,
  Trash2
} from "lucide-react";
import { Input } from "@/components/ui/input";

export default function FilesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<any | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = useCallback(() => {
    fetch("/api/files")
      .then(res => res.json())
      .then(data => {
        setFiles(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        console.error(err);
        setFiles([]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // For upload we need a taskId - prompt user or use a default
    const taskId = prompt("Entrez l'ID de la tâche associée au fichier:");
    if (!taskId) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("taskId", taskId);

      const res = await fetch("/api/files/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Upload failed");
      }

      fetchFiles();
    } catch (err: any) {
      alert(`Erreur: ${err.message}`);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (fileId: string, fileName: string) => {
    if (!confirm(`Supprimer "${fileName}" ?`)) return;

    try {
      const res = await fetch(`/api/files/${fileId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Delete failed");
      }
      setFiles(files.filter(f => f.id !== fileId));
      setSelectedFile(null);
    } catch (err: any) {
      alert(`Erreur: ${err.message}`);
    }
  };

  const filteredFiles = files.filter((f: any) =>
    f.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.taskTitle?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-8 italic">Chargement des fichiers...</div>;

  const getFileIcon = (type: string) => {
    switch (type) {
      case "image": return <ImageIcon className="h-10 w-10 text-blue-500" />;
      case "pdf": return <FileTextIcon className="h-10 w-10 text-red-500" />;
      case "zip": return <FileIcon className="h-10 w-10 text-orange-500" />;
      default: return <FileIcon className="h-10 w-10 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Files & Assets</h1>
          <p className="text-muted-foreground">Manage all your project-related documents and media.</p>
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleUpload}
          />
          <Button className="gap-2" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
            <Upload className="h-4 w-4" /> {uploading ? "Upload en cours..." : "Upload File"}
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search files..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filteredFiles.length === 0 && (
        <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">
          <FileIcon className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Aucun fichier</p>
          <p className="text-sm mt-1">Uploadez votre premier fichier.</p>
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {filteredFiles.map((file: any) => (
          <Card key={file.id} className="group overflow-hidden border bg-card/50 hover:bg-card hover:shadow-md transition-all cursor-pointer" onClick={() => setSelectedFile(file)}>
            <CardContent className="p-0">
              <div className="h-32 bg-muted/30 flex items-center justify-center relative">
                {getFileIcon(file.type)}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                   <Button variant="secondary" size="icon" className="h-8 w-8 bg-background/80 backdrop-blur">
                      <MoreVertical className="h-4 w-4" />
                   </Button>
                </div>
              </div>
              <div className="p-4 space-y-2">
                <p className="font-semibold text-sm truncate" title={file.name}>{file.name}</p>
                <div className="flex justify-between items-center text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                   <span>{file.size}</span>
                   <span>{file.date}</span>
                </div>
                <div className="flex items-center justify-between pt-4">
                   <div className="flex items-center gap-1.5">
                      <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                         {file.user?.charAt(0)}
                      </div>
                      <span className="text-xs text-muted-foreground">{file.user}</span>
                   </div>
                   <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        onClick={(e) => { e.stopPropagation(); window.open(file.url, '_blank'); }}
                      >
                         <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={(e) => { e.stopPropagation(); handleDelete(file.id, file.name); }}
                      >
                         <Trash2 className="h-4 w-4" />
                      </Button>
                   </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedFile} onOpenChange={(open) => !open && setSelectedFile(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{selectedFile?.name}</DialogTitle>
            <DialogDescription>Aperçu du document</DialogDescription>
          </DialogHeader>
          <div className="flex-1 bg-muted/20 rounded-md overflow-hidden relative">
            {(selectedFile?.type === 'pdf' || selectedFile?.name?.endsWith('.pdf')) ? (
              <iframe src={selectedFile?.url} className="w-full h-full border-0" />
            ) : selectedFile?.type === 'image' ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={selectedFile?.url} alt={selectedFile?.name} className="w-full h-full object-contain" />
            ) : (
              <div className="flex items-center justify-center h-full flex-col gap-4 text-muted-foreground">
                {getFileIcon(selectedFile?.type || '')}
                <p>Aperçu non disponible pour ce type de fichier.</p>
                <Button variant="outline" onClick={() => window.open(selectedFile?.url, '_blank')}>
                  Télécharger
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
