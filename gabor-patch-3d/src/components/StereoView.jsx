import { useRef, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Stereoscopic View Component
 * 両眼視差を実現するステレオスコピックカメラ
 * 物理的な距離と画面サイズに基づいた正確な立体視
 */
export default function StereoView({
  eyeSeparation = 0.064,      // 両眼間距離（メートル）人間の平均は約64mm
  viewingDistance = 0.3,      // 視距離（メートル）デフォルト30cm
  screenWidthMM = 340,        // 画面の物理的な横幅（mm）
  focalLength = 5,            // 焦点距離
  children
}) {
  const { gl, scene, camera, size } = useThree()
  const leftCamera = useRef()
  const rightCamera = useRef()

  useEffect(() => {
    // 左右のカメラを作成
    const aspect = (size.width / 2) / size.height
    const left = camera.clone()
    const right = camera.clone()

    left.aspect = aspect
    right.aspect = aspect
    left.updateProjectionMatrix()
    right.updateProjectionMatrix()

    leftCamera.current = left
    rightCamera.current = right
  }, [camera, size.width, size.height])

  useFrame(() => {
    if (!leftCamera.current || !rightCamera.current) return

    const width = size.width
    const height = size.height

    // 物理的な計算
    // 画面の物理的な横幅をメートルに変換
    const screenWidthM = screenWidthMM / 1000

    // ピクセルあたりの物理的な幅
    const physicalWidthPerPixel = screenWidthM / width

    // 半分の画面幅の物理的な寸法
    const halfScreenWidthM = screenWidthM / 2

    // カメラオフセットの計算
    // 視距離と焦点距離を考慮した正確な両眼視差
    const halfEyeSep = eyeSeparation / 2

    // カメラの水平オフセット（3D空間内）
    // 視距離に基づいてスケーリング
    const cameraOffset = halfEyeSep * (focalLength / viewingDistance)

    // カメラ位置の更新
    leftCamera.current.position.copy(camera.position)
    rightCamera.current.position.copy(camera.position)

    leftCamera.current.position.x -= cameraOffset
    rightCamera.current.position.x += cameraOffset

    // カメラの向きを更新
    leftCamera.current.lookAt(camera.position.x - cameraOffset, camera.position.y, camera.position.z - focalLength)
    rightCamera.current.lookAt(camera.position.x + cameraOffset, camera.position.y, camera.position.z - focalLength)

    leftCamera.current.rotation.copy(camera.rotation)
    rightCamera.current.rotation.copy(camera.rotation)
    leftCamera.current.quaternion.copy(camera.quaternion)
    rightCamera.current.quaternion.copy(camera.quaternion)

    // 左目の描画
    gl.setScissorTest(true)
    gl.setScissor(0, 0, width / 2, height)
    gl.setViewport(0, 0, width / 2, height)
    gl.render(scene, leftCamera.current)

    // 右目の描画
    gl.setScissor(width / 2, 0, width / 2, height)
    gl.setViewport(width / 2, 0, width / 2, height)
    gl.render(scene, rightCamera.current)

    gl.setScissorTest(false)
  }, 1) // 通常のレンダリングの後に実行

  return null
}
