import * as React from "react"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 tracking-wide",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary/20 text-indigo-300 border border-primary/50 shadow-[0_0_10px_rgba(79,70,229,0.2)]",
        secondary:
          "border-transparent bg-secondary/50 text-slate-300 border border-border",
        destructive:
          "border-transparent bg-destructive/20 text-red-300 border border-destructive/50 shadow-[0_0_10px_rgba(239,68,68,0.2)]",
        outline: "text-foreground border-border",
        neon: "border-transparent bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-[0_0_10px_rgba(34,211,238,0.3)] animate-pulse-glow"
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  ...props
}) {
  return (<div className={cn(badgeVariants({ variant }), className)} {...props} />);
}

export { Badge, badgeVariants }
