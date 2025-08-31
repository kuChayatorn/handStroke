import { Canvas } from '@react-three/fiber';
import { XR, XROrigin, createXRStore } from '@react-three/xr';
import { OrbitControls, Environment } from '@react-three/drei';
import { useEffect, useState } from 'react';
import { TrackedHandModel } from './Components/TrackedHandModel';

const store = createXRStore();

export default function App() {
  const [inXR, setInXR] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    const checkXRSupport = async () => {
      if (navigator.xr) {
        const supported = await navigator.xr.isSessionSupported('immersive-vr');
        setIsSupported(supported);
      }
    };
    checkXRSupport();

    const unsub = store.subscribe(() => {
      setInXR(store.getState().isPresenting);
    });
    return () => unsub();
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      {/* XR Buttons */}
      <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 10 }}>
        {isSupported ? (
          <>
            {!inXR && (
              <>
                <button onClick={() => store.enterVR()}>Enter VR</button>
                <button onClick={() => store.enterAR()}>Enter AR</button>
              </>
            )}
            {inXR && <button onClick={() => store.exitXR()}>Exit XR</button>}
          </>
        ) : (
          <span style={{ color: 'red' }}>WebXR not supported in this browser</span>
        )}
      </div>

      <Canvas camera={{ position: [0, 1.5, 2.5], fov: 75 }}>
        <XR store={store} hideHands>
          {/* 🟢 Correct lighting */}
          <ambientLight intensity={1.5} />
          <directionalLight position={[2, 3, 5]} intensity={2} castShadow />

          {/* 🧠 XR Origin should always be set */}
          <XROrigin position={[0, 1.6, 0]} />

          {/* 🌎 Environment lighting */}
          <Environment preset="sunset" background blur={0.8} />

          {/* ✋ XR-tracked hand model */}
          <TrackedHandModel handedness="right" />

          {/* 🧪 Debug cube (visible if scene is working) */}
          <mesh position={[0, 1.5, -1]}>
            <boxGeometry args={[0.2, 0.2, 0.2]} />
            <meshStandardMaterial color="green" />
          </mesh>
        </XR>

        {/* Optional controls for desktop dev */}
        <OrbitControls />
      </Canvas>
    </div>
  );
}
