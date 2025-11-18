import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, Grid } from '@react-three/drei'
import GaborPatch from './components/GaborPatch'
import DotPattern from './components/DotPattern'
import ConcentricPattern from './components/ConcentricPattern'
import CheckerPattern from './components/CheckerPattern'
import RadialPattern from './components/RadialPattern'
import StereoView from './components/StereoView'
import './App.css'

function App() {
  const [stereoEnabled, setStereoEnabled] = useState(true)
  const [frequency, setFrequency] = useState(5.0)
  const [sigma, setSigma] = useState(0.3)
  const [orientation, setOrientation] = useState(0.0)
  const [animate, setAnimate] = useState(true)
  const [panelVisible, setPanelVisible] = useState(true)
  const [eyeSeparation, setEyeSeparation] = useState(0.064)
  const [exerciseMode, setExerciseMode] = useState(false)
  const [preset, setPreset] = useState('default')
  const [shapeType, setShapeType] = useState('gabor')
  const [viewingDistance, setViewingDistance] = useState(0.3) // 30cm
  const [screenWidthMM, setScreenWidthMM] = useState(340) // 13インチ相当

  // プリセット定義
  const presets = {
    default: { frequency: 5.0, sigma: 0.3, orientation: 0.0 },
    fine: { frequency: 10.0, sigma: 0.2, orientation: Math.PI / 4 },
    coarse: { frequency: 3.0, sigma: 0.5, orientation: Math.PI / 6 },
    vertical: { frequency: 7.0, sigma: 0.25, orientation: Math.PI / 2 },
    diagonal: { frequency: 6.0, sigma: 0.35, orientation: Math.PI / 3 }
  }

  const applyPreset = (presetName) => {
    const p = presets[presetName]
    setFrequency(p.frequency)
    setSigma(p.sigma)
    setOrientation(p.orientation)
    setPreset(presetName)
  }

  // パターンコンポーネントを返す関数
  const renderPattern = (pos, freq, sig, orient, speed) => {
    const commonProps = {
      position: pos,
      animate: animate,
      exerciseMode: exerciseMode
    }

    switch (shapeType) {
      case 'gabor':
        return (
          <GaborPatch
            {...commonProps}
            frequency={freq}
            sigma={sig}
            orientation={orient}
            animationSpeed={speed}
          />
        )
      case 'dots':
        return (
          <DotPattern
            {...commonProps}
            dotCount={500}
            dotSize={0.03}
          />
        )
      case 'concentric':
        return (
          <ConcentricPattern
            {...commonProps}
            ringCount={10}
          />
        )
      case 'checker':
        return (
          <CheckerPattern
            {...commonProps}
            gridSize={8}
          />
        )
      case 'radial':
        return (
          <RadialPattern
            {...commonProps}
            rayCount={16}
          />
        )
      default:
        return null
    }
  }

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#1a1a1a' }}>
      {/* トグルボタン */}
      <button
        onClick={() => setPanelVisible(!panelVisible)}
        style={{
          position: 'absolute',
          top: 20,
          left: 20,
          zIndex: 101,
          background: 'rgba(0, 0, 0, 0.8)',
          border: '2px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '8px',
          color: 'white',
          padding: '12px 16px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 'bold',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
        onMouseLeave={(e) => e.target.style.background = 'rgba(0, 0, 0, 0.8)'}
      >
        {panelVisible ? '✕ 閉じる' : '☰ 設定'}
      </button>

      {/* 設定パネル */}
      {panelVisible && (
        <div style={{
          position: 'absolute',
          top: 70,
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

        {stereoEnabled && (
          <>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px' }}>
                視距離: {(viewingDistance * 100).toFixed(0)}cm
              </label>
              <input
                type="range"
                min="0.2"
                max="0.6"
                step="0.05"
                value={viewingDistance}
                onChange={(e) => setViewingDistance(parseFloat(e.target.value))}
                style={{ width: '100%' }}
              />
              <p style={{ fontSize: '10px', margin: '5px 0 0 0', opacity: 0.7 }}>
                目から画面までの距離
              </p>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px' }}>
                画面サイズ
              </label>
              <select
                value={screenWidthMM}
                onChange={(e) => setScreenWidthMM(parseInt(e.target.value))}
                style={{
                  width: '100%',
                  padding: '8px',
                  background: '#333',
                  color: 'white',
                  border: '1px solid #666',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  marginBottom: '5px'
                }}
              >
                <option value="286">13インチ (286mm)</option>
                <option value="310">14インチ (310mm)</option>
                <option value="340">15インチ (340mm)</option>
                <option value="380">17インチ (380mm)</option>
                <option value="531">24インチ (531mm)</option>
                <option value="597">27インチ (597mm)</option>
              </select>
              <input
                type="number"
                placeholder="カスタム (mm)"
                value={screenWidthMM}
                onChange={(e) => setScreenWidthMM(parseInt(e.target.value) || 340)}
                style={{
                  width: '100%',
                  padding: '8px',
                  background: '#333',
                  color: 'white',
                  border: '1px solid #666',
                  borderRadius: '5px',
                  fontSize: '12px'
                }}
              />
              <p style={{ fontSize: '10px', margin: '5px 0 0 0', opacity: 0.7 }}>
                画面の横幅（mm単位）
              </p>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px' }}>
                両眼間距離: {(eyeSeparation * 1000).toFixed(0)}mm
              </label>
              <input
                type="range"
                min="0.050"
                max="0.080"
                step="0.001"
                value={eyeSeparation}
                onChange={(e) => setEyeSeparation(parseFloat(e.target.value))}
                style={{ width: '100%' }}
              />
              <p style={{ fontSize: '10px', margin: '5px 0 0 0', opacity: 0.7 }}>
                個人差により調整
              </p>
            </div>
          </>
        )}

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px' }}>
            エクササイズモード（毛様筋トレーニング）
          </label>
          <button
            onClick={() => setExerciseMode(!exerciseMode)}
            style={{
              padding: '8px 16px',
              background: exerciseMode ? '#FF9800' : '#666',
              border: 'none',
              borderRadius: '5px',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            {exerciseMode ? 'ON (自動運動)' : 'OFF'}
          </button>
          {exerciseMode && (
            <p style={{ fontSize: '10px', margin: '5px 0 0 0', opacity: 0.7 }}>
              目で動きを追ってください
            </p>
          )}
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px' }}>
            図形タイプ
          </label>
          <select
            value={shapeType}
            onChange={(e) => setShapeType(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              background: '#333',
              color: 'white',
              border: '1px solid #666',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            <option value="gabor">ガボールパッチ（縞模様）</option>
            <option value="dots">ランダムドット</option>
            <option value="concentric">同心円</option>
            <option value="checker">チェッカーボード</option>
            <option value="radial">放射状</option>
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px' }}>
            パターンプリセット
          </label>
          <select
            value={preset}
            onChange={(e) => applyPreset(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              background: '#333',
              color: 'white',
              border: '1px solid #666',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            <option value="default">標準</option>
            <option value="fine">細かい縞模様</option>
            <option value="coarse">粗い縞模様</option>
            <option value="vertical">垂直</option>
            <option value="diagonal">斜め</option>
          </select>
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
      )}

      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        gl={{ preserveDrawingBuffer: true }}
      >
        {/* 照明 */}
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />

        {/* パターン（複数配置して奥行き感を出す） */}
        {renderPattern([0, 0, 0], frequency, sigma, orientation, 2.0)}

        {/* 奥にもう一つ配置 */}
        {renderPattern([1.5, 0.5, -2], frequency * 0.7, sigma * 1.2, orientation + Math.PI / 4, 1.5)}

        {/* 手前にもう一つ配置 */}
        {renderPattern([-1.5, -0.5, 2], frequency * 1.3, sigma * 0.8, orientation - Math.PI / 6, 2.5)}

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
            eyeSeparation={eyeSeparation}
            viewingDistance={viewingDistance}
            screenWidthMM={screenWidthMM}
            focalLength={5}
          />
        )}
      </Canvas>
    </div>
  )
}

export default App
