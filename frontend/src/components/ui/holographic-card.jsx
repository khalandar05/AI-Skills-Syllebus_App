"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function HolographicCard({ children, className, ...props }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, rotateX: 2, rotateY: 2 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/10 bg-cosmic-indigo/30 backdrop-blur-xl transition-colors hover:border-plasma-cyan/50 hover:bg-cosmic-indigo/40",
        "shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]",
        className
      )}
      {...props}
    >
        {/* Glow Effect on Top */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 transition-opacity hover:opacity-100 pointer-events-none" />
        
        {/* Neon Border Glow */}
        <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-transparent via-plasma-cyan/20 to-transparent opacity-0 blur-sm transition-opacity hover:opacity-100" />
        
        <div className="relative z-10 h-full">
            {children}
        </div>
    </motion.div>
  );
}
