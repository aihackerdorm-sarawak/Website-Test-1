"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { MutableRefObject, PointerEvent as ReactPointerEvent } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  AdaptiveDpr,
  AdaptiveEvents,
  PerformanceMonitor,
} from "@react-three/drei";
import type { BufferGeometry, ShaderMaterial } from "three";
import { AdditiveBlending, BufferAttribute, Plane, Vector2, Vector3 } from "three";

type QualityTier = "low" | "medium" | "high";

type CountdownSceneProps = {
  active: boolean;
  reducedMotion: boolean;
  quality: QualityTier;
};

type CountdownValue = {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
};

type GlyphPoint = [number, number];

type CountdownSettings = {
  resolution: number;
  particlesPerGlyph: number;
  glyphWidth: number;
  glyphHeight: number;
  glyphWidthScale: number;
  digitStep: number;
  groupSpacingX: number;
  groupSpacingY: number;
  separatorGapX: number;
  separatorGapY: number;
  separatorWidth: number;
  separatorHeight: number;
  pointSizeMin: number;
  pointSizeMax: number;
  pointSizeScale: number;
};

type ParticleSystem = {
  positions: Float32Array;
  targets: Float32Array;
  colors: Float32Array;
  sizes: Float32Array;
  count: number;
};

type LayoutItem = {
  char: string;
  originX: number;
  originY: number;
  scaleX: number;
  scaleY: number;
  sampleCount: number;
};

const EVENT_START = new Date("2026-10-14T09:00:00");

const vertexShader = `
attribute float aSize;
attribute vec3 aColor;

varying vec3 vColor;

uniform float uTime;
uniform float uPointScale;

void main() {
  vColor = aColor;

  vec3 displaced = position;
  displaced.z += sin(uTime * 1.15 + position.x * 0.85 + position.y * 1.1) * 0.022;

  vec4 mvPosition = modelViewMatrix * vec4(displaced, 1.0);
  float perspective = 240.0 / max(0.001, -mvPosition.z);

  gl_PointSize = aSize * uPointScale * perspective;
  gl_Position = projectionMatrix * mvPosition;
}
`;

const fragmentShader = `
varying vec3 vColor;

void main() {
  vec2 uv = gl_PointCoord - vec2(0.5);
  float dist = length(uv);
  float core = 1.0 - smoothstep(0.0, 0.48, dist);
  float glow = 1.0 - smoothstep(0.18, 0.5, dist);
  float alpha = core * 0.72 + glow * 0.28;

  gl_FragColor = vec4(vColor, alpha);
}
`;

function useCountdown(target: Date) {
  const [remaining, setRemaining] = useState(() =>
    Math.max(0, target.getTime() - Date.now())
  );

  useEffect(() => {
    const id = window.setInterval(() => {
      setRemaining(Math.max(0, target.getTime() - Date.now()));
    }, 1000);

    return () => window.clearInterval(id);
  }, [target]);

  const totalSeconds = Math.floor(remaining / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    days: String(days).padStart(2, "0"),
    hours: String(hours).padStart(2, "0"),
    minutes: String(minutes).padStart(2, "0"),
    seconds: String(seconds).padStart(2, "0"),
  };
}

function getSettings(quality: QualityTier): CountdownSettings {
  if (quality === "high") {
    return {
      resolution: 80,
      particlesPerGlyph: 224,
      glyphWidth: 0.52,
      glyphHeight: 0.92,
      glyphWidthScale: 1.38,
      digitStep: 0.58,
      groupSpacingX: 1.86,
      groupSpacingY: 1.08,
      separatorGapX: 0.82,
      separatorGapY: 0.78,
      separatorWidth: 0.2,
      separatorHeight: 0.58,
      pointSizeMin: 0.03,
      pointSizeMax: 0.064,
      pointSizeScale: 4.25,
    };
  }

  if (quality === "low") {
    return {
      resolution: 44,
      particlesPerGlyph: 128,
      glyphWidth: 0.48,
      glyphHeight: 0.88,
      glyphWidthScale: 1.32,
      digitStep: 0.54,
      groupSpacingX: 1.74,
      groupSpacingY: 1.0,
      separatorGapX: 0.78,
      separatorGapY: 0.72,
      separatorWidth: 0.18,
      separatorHeight: 0.5,
      pointSizeMin: 0.028,
      pointSizeMax: 0.058,
      pointSizeScale: 3.7,
    };
  }

  return {
    resolution: 64,
    particlesPerGlyph: 176,
    glyphWidth: 0.5,
    glyphHeight: 0.9,
    glyphWidthScale: 1.34,
    digitStep: 0.56,
    groupSpacingX: 1.82,
    groupSpacingY: 1.04,
    separatorGapX: 0.8,
    separatorGapY: 0.74,
    separatorWidth: 0.19,
    separatorHeight: 0.55,
    pointSizeMin: 0.03,
    pointSizeMax: 0.062,
    pointSizeScale: 4.0,
  };
}

function hash01(seed: number) {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

function hexToRgb(hex: string) {
  const normalized = hex.replace("#", "");
  const value = Number.parseInt(normalized, 16);
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

function mixRgb(a: ReturnType<typeof hexToRgb>, b: ReturnType<typeof hexToRgb>, t: number) {
  return {
    r: Math.round(a.r + (b.r - a.r) * t),
    g: Math.round(a.g + (b.g - a.g) * t),
    b: Math.round(a.b + (b.b - a.b) * t),
  };
}

function sampleGlyphPositions(char: string, resolution: number, sampleCount: number, widthScale: number) {
  const canvas = document.createElement("canvas");
  canvas.width = resolution;
  canvas.height = resolution;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return Array.from({ length: sampleCount }, () => [0, 0] as GlyphPoint);
  }

  ctx.clearRect(0, 0, resolution, resolution);
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, resolution, resolution);
  ctx.fillStyle = "#fff";
  ctx.font = `900 ${Math.round(resolution * 0.86)}px "Arial Black", "Segoe UI Black", sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.save();
  ctx.translate(resolution / 2, resolution / 2);
  ctx.scale(widthScale, 1);
  ctx.translate(-resolution / 2, -resolution / 2);
  ctx.fillText(char, resolution / 2, resolution / 2);
  ctx.restore();

  const { data } = ctx.getImageData(0, 0, resolution, resolution);
  const rawPoints: GlyphPoint[] = [];

  for (let y = 0; y < resolution; y += 1) {
    for (let x = 0; x < resolution; x += 1) {
      const index = (y * resolution + x) * 4;
      const brightness = data[index] + data[index + 1] + data[index + 2];
      if (brightness > 500) {
        rawPoints.push([(x / resolution) * 2 - 1, -((y / resolution) * 2 - 1)]);
      }
    }
  }

  if (rawPoints.length === 0) {
    return Array.from({ length: sampleCount }, () => [0, 0] as GlyphPoint);
  }

  const sampled: GlyphPoint[] = [];
  const step = rawPoints.length / sampleCount;

  for (let index = 0; index < sampleCount; index += 1) {
    const source = rawPoints[Math.floor(index * step) % rawPoints.length] ?? rawPoints[0];
    sampled.push(source);
  }

  return sampled;
}

function buildGlyphCache(settings: CountdownSettings) {
  const cache: Record<string, GlyphPoint[]> = {};
  const characters = "0123456789:";

  for (const char of characters) {
    cache[char] = sampleGlyphPositions(
      char,
      settings.resolution,
      settings.particlesPerGlyph,
      settings.glyphWidthScale
    );
  }

  return cache;
}

function useLayoutMode() {
  const [isStacked, setIsStacked] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 640px)");
    const update = () => setIsStacked(query.matches);
    const legacyQuery = query as MediaQueryList & {
      addEventListener?: (type: "change", listener: () => void) => void;
      removeEventListener?: (type: "change", listener: () => void) => void;
      addListener?: (listener: () => void) => void;
      removeListener?: (listener: () => void) => void;
    };

    update();

    if (legacyQuery.addEventListener) {
      legacyQuery.addEventListener("change", update);
      return () => legacyQuery.removeEventListener?.("change", update);
    }

    legacyQuery.addListener?.(update);
    return () => legacyQuery.removeListener?.(update);
  }, []);

  return isStacked;
}

function computeLayout(countdown: CountdownValue, settings: CountdownSettings, isStacked: boolean) {
  const groups = [
    countdown.days,
    countdown.hours,
    countdown.minutes,
    countdown.seconds,
  ].map((value) => value.slice(-2).padStart(2, "0"));
  const digitSpacing = settings.digitStep * settings.glyphWidthScale;
  const stackOffsetY = isStacked ? -1.4 : -0.78;

  const groupOrigins = isStacked
    ? [1.5, 0.5, -0.5, -1.5].map((y) => ({ x: 0, y: y * settings.groupSpacingY + stackOffsetY }))
    : [-1.5, -0.5, 0.5, 1.5].map((x) => ({ x: x * settings.groupSpacingX, y: stackOffsetY }));

  const separatorOrigins = isStacked
    ? [1, 0, -1].map((y) => ({ x: 0, y: y * settings.separatorGapY + stackOffsetY }))
    : [-1, 0, 1].map((x) => ({ x: x * settings.separatorGapX, y: stackOffsetY }));

  const items: LayoutItem[] = [];

  groups.forEach((group, groupIndex) => {
    const origin = groupOrigins[groupIndex];
    const digits = group.split("");

    digits.forEach((digit, digitIndex) => {
      items.push({
        char: digit,
        originX: origin.x + (digitIndex === 0 ? -digitSpacing / 2 : digitSpacing / 2),
        originY: origin.y,
        scaleX: settings.glyphWidth,
        scaleY: settings.glyphHeight,
        sampleCount: settings.particlesPerGlyph,
      });
    });

    if (groupIndex < separatorOrigins.length) {
      const separatorOrigin = separatorOrigins[groupIndex];
      items.push({
        char: ":",
        originX: separatorOrigin.x,
        originY: separatorOrigin.y,
        scaleX: settings.separatorWidth,
        scaleY: settings.separatorHeight,
        sampleCount: Math.max(28, Math.round(settings.particlesPerGlyph * 0.35)),
      });
    }
  });

  return items;
}

function createSystem(
  countdown: CountdownValue,
  settings: CountdownSettings,
  glyphCache: Record<string, GlyphPoint[]>,
  isStacked: boolean
) {
  const layout = computeLayout(countdown, settings, isStacked);
  const count = layout.reduce((total, item) => total + item.sampleCount, 0);
  const positions = new Float32Array(count * 3);
  const targets = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const cyan = hexToRgb("#00f0ff");
  const blue = hexToRgb("#0055ff");
  const white = hexToRgb("#eafcff");

  let particleOffset = 0;

  layout.forEach((item, itemIndex) => {
    const glyph = glyphCache[item.char] ?? glyphCache["0"];

    for (let particleIndex = 0; particleIndex < item.sampleCount; particleIndex += 1) {
      const point = glyph[particleIndex % glyph.length] ?? [0, 0];
      const jitterSeed = itemIndex * 997 + particleIndex * 53 + item.char.charCodeAt(0) * 11;
      const flowSeed = itemIndex * 313 + particleIndex * 17 + item.char.charCodeAt(0) * 7;
      const offset = (particleOffset + particleIndex) * 3;
      const sizeIndex = particleOffset + particleIndex;
      const pointMix = hash01(flowSeed);
      const isBright = hash01(jitterSeed + 41) > 0.86;

      const targetX = item.originX + point[0] * item.scaleX;
      const targetY = item.originY + point[1] * item.scaleY;
      const targetZ = (hash01(jitterSeed + 19) - 0.5) * 0.04;

      targets[offset] = targetX;
      targets[offset + 1] = targetY;
      targets[offset + 2] = targetZ;

      const settleX = (hash01(jitterSeed) - 0.5) * 0.26;
      const settleY = (hash01(jitterSeed + 7) - 0.5) * 0.26;
      const settleZ = (hash01(jitterSeed + 13) - 0.5) * 0.08;

      positions[offset] = targetX + settleX;
      positions[offset + 1] = targetY + settleY;
      positions[offset + 2] = targetZ + settleZ;

      const colorMix = isBright ? 0.16 + pointMix * 0.06 : pointMix * 0.88;
      const color = isBright ? mixRgb(cyan, white, colorMix) : mixRgb(cyan, blue, colorMix);
      colors[offset] = color.r / 255;
      colors[offset + 1] = color.g / 255;
      colors[offset + 2] = color.b / 255;

      sizes[sizeIndex] =
        settings.pointSizeMin +
        hash01(jitterSeed + 23) * (settings.pointSizeMax - settings.pointSizeMin) +
        (isBright ? 0.008 : 0);
    }
    particleOffset += item.sampleCount;
  });

  return {
    positions,
    targets,
    colors,
    sizes,
    count,
  };
}

function CountdownParticles({
  reducedMotion,
  quality,
  pointerTarget,
  pointerNdc,
  pointerActive,
}: {
  reducedMotion: boolean;
  quality: QualityTier;
  pointerTarget: MutableRefObject<Vector3>;
  pointerNdc: MutableRefObject<Vector2>;
  pointerActive: MutableRefObject<boolean>;
}) {
  const pointsGeometryRef = useRef<BufferGeometry>(null!);
  const materialRef = useRef<ShaderMaterial>(null!);
  const pointerPlane = useMemo(() => new Plane(new Vector3(0, 0, 1), 0), []);
  const settings = useMemo(() => getSettings(quality), [quality]);
  const glyphCache = useMemo(() => buildGlyphCache(settings), [settings]);
  const countdown = useCountdown(EVENT_START);
  const isStacked = useLayoutMode();
  const countdownRef = useRef(countdown);
  const [system, setSystem] = useState<ParticleSystem>(() =>
    createSystem(countdown, settings, glyphCache, isStacked)
  );
  const systemRef = useRef(system);

  useEffect(() => {
    countdownRef.current = countdown;
  }, [countdown]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setSystem(createSystem(countdownRef.current, settings, glyphCache, isStacked));
    });

    return () => window.cancelAnimationFrame(frame);
  }, [glyphCache, isStacked, settings]);

  useEffect(() => {
    systemRef.current = system;

    if (pointsGeometryRef.current) {
      pointsGeometryRef.current.setAttribute("position", new BufferAttribute(system.positions, 3));
      pointsGeometryRef.current.setAttribute("aColor", new BufferAttribute(system.colors, 3));
      pointsGeometryRef.current.setAttribute("aSize", new BufferAttribute(system.sizes, 1));
    }
  }, [system]);

  useEffect(() => {
    const current = systemRef.current;
    const layout = computeLayout(countdown, settings, isStacked);
    let particleOffset = 0;

    layout.forEach((item, itemIndex) => {
      const glyph = glyphCache[item.char] ?? glyphCache["0"];

      for (let particleIndex = 0; particleIndex < item.sampleCount; particleIndex += 1) {
        const point = glyph[particleIndex % glyph.length] ?? [0, 0];
        const offset = (particleOffset + particleIndex) * 3;

        current.targets[offset] = item.originX + point[0] * item.scaleX;
        current.targets[offset + 1] = item.originY + point[1] * item.scaleY;
        current.targets[offset + 2] = (hash01(itemIndex * 313 + particleIndex * 17) - 0.5) * 0.04;
      }

      particleOffset += item.sampleCount;
    });
  }, [countdown, glyphCache, isStacked, settings]);

  useFrame((state) => {
    const current = systemRef.current;
    const repelRadius = reducedMotion ? 0.24 : 0.36;
    const repelStrength = reducedMotion ? 0.11 : 0.18;
    const damp = reducedMotion ? 0.07 : 0.16;
    const cameraZ = isStacked ? 8.15 : 7.15;
    const pointer = pointerTarget.current;

    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      materialRef.current.uniforms.uPointScale.value = settings.pointSizeScale;
    }

    state.camera.position.z += (cameraZ - state.camera.position.z) * 0.05;

    if (pointerActive.current) {
      state.raycaster.setFromCamera(pointerNdc.current, state.camera);
      state.raycaster.ray.intersectPlane(pointerPlane, pointer);
    }

    for (let index = 0; index < current.count; index += 1) {
      const offset = index * 3;
      const px = current.positions[offset];
      const py = current.positions[offset + 1];
      const dx = px - pointer.x;
      const dy = py - pointer.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      let targetX = current.targets[offset];
      let targetY = current.targets[offset + 1];
      let targetZ = current.targets[offset + 2];

      if (distance < repelRadius) {
        const push = (repelRadius - distance) * repelStrength;
        const inverse = 1 / Math.max(distance, 0.0001);
        const nx = dx * inverse;
        const ny = dy * inverse;

        targetX += nx * push;
        targetY += ny * push;
        targetZ += (hash01(index * 19 + state.clock.elapsedTime * 3) - 0.5) * push * 0.1;
      }

      current.positions[offset] += (targetX - current.positions[offset]) * damp;
      current.positions[offset + 1] += (targetY - current.positions[offset + 1]) * damp;
      current.positions[offset + 2] += (targetZ - current.positions[offset + 2]) * damp;
    }

    if (pointsGeometryRef.current?.attributes.position) {
      pointsGeometryRef.current.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group>
      <points>
        <bufferGeometry ref={pointsGeometryRef} />
        <shaderMaterial
          ref={materialRef}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          transparent
          depthWrite={false}
          blending={AdditiveBlending}
          uniforms={{
            uTime: { value: 0 },
            uPointScale: { value: settings.pointSizeScale },
          }}
        />
      </points>
    </group>
  );
}

export function CountdownScene({ active, reducedMotion, quality }: CountdownSceneProps) {
  const pointerTarget = useRef(new Vector3(999, 999, 999));
  const pointerNdc = useRef(new Vector2(0, 0));
  const pointerActive = useRef(false);
  const [liveQuality, setLiveQuality] = useState<QualityTier>(quality);
  const dprCap = liveQuality === "high" ? 1.5 : liveQuality === "medium" ? 1.25 : 1;

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    pointerNdc.current.set(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -(((event.clientY - rect.top) / rect.height) * 2 - 1)
    );
    pointerActive.current = true;
  };

  const handlePointerLeave = () => {
    pointerActive.current = false;
    pointerTarget.current.set(999, 999, 999);
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
      camera={{ position: [0, 0, 7.15], fov: 42 }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="h-full w-full"
      style={{ touchAction: "pan-y" }}
    >
      <color attach="background" args={["#030305"]} />
      <ambientLight intensity={1.8} />
      <directionalLight position={[4, 6, 8]} intensity={2.2} color="#dffcff" />
      <directionalLight position={[-4, -2, -4]} intensity={1.2} color="#0055ff" />
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
      <CountdownParticles
        reducedMotion={reducedMotion}
        quality={liveQuality}
        pointerTarget={pointerTarget}
        pointerNdc={pointerNdc}
        pointerActive={pointerActive}
      />
    </Canvas>
  );
}
