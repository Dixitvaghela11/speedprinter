import * as React from "react"
import { cn } from "@/lib/utils"

const Badge = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: "default" | "secondary" | "outline" | "success" | "warning" | "muted"
  }
>(({ className, variant = "default", ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
      variant === "default" && "border-transparent bg-primary text-primary-foreground",
      variant === "secondary" && "border-transparent bg-secondary text-secondary-foreground",
      variant === "outline" && "text-foreground",
      variant === "success" && "border-transparent bg-emerald-50 text-emerald-800",
      variant === "warning" && "border-transparent bg-amber-50 text-amber-800",
      variant === "muted" && "border-transparent bg-slate-100 text-slate-700",
      className,
    )}
    {...props}
  />
))
Badge.displayName = "Badge"

export { Badge }
