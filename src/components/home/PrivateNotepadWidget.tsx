"use client";

import { useState, useEffect } from "react";
import { StickyNote, Save } from "lucide-react";

export function PrivateNotepadWidget() {
  const [note, setNote] = useState("");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("focus_home_note");
    if (saved) setNote(saved);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setNote(val);
    localStorage.setItem("focus_home_note", val);
    setLastSaved(new Date());
  };

  return (
    <div className="relative group/note">
      <textarea 
        value={note}
        onChange={handleChange}
        placeholder="Capture a quick reminder or a late-night thought..."
        className="w-full min-h-[160px] bg-transparent border-none focus:ring-0 resize-none text-sm font-medium leading-relaxed placeholder:italic placeholder:opacity-30 scrollbar-hide"
      />
      <div className="absolute bottom-0 right-0 p-2 flex items-center gap-1.5 opacity-0 group-hover/note:opacity-40 transition-opacity pointer-events-none">
        <Save className="h-3 w-3" />
        <span className="text-[9px] font-mono">
          {lastSaved ? `Auto-saved at ${lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : "Draft mode"}
        </span>
      </div>
      
      {/* Decorative Corner */}
      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary/5 rounded-tl-full pointer-events-none" />
    </div>
  );
}
