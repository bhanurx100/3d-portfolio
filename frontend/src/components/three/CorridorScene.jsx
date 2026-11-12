import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { A } from "@/data/assets";

// 5-Passage continuous camera spline: [progress, z, x, yaw, y, roll, fovOffset]
const KEYS = [
  [0.0, 9.0, 0.0, 0.0, 2.0, 0.0, 0.0],
  [0.2, -1.8, 0.0, 0.0, 1.96, -0.012, 1.2],
  [0.34, -10.0, -0.95, -0.26, 2.02, -0.026, 2.4],
  [0.44, -16.5, -0.35, -0.08, 1.98, 0.014, 1.0],
  [0.54, -22.5, 0.65, 0.16, 2.04, 0.024, 1.8],
  [0.64, -28.0, 0.0, 0.0, 1.98, 0.0, 0.5],
  [0.74, -34.5, 1.05, 0.34, 2.0, 0.028, 2.2],
  [0.82, -41.5, -1.05, -0.34, 2.0, -0.028, 2.2],
  [0.9, -47.5, 0.0, 0.0, 1.98, 0.0, 0.8],
  [1.0, -54.5, 0.0, 0.0, 1.96, 0.0, -1.5],
];

const sampleSpline = (p) => {
  const clamped = THREE.MathUtils.clamp(p, 0, 1);
  let i = 0;
  while (i < KEYS.length - 2 && clamped > KEYS[i + 1][0]) i += 1;
  const a = KEYS[i];
  const b = KEYS[i + 1];
  let t = THREE.MathUtils.clamp((clamped - a[0]) / Math.max(0.0001, b[0] - a[0]), 0, 1);
  t = t * t * (3 - 2 * t);
  return [1, 2, 3, 4, 5, 6].map((k) => a[k] + (b[k] - a[k]) * t);
};

const makeConcrete = () => {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 512;
  const g = c.getContext("2d");
  g.fillStyle = "#8a8b8f";
  g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 6000; i += 1) {
    const v = (106 + Math.random() * 68) | 0;
    g.fillStyle = `rgba(${v},${v},${v},.28)`;
    g.fillRect(Math.random() * 512, Math.random() * 512, 1 + Math.random() * 2, 1 + Math.random() * 2);
  }
  for (let i = 0; i < 10; i += 1) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const r = 40 + Math.random() * 90;
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, "rgba(42,42,46,.22)");
    gr.addColorStop(1, "rgba(42,42,46,0)");
    g.fillStyle = gr;
    g.fillRect(x - r, y - r, 2 * r, 2 * r);
  }
  g.strokeStyle = "rgba(25,25,28,.65)";
  g.lineWidth = 3;
  g.strokeRect(0, 0, 512, 512);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.RepeatWrapping;
  return t;
};

const makeGlow = () => {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 256;
  const g = c.getContext("2d");
  const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  gr.addColorStop(0, "rgba(255,255,255,.94)");
  gr.addColorStop(0.4, "rgba(255,255,255,.3)");
  gr.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = gr;
  g.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(c);
};

const Block = ({ pos, size, tex, color = "#4f5258" }) => {
  const map = useMemo(() => {
    const t = tex.clone();
    t.needsUpdate = true;
    t.repeat.set(Math.max(size[0], size[2]) / 3.5, size[1] / 3.5);
    return t;
  }, [tex, size]);
  return (
    <mesh position={pos}>
      <boxGeometry args={size} />
      <meshStandardMaterial map={map} color={color} roughness={0.85} metalness={0.12} />
    </mesh>
  );
};

const PortalRib = ({ z, tex, accent = "#D8C08A", opacity = 0.4 }) => (
  <group position={[0, 0, z]}>
    <Block pos={[-3.55, 4, 0]} size={[0.32, 8.2, 0.44]} tex={tex} color="#3d4047" />
    <Block pos={[3.55, 4, 0]} size={[0.32, 8.2, 0.44]} tex={tex} color="#3d4047" />
    <Block pos={[0, 7.9, 0]} size={[7.45, 0.36, 0.44]} tex={tex} color="#3d4047" />
    {/* Subtle top cove & floor threshold inlays */}
    <mesh position={[0, 7.7, 0]}>
      <boxGeometry args={[6.7, 0.035, 0.08]} />
      <meshBasicMaterial color={accent} transparent opacity={opacity} />
    </mesh>
    <mesh position={[-3.38, 0.02, 0]}>
      <boxGeometry args={[0.08, 0.025, 0.44]} />
      <meshBasicMaterial color={accent} transparent opacity={opacity * 0.85} />
    </mesh>
    <mesh position={[3.38, 0.02, 0]}>
      <boxGeometry args={[0.08, 0.025, 0.44]} />
      <meshBasicMaterial color={accent} transparent opacity={opacity * 0.85} />
    </mesh>
  </group>
);

const RIB_Z_FULL = [4.0, -3.5, -10.5, -17.5, -24.5, -31.5, -38.5, -45.5, -52.5, -58.5];
const RIB_Z_MOBILE = [4.0, -10.5, -24.5, -38.5, -52.5, -58.5];

const WALL_BLOCKS = [
  [[4.2, 4, -8.5], [1, 8.4, 41]],
  [[4.2, 7.2, -31.0], [1, 2.0, 3.6]],
  [[4.2, 4, -49.0], [1, 8.4, 34]],
  [[6.1, 4, -29.0], [3.6, 8.4, 0.4]],
  [[6.1, 4, -33.0], [3.6, 8.4, 0.4]],
  [[6.1, 7.3, -31.0], [3.6, 1.8, 4.2]],

  [[-4.2, 4, -15.5], [1, 8.4, 41]],
  [[-4.2, 7.2, -38.0], [1, 2.0, 3.6]],
  [[-4.2, 4, -52.5], [1, 8.4, 27]],
  [[-6.1, 4, -36.0], [3.6, 8.4, 0.4]],
  [[-6.1, 4, -40.0], [3.6, 8.4, 0.4]],
  [[-6.1, 7.3, -38.0], [3.6, 1.8, 4.2]],

  [[-2.8, 4, -61.5], [2.4, 8.4, 1]],
  [[2.8, 4, -61.5], [2.4, 8.4, 1]],
  [[0, 7.2, -61.5], [3.4, 2.0, 1]],
  [[0, 8.6, -28], [10, 1, 78]],
];

const DOORS = [
  {
    key: "stayease",
    color: "#D4AF37",
    img: [7.65, 3.7, -31.0],
    rot: -Math.PI / 2,
    light: [5.0, 3.6, -31.0],
    spill: [1.5, -31.0],
    trim: [3.65, 3.0, -31.0],
    trimRot: [0, -Math.PI / 2, 0],
    threshold: [3.65, 0.03, -31.0],
    thresholdSize: [0.06, 0.02, 3.2],
  },
  {
    key: "stockpilot",
    color: "#F59E0B",
    img: [-7.65, 3.7, -38.0],
    rot: Math.PI / 2,
    light: [-5.0, 3.6, -38.0],
    spill: [-1.5, -38.0],
    trim: [-3.65, 3.0, -38.0],
    trimRot: [0, Math.PI / 2, 0],
    threshold: [-3.65, 0.03, -38.0],
    thresholdSize: [0.06, 0.02, 3.2],
  },
  {
    key: "splitfin",
    color: "#2DD4BF",
    img: [0, 3.7, -64.5],
    rot: 0,
    light: [0, 3.6, -60.5],
    spill: [0, -56.5],
    trim: [0, 3.0, -60.9],
    trimRot: [0, 0, 0],
    threshold: [0, 0.03, -60.9],
    thresholdSize: [3.2, 0.02, 0.06],
  },
];

// Curated distinct textures for each passage — never reused blindly
const TEX = [
  "se_villa",
  "sp_atelier",
  "sf_workspace",
  "home_atrium",
  "home_studio",
  "home_journey",
  "home_terminus",
].map(A);

function TexturedPortals() {
  const tex = useTexture(TEX);
  return (
    <>
      {DOORS.map((d, i) => (
        <mesh key={d.key} position={d.img} rotation={[0, d.rot, 0]}>
          <planeGeometry args={[5.6, 8.2]} />
          <meshBasicMaterial map={tex[i]} toneMapped={false} fog={false} />
        </mesh>
      ))}
      {/* Passage 01 Hero Atrium Wall Plates */}
      <mesh position={[-3.52, 2.95, 1.5]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[3.2, 2.1]} />
        <meshBasicMaterial map={tex[3]} color="#d8d4c8" toneMapped={false} />
      </mesh>
      <mesh position={[3.52, 2.95, -5.0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[3.2, 2.1]} />
        <meshBasicMaterial map={tex[3]} color="#c9c4b8" toneMapped={false} />
      </mesh>
      {/* Passage 02 Builder Studio Wall Plates */}
      <mesh position={[-3.52, 2.9, -11.5]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[3.1, 2.05]} />
        <meshBasicMaterial map={tex[4]} color="#e0ddd2" toneMapped={false} />
      </mesh>
      <mesh position={[3.52, 2.9, -14.8]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[3.0, 2.0]} />
        <meshBasicMaterial map={tex[4]} color="#d2cec2" toneMapped={false} />
      </mesh>
      {/* Passage 03 Journey Drafting Wing Panels */}
      <mesh position={[-3.52, 3.0, -21.0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[3.4, 2.2]} />
        <meshBasicMaterial map={tex[5]} color="#e6dfd0" toneMapped={false} />
      </mesh>
      <mesh position={[3.52, 3.0, -25.2]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[3.4, 2.2]} />
        <meshBasicMaterial map={tex[5]} color="#d8d1c2" toneMapped={false} />
      </mesh>
      {/* Passage 05 Contact Terminus Monolith Panels */}
      <mesh position={[3.52, 2.95, -49.5]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[3.2, 2.1]} />
        <meshBasicMaterial map={tex[6]} color="#e6dfd0" toneMapped={false} />
      </mesh>
      <mesh position={[-3.52, 2.95, -52.5]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[3.2, 2.1]} />
        <meshBasicMaterial map={tex[6]} color="#d6cfc0" toneMapped={false} />
      </mesh>
    </>
  );
}

/** Architectural suspended pylons along the Journey bay for unmistakable 3D spatial progression. */
function JourneyPylons() {
  const pylons = [
    [-2.55, 2.2, -20.5],
    [2.55, 2.2, -24.5],
    [-2.55, 2.2, -27.2],
  ];
  return (
    <>
      {pylons.map(([x, y, z], i) => (
        <group key={i} position={[x, y, z]}>
          <mesh>
            <boxGeometry args={[0.24, 4.4, 0.24]} />
            <meshStandardMaterial color="#1f232b" roughness={0.35} metalness={0.72} />
          </mesh>
          <mesh position={[0, 0, 0.13]}>
            <boxGeometry args={[0.04, 3.6, 0.02]} />
            <meshBasicMaterial color="#D8C08A" transparent opacity={0.55} />
          </mesh>
        </group>
      ))}
    </>
  );
}

function TerminusRing() {
  const ringRef = useRef(null);
  useFrame(({ clock }) => {
    if (!ringRef.current) return;
    ringRef.current.rotation.z = clock.getElapsedTime() * 0.08;
    ringRef.current.position.y = 2.6 + Math.sin(clock.getElapsedTime() * 0.7) * 0.12;
  });
  return (
    <group ref={ringRef} position={[0, 2.6, -58.0]}>
      <mesh>
        <torusGeometry args={[2.0, 0.026, 16, 80]} />
        <meshBasicMaterial color="#D8C08A" transparent opacity={0.5} />
      </mesh>
      <mesh rotation={[0, 0, 0.4]}>
        <torusGeometry args={[1.58, 0.015, 12, 64]} />
        <meshBasicMaterial color="#EDE9E0" transparent opacity={0.28} />
      </mesh>
    </group>
  );
}

function World({ progressRef, focusedProjectRef, isMobile }) {
  const { camera, size } = useThree();
  const stacked = size.width / Math.max(1, size.height) < 0.85;
  const concrete = useMemo(makeConcrete, []);
  const glow = useMemo(makeGlow, []);
  const travelLightRef = useRef(null);
  const cur = useRef({ z: 9.0, x: 0, y: 2.0, yaw: 0, roll: 0, fovOffset: 0, mx: 0, my: 0, tx: 0, ty: 0, focusYaw: 0 });
  const R = -Math.PI / 2;

  useEffect(() => {
    if (isMobile) return undefined;
    const onMove = (e) => {
      cur.current.tx = (e.clientX / window.innerWidth) * 2 - 1;
      cur.current.ty = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [isMobile]);

  useFrame((_, dt) => {
    const c = cur.current;
    const p = progressRef?.current ?? 0;
    const [z, x, yaw, y, roll, fovOffset] = sampleSpline(p);
    const focus = focusedProjectRef?.current;
    const targetFocusYaw = focus === "stayease" ? -0.14 : focus === "stockpilot" ? 0.14 : 0;

    const k = 1 - Math.pow(0.0025, Math.min(dt, 0.05));
    c.z += (z - c.z) * k;
    c.x += (x - c.x) * k;
    c.y += (y - c.y) * k;
    c.yaw += (yaw - c.yaw) * k;
    c.roll += ((isMobile ? roll * 0.45 : roll) - c.roll) * k;
    c.fovOffset += (fovOffset - c.fovOffset) * k;
    c.focusYaw += (targetFocusYaw - c.focusYaw) * k;
    c.mx += (c.tx - c.mx) * k * 0.55;
    c.my += (c.ty - c.my) * k * 0.55;

    const baseFov = stacked ? 68 : 50;
    if (Math.abs(camera.fov - (baseFov + c.fovOffset)) > 0.05) {
      camera.fov = baseFov + c.fovOffset;
      camera.updateProjectionMatrix();
    }

    camera.position.set(c.x + c.mx * 0.24, c.y - c.my * 0.08, c.z);
    camera.rotation.set(-c.my * 0.025, c.yaw + c.focusYaw - c.mx * 0.05, c.roll, "YXZ");

    if (travelLightRef.current) {
      travelLightRef.current.position.set(c.x * 0.5, 5.2, c.z - 6.5);
      travelLightRef.current.intensity = 52 + Math.sin(p * Math.PI * 3) * 10;
    }
  });

  const ribs = isMobile ? RIB_Z_MOBILE : RIB_Z_FULL;

  return (
    <>
      <color attach="background" args={["#050608"]} />
      <fog attach="fog" args={["#050608", 11, 56]} />
      <ambientLight intensity={0.56} />
      <pointLight ref={travelLightRef} position={[0, 5.2, 2.0]} intensity={58} distance={26} color="#e6d6b5" />
      <pointLight position={[-1.2, 4.2, -23.0]} intensity={48} distance={22} color="#D8C08A" />
      <pointLight position={[0, 4.8, -53.0]} intensity={58} distance={28} color="#D8C08A" />

      {WALL_BLOCKS.map(([pos, sz], i) => (
        <Block key={i} pos={pos} size={sz} tex={concrete} />
      ))}

      {ribs.map((z) => (
        <PortalRib key={z} z={z} tex={concrete} />
      ))}

      {!isMobile && <JourneyPylons />}

      {/* Polished obsidian floor */}
      <mesh rotation={[R, 0, 0]} position={[0, 0, -28]}>
        <planeGeometry args={[10, 82]} />
        <meshStandardMaterial color="#0e1015" roughness={0.18} metalness={0.7} />
      </mesh>

      {/* Architectural brass center perspective axis + delicate side inlay hairlines */}
      <mesh rotation={[R, 0, 0]} position={[0, 0.012, -28]}>
        <planeGeometry args={[0.04, 74]} />
        <meshBasicMaterial color="#D8C08A" transparent opacity={0.36} />
      </mesh>
      <mesh rotation={[R, 0, 0]} position={[-3.3, 0.012, -28]}>
        <planeGeometry args={[0.016, 74]} />
        <meshBasicMaterial color="#D8C08A" transparent opacity={0.16} />
      </mesh>
      <mesh rotation={[R, 0, 0]} position={[3.3, 0.012, -28]}>
        <planeGeometry args={[0.016, 74]} />
        <meshBasicMaterial color="#D8C08A" transparent opacity={0.16} />
      </mesh>

      {DOORS.map((d) => (
        <group key={d.key}>
          <mesh position={d.img} rotation={[0, d.rot, 0]}>
            <planeGeometry args={[5.6, 8.2]} />
            <meshBasicMaterial color={d.color} transparent opacity={0.14} fog={false} />
          </mesh>
          <mesh position={d.threshold}>
            <boxGeometry args={d.thresholdSize} />
            <meshBasicMaterial color={d.color} toneMapped={false} />
          </mesh>
          <mesh position={[d.trim[0], 6.0, d.trim[2]]} rotation={d.trimRot}>
            <planeGeometry args={[3.2, 0.05]} />
            <meshBasicMaterial color={d.color} transparent opacity={0.65} toneMapped={false} />
          </mesh>
          {!isMobile && <pointLight position={d.light} color={d.color} intensity={170} distance={22} />}
          <mesh rotation={[R, 0, 0]} position={[d.spill[0], 0.02, d.spill[1]]}>
            <planeGeometry args={[7.4, 9.2]} />
            <meshBasicMaterial
              map={glow}
              color={d.color}
              transparent
              opacity={0.56}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
              fog={false}
            />
          </mesh>
        </group>
      ))}

      <TerminusRing />

      <Suspense fallback={null}>
        <TexturedPortals />
      </Suspense>
    </>
  );
}

export default function CorridorScene({
  progressRef,
  focusedProjectRef,
  running = true,
  isMobile = false,
  onContextLost,
}) {
  return (
    <Canvas
      dpr={isMobile ? [1, 1.25] : [1, 1.5]}
      frameloop={running ? "always" : "never"}
      gl={{ antialias: !isMobile, powerPreference: "high-performance" }}
      camera={{ position: [0, 2.0, 9.0], fov: 50, near: 0.1, far: 105 }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener(
          "webglcontextlost",
          (e) => {
            e.preventDefault();
            onContextLost?.();
          },
          false,
        );
      }}
      data-testid="corridor-canvas"
    >
      <World
        progressRef={progressRef}
        focusedProjectRef={focusedProjectRef}
        isMobile={isMobile}
      />
    </Canvas>
  );
}
