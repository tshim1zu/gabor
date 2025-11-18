import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Concentric Circles Pattern Component
 * 同心円パターン - 視覚的奥行き感と注視点を提供
 */
export default function ConcentricPattern({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  ringCount = 10,
  animate = true,
  exerciseMode = false
}) {
  const meshRef = useRef()
  const materialRef = useRef()
  const basePosition = useRef(position)

  const shaderMaterial = useMemo(() => {
    return {
      uniforms: {
        uTime: { value: 0.0 },
        uRingCount: { value: ringCount }
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
        uniform float uRingCount;

        varying vec2 vUv;

        void main() {
          vec2 centered = vUv - 0.5;
          float distFromCenter = length(centered) * 2.0;

          // アニメーション: 同心円が外側に広がる
          float animatedDist = distFromCenter - uTime * 0.3;

          // 同心円パターン
          float rings = sin(animatedDist * uRingCount * 3.14159) * 0.5 + 0.5;

          // エッジをフェード
          float edgeFade = smoothstep(1.0, 0.7, distFromCenter);

          float intensity = rings * edgeFade;

          gl_FragColor = vec4(vec3(intensity), edgeFade);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide
    }
  }, [ringCount])

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
