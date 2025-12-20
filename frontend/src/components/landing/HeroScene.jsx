"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Stars, Float, Sparkles, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";

function RotatingStars() {
  const ref = useRef();
  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta / 10;
      ref.current.rotation.y -= delta / 15;
    }
  });
  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Stars 
        ref={ref} 
        radius={100} 
        depth={50} 
        count={5000} 
        factor={4} 
        saturation={0} 
        fade 
        speed={1} 
      />
    </group>
  );
}

function CinematicLighting() {
  return (
    <>
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color="#4c1d95" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#0f172a" />
      <spotLight 
        position={[0, 15, 0]} 
        angle={0.3} 
        penumbra={1} 
        intensity={2} 
        castShadow 
      />
    </>
  );
}

export default function HeroScene() {
  const mouse = useRef([0, 0]);

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 20]} />
      <color attach="background" args={["#030712"]} /> { /* Very dark gray/black background matching Tailwind gray-950 */ }
      
      <CinematicLighting />
      
      {/* Background Ambience */}
      <RotatingStars />
      
      {/* Floating Particles for Depth */}
      <Float speed={1} rotationIntensity={0.5} floatIntensity={0.5}>
        <Sparkles 
          count={200} 
          scale={12} 
          size={2} 
          speed={0.4} 
          opacity={0.5} 
          color="#8b5cf6" // Violet-500
        />
      </Float>

       <Float speed={1.5} rotationIntensity={1.5} floatIntensity={1}>
        <Sparkles 
          count={100} 
          scale={15} 
          size={3} 
          speed={0.3} 
          opacity={0.3} 
          color="#3b82f6" // Blue-500
        />
      </Float>
      
      <fog attach="fog" args={["#030712", 10, 50]} />
    </>
  );
}
