import React, { useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useXR } from '@react-three/xr';
import * as THREE from 'three';
import { Text } from '@react-three/drei';

function XRSpacePosition() {
    const session = useXR((xr) => xr.session);
    const [jointPositions, setJointPositions] = useState([]);

    useFrame((state) => {
        if (session) {
            const xrFrame = state.gl.xr.getFrame();
            const referenceSpace = state.gl.xr.getReferenceSpace();

            if (xrFrame && referenceSpace) {
                const positions = [];
                session.inputSources.forEach((inputSource) => {
                    if (inputSource.hand) {
                        inputSource.hand.forEach((inputJoint, index) => {
                            const jointPose = xrFrame.getJointPose(inputJoint, referenceSpace);
                            if (jointPose) {
                                const { position } = jointPose.transform;
                                positions.push(new THREE.Vector3(-position.x, position.y, position.z));
                            }
                        });
                        setJointPositions(positions);
                    }
                });
            }
        }
    });

    return (
        <>
            <group position={[0, 0, 10]}>
                {jointPositions.map((pos, index) => (
                    <mesh key={index} position={pos}>
                        <sphereGeometry args={[0.01, 32, 32]} />
                        <meshBasicMaterial color="red" />
                    </mesh>
                ))}
            </group>

            {jointPositions.map((pos, index) => (
                <Text key={index} position={[2, 0.5 + index * 0.1, 0.5]} fontSize={0.1}>
                    Joint {index}: X({pos.x.toFixed(2)}), Y({pos.y.toFixed(2)}), Z({pos.z.toFixed(2)})
                </Text>
            ))}
            <Text position={[-2, 1, -0.5]} fontSize={0.2}>
                {jointPositions.length > 0 ? `Tracking ${jointPositions.length} joints` : 'No hand detected'}
            </Text>

        </>
    );
}

export default XRSpacePosition;
