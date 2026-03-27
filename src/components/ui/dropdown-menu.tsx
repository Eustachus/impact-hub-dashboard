import * as React from "react"
import { cn } from "@/lib/utils"

const DropdownMenuContext = React.createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
} | null>(null);

export const DropdownMenu = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);


  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      <div ref={containerRef} className="relative inline-block text-left">{children}</div>
    </DropdownMenuContext.Provider>
  );
};

export const DropdownMenuTrigger = ({ children }: { children: React.ReactNode }) => {
  const context = React.useContext(DropdownMenuContext);
  if (!context) return null;
  
  return (
    <div 
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        context.setOpen(!context.open);
      }} 
      className="cursor-pointer"
    >
      {children}
    </div>
  );
};


export const DropdownMenuContent = ({ className, children, align, forceMount, ...props }: React.HTMLAttributes<HTMLDivElement> & { align?: string, forceMount?: boolean }) => {
  const context = React.useContext(DropdownMenuContext);
  if (!context || (!context.open && !forceMount)) return null;

  return (
    <div className={cn("absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-md bg-card border shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none p-1 animate-in fade-in zoom-in-95", className)} {...props}>
      {children}
    </div>
  );
};

export const DropdownMenuItem = ({ className, children, onClick, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  const context = React.useContext(DropdownMenuContext);
  
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    onClick?.(e);
    context?.setOpen(false);
  };

  return (
    <div 
      onClick={handleClick}
      className={cn("relative flex cursor-pointer select-none items-center rounded-sm px-3 py-2 text-sm outline-none hover:bg-muted hover:text-accent-foreground transition-colors", className)} 
      {...props}
    >
      {children}
    </div>
  );
};

export const DropdownMenuLabel = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("px-3 py-2 text-sm font-semibold text-muted-foreground", className)} {...props}>{children}</div>
)

export const DropdownMenuSeparator = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("-mx-1 my-1 h-px bg-muted", className)} {...props} />
)

