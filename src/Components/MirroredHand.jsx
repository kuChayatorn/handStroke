import React, { useEffect, useMemo, useState } from 'react'
import { useGLTF } from '@react-three/drei'
import { SkeletonUtils } from 'three-stdlib'
import * as THREE from 'three'

export function MirroredHand({ trackingData }) {
  const { scene } = useGLTF('/hand.glb')
  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene])

  const [mesh, setMesh] = useState(null)
  const [arm, setArm] = useState(null)
  const [skeleton, setSkeleton] = useState(null)

  useEffect(() => {
    let foundMesh = null
    let foundArm = null

    clone.traverse(obj => {
      if (obj.name === 'leapmotion_basehand_mesh') foundMesh = obj
      if (obj.name === 'Armature') foundArm = obj
    })

    setMesh(foundMesh)
    setArm(foundArm)
    setSkeleton(foundMesh?.skeleton || null)
  }, [clone])

  const applyMirroredTracking = (data) => {
    const rotateBone = (name, x, y, z) => {
      const bone = skeleton?.bones.find(b => b.name === name)
      if (bone) {
        bone.rotation.set(
          THREE.MathUtils.degToRad(x),
          -THREE.MathUtils.degToRad(y),
          -THREE.MathUtils.degToRad(z)
        )
      }
    }

    rotateBone('Bone004', data.thumb.x, data.thumb.y, data.thumb.z)
    rotateBone('Bone009', data.index.x, data.index.y, data.index.z)
    rotateBone('Bone013', data.middle.x, data.middle.y, data.middle.z)
    rotateBone('Bone017', data.ring.x, data.ring.y, data.ring.z)
    rotateBone('Bone021', data.pinky.x, data.pinky.y, data.pinky.z)
  }

  useEffect(() => {
    if (trackingData && skeleton) {
      applyMirroredTracking(trackingData)
    }
  }, [trackingData, skeleton])

  if (!mesh || !skeleton || !arm) return null

  return (
    <group position={[30, 1.3, -0.3]} scale={[-1.5, 1.5, 1.5]}>
      <primitive object={arm} />
      <skinnedMesh
        geometry={mesh.geometry}
        material={mesh.material}
        skeleton={skeleton}
      />
    </group>
  )
}

useGLTF.preload('/hand.glb')
