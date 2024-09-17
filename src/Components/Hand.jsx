import { useCallback, useRef, useState } from 'react'
import { Text, useGLTF } from '@react-three/drei'
import { Suspense } from 'react'
import { useFrame } from '@react-three/fiber'
import { Quaternion, Vector3 } from 'three'
import { useXRHandState, XRHandModel, useXRInputSourceStateContext } from '@react-three/xr'

export function Hand() {
    const handState = useXRHandState()

    useFrame(() => {
        console.log(state)
    })
    return (
        <>
            <Suspense>
                <XRHandModel renderOrder={-1} colorWrite={false} />
            </Suspense>
            <group scale={0.045}>
                <Suspense>
                    <Paddle handedness={handState.inputSource.handedness} />
                </Suspense>
            </group>
        </>
    )
}


export function CustomHandModel({ hand }) {
    const [joints, setJoints] = React.useState([])
  
  
    React.useEffect(() => {
      const jointMeshes = []
      hand.joints.forEach((joint, jointName) => {
        const mesh = new THREE.Mesh(
          new THREE.SphereGeometry(0.005),
          new THREE.MeshBasicMaterial({ color: 0x00ff00 })
        )
        mesh.name = jointName
        jointMeshes.push(mesh)
      })
      setJoints(jointMeshes)
  
      return () => {
        // Clean up meshes when component unmounts
        jointMeshes.forEach((mesh) => mesh.geometry.dispose())
      }
    }, [hand])
  
    useFrame(() => {
      joints.forEach((mesh) => {
        const joint = hand.joints.get(mesh.name)
        if (joint) {
          joint.getWorldPosition(mesh.position)
          joint.getWorldQuaternion(mesh.quaternion)
        }
      })
    })
  
    return <primitive object={new THREE.Group().add(...joints)} />
}
export function CustomHand() {
    console.log("test")
    const state = useXRInputSourceStateContext('hand')
    console.log(state)
    setState(state);
    const middleFingerRef = useRef<Object3D>(null)
    const pointer = useTouchPointer(middleFingerRef, state)
    useFrame(() => {
      if (state) {
        console.log(state);
      }
    });
    return (
      <>
        <XRSpace ref={middleFingerRef} space={state?.inputSource?.hand.get('middle-finger-tip')} />
        <Suspense>
          <XRHandModel />
        </Suspense>
        <PointerCursorModel pointer={pointer} opacity={defaultTouchPointerOpacity} />
      </>
    )
  }
const vectorHelper = new Vector3()
const quaternionHelper = new Quaternion()

function Paddle({ handedness }) {
    const api = useRef()
    const ref = useRef()
    const model = useRef()
    const { nodes, materials } = useGLTF('pingpong.glb')
    useFrame(() => {
        ref.current.getWorldPosition(vectorHelper)
        api.current.setTranslation(vectorHelper)

        ref.current.getWorldQuaternion(quaternionHelper)
        api.current.setRotation(quaternionHelper)
    })
    return (
        <group
            position={[0, -1, -1.6]}
            rotation-z={handedness === 'left' ? 0.6 : -0.6}
            rotation-x={0}
            rotation-y={handedness === 'left' ? -0.7 : 0.7}
        >
            <mesh >
                <boxGeometry />
                <meshBasicMaterial color={red ? 'red' : 'blue'} />
            </mesh>
            <group ref={ref} position={[0.1, 0.3, -2.6]}>
                <Text
                    anchorX="center"
                    anchorY="middle"
                    rotation={[-Math.PI / 2, Math.PI, 0]}
                    position={[0, -0.2, 0]}
                    fontSize={10}
                    scale={0.15}
                />
            </group>
            <group ref={model} scale={0.15}>
                <group rotation={[0, -0.04, 0]} scale={141.94}>
                    <mesh castShadow receiveShadow material={materials.wood} geometry={nodes.mesh.geometry} />
                    <mesh castShadow receiveShadow material={materials.side} geometry={nodes.mesh_1.geometry} />
                    <mesh castShadow receiveShadow material={materials.foam} geometry={nodes.mesh_2.geometry} />
                    <mesh castShadow receiveShadow material={materials.lower} geometry={nodes.mesh_3.geometry} />
                    <mesh castShadow receiveShadow material={materials.upper} geometry={nodes.mesh_4.geometry} />
                </group>
            </group>
        </group>
    )
}
