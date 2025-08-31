import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useXR } from '@react-three/xr';
import { SkeletonUtils } from 'three-stdlib';
import * as THREE from 'three';

const XR_JOINTS = [
  'wrist',
  'thumb-metacarpal', 'thumb-phalanx-proximal', 'thumb-phalanx-distal', 'thumb-tip',
  'index-finger-metacarpal', 'index-finger-phalanx-proximal', 'index-finger-phalanx-intermediate', 'index-finger-phalanx-distal', 'index-finger-tip',
  'middle-finger-metacarpal', 'middle-finger-phalanx-proximal', 'middle-finger-phalanx-intermediate', 'middle-finger-phalanx-distal', 'middle-finger-tip',
  'ring-finger-metacarpal', 'ring-finger-phalanx-proximal', 'ring-finger-phalanx-intermediate', 'ring-finger-phalanx-distal', 'ring-finger-tip',
  'pinky-finger-metacarpal', 'pinky-finger-phalanx-proximal', 'pinky-finger-phalanx-intermediate', 'pinky-finger-phalanx-distal', 'pinky-finger-tip'
];

const XR_TO_BONE_MAP = {
  'thumb-phalanx-distal': 'Bone004',
  'index-finger-phalanx-proximal': 'Bone009',
  'middle-finger-phalanx-proximal': 'Bone013',
  'ring-finger-phalanx-proximal': 'Bone017',
  'pinky-finger-phalanx-proximal': 'Bone021',
};

export function TrackedHandModel({ handedness = 'right' }) {
  const { scene } = useGLTF('/hand.glb');
  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);

  const groupRef = useRef(null); // tracks wrist
  const modelRef = useRef(null); // holds model
  const jointRefs = useRef([]); // debug spheres
  const [mesh, setMesh] = useState(null);
  const [arm, setArm] = useState(null);
  const [skeleton, setSkeleton] = useState(null);
  const { session } = useXR();

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

  useFrame(({ gl }) => {
    const frame = gl.xr.getFrame();
    const refSpace = gl.xr.getReferenceSpace();
    if (!frame || !refSpace || !skeleton || !groupRef.current || !session) return;

    for (const inputSource of session.inputSources) {
      if (inputSource.hand && inputSource.handedness === handedness) {
        const flipQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.PI, 0));

        const wrist = inputSource.hand.get('wrist');
        const wristPose = frame.getJointPose(wrist, refSpace);
        if (wristPose) {
          groupRef.current.position.set(
            wristPose.transform.position.x,
            wristPose.transform.position.y,
            wristPose.transform.position.z
          );
          groupRef.current.quaternion.set(
            wristPose.transform.orientation.x,
            wristPose.transform.orientation.y,
            wristPose.transform.orientation.z,
            wristPose.transform.orientation.w
          );
        }

        for (const [jointName, boneName] of Object.entries(XR_TO_BONE_MAP)) {
          const joint = inputSource.hand.get(jointName);
          const pose = frame.getJointPose(joint, refSpace);
          const bone = skeleton.bones.find((b) => b.name === boneName);
          if (pose && bone) {
            const quat = new THREE.Quaternion(
              pose.transform.orientation.x,
              pose.transform.orientation.y,
              pose.transform.orientation.z,
              pose.transform.orientation.w
            );
            bone.quaternion.copy(quat).multiply(flipQuat);
          }
        }

        // Debug spheres
        XR_JOINTS.forEach((jointName, i) => {
          const joint = inputSource.hand.get(jointName);
          const pose = frame.getJointPose(joint, refSpace);
          if (pose && jointRefs.current[i]) {
            jointRefs.current[i].visible = true;
            jointRefs.current[i].position.set(
              pose.transform.position.x,
              pose.transform.position.y,
              pose.transform.position.z
            );
          } else if (jointRefs.current[i]) {
            jointRefs.current[i].visible = false;
          }
        });
      }
    }
  });

  if (!mesh || !skeleton || !arm) return null;

  return (
    <>
      {/* Wrist tracker group */}
      <group ref={groupRef}>
        {/* Apply model offset + mirror + scale */}
        <group
          ref={modelRef}
          position={[0, -0.1, 0]} // 💡 tweak this to visually align with cyan joints
          rotation={[Math.PI / 2, 0, Math.PI]}
          scale={[0.05, 0.05, 0.05]}
        >
          <primitive object={arm} />
          <skinnedMesh geometry={mesh.geometry} material={mesh.material} skeleton={skeleton} />
        </group>

        {/* 🔴 Wrist debug box */}
        <mesh>
          <boxGeometry args={[0.01, 0.01, 0.01]} />
          <meshStandardMaterial color="red" />
        </mesh>
      </group>

      {/* 🔵 Joint debug spheres */}
      {XR_JOINTS.map((_, i) => (
        <mesh key={i} ref={(el) => (jointRefs.current[i] = el)}>
          <sphereGeometry args={[0.006, 12, 12]} />
          <meshStandardMaterial color="cyan" transparent opacity={0.6} />
        </mesh>
      ))}
    </>
  );
}

useGLTF.preload('/hand.glb');
