import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

export function MirroredHand({ originalRef }) {
  const { scene } = useGLTF('/hand.glb');
  const mirrorRef = useRef<THREE.Object3D>(null);

  useFrame(() => {
    if (!originalRef.current || !mirrorRef.current) return;

    const pos = originalRef.current.position.clone();
    pos.x *= -1;

    const quat = originalRef.current.quaternion.clone();
    const flip = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.PI, 0));
    quat.multiply(flip);

    mirrorRef.current.position.copy(pos);
    mirrorRef.current.quaternion.copy(quat);
  });

  return (
    <primitive
      ref={mirrorRef}
      object={scene.clone()}
      scale={[-0.05, 0.05, 0.05]}
      rotation={[Math.PI / 2, 0, Math.PI]}
    />
  );
}

useGLTF.preload('/hand.glb');
