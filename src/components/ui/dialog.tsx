import * as React from "react"
import { cn } from "@/lib/utils"

export const Dialog = ({ open, children }: { open?: boolean, onOpenChange?: (open: boolean) => void, children: React.ReactNode }) => {
  if (open === undefined) return <>{children}</>
  return open ? <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">{children}</div> : null
}

export const DialogTrigger = ({ children, onClick }: { children: React.ReactNode, onClick?: () => void }) => (
  <div className="inline-block" onClick={onClick}>{children}</div>
)

export const DialogContent = ({ className, children, onClose }: { className?: string, children: React.ReactNode, onClose?: () => void }) => {
  return (
    <div className={cn("relative bg-card rounded-lg shadow-lg border p-6 w-full max-w-lg", className)}>
      <button onClick={onClose} className="absolute top-4 right-4 opacity-70 hover:opacity-100">✕</button>
      {children}
    </div>
  )
}

export const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left mb-4", className)} {...props} />
)

export const DialogTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props} />
)

export const DialogDescription = ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn("text-sm text-muted-foreground", className)} {...props} />
)

export const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-4", className)} {...props} />
)
