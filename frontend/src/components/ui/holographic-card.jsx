"use client";

import { cn } from "@/lib/utils";

export function HolographicCard({ children, className, ...props }) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card text-card-foreground shadow-sm transition-all",
        className
      )}
      {...props}
    >
      <div className="relative z-10 h-full">
          {children}
      </div>
    </div>
  );
}
