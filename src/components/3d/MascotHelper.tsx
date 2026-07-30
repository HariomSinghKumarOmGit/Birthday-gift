'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

type MascotActivity = 'sitting' | 'looking' | 'sleeping' | 'waving' | 'stargazing' | 'jumping';

interface MascotHelperProps {
  onResetView: () => void;
}

// ────────────────────────────────────────────────────────────────
// 3D Chibi Character — Pegman-style 3D humanoid rendered in its
// own lightweight Canvas overlay. Uses basic Three.js primitives
// with proper materials and lighting for a clean 3D look.
// ────────────────────────────────────────────────────────────────

function ChibiCharacter3D({ activity }: { activity: MascotActivity }) {
  const headRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const cubeRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    // ── Head animation ──
    if (headRef.current) {
      const h = headRef.current.rotation;
      switch (activity) {
        case 'looking':
          h.y = Math.sin(t * 2) * 0.45;
          h.x = THREE.MathUtils.lerp(h.x, 0, 0.06);
          h.z = THREE.MathUtils.lerp(h.z, 0, 0.06);
          break;
        case 'sleeping':
          h.y = THREE.MathUtils.lerp(h.y, 0, 0.06);
          h.x = THREE.MathUtils.lerp(h.x, 0.18, 0.04);
          h.z = Math.sin(t * 0.7) * 0.06 - 0.08;
          break;
        case 'stargazing':
          h.x = THREE.MathUtils.lerp(h.x, -0.28, 0.04);
          h.y = THREE.MathUtils.lerp(h.y, 0, 0.06);
          h.z = THREE.MathUtils.lerp(h.z, 0, 0.06);
          break;
        default:
          h.x = THREE.MathUtils.lerp(h.x, 0, 0.06);
          h.y = THREE.MathUtils.lerp(h.y, 0, 0.06);
          h.z = THREE.MathUtils.lerp(h.z, 0, 0.06);
      }
    }

    // ── Right arm wave ──
    if (rightArmRef.current) {
      const target = activity === 'waving'
        ? -1.3 + Math.sin(t * 5) * 0.35
        : 0.15;
      rightArmRef.current.rotation.z += (target - rightArmRef.current.rotation.z) * 0.1;
    }

    // ── Cube slow spin ──
    if (cubeRef.current) {
      cubeRef.current.rotation.y += 0.006;
    }
  });

  const isSleeping = activity === 'sleeping';

  // ── Shared materials ──
  const skinMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#fce4cc', roughness: 0.65 }), []);
  const hairMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#7c5e48', roughness: 0.85 }), []);
  const darkHairMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#6b4f3d', roughness: 0.85 }), []);
  const coatMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#9c7b56', roughness: 0.72 }), []);
  const scarfMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#c8bda6', roughness: 0.8 }), []);
  const pantsMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#7a7a7a', roughness: 0.7 }), []);
  const shoeMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#4a3a2a', roughness: 0.6 }), []);
  const eyeMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#2d2d2d', roughness: 0.25 }), []);
  const highlightMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#ffffff', emissive: '#ffffff', emissiveIntensity: 0.5 }), []);
  const cheekMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#f8a4a4', transparent: true, opacity: 0.4, roughness: 0.9 }), []);
  const buttonMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#5a4a3a', roughness: 0.5 }), []);

  // Hair spike data
  const hairSpikes: Array<{ p: [number, number, number]; r: [number, number, number]; radius: number; h: number; dark: boolean }> = [
    { p: [-0.16, 0.44, 0.04], r: [0.2, 0, -0.35], radius: 0.07, h: 0.24, dark: true },
    { p: [0, 0.48, 0.01], r: [0.1, 0, 0.08], radius: 0.065, h: 0.22, dark: false },
    { p: [0.13, 0.45, 0.03], r: [0.15, 0, 0.3], radius: 0.07, h: 0.2, dark: true },
    { p: [-0.27, 0.36, 0], r: [0, 0, -0.55], radius: 0.05, h: 0.17, dark: false },
    { p: [0.25, 0.38, 0], r: [0, 0, 0.5], radius: 0.055, h: 0.18, dark: true },
    { p: [0.06, 0.47, -0.06], r: [-0.2, 0, 0.15], radius: 0.05, h: 0.16, dark: false },
  ];

  return (
    <group>
      {/* ════════ HEAD GROUP ════════ */}
      <group ref={headRef} position={[0, 0.72, 0]}>
        {/* Head sphere */}
        <mesh material={skinMat}>
          <sphereGeometry args={[0.42, 24, 24]} />
        </mesh>

        {/* Hair dome (top half) */}
        <mesh position={[0, 0.1, -0.05]} material={hairMat}>
          <sphereGeometry args={[0.44, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
        </mesh>

        {/* Hair spikes */}
        {hairSpikes.map((s, i) => (
          <mesh key={i} position={s.p} rotation={s.r} material={s.dark ? darkHairMat : hairMat}>
            <coneGeometry args={[s.radius, s.h, 5]} />
          </mesh>
        ))}

        {/* Bangs */}
        {([
          [-0.18, 0.2, 0.28, false],
          [-0.04, 0.25, 0.31, true],
          [0.12, 0.22, 0.29, false],
        ] as [number, number, number, boolean][]).map(([x, y, z, dark], i) => (
          <mesh key={`b${i}`} position={[x, y, z]} rotation={[0.7, 0, (i - 1) * 0.2]} material={dark ? darkHairMat : hairMat}>
            <sphereGeometry args={[0.09, 10, 10]} />
          </mesh>
        ))}

        {/* Ears */}
        <mesh position={[-0.4, -0.02, 0]} material={skinMat}>
          <sphereGeometry args={[0.07, 10, 10]} />
        </mesh>
        <mesh position={[0.4, -0.02, 0]} material={skinMat}>
          <sphereGeometry args={[0.07, 10, 10]} />
        </mesh>
        {/* Inner ear pink */}
        <mesh position={[-0.41, -0.02, 0.02]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color="#f0c0a8" roughness={0.8} />
        </mesh>
        <mesh position={[0.41, -0.02, 0.02]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color="#f0c0a8" roughness={0.8} />
        </mesh>

        {/* ── Eyes ── */}
        {!isSleeping ? (
          <>
            {/* Eye balls */}
            <mesh position={[-0.14, -0.02, 0.38]} material={eyeMat}>
              <sphereGeometry args={[0.06, 12, 12]} />
            </mesh>
            <mesh position={[0.14, -0.02, 0.38]} material={eyeMat}>
              <sphereGeometry args={[0.06, 12, 12]} />
            </mesh>
            {/* Specular highlights */}
            <mesh position={[-0.12, 0.005, 0.425]} material={highlightMat}>
              <sphereGeometry args={[0.023, 6, 6]} />
            </mesh>
            <mesh position={[0.16, 0.005, 0.425]} material={highlightMat}>
              <sphereGeometry args={[0.023, 6, 6]} />
            </mesh>
            {/* Smaller secondary highlight */}
            <mesh position={[-0.155, -0.03, 0.42]} material={highlightMat}>
              <sphereGeometry args={[0.012, 6, 6]} />
            </mesh>
            <mesh position={[0.125, -0.03, 0.42]} material={highlightMat}>
              <sphereGeometry args={[0.012, 6, 6]} />
            </mesh>
          </>
        ) : (
          <>
            {/* Sleeping eyes */}
            <mesh position={[-0.14, -0.02, 0.39]} scale={[1.6, 0.22, 0.4]} material={eyeMat}>
              <sphereGeometry args={[0.05, 8, 8]} />
            </mesh>
            <mesh position={[0.14, -0.02, 0.39]} scale={[1.6, 0.22, 0.4]} material={eyeMat}>
              <sphereGeometry args={[0.05, 8, 8]} />
            </mesh>
          </>
        )}

        {/* Cheek blush */}
        <mesh position={[-0.25, -0.1, 0.3]} material={cheekMat}>
          <sphereGeometry args={[0.075, 10, 10]} />
        </mesh>
        <mesh position={[0.25, -0.1, 0.3]} material={cheekMat}>
          <sphereGeometry args={[0.075, 10, 10]} />
        </mesh>

        {/* Mouth */}
        <mesh
          position={[0, -0.15, 0.39]}
          scale={activity === 'waving' || activity === 'jumping' ? [1.4, 0.65, 0.5] : [1, 0.45, 0.5]}
          material={eyeMat}
        >
          <sphereGeometry args={[0.035, 8, 8]} />
        </mesh>
      </group>

      {/* ════════ SCARF ════════ */}
      <mesh position={[0, 0.33, 0]} rotation={[Math.PI / 2, 0, 0]} material={scarfMat}>
        <torusGeometry args={[0.21, 0.058, 8, 16]} />
      </mesh>
      {/* Scarf dangling tail */}
      <mesh position={[0.15, 0.22, 0.18]} rotation={[0.3, 0, 0.15]} material={scarfMat}>
        <boxGeometry args={[0.07, 0.16, 0.035]} />
      </mesh>
      {/* Scarf stripe detail */}
      <mesh position={[0.15, 0.17, 0.19]} rotation={[0.3, 0, 0.15]}>
        <boxGeometry args={[0.072, 0.02, 0.037]} />
        <meshStandardMaterial color="#b0a48e" roughness={0.8} />
      </mesh>

      {/* ════════ BODY / COAT ════════ */}
      <mesh position={[0, 0.05, 0]} material={coatMat}>
        <cylinderGeometry args={[0.25, 0.29, 0.44, 16]} />
      </mesh>
      {/* Coat center seam */}
      <mesh position={[0, 0.05, 0.27]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.015, 0.38, 0.01]} />
        <meshStandardMaterial color="#8a6b46" roughness={0.7} transparent opacity={0.4} />
      </mesh>
      {/* Buttons */}
      <mesh position={[0, 0.12, 0.27]} material={buttonMat}>
        <sphereGeometry args={[0.022, 6, 6]} />
      </mesh>
      <mesh position={[0, 0.0, 0.29]} material={buttonMat}>
        <sphereGeometry args={[0.022, 6, 6]} />
      </mesh>
      <mesh position={[0, -0.1, 0.29]} material={buttonMat}>
        <sphereGeometry args={[0.018, 6, 6]} />
      </mesh>

      {/* ════════ LEFT ARM ════════ */}
      <group position={[-0.31, 0.08, 0]} rotation={[0, 0, -0.18]}>
        {/* Upper arm */}
        <mesh material={coatMat}>
          <capsuleGeometry args={[0.058, 0.2, 4, 10]} />
        </mesh>
        {/* Hand */}
        <mesh position={[0, -0.17, 0]} material={skinMat}>
          <sphereGeometry args={[0.058, 10, 10]} />
        </mesh>
      </group>

      {/* ════════ RIGHT ARM (animated wave) ════════ */}
      <group ref={rightArmRef} position={[0.31, 0.08, 0]} rotation={[0, 0, 0.15]}>
        <mesh material={coatMat}>
          <capsuleGeometry args={[0.058, 0.2, 4, 10]} />
        </mesh>
        <mesh position={[0, -0.17, 0]} material={skinMat}>
          <sphereGeometry args={[0.058, 10, 10]} />
        </mesh>
      </group>

      {/* ════════ LEGS ════════ */}
      <mesh position={[-0.1, -0.28, 0.04]} rotation={[0.25, 0, 0]} material={pantsMat}>
        <capsuleGeometry args={[0.065, 0.16, 4, 10]} />
      </mesh>
      <mesh position={[0.1, -0.28, 0.04]} rotation={[0.25, 0, 0]} material={pantsMat}>
        <capsuleGeometry args={[0.065, 0.16, 4, 10]} />
      </mesh>

      {/* ════════ SHOES ════════ */}
      <mesh position={[-0.1, -0.43, 0.09]} material={shoeMat}>
        <boxGeometry args={[0.12, 0.055, 0.15]} />
      </mesh>
      <mesh position={[0.1, -0.43, 0.09]} material={shoeMat}>
        <boxGeometry args={[0.12, 0.055, 0.15]} />
      </mesh>
      {/* Shoe toe caps */}
      <mesh position={[-0.1, -0.43, 0.155]}>
        <sphereGeometry args={[0.045, 8, 8]} />
        <meshStandardMaterial color="#3d2f1f" roughness={0.6} />
      </mesh>
      <mesh position={[0.1, -0.43, 0.155]}>
        <sphereGeometry args={[0.045, 8, 8]} />
        <meshStandardMaterial color="#3d2f1f" roughness={0.6} />
      </mesh>

      {/* ════════ HOVERING WHITE CUBE ════════ */}
      <mesh ref={cubeRef} position={[0, -0.74, 0]}>
        <boxGeometry args={[0.48, 0.48, 0.48]} />
        <meshStandardMaterial
          color="#ffffff"
          roughness={0.2}
          metalness={0.1}
          emissive="#f1f5f9"
          emissiveIntensity={0.2}
        />
      </mesh>
      {/* Cube outer subtle glow shell */}
      <mesh position={[0, -0.74, 0]}>
        <boxGeometry args={[0.54, 0.54, 0.54]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.15} roughness={0.1} />
      </mesh>
    </group>
  );
}


// ────────────────────────────────────────────────────────────────
// Outer Wrapper — positions the 3D Canvas as an overlay, handles
// click-to-reset, idle activity cycling, and HTML label overlays.
// ────────────────────────────────────────────────────────────────

export default function MascotHelper({ onResetView }: MascotHelperProps) {
  const [activity, setActivity] = useState<MascotActivity>('sitting');
  const [isJumping, setIsJumping] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // Cycle through random idle activities every 3 – 6.5 s
  useEffect(() => {
    const pool: MascotActivity[] = ['sitting', 'looking', 'sleeping', 'waving', 'stargazing', 'sitting'];
    let tid: ReturnType<typeof setTimeout>;

    const next = () => {
      if (!isJumping) {
        setActivity(pool[Math.floor(Math.random() * pool.length)]);
      }
      tid = setTimeout(next, 3000 + Math.random() * 3500);
    };

    tid = setTimeout(next, 2500);
    return () => clearTimeout(tid);
  }, [isJumping]);

  const handleClick = useCallback(() => {
    if (isJumping) return;
    setIsJumping(true);
    setActivity('jumping');

    setTimeout(() => onResetView(), 280);
    setTimeout(() => {
      setIsJumping(false);
      setActivity('sitting');
    }, 700);
  }, [onResetView, isJumping]);

  const containerAnim = isJumping ? 'mascot-jump' : 'mascot-float';

  return (
    <div
      className="absolute z-20 pointer-events-auto select-none top-14 right-2 sm:top-24 sm:right-6"
    >
      <div
        className={`relative cursor-pointer group ${containerAnim}`}
        onClick={handleClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        title="Click to reset view"
      >
        {/* Tooltip label */}
        {showTooltip && (
          <div
            className="absolute -left-[88px] top-1/2 -translate-y-1/2 bg-slate-900/95 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg border border-white/10 shadow-lg whitespace-nowrap pointer-events-none hidden sm:block"
            style={{ animation: 'fadeInLeft 0.2s ease-out' }}
          >
            Reset View ↻
          </div>
        )}

        {/* Zzz bubbles when sleeping */}
        {activity === 'sleeping' && (
          <div
            className="absolute -top-1 right-0 pointer-events-none"
            style={{ animation: 'zzzFloat 2s ease-in-out infinite' }}
          >
            <span className="text-[10px] sm:text-[11px] font-black text-indigo-300/80"
              style={{ textShadow: '0 0 8px rgba(129,140,248,0.5)' }}>z</span>
            <span className="text-[7px] sm:text-[8px] font-black text-indigo-300/55 ml-0.5 relative -top-1">z</span>
            <span className="text-[5px] sm:text-[6px] font-black text-indigo-300/35 ml-0.5 relative -top-2">z</span>
          </div>
        )}

        {/* Sparkle when stargazing */}
        {activity === 'stargazing' && (
          <div
            className="absolute -top-3 left-1/2 -translate-x-1/2 pointer-events-none"
            style={{ animation: 'starSparkle 1.5s ease-in-out infinite' }}
          >
            <span className="text-[10px] sm:text-[11px]"
              style={{ filter: 'drop-shadow(0 0 5px rgba(250,204,21,0.7))' }}>✦</span>
          </div>
        )}

        {/* ── 3D Canvas ── */}
        <div className="w-[75px] h-[105px] sm:w-[105px] sm:h-[145px] pointer-events-none">
          <Canvas
            camera={{ position: [0, 0, 3.2], fov: 38 }}
            gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }}
            style={{ width: '100%', height: '100%' }}
            dpr={[1, 2]}
          >
            {/* Studio lighting for the mascot */}
            <ambientLight intensity={0.7} />
            <directionalLight position={[3, 5, 5]} intensity={1.4} color="#fff8ee" />
            <pointLight position={[-3, 1, 3]} intensity={0.4} color="#c4b5fd" distance={10} />
            <pointLight position={[0, -2, 2]} intensity={0.3} color="#ffffff" distance={8} />

            <ChibiCharacter3D activity={activity} />
          </Canvas>
        </div>

        {/* Ground shadow glow for white cube */}
        <div
          className="mx-auto rounded-full"
          style={{
            width: '28px',
            height: '6px',
            marginTop: '-6px',
            background: 'radial-gradient(ellipse, rgba(255,255,255,0.35) 0%, transparent 70%)',
            filter: 'blur(3px)',
          }}
        />
      </div>
    </div>
  );
}
