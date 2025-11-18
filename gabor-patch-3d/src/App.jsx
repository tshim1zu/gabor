import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, Grid } from '@react-three/drei'
import GaborPatch from './components/GaborPatch'
import StereoView from './components/StereoView'
import './App.css'

function App() {
  const [stereoEnabled, setStereoEnabled] = useState(true)
  const [frequency, setFrequency] = useState(5.0)
  const [sigma, setSigma] = useState(0.3)
  const [orientation, setOrientation] = useState(0.0)
  const [animate, setAnimate] = useState(true)

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#1a1a1a' }}>
      <div style={{
        position: 'absolute',
        top: 20,
        left: 20,
        zIndex: 100,
        background: 'rgba(0, 0, 0, 0.95)',
        padding: '20px',
        borderRadius: '10px',
        color: 'white',
        fontFamily: 'monospace',
        maxWidth: '300px',
        border: '2px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.8)'
      }}>
        <h2 style={{ marginTop: 0, fontSize: '18px' }}>3D Gabor Patch</h2>
        <p style={{ fontSize: '12px', marginBottom: '15px' }}>
          両眼視差による3Dガボールパッチ
        </p>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px' }}>
            ステレオビュー
          </label>
          <button
            onClick={() => setStereoEnabled(!stereoEnabled)}
            style={{
              padding: '8px 16px',
              background: stereoEnabled ? '#4CAF50' : '#666',
              border: 'none',
              borderRadius: '5px',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            {stereoEnabled ? 'ON (左右分割)' : 'OFF'}
          </button>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px' }}>
            空間周波数: {frequency.toFixed(1)}
          </label>
          <input
            type="range"
            min="1"
            max="20"
            step="0.1"
            value={frequency}
            onChange={(e) => setFrequency(parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px' }}>
            ガウス標準偏差: {sigma.toFixed(2)}
          </label>
          <input
            type="range"
            min="0.1"
            max="1.0"
            step="0.01"
            value={sigma}
            onChange={(e) => setSigma(parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px' }}>
            向き: {Math.round(orientation * 180 / Math.PI)}°
          </label>
          <input
            type="range"
            min="0"
            max={Math.PI * 2}
            step="0.01"
            value={orientation}
            onChange={(e) => setOrientation(parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px' }}>
            アニメーション
          </label>
          <button
            onClick={() => setAnimate(!animate)}
            style={{
              padding: '8px 16px',
              background: animate ? '#4CAF50' : '#666',
              border: 'none',
              borderRadius: '5px',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            {animate ? 'ON' : 'OFF'}
          </button>
        </div>

        <div style={{ fontSize: '11px', marginTop: '20px', opacity: 0.7 }}>
          {stereoEnabled && (
            <p>💡 平行法またはVRビューアーで立体視できます</p>
          )}
          <p>マウスでカメラ操作可能</p>
        </div>
      </div>

      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        gl={{ preserveDrawingBuffer: true }}
      >
        {/* 照明 */}
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />

        {/* ガボールパッチ（複数配置して奥行き感を出す） */}
        <GaborPatch
          position={[0, 0, 0]}
          frequency={frequency}
          sigma={sigma}
          orientation={orientation}
          animate={animate}
          animationSpeed={2.0}
        />

        {/* 奥にもう一つ配置 */}
        <GaborPatch
          position={[1.5, 0.5, -2]}
          frequency={frequency * 0.7}
          sigma={sigma * 1.2}
          orientation={orientation + Math.PI / 4}
          animate={animate}
          animationSpeed={1.5}
        />

        {/* 手前にもう一つ配置 */}
        <GaborPatch
          position={[-1.5, -0.5, 2]}
          frequency={frequency * 1.3}
          sigma={sigma * 0.8}
          orientation={orientation - Math.PI / 6}
          animate={animate}
          animationSpeed={2.5}
        />

        {/* グリッド（参照用） */}
        <Grid
          args={[10, 10]}
          position={[0, -2, 0]}
          cellSize={0.5}
          cellThickness={0.5}
          cellColor={'#6f6f6f'}
          sectionSize={1}
          sectionThickness={1}
          sectionColor={'#9d4b4b'}
          fadeDistance={25}
          fadeStrength={1}
          infiniteGrid
        />

        {/* 環境光 */}
        <Environment preset="city" />

        {/* カメラコントロール */}
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          rotateSpeed={0.5}
        />

        {/* ステレオビュー */}
        {stereoEnabled && (
          <StereoView
            eyeSeparation={0.064}
            focalLength={5}
          />
        )}
      </Canvas>
    </div>
  )
}

export default App
