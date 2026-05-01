"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Button as BaseButton } from "@/components/ui/button";

export const NeonButton = React.forwardRef(({ className, variant="primary", children, glowColor, ...props }, ref) => {
  
  // Map old neon variants to standard variants
  const variantMap = {
    primary: "default",
    cyan: "secondary",
    ghost: "ghost",
  };

  const actualVariant = variantMap[variant] || "default";

  return (
    <BaseButton
        ref={ref}
        variant={actualVariant}
        className={className}
        {...props}
    >
        {children}
    </BaseButton>
  );
});

NeonButton.displayName = "NeonButton";
