import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, ContactShadows, Sphere, RoundedBox, Icosahedron } from '@react-three/drei';
import * as THREE from 'three';

function FloatingCard() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      // Gentle rotation tied to mouse position for parallax effect
      const targetX = (state.pointer.x * Math.PI) / 6;
      const targetY = (state.pointer.y * Math.PI) / 6;
      
      meshRef.current.rotation.x += 0.05 * (targetY - meshRef.current.rotation.x);
      meshRef.current.rotation.y += 0.05 * (targetX - meshRef.current.rotation.y);
    }
  });

  return (
    <Float floatIntensity={2} rotationIntensity={1} speed={2}>
      {/* 3D representation of a Premium Credit Card */}
      <RoundedBox ref={meshRef} args={[3.4, 2.1, 0.15]} radius={0.05} smoothness={4}>
        <meshPhysicalMaterial 
          color="#1e1e2f" 
          roughness={0.2} 
          metalness={0.8}
          clearcoat={1}
          clearcoatRoughness={0.1}
          transmission={0.2}
          ior={1.5}
        />
      </RoundedBox>
    </Float>
  );
}

function AbstractShapes() {
  return (
    <>
      <Float floatIntensity={3} speed={1.5} rotationIntensity={2} position={[-2, 1.2, -1]}>
        <Icosahedron args={[0.5, 0]}>
          <meshPhysicalMaterial color="#06b6d4" roughness={0} metalness={0.5} wireframe />
        </Icosahedron>
      </Float>
      
      <Float floatIntensity={2} speed={3} rotationIntensity={1.5} position={[2, -1.2, 1]}>
        <Sphere args={[0.4, 32, 32]}>
          <meshPhysicalMaterial 
            color="#10b981" 
            roughness={0.1} 
            metalness={1} 
            clearcoat={1} 
            clearcoatRoughness={0.1}
          />
        </Sphere>
      </Float>
      
      <Float floatIntensity={1.5} speed={2} rotationIntensity={3} position={[1.8, 1.5, -0.5]}>
        <RoundedBox args={[0.6, 0.6, 0.6]} radius={0.1}>
          <meshPhysicalMaterial 
            color="#f43f5e" 
            roughness={0.4} 
            metalness={0.2} 
            transmission={0.9} 
            ior={1.2}
          />
        </RoundedBox>
      </Float>
    </>
  );
}

export default function Hero3DVisual() {
  return (
    <div className="relative w-full h-[600px] flex items-center justify-center cursor-crosshair select-none">
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }} dpr={[1, 2]}>
        {/* Soft lighting */}
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b5cf6" />
        
        {/* 3D Elements */}
        <FloatingCard />
        <AbstractShapes />
        
        {/* Studio-like reflections */}
        <Environment preset="city" />
        
        {/* Soft floor shadow */}
        <ContactShadows position={[0, -2.5, 0]} opacity={0.4} scale={10} blur={2} far={4} color="#000000" />
      </Canvas>
    </div>
  );
}