import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import { SkeletonUtils } from 'three-stdlib';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

export function Hand({ wristTransform }) {
  const { scene } = useGLTF('/hand.glb');
  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);

  const groupRef = useRef();
  const [mesh, setMesh] = useState(null);
  const [arm, setArm] = useState(null);
  const [skeleton, setSkeleton] = useState(null);

  useEffect(() => {
    let foundMesh = null;
    let foundArm = null;
    clone.traverse((obj) => {
      if (obj.name === 'leapmotion_basehand_mesh') foundMesh = obj;
      if (obj.name === 'Armature') foundArm = obj;
    });
    setMesh(foundMesh);
    setArm(foundArm);
    setSkeleton(foundMesh?.skeleton || null);
  }, [clone]);

  useFrame(() => {
    if (!wristTransform || !groupRef.current || !skeleton) return;

    groupRef.current.position.copy(wristTransform.position);
    groupRef.current.quaternion.copy(wristTransform.quaternion);

    // Optional: Apply mock finger animation
    const t = performance.now() / 1000;
    const mock = {
      thumb: { x: Math.sin(t * 1.5) * 30, y: 0, z: 0 },
      index: { x: Math.sin(t * 2.0) * 45, y: 0, z: 0 },
      middle: { x: Math.sin(t * 2.5) * 45, y: 0, z: 0 },
      ring: { x: Math.sin(t * 2.2) * 30, y: 0, z: 0 },
      pinky: { x: Math.sin(t * 2.8) * 25, y: 0, z: 0 },
    };

    const rotateBone = (name, x, y, z) => {
      const bone = skeleton?.bones.find((b) => b.name === name);
      if (bone) {
        bone.rotation.set(
          THREE.MathUtils.degToRad(x),
          THREE.MathUtils.degToRad(y),
          THREE.MathUtils.degToRad(z)
        );
      }
    };

    rotateBone('Bone004', mock.thumb.x, mock.thumb.y, mock.thumb.z);
    rotateBone('Bone009', mock.index.x, mock.index.y, mock.index.z);
    rotateBone('Bone013', mock.middle.x, mock.middle.y, mock.middle.z);
    rotateBone('Bone017', mock.ring.x, mock.ring.y, mock.ring.z);
    rotateBone('Bone021', mock.pinky.x, mock.pinky.y, mock.pinky.z);
  });

  if (!mesh || !skeleton || !arm || !wristTransform) return null;

  return (
    <group ref={groupRef} scale={[1.5, 1.5, 1.5]}>
      <primitive object={arm} />
      <skinnedMesh
        geometry={mesh.geometry}
        material={mesh.material}
        skeleton={skeleton}
      />
    </group>
  );
}

useGLTF.preload('/hand.glb');
