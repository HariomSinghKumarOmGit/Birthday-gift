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

export default function VoxelMesh({
  voxels,
  isRevealed,
  onRevealComplete,
  cubeSize = 0.9,
}: VoxelMeshProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const tempObject = useMemo(() => new THREE.Object3D(), []);
  const tempColor = useMemo(() => new THREE.Color(), []);

  // Pre-calculate randomized starting positions for dramatic explosive assembling effect
  const initialPositions = useMemo(() => {
    return voxels.map((v) => ({
      x: v.x + (Math.random() - 0.5) * 120,
      y: v.y + (Math.random() - 0.5) * 120,
      z: v.z + (Math.random() - 0.5) * 160,
      rotX: Math.random() * Math.PI * 2,
      rotY: Math.random() * Math.PI * 2,
      rotZ: Math.random() * Math.PI * 2,
      delay: Math.random() * 0.4, // micro staggered feel
    }));
  }, [voxels]);

  // Set up instance colors and initial hidden states once on mount
  useEffect(() => {
    if (!meshRef.current) return;

    voxels.forEach((voxel, index) => {
      // Set RGB color per instance cube
      tempColor.setRGB(voxel.r / 255, voxel.g / 255, voxel.b / 255);
      meshRef.current?.setColorAt(index, tempColor);

      // Initialize positioning with adaptive target sizing
      const init = initialPositions[index];
      const targetSize = (voxel.size || 1.0) * cubeSize * 0.01;
      tempObject.position.set(init.x, init.y, init.z);
      tempObject.rotation.set(init.rotX, init.rotY, init.rotZ);
      tempObject.scale.set(targetSize, targetSize, targetSize);
      tempObject.updateMatrix();
      meshRef.current?.setMatrixAt(index, tempObject.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  }, [voxels, initialPositions, tempColor, tempObject, cubeSize]);

  // Handle high-performance single GSAP tween loop to animate thousands of instances seamlessly at 60fps
  useEffect(() => {
    if (!meshRef.current || !isRevealed) return;

    const progress = { value: 0 };

    gsap.to(progress, {
      value: 1,
      duration: 2.4,
      ease: 'expo.out',
      onUpdate: () => {
        if (!meshRef.current) return;
        const p = progress.value;

        for (let i = 0; i < voxels.length; i++) {
          const target = voxels[i];
          const init = initialPositions[i];
          const size = (target.size || 1.0) * cubeSize;

          // Calculate easing per voxel based on micro-delay
          const localP = Math.min(1, Math.max(0, (p - init.delay * 0.3) / (1 - init.delay * 0.3)));
          // cubic ease out for individual cube snap
          const easeP = 1 - Math.pow(1 - localP, 3);

          const curX = init.x + (target.x - init.x) * easeP;
          const curY = init.y + (target.y - init.y) * easeP;
          const curZ = init.z + (target.z - init.z) * easeP;

          const curRotX = init.rotX * (1 - easeP);
          const curRotY = init.rotY * (1 - easeP);
          const curRotZ = init.rotZ * (1 - easeP);

          const curScale = easeP * size;

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
  }, [isRevealed, voxels, initialPositions, tempObject, onRevealComplete]);

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, voxels.length]}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[cubeSize, cubeSize, cubeSize]} />
      <meshStandardMaterial
        roughness={0.25}
        metalness={0.15}
      />
    </instancedMesh>
  );
}
