"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { MutableRefObject, PointerEvent as ReactPointerEvent } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  AdaptiveDpr,
  AdaptiveEvents,
  PerformanceMonitor,
} from "@react-three/drei";
import type { BufferGeometry, Group, Mesh } from "three";
import { AdditiveBlending, BufferAttribute, DoubleSide } from "three";

type QualityTier = "low" | "medium" | "high";

type HeroSceneProps = {
  active: boolean;
  reducedMotion: boolean;
  quality: QualityTier;
};

type NodeSpec = {
  radius: number;
  height: number;
  speed: number;
  phase: number;
  band: number;
};

type PointerRef = {
  x: number;
  y: number;
};

function buildNodes(count: number): NodeSpec[] {
  return Array.from({ length: count }, (_, index) => {
    const band = index % 3;
    return {
      radius: 2.2 + band * 1.05 + (index % 4) * 0.03,
      height: 0.28 + band * 0.18,
      speed: 0.18 + band * 0.08 + (index % 5) * 0.01,
      phase: index * 0.48,
      band,
    };
  });
}

function buildConnections(count: number): Array<[number, number]> {
  const pairs: Array<[number, number]> = [];

  for (let index = 0; index < count; index += 1) {
    pairs.push([index, (index + 1) % count]);
    if (index % 3 === 0) {
      pairs.push([index, (index + 4) % count]);
    }
    if (index % 5 === 0) {
      pairs.push([index, (index + 7) % count]);
    }
  }

  return pairs;
}

function Constellation({
  reducedMotion,
  quality,
  pointerTarget,
}: {
  reducedMotion: boolean;
  quality: QualityTier;
  pointerTarget: MutableRefObject<PointerRef>;
}) {
  const groupRef = useRef<Group>(null!);
  const coreRef = useRef<Mesh>(null!);
  const pointsGeometryRef = useRef<BufferGeometry>(null!);
  const linesGeometryRef = useRef<BufferGeometry>(null!);

  const nodeCount = quality === "high" ? 96 : quality === "medium" ? 68 : 40;
  const nodes = useMemo(() => buildNodes(nodeCount), [nodeCount]);
  const connections = useMemo(() => buildConnections(nodeCount), [nodeCount]);
  const nodePositions = useMemo(() => new Float32Array(nodeCount * 3), [nodeCount]);
  const linePositions = useMemo(
    () => new Float32Array(connections.length * 2 * 3),
    [connections.length]
  );
  const coreDetail = quality === "high" ? 2 : quality === "medium" ? 1 : 0;

  useEffect(() => {
    if (pointsGeometryRef.current) {
      pointsGeometryRef.current.setAttribute("position", new BufferAttribute(nodePositions, 3));
    }
    if (linesGeometryRef.current) {
      linesGeometryRef.current.setAttribute("position", new BufferAttribute(linePositions, 3));
    }
  }, [linePositions, nodePositions]);

  useFrame((state, delta) => {
    const pointer = pointerTarget.current;
    const damp = reducedMotion ? 0.04 : 0.08;
    const cameraZ = quality === "low" ? 7.6 : 7.0;

    state.camera.position.x += (pointer.x * 0.55 - state.camera.position.x) * damp;
    state.camera.position.y += ((0.3 + pointer.y * 0.28) - state.camera.position.y) * damp;
    state.camera.position.z += (cameraZ - state.camera.position.z) * 0.03;
    state.camera.lookAt(0, 0, 0);

    if (groupRef.current) {
      groupRef.current.rotation.y += delta * (reducedMotion ? 0.02 : 0.07);
      groupRef.current.rotation.x =
        Math.sin(state.clock.elapsedTime * 0.12) * 0.09 + pointer.y * 0.05;
    }

    if (coreRef.current) {
      coreRef.current.rotation.x += delta * 0.12;
      coreRef.current.rotation.y += delta * 0.15;
    }

    const elapsed = state.clock.elapsedTime;

    nodes.forEach((node, index) => {
      const wave = Math.sin(elapsed * node.speed + node.phase);
      const swirl = Math.cos(elapsed * node.speed * 1.3 + node.phase * 0.6);
      const radius = node.radius + wave * 0.18;
      const x = Math.cos(elapsed * node.speed + node.phase) * radius;
      const y =
        Math.sin(elapsed * node.speed * 1.5 + node.phase * 0.9) * node.height +
        Math.sin(elapsed * 0.55 + node.phase) * 0.06;
      const z =
        Math.sin(elapsed * node.speed + node.phase) * radius * 0.24 +
        swirl * 0.12 * (node.band - 1);

      const offset = index * 3;
      nodePositions[offset] = x;
      nodePositions[offset + 1] = y;
      nodePositions[offset + 2] = z;
    });

    if (pointsGeometryRef.current?.attributes.position) {
      pointsGeometryRef.current.attributes.position.needsUpdate = true;
    }

    connections.forEach(([start, end], index) => {
      const startOffset = start * 3;
      const endOffset = end * 3;
      const lineOffset = index * 6;

      linePositions[lineOffset] = nodePositions[startOffset];
      linePositions[lineOffset + 1] = nodePositions[startOffset + 1];
      linePositions[lineOffset + 2] = nodePositions[startOffset + 2];
      linePositions[lineOffset + 3] = nodePositions[endOffset];
      linePositions[lineOffset + 4] = nodePositions[endOffset + 1];
      linePositions[lineOffset + 5] = nodePositions[endOffset + 2];
    });

    if (linesGeometryRef.current?.attributes.position) {
      linesGeometryRef.current.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group ref={groupRef} position={[-1.25, -0.08, 0]}>
      <mesh ref={coreRef} scale={1.28} rotation={[0.12, -0.2, 0]}>
        <icosahedronGeometry args={[1.15, coreDetail]} />
        <meshPhysicalMaterial
          color="#11dfff"
          emissive="#003cff"
          emissiveIntensity={0.45}
          metalness={0.7}
          roughness={0.24}
          clearcoat={1}
          clearcoatRoughness={0.12}
          flatShading
        />
      </mesh>

      <mesh scale={1.44} rotation={[0.12, -0.2, 0]}>
        <icosahedronGeometry args={[1.15, Math.max(0, coreDetail - 1)]} />
        <meshPhysicalMaterial
          color="#00f0ff"
          transparent
          opacity={0.16}
          metalness={0.2}
          roughness={0.75}
          emissive="#0019ff"
          emissiveIntensity={0.2}
          side={DoubleSide}
        />
      </mesh>

      <mesh scale={1.58} rotation={[0.12, -0.2, 0]}>
        <icosahedronGeometry args={[1.15, 0]} />
        <meshBasicMaterial
          color="#8efcff"
          transparent
          opacity={0.06}
          wireframe
        />
      </mesh>

      <points>
        <bufferGeometry ref={pointsGeometryRef} />
        <pointsMaterial
          color="#b9fbff"
          size={quality === "high" ? 0.04 : 0.06}
          sizeAttenuation
          transparent
          opacity={0.18}
          blending={AdditiveBlending}
        />
      </points>

      <lineSegments>
        <bufferGeometry ref={linesGeometryRef} />
        <lineBasicMaterial
          color="#0055ff"
          transparent
          opacity={0.16}
          blending={AdditiveBlending}
        />
      </lineSegments>
    </group>
  );
}

export function HeroScene({ active, reducedMotion, quality }: HeroSceneProps) {
  const pointerTarget = useRef<PointerRef>({ x: 0, y: 0 });
  const [liveQuality, setLiveQuality] = useState<QualityTier>(quality);
  const dprCap = liveQuality === "high" ? 1.5 : liveQuality === "medium" ? 1.25 : 1;

  useEffect(() => {
    setLiveQuality(quality);
  }, [quality]);

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
    pointerTarget.current = { x, y };
  };

  const handlePointerLeave = () => {
    pointerTarget.current = { x: 0, y: 0 };
  };

  return (
      <Canvas
      dpr={[1, dprCap]}
      frameloop={active ? "always" : "demand"}
      gl={{
        alpha: true,
        antialias: liveQuality !== "low",
        depth: true,
        stencil: false,
        powerPreference: "high-performance",
      }}
      camera={{ position: [0, 0, 7], fov: 42 }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="h-full w-full"
      style={{ touchAction: "pan-y" }}
      >
      <color attach="background" args={["#030305"]} />
      <ambientLight intensity={2.2} />
      <directionalLight position={[5, 7, 10]} intensity={3.4} color="#ffffff" />
      <directionalLight position={[-4, 1.5, -6]} intensity={1.8} color="#00f0ff" />
      <pointLight position={[-5, -1.5, 4]} intensity={2.2} color="#0055ff" />
      <AdaptiveDpr pixelated={liveQuality === "low"} />
      <AdaptiveEvents />
      <PerformanceMonitor
        onDecline={() => {
          setLiveQuality((current) => (current === "high" ? "medium" : "low"));
        }}
        onIncline={() => {
          setLiveQuality((current) => (current === "low" ? "medium" : "high"));
        }}
      />
      <Constellation
        reducedMotion={reducedMotion}
        quality={liveQuality}
        pointerTarget={pointerTarget}
      />
    </Canvas>
  );
}
