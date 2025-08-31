import React, { useRef, useEffect, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useXRInputSourceStateContext } from '@react-three/xr';
import * as THREE from 'three';
import { MirroredHand } from './MirroredHand';

export function CustomHand({ handedness }) {
  const state = useXRInputSourceStateContext(handedness);
  const { scene } = useGLTF('/hand.glb');
  const handRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (scene) {
      scene.traverse((obj) => {
        obj.frustumCulled = false;
        obj.castShadow = true;
      });
      setReady(true);
    }
  }, [scene]);

  useFrame(({ gl }) => {
    const frame = gl.xr.getFrame();
    const refSpace = gl.xr.getReferenceSpace();

    if (!ready || !state?.inputSource?.hand || !handRef.current || !frame || !refSpace) return;

    const wrist = state.inputSource.hand.get('wrist');
    const pose = frame.getJointPose(wrist, refSpace);
    if (pose) {
      handRef.current.position.set(
        pose.transform.position.x,
        pose.transform.position.y,
        pose.transform.position.z
      );
      handRef.current.quaternion.set(
        pose.transform.orientation.x,
        pose.transform.orientation.y,
        pose.transform.orientation.z,
        pose.transform.orientation.w
      );
    }
  });

  if (!ready) return null;

  return (
    <>
      <primitive
        ref={handRef}
        object={scene}
        scale={[0.05, 0.05, 0.05]}
        rotation={[Math.PI / 2, 0, Math.PI]}
      />
      <MirroredHand originalRef={handRef} />
    </>
  );
}

useGLTF.preload('/hand.glb');
