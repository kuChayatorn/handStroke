import React, { useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useXR } from '@react-three/xr';
import * as THREE from 'three';
import { Text } from '@react-three/drei';

function XRSpacePosition() {
    const session = useXR((xr) => xr.session);
    const [isDisplay, setIsDisplay] = useState(false);
    const [jointPose1, setJointPose1] = useState(0);
    let xrFrame = null;
    let referenceSpace = null;
    useFrame((state) => {
        if (session) {
            xrFrame = state.gl.xr.getFrame();
            referenceSpace = state.gl.xr.getReferenceSpace();
            // console.log(session.inputSources.length)
            // console.log(xrFrame)
            // console.log(referenceSpace)
            if (xrFrame && referenceSpace) {
                session.inputSources.forEach((inputSource) => {
                    // For controllers with gripSpace
                    // if (inputSource.gripSpace) {
                    //     const pose = xrFrame.getPose(inputSource.gripSpace, referenceSpace);
                    //     if (pose) {
                    //         const { position, orientation } = pose.transform;
                    //         console.log(`Controller position: (${position.x}, ${position.y}, ${position.z})`);
                    //     }
                    // }

                    // For hand tracking
                    // if (inputSource.hand) {
                    //     inputSource.hand.values().forEach((inputJoint, i) => {
                    //         const jointPose = xrFrame.getJointPose(inputJoint, referenceSpace);
                    //         if (i == 1 && jointPose1 !== undefined) {
                    //             if (!isDisplay) {
                    //                 setIsDisplay(true);
                    //             };
                    //             setJointPose1(inputJoint)
                    //         }
                    //         if (jointPose) {
                    //             const { position } = jointPose.transform;
                    //             console.log(`Hand joint position: (${position.x}, ${position.y}, ${position.z})`);
                    //         }
                    //     });
                    // }
                    if (inputSource.hand) {
                        const jointPose1 = xrFrame.getJointPose(inputSource.hand.get(1), referenceSpace);
                        if (jointPose1) {
                            const { position } = jointPose1.transform;
                            console.log(`Hand joint position: (${position.x}, ${position.y}, ${position.z})`);
                            if (!isDisplay) { (setIsDisplay(true)) }
                            setJointPose1(position.x)
                        }
                    }
                });
            }
        }
    });

    return (<>
        <Text position={[0, 0, 0]} fontSize={0.2}>
            {(isDisplay) ? jointPose1 : 'nono'}
        </Text>
    </>
    );
}

export default XRSpacePosition;
