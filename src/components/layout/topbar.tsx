"use client";

import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Search, Plus, Sun, Moon, LogOut, User as UserIcon, Settings } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useEffect, useCallback, useRef } from "react";
import { CreateTaskModal } from "@/components/CreateTaskModal";
import { NotificationDropdown } from "@/components/NotificationDropdown";
import { useSocket } from "@/hooks/useSocket";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function Topbar() {
  const { setTheme, theme } = useTheme();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;
  const { socket } = useSocket();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }, [supabase, router]);

  const openCommandPalette = useCallback(() => {
    document.dispatchEvent(new Event("open-command-palette"));
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "light" ? "dark" : "light");
  }, [setTheme, theme]);

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-card/70 backdrop-blur-xl px-6 lg:h-[60px] sticky top-0 z-50">
      <div className="w-full flex-1">
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Rechercher... (Cmd+K)"
              className="w-full appearance-none bg-muted/50 pl-8 shadow-none border border-white/5 rounded-md h-9 text-sm outline-none focus:ring-1 focus:ring-primary md:w-2/3 lg:w-1/3 transition-all focus:bg-muted/80 cursor-pointer"
              readOnly
              onClick={openCommandPalette}
            />
          </div>
        </form>
      </div>

      <NotificationDropdown socket={socket} />

      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 rounded-full"
        onClick={toggleTheme}
      >
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </Button>
      
      <Button size="sm" className="hidden md:flex gap-1 h-9" onClick={() => setIsCreateModalOpen(true)}>
        <Plus className="h-4 w-4" /> Nouveau
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger>
          <div className="relative h-9 w-9 rounded-full p-0 overflow-hidden ring-offset-background transition-all hover:ring-2 hover:ring-primary/20 cursor-pointer">
            <Avatar className="h-9 w-9">
              {user?.user_metadata?.avatar_url && (
                <AvatarImage src={user.user_metadata.avatar_url} alt={user?.user_metadata?.full_name || "User"} />
              )}
              <AvatarFallback className="bg-primary/10 text-primary font-bold">
                {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64 mt-2" align="end">
          <DropdownMenuLabel className="font-normal p-2">
            <div className="flex flex-col space-y-2">
              <p className="text-sm font-semibold leading-none">{user?.user_metadata?.full_name || "Utilisateur"}</p>
              <p className="text-xs leading-none text-muted-foreground truncate">
                {user?.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <Link href="/dashboard/settings">
            <DropdownMenuItem className="cursor-pointer gap-2">
              <UserIcon className="h-4 w-4" />
              Profil
            </DropdownMenuItem>
          </Link>
          <Link href="/dashboard/settings">
            <DropdownMenuItem className="cursor-pointer gap-2">
              <Settings className="h-4 w-4" />
              Paramètres
            </DropdownMenuItem>
          </Link>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            className="cursor-pointer text-destructive focus:text-destructive gap-2 font-medium" 
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" />
            Se déconnecter
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CreateTaskModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />
    </header>
  );
}
