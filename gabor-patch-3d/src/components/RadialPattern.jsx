import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Radial Pattern Component
 * 放射状パターン - 注視点と方向性の視覚刺激
 */
export default function RadialPattern({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  rayCount = 16,
  animate = true,
  exerciseMode = false
}) {
  const meshRef = useRef()
  const materialRef = useRef()
  const basePosition = useRef(position)

  useEffect(() => {
    basePosition.current = position
  }, [position])

  const shaderMaterial = useMemo(() => {
    return {
      uniforms: {
        uTime: { value: 0.0 },
        uRayCount: { value: rayCount }
      },
      vertexShader: `
        varying vec2 vUv;

        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uRayCount;

        varying vec2 vUv;

        void main() {
          vec2 centered = vUv - 0.5;
          float distFromCenter = length(centered);

          // 角度を計算
          float angle = atan(centered.y, centered.x);

          // アニメーション: 回転する放射状パターン
          float animatedAngle = angle + uTime * 0.5;

          // 放射状パターン
          float rays = sin(animatedAngle * uRayCount) * 0.5 + 0.5;

          // 距離に応じたリング
          float rings = sin(distFromCenter * 20.0) * 0.5 + 0.5;

          // 組み合わせ
          float pattern = rays * rings;

          // エッジをフェード
          float edgeFade = smoothstep(0.7, 0.4, distFromCenter);

          float intensity = pattern * edgeFade;

          gl_FragColor = vec4(vec3(intensity), edgeFade);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide
    }
  }, [rayCount])

  useFrame((state) => {
    if (materialRef.current && animate) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime
    }

    if (meshRef.current) {
      if (exerciseMode) {
        const t = state.clock.elapsedTime
        const depthMovement = Math.sin(t * 0.4) * 3.0
        const horizontalMovement = Math.sin(t * 0.5 + Math.PI / 3) * 1.5
        const verticalMovement = Math.cos(t * 0.35 + Math.PI / 6) * 1.0

        meshRef.current.position.set(
          basePosition.current[0] + horizontalMovement,
          basePosition.current[1] + verticalMovement,
          basePosition.current[2] + depthMovement
        )

        meshRef.current.rotation.y = Math.sin(t * 0.2) * 0.1
        meshRef.current.rotation.x = Math.cos(t * 0.15) * 0.1
      } else if (animate) {
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
