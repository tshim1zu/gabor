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

  // autoClearを無効化してステレオレンダリングを制御
  useEffect(() => {
    const previousAutoClear = gl.autoClear
    gl.autoClear = false

    return () => {
      gl.autoClear = previousAutoClear
    }
  }, [gl])

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

  useFrame(({ gl: renderer, scene: currentScene, camera: currentCamera, clock }) => {
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

    // デバッグ: オフセット値を確認
    if (typeof window !== 'undefined' && !window._stereoDebugLogged) {
      console.log('Stereo Debug Info:')
      console.log('  Eye separation:', eyeSeparation * 1000, 'mm')
      console.log('  Viewing distance:', viewingDistance * 100, 'cm')
      console.log('  Screen width:', screenWidthMM, 'mm')
      console.log('  Camera offset:', cameraOffset)
      console.log('  Focal length:', focalLength)
      window._stereoDebugLogged = true
    }

    // カメラ位置と向きの更新
    leftCamera.current.position.copy(currentCamera.position)
    rightCamera.current.position.copy(currentCamera.position)

    leftCamera.current.rotation.copy(currentCamera.rotation)
    rightCamera.current.rotation.copy(currentCamera.rotation)
    leftCamera.current.quaternion.copy(currentCamera.quaternion)
    rightCamera.current.quaternion.copy(currentCamera.quaternion)

    // 位置オフセットを適用（平行法: 両眼は同じ方向を向く）
    leftCamera.current.position.x -= cameraOffset
    rightCamera.current.position.x += cameraOffset

    // 行列を更新
    leftCamera.current.updateMatrixWorld()
    rightCamera.current.updateMatrixWorld()

    // レンダラーをクリア
    renderer.clear()

    // 左目の描画
    renderer.setScissorTest(true)
    renderer.setScissor(0, 0, width / 2, height)
    renderer.setViewport(0, 0, width / 2, height)
    renderer.render(currentScene, leftCamera.current)

    // 右目の描画
    renderer.setScissor(width / 2, 0, width / 2, height)
    renderer.setViewport(width / 2, 0, width / 2, height)
    renderer.render(currentScene, rightCamera.current)

    renderer.setScissorTest(false)

    // 継続的なレンダリングを要求
    renderer.resetState()
  }, 1) // 通常のレンダリングの後に実行

  return null
}
