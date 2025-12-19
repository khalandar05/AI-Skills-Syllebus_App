"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button as BaseButton } from "@/components/ui/button";

export const NeonButton = React.forwardRef(({ className, variant="primary", children, ...props }, ref) => {
  
  const variants = {
    primary: "bg-primary text-white shadow-[0_0_15px_rgba(109,40,217,0.5)] hover:shadow-[0_0_25px_rgba(109,40,217,0.8)] border-transparent hover:bg-primary/90",
    cyan: "bg-plasma-cyan/10 text-plasma-cyan border border-plasma-cyan/50 shadow-[0_0_10px_rgba(34,211,238,0.2)] hover:bg-plasma-cyan/20 hover:shadow-[0_0_20px_rgba(34,211,238,0.4)]",
    ghost: "bg-transparent text-white hover:bg-white/10 hover:text-plasma-cyan",
  };

  return (
    <motion.div
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.05 }}
        className="inline-block"
    >
        <BaseButton
            ref={ref}
            className={cn(
                "relative overflow-hidden transition-all duration-300 font-heading tracking-wide uppercase font-bold",
                variants[variant] || variants.primary,
                className
            )}
            {...props}
        >
            {children}
            {/* Shimmer Effect */}
            <div className="absolute inset-0 -translate-x-[100%] animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </BaseButton>
    </motion.div>
  );
});

NeonButton.displayName = "NeonButton";
