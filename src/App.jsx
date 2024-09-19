import { Suspense, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { createXRStore, PointerCursorModel, useTouchPointer, useXR, useXRControllerState, useXRInputSourceState, useXRInputSourceStateContext, XR, XRHandJoint, XRHandModel, XROrigin, XRSpace } from '@react-three/xr'
import { Environment, OrbitControls, Text, Torus } from '@react-three/drei'
import { Object3D } from 'three'
import * as THREE from 'three'
import { CustomHand } from './Components/Hand'
import XRSpacePosition from './Components/XRSpacePosition'

const store = createXRStore()

function HandPosition() {
  const state = useXRControllerState("right");
  const vector = new THREE.Vector3();
  const [vec, setVec] = useState(new THREE.Vector3())
  useFrame(() => {
    if (state) {
      const controller =
        (state.object?.children[0].children ?? []).filter(
          (c) => c.name === "controller_mesh"
        )
      if (controller.length > 0) {
        controller[0].getWorldPosition(vector);
        setVec(vector)
        // console.log(vector);
      }
    }
  });
  return <Text
    position={[vector.x, vector.y, vector.z]}
    scale={[0.1, 0.1, 0.1]}
    fontSize={10}
  >
    {/* {`${vec.x.toFixed(2)}, ${vec.y.toFixed(2)}, ${vec.z.toFixed(2)}`} */}
  </Text>
}
const extractPositionsFromData = (data) => {
  if (!data) return null;
  const positions = [];
  for (let i = 0; i < data.length; i += 3) {
    positions.push(new THREE.Vector3(data[i], data[i + 1], data[i + 2]));
  }
  return positions;
};

function HandPosition2({setRed}) {
  const handState = useXRInputSourceState('controller', 'right'); // return XRHandState
  const vector = new THREE.Vector3();
  const [vec, setVec] = useState(new THREE.Vector3())
  const [pos, setPos] = useState(new Float32Array)
  let positions = [];
  if (handState) {setRed(true) } ;
  useFrame(() => {
    // console.log(handState)
    // setPos(handState?.pose.data);
    if (handState) {
      const controller =
        (handState.object?.children[0].children[0] ?? undefined);
      // console.log(controller)
      if (controller) {
        controller.getWorldPosition(vector);
        setVec(vector)
        // console.log(vector);
      }
    }
    // if (handState) {
    //   const controller =
    //     (handState?.hand.object?.children[0].children[0] ?? undefined);
    //   console.log(controller)
    //   if (controller) {
    //     controller.getWorldPosition(vector);
    //     setVec(vector)
    //     console.log(vector);
    //   }
    // }
  });
  return <Text
    position={[vector.x, vector.y, vector.z]}
    scale={[0.1, 0.1, 0.1]}
    fontSize={10}
  >
    {`${vec.x.toFixed(2)}, ${vec.y.toFixed(2)}, ${vec.z.toFixed(2)}`}
    {/* {handState.object?.children[0].children?.map((c, i) => <div key={i}>{c.name}</div>)} */}
    {/* {handState?.pose ? `(${handState.pose.data})` : 'no pose'} */}
    {/* {handState?.pose ? `(${pos.length})` : 'no pose'} */}
  </Text>
}
function HandTracker() {
  const state = useXR("right");
  const rightController = controllers.find((c) => c.inputSource.handedness === 'right');

  if (!rightController) return null;
  console.log(state)
  return (
    <>
      {rightController.inputSource.hand && (
        <CustomHandModel hand={rightController.inputSource.hand} />
      )}
    </>
  )
}
function CustomHandModel({ hand }) {
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




function App() {
  // const xrDevice = new XRDevice(metaQuest2);
  // xrDevice.installRuntime();
  // const devui = new DevUI(xrDevice);

  const [red, setRed] = useState(false)

  // References for the hands
  console.log(store);
  return (

    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'fixed', top: 0, left: 0 }}>
      <div style={{ position: 'absolute', top: 10, left: 10, zIndex: '9999' }}>
        <button onClick={() => store.enterVR()}>Enter VR</button>
        <button onClick={() => store.enterAR()}>Enter AR</button>
      </div>
      <Canvas
        camera={{ position: [0, 0, 10], fov: 55 }}
      >
        <XR store={store}>
          {/* <HandPosition /> */}
          <HandPosition2 setRed={setRed} />
          <XRSpacePosition/>
          <XROrigin position={[0, 0, 10]}>
          </XROrigin>
          <OrbitControls />
          <Environment preset="forest" background blur={0.5} />
          <mesh pointerEventsType={{ deny: 'grab' }} onPointerDown={() => { setRed(!red); console.log(red); }} position={[0, 1, -1]}>
            <boxGeometry />
            <meshBasicMaterial color={red ? 'red' : 'blue'} />
          </mesh>
        </XR>
      </Canvas>
    </div>

  )
}

export default App

