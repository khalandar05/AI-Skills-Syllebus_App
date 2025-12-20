"use client";

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial, Stars } from '@react-three/drei';
import * as random from 'maath/random/dist/maath-random.esm';

function StarField(props) {
  const ref = useRef();
  const sphere = useMemo(() => random.inSphere(new Float32Array(5001), { radius: 1.5 }), []);

  useFrame((state, delta) => {
    ref.current.rotation.x -= delta / 10;
    ref.current.rotation.y -= delta / 15;
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
      <Canvas camera={{ position: [0, 0, 2.5] }}>
        <fog attach="fog" args={['#02030A', 0, 3]} />
        <StarField />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <ambientLight intensity={0.5} />
      </Canvas>
      {/* Overlay to ensure text readability */}
      <div className="absolute inset-0 bg-gradient-to-tr from-space-black/80 via-transparent to-space-black/40 pointer-events-none" />
    </div>
  );
}
