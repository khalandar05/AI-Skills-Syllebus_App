"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, useState, useEffect } from "react";
import { View, Preload, PerformanceMonitor, AdaptiveDpr, AdaptiveEvents, Environment } from "@react-three/drei";
import { Loader } from "lucide-react";

/**
 * Optimized 3D Canvas
 * Includes:
 * - Adaptive DPR (Device Pixel Ratio)
 * - Performance Monitoring (downgrades quality if FPS drops)
 * - Suspense Fallback
 * - Proper Tone Mapping
 */
export default function SceneCanvas({ children, className, ...props }) {
  const [dpr, setDpr] = useState(1.5); // Default to slightly higher quality
  
  // Lower quality on low-power mode or if performance drops
  const handleIncline = () => setDpr(2);
  const handleDecline = () => setDpr(1);

  return (
    <div className={`relative w-full h-full ${className}`}>
      <Canvas
        dpr={dpr}
        gl={{ 
          antialias: true, 
          powerPreference: "high-performance",
          alpha: true, // Allow transparency for HTML backgrounds if needed
          stencil: false,
          depth: true
        }}
        camera={{ position: [0, 0, 10], fov: 45 }}
        {...props}
      >
        <PerformanceMonitor 
          onIncline={handleIncline} 
          onDecline={handleDecline} 
          flipflops={3}
          onFallback={() => setDpr(0.5)}
        />
        
        <AdaptiveDpr pixelated />
        <AdaptiveEvents />

        <Suspense fallback={null}>
          <View.Port />
          {/* Global Lighting for all Views */}
          <ambientLight intensity={0.8} />
          <pointLight position={[10, 10, 10]} intensity={1.5} color="#8b5cf6" />
          <Environment preset="city" blur={1} />
          {children}
          <Preload all />
        </Suspense>
      </Canvas>
      
      {/* Optional: Add a custom HTML loader here if Suspense triggers */}
    </div>
  );
}
