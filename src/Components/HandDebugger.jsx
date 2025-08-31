import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useXR } from '@react-three/xr';
import * as THREE from 'three';

export function HandDebugger({ handedness }) {
  const { session } = useXR();
  const jointRefs = useRef([]);

  useFrame(({ gl }) => {
    const frame = gl.xr.getFrame();
    const refSpace = gl.xr.getReferenceSpace();
    if (!session || !frame || !refSpace) return;

    for (const source of session.inputSources) {
      if (source.hand && source.handedness === handedness) {
        let i = 0;
        for (const key of source.hand.keys()) {
          const joint = source.hand.get(key);
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
          i++;
        }
      }
    }
  });

  return (
    <>
      {Array.from({ length: 25 }).map((_, i) => (
        <mesh ref={(el) => (jointRefs.current[i] = el)} key={i}>
          <sphereGeometry args={[0.008, 16, 16]} />
          <meshStandardMaterial color="cyan" />
        </mesh>
      ))}
    </>
  );
}
