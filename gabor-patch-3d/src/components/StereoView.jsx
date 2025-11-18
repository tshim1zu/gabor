import { useRef, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Stereoscopic View Component
 * 両眼視差を実現するステレオスコピックカメラ
 */
export default function StereoView({
  eyeSeparation = 0.064,  // 両眼間距離（メートル）人間の平均は約64mm
  focalLength = 10,        // 焦点距離
  children
}) {
  const { gl, scene, camera, size } = useThree()
  const stereoCamera = useRef()

  useEffect(() => {
    // ステレオカメラのセットアップ
    const stereoCam = new THREE.StereoCamera()
    stereoCam.aspect = 0.5
    stereoCam.eyeSep = eyeSeparation
    stereoCamera.current = stereoCam

    // 既存のカメラを親として設定
    if (camera) {
      camera.position.z = focalLength
    }
  }, [camera, eyeSeparation, focalLength])

  useFrame(() => {
    if (!stereoCamera.current) return

    const width = size.width
    const height = size.height

    // ステレオカメラの更新
    stereoCamera.current.update(camera)

    // 左目の描画
    gl.setScissorTest(true)
    gl.setScissor(0, 0, width / 2, height)
    gl.setViewport(0, 0, width / 2, height)
    gl.render(scene, stereoCamera.current.cameraL)

    // 右目の描画
    gl.setScissor(width / 2, 0, width / 2, height)
    gl.setViewport(width / 2, 0, width / 2, height)
    gl.render(scene, stereoCamera.current.cameraR)

    gl.setScissorTest(false)
  }, 1) // 通常のレンダリングの後に実行

  return null
}
