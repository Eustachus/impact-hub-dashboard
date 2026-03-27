"use client";

import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Search, Plus, Sun, Moon, Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";
import { CreateTaskModal } from "@/components/CreateTaskModal";
import Link from "next/link";

export function Topbar() {
  const { setTheme, theme } = useTheme();
  const { data: session } = useSession();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-card/70 backdrop-blur-xl px-6 lg:h-[60px] sticky top-0 z-50">
      <div className="w-full flex-1">
        <form>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search tasks, projects, people... (Cmd+K)"
              className="w-full appearance-none bg-muted/50 pl-8 shadow-none border border-white/5 rounded-md h-9 text-sm outline-none focus:ring-1 focus:ring-primary md:w-2/3 lg:w-1/3 transition-all focus:bg-muted/80"
            />
          </div>
        </form>
      </div>

      <Button variant="outline" size="icon" className="h-9 w-9 rounded-full relative">
        <Bell className="h-4 w-4" />
        <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-destructive" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 rounded-full"
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      >
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </Button>
      
      <Button size="sm" className="hidden md:flex gap-1 h-9" onClick={() => setIsCreateModalOpen(true)}>
        <Plus className="h-4 w-4" /> Create
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
            <Avatar className="h-9 w-9">
              {session?.user?.image && (
                <AvatarImage src={session.user.image} alt={session.user.name || "User"} />
              )}
              <AvatarFallback className="bg-primary/10 text-primary">
                {session?.user?.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{session?.user?.name}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {session?.user?.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <Link href="/dashboard/settings">
            <DropdownMenuItem>Profile</DropdownMenuItem>
          </Link>
          <Link href="/dashboard/settings">
            <DropdownMenuItem>Settings</DropdownMenuItem>
          </Link>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/' })}>
            Log out
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

