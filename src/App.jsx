import { Canvas } from "@react-three/fiber";
import { XR, XROrigin, createXRStore } from "@react-three/xr";
import { OrbitControls, Environment, Lightformer } from "@react-three/drei";
import { useEffect, useState } from "react";
import { Hand } from "./Components/Hand";
import { MirroredHand } from "./Components/MirroredHand";

const store = createXRStore();

export default function App() {
  const [trackingData, setTrackingData] = useState(null);
  const [inXR, setInXR] = useState(false);

  useEffect(() => {
    const sub = store.subscribe(() => {
      setInXR(store.getState().isPresenting);
    });
    return () => sub(); // clean up
  }, []);
  
  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 10, left: 10, zIndex: 10 }}>
        <button onClick={() => store.enterVR()}>Enter VR</button>
        <button onClick={() => store.enterAR()}>Enter AR</button>
        <button onClick={() => store.exitXR()}>Exit XR</button>
      </div>

      <Canvas camera={{ position: [0, 1.5, 1.5], fov: 75 }}>
        <XR store={store}>
          <XROrigin />
          {/* Hand inside XR */}
          {inXR && (
            <>
              <Hand setTrackingData={setTrackingData} />
              {trackingData && <MirroredHand trackingData={trackingData} />}
            </>
          )}
        </XR>

        {/* Hand outside XR, always visible */}
        {!inXR && (
          <>
            <Hand setTrackingData={setTrackingData} />
            {trackingData && <MirroredHand trackingData={trackingData} />}
          </>
        )}

        <OrbitControls />
        <ambientLight intensity={1.2} />
        <directionalLight position={[1, 2, 3]} intensity={1} />
        <axesHelper args={[0.2]} />
        <gridHelper args={[10, 10]} />
        <Environment preset="forest" background blur={0.5} />
      </Canvas>
    </div>
  );
}
