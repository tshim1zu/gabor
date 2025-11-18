import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * 3D Gabor Patch Component
 * ガボールパッチ: ガウス分布でエンベロープされた正弦波グレーティング
 */
export default function GaborPatch({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  frequency = 5.0,      // 空間周波数
  sigma = 0.3,          // ガウスエンベロープの標準偏差
  phase = 0.0,          // 位相
  orientation = 0.0,    // 向き（ラジアン）
  animate = true,       // アニメーション有効化
  animationSpeed = 1.0, // アニメーション速度
  exerciseMode = false  // エクササイズモード（毛様筋トレーニング）
}) {
  const meshRef = useRef()
  const materialRef = useRef()
  const basePosition = useRef(position)

  // カスタムシェーダーマテリアル
  const shaderMaterial = useMemo(() => {
    return {
      uniforms: {
        uTime: { value: 0.0 },
        uFrequency: { value: frequency },
        uSigma: { value: sigma },
        uPhase: { value: phase },
        uOrientation: { value: orientation },
        uAnimate: { value: animate ? 1.0 : 0.0 },
        uAnimationSpeed: { value: animationSpeed }
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vPosition;

        void main() {
          vUv = uv;
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uFrequency;
        uniform float uSigma;
        uniform float uPhase;
        uniform float uOrientation;
        uniform float uAnimate;
        uniform float uAnimationSpeed;

        varying vec2 vUv;
        varying vec3 vPosition;

        void main() {
          // 中心からの相対座標
          vec2 centered = vUv - 0.5;

          // 回転行列を適用
          float cosTheta = cos(uOrientation);
          float sinTheta = sin(uOrientation);
          vec2 rotated = vec2(
            centered.x * cosTheta - centered.y * sinTheta,
            centered.x * sinTheta + centered.y * cosTheta
          );

          // ガウスエンベロープ
          float gaussianX = rotated.x / uSigma;
          float gaussianY = rotated.y / uSigma;
          float gaussian = exp(-(gaussianX * gaussianX + gaussianY * gaussianY) / 2.0);

          // 正弦波グレーティング（アニメーション付き）
          float animPhase = uPhase + uTime * uAnimationSpeed * uAnimate;
          float sinusoid = cos(2.0 * 3.14159265359 * uFrequency * rotated.x + animPhase);

          // ガボールパッチ
          float gabor = gaussian * sinusoid;

          // グレースケール値を0-1の範囲に正規化
          float intensity = gabor * 0.5 + 0.5;

          // エッジをスムーズにフェードアウト
          float edgeFade = smoothstep(0.5, 0.45, length(centered));
          intensity *= edgeFade;

          gl_FragColor = vec4(vec3(intensity), gaussian * edgeFade);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide
    }
  }, [frequency, sigma, phase, orientation, animate, animationSpeed])

  // アニメーションループ
  useFrame((state) => {
    if (materialRef.current && animate) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime
    }

    if (meshRef.current) {
      if (exerciseMode) {
        // エクササイズモード: 毛様筋トレーニング
        const t = state.clock.elapsedTime

        // 前後運動（Z軸）- 毛様筋のストレッチ（遠近調整）
        // ゆっくり大きく動かして、目のピント調整を促す
        const depthMovement = Math.sin(t * 0.4) * 3.0

        // 左右運動（X軸）- 眼球追従運動
        const horizontalMovement = Math.sin(t * 0.5 + Math.PI / 3) * 1.5

        // 上下運動（Y軸）- 眼球追従運動
        const verticalMovement = Math.cos(t * 0.35 + Math.PI / 6) * 1.0

        meshRef.current.position.set(
          basePosition.current[0] + horizontalMovement,
          basePosition.current[1] + verticalMovement,
          basePosition.current[2] + depthMovement
        )

        // エクササイズモード時は回転を抑える
        meshRef.current.rotation.y = Math.sin(t * 0.2) * 0.1
        meshRef.current.rotation.x = Math.cos(t * 0.15) * 0.1
      } else if (animate) {
        // 通常のアニメーション: ゆっくり回転
        meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.3
        meshRef.current.rotation.x = Math.cos(state.clock.elapsedTime * 0.2) * 0.2
      }
    }
  })

  return (
    <mesh
      ref={meshRef}
      position={position}
      rotation={rotation}
    >
      <planeGeometry args={[2, 2, 64, 64]} />
      <shaderMaterial
        ref={materialRef}
        {...shaderMaterial}
      />
    </mesh>
  )
}
