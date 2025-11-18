import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Random Dot Pattern Component
 * ランダムドットパターン - 視覚科学でよく使われる刺激
 */
export default function DotPattern({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  dotCount = 500,
  dotSize = 0.03,
  animate = true,
  exerciseMode = false
}) {
  const meshRef = useRef()
  const materialRef = useRef()
  const basePosition = useRef(position)

  useEffect(() => {
    basePosition.current = position
  }, [position])

  // ランダムドットの生成
  const shaderMaterial = useMemo(() => {
    return {
      uniforms: {
        uTime: { value: 0.0 },
        uDotSize: { value: dotSize },
        uSeed: { value: Math.random() * 1000 }
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
        uniform float uDotSize;
        uniform float uSeed;

        varying vec2 vUv;

        // 疑似乱数生成
        float random(vec2 st) {
          return fract(sin(dot(st.xy + uSeed, vec2(12.9898, 78.233))) * 43758.5453123);
        }

        void main() {
          vec2 centered = vUv - 0.5;
          float distFromCenter = length(centered);

          // グリッドセル
          vec2 gridUv = vUv * 20.0;
          vec2 cellId = floor(gridUv);
          vec2 cellUv = fract(gridUv);

          // 各セルにランダムドット配置
          vec2 dotPos = vec2(random(cellId), random(cellId + 100.0));

          // アニメーション: ドットが時間でちらつく
          float flickerThreshold = random(cellId + 200.0);
          float flicker = step(flickerThreshold, fract(uTime * 0.5 + random(cellId + 300.0)));

          // ドットの描画
          float dist = distance(cellUv, dotPos);
          float dot = smoothstep(uDotSize, uDotSize * 0.5, dist);

          // エッジをフェード
          float edgeFade = smoothstep(0.5, 0.3, distFromCenter);

          float intensity = dot * flicker * edgeFade;

          gl_FragColor = vec4(vec3(intensity), intensity);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide
    }
  }, [dotSize])

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
