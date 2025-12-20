"use client";

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial, Stars } from '@react-three/drei';
import * as random from 'maath/random/dist/maath-random.esm';

function StarField(props) {
  const ref = useRef();
  // Adjusted count to 2400 (multiple of 3) for 800 stars - prevents NaN errors
  const sphere = useMemo(() => random.inSphere(new Float32Array(2400), { radius: 1.5 }), []);

  useFrame((state, delta) => {
    // Slower rotation for stability
    ref.current.rotation.x -= delta / 30;
    ref.current.rotation.y -= delta / 40;
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled={false} {...props}>
        <PointMaterial
          transparent
          color="#f272c8"
          size={0.002}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.8}
        />
      </Points>
    </group>
  );
}

function Fog() {
    return <fog attach="fog" args={['#02030A', 5, 20]} /> 
}

export default function SpaceBackground() {
  return (
    <div className="fixed inset-0 -z-50 bg-space-black">
      <Canvas camera={{ position: [0, 0, 2.5] }} dpr={[1, 1.5]} gl={{ antialias: false, powerPreference: "high-performance" }}>
        <fog attach="fog" args={['#02030A', 0, 3]} />
        <StarField />
        <Stars radius={100} depth={50} count={1000} factor={3} saturation={0} fade speed={0.5} />
        <ambientLight intensity={0.2} />
      </Canvas>
      {/* Reduced visual noise overlay - center is transparent for clarity */}
      <div className="absolute inset-0 bg-gradient-to-b from-space-black/80 via-transparent to-space-black/80 pointer-events-none" />
    </div>
  );
}
