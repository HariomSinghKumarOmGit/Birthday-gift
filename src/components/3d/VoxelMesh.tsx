'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { VoxelData } from '@/types/gift';

interface VoxelMeshProps {
  voxels: VoxelData[];
  isRevealed: boolean;
  onRevealComplete?: () => void;
  cubeSize?: number;
}

// Deterministic pseudo-random number generator to ensure render purity and idempotent animations
function pseudoRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 10000;
  return x - Math.floor(x);
}

export default function VoxelMesh({
  voxels,
  isRevealed,
  onRevealComplete,
  cubeSize = 0.88,
}: VoxelMeshProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const tempObject = useMemo(() => new THREE.Object3D(), []);
  const tempColor = useMemo(() => new THREE.Color(), []);

  // Pre-calculate starting positions for dramatic assembling effect.
  // Uses a spiral-outward pattern so the reveal feels like it converges inward.
  const initialPositions = useMemo(() => {
    return voxels.map((v, i) => {
      // Golden angle spiral for even distribution in 3D space
      const phi = i * 2.39996323; // golden angle ≈ 137.508°
      const rand1 = pseudoRandom(i * 7 + 1);
      const rand2 = pseudoRandom(i * 13 + 3);
      const rand3 = pseudoRandom(i * 17 + 5);
      const rand4 = pseudoRandom(i * 23 + 7);
      const rand5 = pseudoRandom(i * 29 + 11);
      const rand6 = pseudoRandom(i * 31 + 13);

      const radius = 80 + rand1 * 100;
      const theta = Math.acos(1 - 2 * (i / Math.max(1, voxels.length)));

      return {
        x: v.x + radius * Math.sin(theta) * Math.cos(phi),
        y: v.y + radius * Math.sin(theta) * Math.sin(phi),
        z: v.z + radius * Math.cos(theta) + (rand2 - 0.5) * 60,
        rotX: rand3 * Math.PI * 4,
        rotY: rand4 * Math.PI * 4,
        rotZ: rand5 * Math.PI * 4,
        // Stagger delay based on distance from center for a "wave" reveal
        delay: Math.sqrt(v.x * v.x + v.y * v.y) / 200 + rand6 * 0.15,
      };
    });
  }, [voxels]);

  // Initialize colors and hidden start state
  useEffect(() => {
    if (!meshRef.current) return;

    voxels.forEach((voxel, index) => {
      // Apply sRGB-correct color with slight gamma boost for vibrancy
      const r = Math.pow(voxel.r / 255, 0.95);
      const g = Math.pow(voxel.g / 255, 0.95);
      const b = Math.pow(voxel.b / 255, 0.95);
      tempColor.setRGB(r, g, b);
      meshRef.current?.setColorAt(index, tempColor);

      // Start tiny and scattered
      const init = initialPositions[index];
      const startScale = (voxel.size || 1.0) * cubeSize * 0.005;
      tempObject.position.set(init.x, init.y, init.z);
      tempObject.rotation.set(init.rotX, init.rotY, init.rotZ);
      tempObject.scale.set(startScale, startScale, startScale);
      tempObject.updateMatrix();
      meshRef.current?.setMatrixAt(index, tempObject.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  }, [voxels, initialPositions, tempColor, tempObject, cubeSize]);

  // GSAP animation: single tween drives the entire InstancedMesh for 60fps
  useEffect(() => {
    if (!meshRef.current || !isRevealed) return;

    const progress = { value: 0 };
    const n = voxels.length;

    // Normalize delays so max delay = 1
    const maxDelay = Math.max(...initialPositions.map(p => p.delay));
    const normDelays = initialPositions.map(p => maxDelay > 0 ? p.delay / maxDelay : 0);

    gsap.to(progress, {
      value: 1,
      duration: 3.0,
      ease: 'power3.out',
      onUpdate: () => {
        if (!meshRef.current) return;
        const p = progress.value;

        for (let i = 0; i < n; i++) {
          const target = voxels[i];
          const init = initialPositions[i];
          const size = (target.size || 1.0) * cubeSize;
          const delay = normDelays[i];

          // Per-voxel eased progress with stagger
          const delayedP = Math.min(1, Math.max(0, (p - delay * 0.35) / (1 - delay * 0.35)));
          // Quartic ease-out: fast snap then gentle settle
          const t = delayedP;
          const easeP = 1 - Math.pow(1 - t, 4);

          // Interpolate position
          const curX = init.x + (target.x - init.x) * easeP;
          const curY = init.y + (target.y - init.y) * easeP;
          const curZ = init.z + (target.z - init.z) * easeP;

          // Rotation decays to zero
          const curRotX = init.rotX * (1 - easeP);
          const curRotY = init.rotY * (1 - easeP);
          const curRotZ = init.rotZ * (1 - easeP);

          // Scale eases in with a very subtle overshoot bounce at the end
          const overshoot = easeP > 0.9 ? 1.0 + 0.04 * Math.sin((easeP - 0.9) * Math.PI * 10) : easeP;
          const curScale = overshoot * size;

          tempObject.position.set(curX, curY, curZ);
          tempObject.rotation.set(curRotX, curRotY, curRotZ);
          tempObject.scale.set(curScale, curScale, curScale);
          tempObject.updateMatrix();
          meshRef.current.setMatrixAt(i, tempObject.matrix);
        }

        meshRef.current.instanceMatrix.needsUpdate = true;
      },
      onComplete: () => {
        if (onRevealComplete) onRevealComplete();
      },
    });
  }, [isRevealed, voxels, initialPositions, tempObject, onRevealComplete, cubeSize]);

  // Use RoundedBoxGeometry for softer, more premium look
  const geometry = useMemo(() => {
    const geo = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
    // Bevel the edges slightly by adjusting normals for smoother shading
    geo.computeVertexNormals();
    return geo;
  }, [cubeSize]);

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, undefined, voxels.length]}
      castShadow
      receiveShadow
    >
      <meshPhysicalMaterial
        roughness={0.3}
        metalness={0.08}
        clearcoat={0.15}
        clearcoatRoughness={0.4}
        envMapIntensity={0.6}
      />
    </instancedMesh>
  );
}
