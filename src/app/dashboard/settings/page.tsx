/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { 
  User, 
  Bell, 
  Palette, 
  Shield, 
  Zap, 
  Layout, 
  Globe, 
  Save, 
  Check, 
  ArrowRight,
  Monitor,
  Moon,
  Sun
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

export default function SettingsPage() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    // Mock save delay
    setTimeout(() => {
      setIsSaving(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      {/* Header */}
      <div className="flex flex-col gap-2 relative group">
        <div className="absolute -left-12 top-0 h-full w-1 bg-primary/20 rounded-full group-hover:bg-primary transition-colors" />
        <Badge variant="outline" className="w-fit text-[10px] font-black uppercase tracking-[0.2em] border-primary/30 text-primary bg-primary/5 px-2 py-0.5">
          System Configuration
        </Badge>
        <h1 className="text-4xl font-black tracking-tighter">Réglages <span className="text-muted-foreground/30">/ Preference</span></h1>
        <p className="text-muted-foreground text-sm font-medium">Configure your workspace settings, notifications, and team preferences. Everything you need to keep your focus sharp and impact high.</p>
      </div>

      <div className="grid gap-8">
        {/* Profile Card */}
        <Card className="bg-card/40 backdrop-blur-xl border-white/5 shadow-2xl overflow-hidden group">
          <CardHeader className="border-b border-white/5 bg-muted/5">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                  <User className="h-5 w-5" />
               </div>
               <div>
                  <CardTitle className="text-lg font-black tracking-tight">Profil Utilisateur</CardTitle>
                  <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 leading-none mt-1">
                    Identity & Access
                  </CardDescription>
               </div>
            </div>
          </CardHeader>
          <CardContent className="pt-8 space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs font-black uppercase tracking-widest opacity-60">Nom complet</Label>
                <Input id="name" defaultValue={session?.user?.name || ""} className="bg-muted/10 border-white/5 focus:border-primary/40 transition-all font-bold" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-black uppercase tracking-widest opacity-60">Addresse Email</Label>
                <Input id="email" type="email" defaultValue={session?.user?.email || ""} className="bg-muted/10 border-white/5 focus:border-primary/40 transition-all font-bold" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appearance Card */}
        <Card className="bg-card/40 backdrop-blur-xl border-white/5 shadow-2xl overflow-hidden">
          <CardHeader className="border-b border-white/5 bg-muted/5">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 border border-orange-500/20">
                  <Palette className="h-5 w-5" />
               </div>
               <div>
                  <CardTitle className="text-lg font-black tracking-tight">Apparence</CardTitle>
                  <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 leading-none mt-1">
                    Visual Experience
                  </CardDescription>
               </div>
            </div>
          </CardHeader>
          <CardContent className="pt-8 space-y-8">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-black">Thème de l'interface</p>
                <p className="text-[10px] text-muted-foreground font-medium">Choisissez le mode qui vous convient le mieux.</p>
              </div>
              <div className="flex bg-muted/10 p-1 rounded-xl border border-white/5">
                 {[
                   { id: 'light', icon: Sun, label: 'Clair' },
                   { id: 'dark', icon: Moon, label: 'Sombre' },
                   { id: 'system', icon: Monitor, label: 'Système' }
                 ].map((t) => (
                   <button
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${theme === t.id ? 'bg-primary text-primary-foreground shadow-lg' : 'hover:bg-white/5 text-muted-foreground'}`}
                   >
                     <t.icon className="h-3 w-3" />
                     {t.label}
                   </button>
                 ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <div className="space-y-1">
                <p className="text-sm font-black">Réduction des animations</p>
                <p className="text-[10px] text-muted-foreground font-medium">Désactiver les transitions fluides pour plus de rapidité.</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        {/* Notifications Card */}
        <Card className="bg-card/40 backdrop-blur-xl border-white/5 shadow-2xl overflow-hidden">
          <CardHeader className="border-b border-white/5 bg-muted/5">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
                  <Bell className="h-5 w-5" />
               </div>
               <div>
                  <CardTitle className="text-lg font-black tracking-tight">Notifications</CardTitle>
                  <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 leading-none mt-1">
                    Alerts & Updates
                  </CardDescription>
               </div>
            </div>
          </CardHeader>
          <CardContent className="pt-8 space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-black">Emails de rappel</p>
                <p className="text-[10px] text-muted-foreground font-medium font-bold italic">Recevoir des digests quotidiens par mail.</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <div className="space-y-1">
                <p className="text-sm font-black">Alertes navigateur</p>
                <p className="text-[10px] text-muted-foreground font-medium">Notifications push en temps réel.</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Action Button */}
        <div className="flex justify-end pt-4">
           <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className={`min-w-[200px] h-12 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all shadow-xl ${success ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20' : 'shadow-primary/20 hover:scale-[1.02] active:scale-95'}`}
           >
             {isSaving ? (
               <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
             ) : success ? (
               <><Check className="mr-2 h-4 w-4" /> Sauvegardé</>
             ) : (
               <><Save className="mr-2 h-4 w-4" /> Enregistrer</>
             )}
           </Button>
        </div>
      </div>
    </div>
  );
}
