import { useFrame } from '@react-three/fiber';
import { useXR } from '@react-three/xr';
import * as THREE from 'three';
import { useRef } from 'react';

export function XRHandTracker({ handedness = 'right', onUpdate }) {
  const session = useXR((xr) => xr.session);
  const wristRef = useRef(new THREE.Object3D());

  useFrame((state) => {
    if (!session) return;
    const frame = state.gl.xr.getFrame();
    const refSpace = state.gl.xr.getReferenceSpace();

    for (const source of session.inputSources) {
      if (source.hand && source.handedness === handedness) {
        const joint = source.hand.get('wrist');
        if (!joint) continue;
        const pose = frame.getJointPose(joint, refSpace);
        if (!pose) continue;

        wristRef.current.position.set(
          pose.transform.position.x,
          pose.transform.position.y,
          pose.transform.position.z
        );
        wristRef.current.quaternion.set(
          pose.transform.orientation.x,
          pose.transform.orientation.y,
          pose.transform.orientation.z,
          pose.transform.orientation.w
        );
        onUpdate(wristRef.current);
      }
    }
  });

  return null;
}
