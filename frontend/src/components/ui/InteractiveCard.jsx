"use client";

import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { MeshTransmissionMaterial, Text, Image, Html } from "@react-three/drei";
import { useSpring, a } from "@react-spring/three";

/**
 * Interactive 3D Card
 * Uses react-spring for physics-based tilt and hover effects.
 * Includes a glassmorphic material overlay.
 */
export default function InteractiveCard({ title, subtitle, image, onClick }) {
  const mesh = useRef();
  const [hovered, setHovered] = useState(false);

  // Spring physics for tilt
  const { scale, rotation } = useSpring({
    scale: hovered ? 1.1 : 1,
    rotation: hovered ? [0.1, 0.1, 0] : [0, 0, 0],
    config: { mass: 5, tension: 350, friction: 40 }
  });

  return (
    <a.group
      ref={mesh}
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      scale={scale}
      rotation={rotation}
    >
      {/* Glass Layer */}
      <mesh position={[0, 0, 0.1]}>
        <boxGeometry args={[3, 4, 0.2]} />
        <MeshTransmissionMaterial 
          backside 
          thickness={0.2} 
          roughness={0.1} 
          transmission={0.9} 
          ior={1.5} 
          chromaticAberration={0.06} 
          anisotropy={0.1}
          color="#8b5cf6"
        />
      </mesh>

      {/* Content: Image or Fallback Icon */}
      {image ? (
        <Image 
          url={image} 
          position={[0, 0.5, 0]} 
          scale={[2.5, 2, 1]} 
          opacity={0.8}
          alt=""
        />
      ) : (
        <mesh position={[0, 0.5, 0]}>
          <icosahedronGeometry args={[0.8, 0]} />
          <meshStandardMaterial color="#8b5cf6" wireframe />
        </mesh>
      )}

      {/* Text Content */}
      <Text
        position={[0, -0.8, 0.22]}
        fontSize={0.22}
        color="white"
        anchorX="center"
        anchorY="top"
        maxWidth={2.5}
        textAlign="center"
        lineHeight={1.2}
      >
        {title}
      </Text>
      
      <Text
        position={[0, -1.8, 0.22]}
        fontSize={0.12}
        color="#a78bfa" // Light violet
        anchorX="center"
        anchorY="top"
        maxWidth={2.5}
        textAlign="center"
      >
        {subtitle}
      </Text>
      
      {/* Glow Effect on Hover */}
      {hovered && (
        <pointLight position={[0, 0, 1]} intensity={2} distance={5} color="#8b5cf6" />
      )}
    </a.group>
  );
}
