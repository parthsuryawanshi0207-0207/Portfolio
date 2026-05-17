import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Center, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { portfolioData } from '../data';
import { playSwellSound } from '../utils/audio';
import { isTouchDevice, useGyroscope } from '../utils/gyroscope';

const useMouseInteraction = () => {
  const isDown = useRef(false);
  useEffect(() => {
    if (isTouchDevice()) {
      // Mobile: long-press (300ms hold) activates black hole
      let longPressTimer: ReturnType<typeof setTimeout>;
      const handleTouchStart = () => {
        longPressTimer = setTimeout(() => {
          isDown.current = true;
          playSwellSound();
        }, 300);
      };
      const handleTouchEnd = () => {
        clearTimeout(longPressTimer);
        isDown.current = false;
      };
      window.addEventListener('touchstart', handleTouchStart);
      window.addEventListener('touchend', handleTouchEnd);
      window.addEventListener('touchcancel', handleTouchEnd);
      return () => {
        window.removeEventListener('touchstart', handleTouchStart);
        window.removeEventListener('touchend', handleTouchEnd);
        window.removeEventListener('touchcancel', handleTouchEnd);
      };
    } else {
      // Desktop: click-hold
      const handleDown = () => { isDown.current = true; playSwellSound(); };
      const handleUp = () => { isDown.current = false; };
      window.addEventListener('pointerdown', handleDown);
      window.addEventListener('pointerup', handleUp);
      window.addEventListener('pointerleave', handleUp);
      return () => {
        window.removeEventListener('pointerdown', handleDown);
        window.removeEventListener('pointerup', handleUp);
        window.removeEventListener('pointerleave', handleUp);
      };
    }
  }, []);
  return isDown;
};

const CameraRig = () => {
  const { tilt } = useGyroscope();
  useFrame((state) => {
    if (isTouchDevice()) {
      // Mobile: gyroscope drives the camera (gamma = left/right, beta = fwd/back)
      const targetX = THREE.MathUtils.clamp(tilt.gamma / 30, -1, 1) * -2.5;
      const targetY = THREE.MathUtils.clamp((tilt.beta - 45) / 30, -1, 1) * -2.5;
      state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, targetX, 0.05);
      state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, targetY, 0.05);
    } else {
      // Desktop: mouse drives the camera
      state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, -state.mouse.x * 2.5, 0.05);
      state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, -state.mouse.y * 2.5, 0.05);
    }
    state.camera.lookAt(0, 0, 0);
  });
  return null;
};

// Matrix Easter Egg — type 'matrix' anywhere to toggle
const useMatrixEasterEgg = () => {
  const isMatrix = useRef(false);
  useEffect(() => {
    const sequence = 'matrix';
    let progress = '';
    const handler = (e: KeyboardEvent) => {
      // Escape always exits Matrix mode
      if (e.key === 'Escape' && isMatrix.current) {
        isMatrix.current = false;
        window.dispatchEvent(new CustomEvent('matrixtoggle', { detail: false }));
        document.body.style.setProperty('--accent-color', '#00f0ff');
        progress = '';
        return;
      }
      progress += e.key.toLowerCase();
      if (progress.length > sequence.length) progress = progress.slice(-sequence.length);
      if (progress === sequence) {
        isMatrix.current = !isMatrix.current;
        window.dispatchEvent(new CustomEvent('matrixtoggle', { detail: isMatrix.current }));
        document.body.style.setProperty('--accent-color', isMatrix.current ? '#00ff41' : '#00f0ff');
        progress = '';
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);
  return isMatrix;
};

const UnifiedParticleSystem = () => {
  const pointsRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);
  const { viewport, mouse } = useThree();
  const isMouseDown = useMouseInteraction();
  const isMatrix = useMatrixEasterEgg();

  // Don't interact until user actually moves the mouse — avoids
  // particles scattering at startup when mouse idles on the name
  const hasMoved = useRef(false);
  useEffect(() => {
    const onMove = () => { hasMoved.current = true; };
    window.addEventListener('mousemove', onMove, { once: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  // Ripple: track single-click origin and time
  const ripple = useRef<{ mx: number; my: number; startTime: number } | null>(null);
  useEffect(() => {
    let downTime = 0;
    const onDown = () => { downTime = Date.now(); };
    const onUp = (e: PointerEvent) => {
      // Only fire ripple for quick taps (< 300ms), not holds
      if (Date.now() - downTime < 300) {
        const rect = (e.target as HTMLElement)?.getBoundingClientRect?.() ?? { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
        const ndcX = ((e.clientX / window.innerWidth) * 2 - 1);
        const ndcY = -((e.clientY / window.innerHeight) * 2 - 1);
        ripple.current = { mx: ndcX * viewport.width / 2, my: ndcY * viewport.height / 2, startTime: Date.now() };
      }
    };
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);
    return () => { window.removeEventListener('pointerdown', onDown); window.removeEventListener('pointerup', onUp); };
  }, [viewport]);

  const [positions, colors, targetPositions, velocities, totalCount, textCount, linePositions, lineColors] = useMemo(() => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    canvas.width = 1000;
    canvas.height = 400;

    if (ctx) {
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Small greeting text
      ctx.font = '400 40px "Outfit", sans-serif';
      ctx.fillText("hey there Its", canvas.width / 2, canvas.height / 2 - 80);

      // Big cursive name
      ctx.font = 'normal 180px "Brush Script MT", "Segoe Script", "Apple Chancery", cursive';
      ctx.fillText("Parth", canvas.width / 2, canvas.height / 2 + 40);
    }

    const textCoordinates = ctx ? ctx.getImageData(0, 0, canvas.width, canvas.height).data : new Uint8ClampedArray(0);
    const validPixels: { x: number, y: number }[] = [];

    // Dense sampling for text
    for (let y = 0; y < canvas.height; y += 2) {
      for (let x = 0; x < canvas.width; x += 2) {
        const index = (y * canvas.width + x) * 4;
        if (textCoordinates[index + 3] > 128) {
          validPixels.push({ x, y });
        }
      }
    }

    const safeTextCount = Math.max(validPixels.length, 1);
    const ambientCount = 800; // Reduced for Line calculation performance
    const totalCount = safeTextCount + ambientCount;

    const positions = new Float32Array(totalCount * 3);
    const colors = new Float32Array(totalCount * 3);
    const targetPositions = new Float32Array(totalCount * 3);
    const velocities = new Float32Array(totalCount * 3);

    // Calculate maximum possible lines between ambient particles
    const maxLines = (ambientCount * (ambientCount - 1)) / 2;
    const linePositions = new Float32Array(maxLines * 6);
    const lineColors = new Float32Array(maxLines * 6);

    const scale = 0.015;
    const offsetX = canvas.width / 2;
    const offsetY = canvas.height / 2;

    // 1. Generate Text Particles
    for (let i = 0; i < safeTextCount; i++) {
      const pixel = validPixels.length > 0 ? validPixels[i] : { x: offsetX, y: offsetY };

      const tx = (pixel.x - offsetX) * scale;
      const ty = -(pixel.y - offsetY) * scale;
      const tz = 0;

      // Start completely scattered for intro animation
      positions[i * 3] = tx + (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = ty + (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;

      targetPositions[i * 3] = tx;
      targetPositions[i * 3 + 1] = ty;
      targetPositions[i * 3 + 2] = tz;

      // Deep cyan to purple gradient
      const normalizedX = pixel.x / canvas.width;
      colors[i * 3] = 0.2 + (normalizedX * 0.8);
      colors[i * 3 + 1] = 0.8 - (normalizedX * 0.4);
      colors[i * 3 + 2] = 1.0;

      velocities[i * 3] = 0;
      velocities[i * 3 + 1] = 0;
      velocities[i * 3 + 2] = 0;
    }

    // 2. Generate Ambient Particles
    for (let i = safeTextCount; i < totalCount; i++) {
      // Scatter widely across the screen
      const tx = (Math.random() - 0.5) * 30;
      const ty = (Math.random() - 0.5) * 30;
      const tz = (Math.random() - 0.5) * 30;

      positions[i * 3] = tx;
      positions[i * 3 + 1] = ty;
      positions[i * 3 + 2] = tz;

      targetPositions[i * 3] = tx;
      targetPositions[i * 3 + 1] = ty;
      targetPositions[i * 3 + 2] = tz;

      // Ambient particles are white or slightly themed
      const isAccent = Math.random() > 0.8;
      colors[i * 3] = isAccent ? 0.2 : 1.0;
      colors[i * 3 + 1] = isAccent ? 0.8 : 1.0;
      colors[i * 3 + 2] = 1.0;

      velocities[i * 3] = 0;
      velocities[i * 3 + 1] = 0;
      velocities[i * 3 + 2] = 0;
    }

    return [positions, colors, targetPositions, velocities, totalCount, safeTextCount, linePositions, lineColors];
  }, []);

  const tempColor = useMemo(() => new THREE.Color(), []);

  useFrame((state) => {
    if (!pointsRef.current || !linesRef.current || !linesRef.current.geometry.attributes.color) return;

    const time = state.clock.getElapsedTime();
    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
    const colors = pointsRef.current.geometry.attributes.color.array as Float32Array;
    const lPos = linesRef.current.geometry.attributes.position.array as Float32Array;
    const lCol = linesRef.current.geometry.attributes.color.array as Float32Array;

    // Convert 2D mouse (-1 to 1) to 3D world coordinates.
    // Park far off-screen until the user actually moves the mouse.
    const mx = hasMoved.current ? (mouse.x * viewport.width) / 2 : 0;
    const my = hasMoved.current ? (mouse.y * viewport.height) / 2 : -999;

    // Ripple shockwave: expand outward at ~2 units/frame, decay after 1.5s
    const rippleAge = ripple.current ? (Date.now() - ripple.current.startTime) / 1000 : Infinity;
    const rippleRadius = rippleAge * 6; // expands at 6 world-units/sec
    const rippleActive = ripple.current && rippleAge < 1.2;
    if (rippleAge >= 1.2) ripple.current = null;

    for (let i = 0; i < totalCount; i++) {
      const i3 = i * 3;

      const tx = targetPositions[i3];
      const ty = targetPositions[i3 + 1];
      const tz = targetPositions[i3 + 2];

      const cx = positions[i3];
      const cy = positions[i3 + 1];
      const cz = positions[i3 + 2];

      let vx = velocities[i3];
      let vy = velocities[i3 + 1];
      let vz = velocities[i3 + 2];

      const dx = cx - mx;
      const dy = cy - my;
      const distToMouse = Math.sqrt(dx * dx + dy * dy);
      const angleToMouse = Math.atan2(dy, dx);

      // --- RIPPLE SHOCKWAVE ---
      if (rippleActive && ripple.current) {
        const rdx = cx - ripple.current.mx;
        const rdy = cy - ripple.current.my;
        const rdist = Math.sqrt(rdx * rdx + rdy * rdy);
        const waveWidth = 1.5;
        const diff = Math.abs(rdist - rippleRadius);
        if (diff < waveWidth) {
          const force = (1 - diff / waveWidth) * 1.8 * (1 - rippleAge / 1.2);
          const angle = Math.atan2(rdy, rdx);
          vx += Math.cos(angle) * force;
          vy += Math.sin(angle) * force;
        }
      }

      if (isMouseDown.current) {
        // --- POINT SIZE BLACK HOLE (SINGULARITY) ---
        // Use normalized vectors so the particles travel at a constant speed.
        // Drastically reduced speed to match the slow return step
        const safeDist = Math.max(distToMouse, 0.01);
        const inwardSpeed = 0.005;
        vx -= (dx / safeDist) * inwardSpeed;
        vy -= (dy / safeDist) * inwardSpeed;

        // Very slow, gentle swirl
        const swirlSpeed = 0.01;
        vx -= Math.sin(angleToMouse) * swirlSpeed;
        vy += Math.cos(angleToMouse) * swirlSpeed;

        // Perfect compression into a single mathematical point size (z=0)
        vz += (0 - cz) * 0.1;

        // Teleportation event horizon
        if (distToMouse < 0.2) {
          const spawnAngle = Math.random() * Math.PI * 2;
          // Spawn strictly INSIDE the visible screen edges (6 to 8 units)
          // This guarantees the screen never looks "blank" when they teleport
          const spawnRadius = 6 + Math.random() * 2;
          positions[i3] = mx + Math.cos(spawnAngle) * spawnRadius;
          positions[i3 + 1] = my + Math.sin(spawnAngle) * spawnRadius;
          positions[i3 + 2] = (Math.random() - 0.5) * 5;

          vx = 0; vy = 0; vz = 0;
        }

      } else {
        // --- STANDARD PHYSICS ---
        const radius = 1.2; // Interaction pointer size
        if (distToMouse < radius) {
          const force = (radius - distToMouse) / radius;
          // Push outward gently
          vx += Math.cos(angleToMouse) * force * 0.12;
          vy += Math.sin(angleToMouse) * force * 0.12;
          // Bulge towards camera
          vz += force * 0.4;
        }

        // Text particles snap back fast; ambient particles drift back slowly
        const returnSpeed = i < textCount ? 0.018 : 0.002;
        vx += (tx - cx) * returnSpeed;
        vy += (ty - cy) * returnSpeed;
        vz += (tz - cz) * returnSpeed;

        // Ambient particles (i >= textCount) get a slow drift so they aren't totally frozen
        if (i >= textCount) {
          vx += Math.sin(time * 0.5 + i) * 0.005;
          vy += Math.cos(time * 0.5 + i) * 0.005;
        }
      }

      // Physics Friction
      vx *= 0.82;
      vy *= 0.82;
      vz *= 0.82;

      velocities[i3] = vx;
      velocities[i3 + 1] = vy;
      velocities[i3 + 2] = vz;

      positions[i3] += vx;
      positions[i3 + 1] += vy;
      positions[i3 + 2] += vz;

      // Dynamic color shifting — Matrix override or normal rainbow text
      if (isMatrix.current) {
        // Matrix: all particles neon green and raining downward
        // Matrix active: hide all particles (2D canvas overlay handles the visuals)
        colors[i3] = 0;
        colors[i3 + 1] = 0;
        colors[i3 + 2] = 0;
      } else if (i < textCount) {
        // Normal: flowing rainbow wave across the name
        const normalizedX = (tx + 10) / 20;
        const hue = (normalizedX * 0.5 + time * 0.5) % 1.0;
        tempColor.setHSL(hue, 0.9, 0.6);
        colors[i3] = tempColor.r;
        colors[i3 + 1] = tempColor.g;
        colors[i3 + 2] = tempColor.b;
      }
    }

    // --- CONSTELLATION LINE CALCULATION ---
    let lineIdx = 0;

    // Skip all line drawing while Matrix rain overlay is active
    if (!isMatrix.current) {
      for (let i = textCount; i < totalCount; i++) {
        const ix = positions[i * 3];
        const iy = positions[i * 3 + 1];
        const iz = positions[i * 3 + 2];

        for (let j = i + 1; j < totalCount; j++) {
          const jx = positions[j * 3];
          const jy = positions[j * 3 + 1];
          const jz = positions[j * 3 + 2];

          const dx = ix - jx;
          const dy = iy - jy;
          const dz = iz - jz;
          const distSq = dx * dx + dy * dy + dz * dz;

          if (distSq < 12.25 && lineIdx < 90000) {
            const dist = Math.sqrt(distSq);
            const midX = (ix + jx) / 2;
            const lineHue = ((midX + 15) / 30 + time * 0.4) % 1.0;
            tempColor.setHSL(lineHue, 0.9, 0.6);
            const intensity = Math.pow(1.0 - (dist / 3.5), 2) * 0.5;
            const r = tempColor.r * intensity;
            const g = tempColor.g * intensity;
            const b = tempColor.b * intensity;

            lPos[lineIdx] = ix; lPos[lineIdx + 1] = iy; lPos[lineIdx + 2] = iz;
            lCol[lineIdx] = r; lCol[lineIdx + 1] = g; lCol[lineIdx + 2] = b;
            lineIdx += 3;
            lPos[lineIdx] = jx; lPos[lineIdx + 1] = jy; lPos[lineIdx + 2] = jz;
            lCol[lineIdx] = r; lCol[lineIdx + 1] = g; lCol[lineIdx + 2] = b;
            lineIdx += 3;
          }
        }
      }
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    pointsRef.current.geometry.attributes.color.needsUpdate = true;
    linesRef.current.geometry.attributes.position.needsUpdate = true;
    linesRef.current.geometry.attributes.color.needsUpdate = true;
    // Draw 2 points per line segment (lineIdx is the number of floats, so divide by 3 for points)
    linesRef.current.geometry.setDrawRange(0, lineIdx / 3);
  });

  return (
    <group>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={totalCount}
            array={positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={totalCount}
            array={colors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.035}
          vertexColors
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={linePositions.length / 3}
            array={linePositions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={lineColors.length / 3}
            array={lineColors}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial
          vertexColors
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>
    </group>
  );
};

export const Scene3D = () => {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 0, background: 'var(--bg-color)', pointerEvents: 'auto' }}>
      <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
        <CameraRig />
        <color attach="background" args={['#050505']} />
        <ambientLight intensity={0.5} />
        <Center>
          <UnifiedParticleSystem />
        </Center>
        <Environment preset="city" />
      </Canvas>
    </div>
  );
};
