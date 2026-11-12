import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { A } from "@/data/assets";

const WORLDS = {
  stayease: {
    bg: "#070D1F",
    fog: "#070D1F",
    accent: "#D4AF37",
    secondary: "#6C8ECE",
    ribColor: "#172549",
    wallColor: "#0d1630",
    floorColor: "#0a132b",
    textures: ["se_villa", "se_hotel", "se_pg", "se_apartment", "se_homestay", "se_townhouse"],
  },
  stockpilot: {
    bg: "#12151B",
    fog: "#12151B",
    accent: "#F59E0B",
    secondary: "#FBBF24",
    ribColor: "#2C3340",
    wallColor: "#181C24",
    floorColor: "#141820",
    textures: ["sp_atelier", "sp_counter", "sp_aisle", "sp_scanner", "sp_shelf", "sp_stockroom"],
  },
  splitfin: {
    bg: "#071120",
    fog: "#071120",
    accent: "#2DD4BF",
    secondary: "#20A496",
    ribColor: "#11333E",
    wallColor: "#0A202B",
    floorColor: "#081726",
    textures: ["sf_workspace", "sf_finance", "sf_receipt", "sf_workspace", "sf_finance", "sf_receipt"],
  },
};

const PRODUCT_SPLINES = [
  [0.0, 10.0, 0.0, 0.0, 2.08, 0.0, 0.0],
  [0.18, -1.5, 0.9, 0.22, 2.15, 0.022, 1.5],
  [0.36, -13.0, -0.95, -0.24, 2.02, -0.024, 2.2],
  [0.54, -25.0, 0.85, 0.2, 2.1, 0.02, 1.6],
  [0.74, -37.5, -0.8, -0.18, 2.04, -0.02, 1.8],
  [1.0, -51.0, 0.0, 0.0, 2.0, 0.0, -1.2],
];

const sampleSpline = (p) => {
  const clamped = THREE.MathUtils.clamp(p, 0, 1);
  let i = 0;
  while (i < PRODUCT_SPLINES.length - 2 && clamped > PRODUCT_SPLINES[i + 1][0]) i += 1;
  const a = PRODUCT_SPLINES[i];
  const b = PRODUCT_SPLINES[i + 1];
  let t = THREE.MathUtils.clamp((clamped - a[0]) / Math.max(0.0001, b[0] - a[0]), 0, 1);
  t = t * t * (3 - 2 * t);
  return [1, 2, 3, 4, 5, 6].map((k) => a[k] + (b[k] - a[k]) * t);
};

/** StayEase: Grand curved courtyard colonnade arches & warm gold floor lanterns. */
function StayEaseArchRib({ z, ribColor, accent }) {
  return (
    <group position={[0, 0, z]}>
      <mesh position={[-3.7, 2.7, 0]}>
        <cylinderGeometry args={[0.18, 0.22, 5.4, 16]} />
        <meshStandardMaterial color={ribColor} roughness={0.6} metalness={0.22} />
      </mesh>
      <mesh position={[3.7, 2.7, 0]}>
        <cylinderGeometry args={[0.18, 0.22, 5.4, 16]} />
        <meshStandardMaterial color={ribColor} roughness={0.6} metalness={0.22} />
      </mesh>
      <mesh position={[0, 5.3, 0]}>
        <torusGeometry args={[3.7, 0.2, 14, 40, Math.PI]} />
        <meshStandardMaterial color={ribColor} roughness={0.55} metalness={0.28} />
      </mesh>
      <mesh position={[0, 5.3, 0]}>
        <torusGeometry args={[3.45, 0.025, 10, 40, Math.PI]} />
        <meshBasicMaterial color={accent} transparent opacity={0.58} toneMapped={false} />
      </mesh>
      <mesh position={[-3.42, 0.2, 0]}>
        <boxGeometry args={[0.24, 0.4, 0.24]} />
        <meshBasicMaterial color={accent} transparent opacity={0.42} toneMapped={false} />
      </mesh>
      <mesh position={[3.42, 0.2, 0]}>
        <boxGeometry args={[0.24, 0.4, 0.24]} />
        <meshBasicMaterial color={accent} transparent opacity={0.42} toneMapped={false} />
      </mesh>
    </group>
  );
}

/** StockPilot: Contemporary retail atelier bays with illuminated amber shelf totems. */
function StockPilotRetailBay({ z, ribColor, accent }) {
  return (
    <group position={[0, 0, z]}>
      <mesh position={[-3.95, 4.1, 0]}>
        <boxGeometry args={[0.32, 8.4, 0.42]} />
        <meshStandardMaterial color={ribColor} roughness={0.52} metalness={0.4} />
      </mesh>
      <mesh position={[3.95, 4.1, 0]}>
        <boxGeometry args={[0.32, 8.4, 0.42]} />
        <meshStandardMaterial color={ribColor} roughness={0.52} metalness={0.4} />
      </mesh>
      <mesh position={[0, 8.05, 0]}>
        <boxGeometry args={[8.2, 0.3, 0.42]} />
        <meshStandardMaterial color={ribColor} roughness={0.52} metalness={0.4} />
      </mesh>
      <mesh position={[0, 7.82, 0]}>
        <boxGeometry args={[7.2, 0.045, 0.09]} />
        <meshBasicMaterial color={accent} transparent opacity={0.68} toneMapped={false} />
      </mesh>
    </group>
  );
}

function StockPilotShelfMarkers({ accent }) {
  const racks = [
    [-2.8, 1.5, -5.0],
    [2.8, 1.5, -15.5],
    [-2.8, 1.5, -27.0],
    [2.8, 1.5, -39.5],
  ];
  return (
    <>
      {racks.map(([x, y, z], idx) => (
        <group key={idx} position={[x, y, z]}>
          <mesh position={[0, 0.65, 0]}>
            <boxGeometry args={[1.05, 0.05, 1.85]} />
            <meshStandardMaterial color="#303846" roughness={0.4} metalness={0.55} />
          </mesh>
          <mesh position={[0, -0.25, 0]}>
            <boxGeometry args={[1.05, 0.05, 1.85]} />
            <meshStandardMaterial color="#303846" roughness={0.4} metalness={0.55} />
          </mesh>
          <mesh position={[0, 1.0, -0.35]}>
            <boxGeometry args={[0.48, 0.56, 0.48]} />
            <meshStandardMaterial color="#424C5E" roughness={0.35} metalness={0.4} />
          </mesh>
          <mesh position={[0, 0.12, 0.35]}>
            <boxGeometry args={[0.52, 0.52, 0.52]} />
            <meshStandardMaterial color="#3A4252" roughness={0.35} metalness={0.4} />
          </mesh>
          <mesh position={[0, 0.68, 0]}>
            <boxGeometry args={[1.08, 0.02, 1.88]} />
            <meshBasicMaterial color={accent} transparent opacity={0.48} />
          </mesh>
        </group>
      ))}
    </>
  );
}

/** Splitfin: Refined translucent teal equilibrium portals & slender balance fins. */
function SplitfinLedgerRib({ z, ribColor, accent }) {
  return (
    <group position={[0, 0, z]}>
      <mesh position={[-3.85, 4.0, 0]}>
        <boxGeometry args={[0.14, 8.0, 0.65]} />
        <meshStandardMaterial color={ribColor} roughness={0.28} metalness={0.75} />
      </mesh>
      <mesh position={[3.85, 4.0, 0]}>
        <boxGeometry args={[0.14, 8.0, 0.65]} />
        <meshStandardMaterial color={ribColor} roughness={0.28} metalness={0.75} />
      </mesh>
      <mesh position={[0, 7.65, 0]}>
        <boxGeometry args={[7.8, 0.08, 0.35]} />
        <meshStandardMaterial color={ribColor} roughness={0.28} metalness={0.75} />
      </mesh>
      <mesh position={[-3.76, 4.0, 0]}>
        <boxGeometry args={[0.025, 6.2, 0.06]} />
        <meshBasicMaterial color={accent} transparent opacity={0.45} toneMapped={false} />
      </mesh>
      <mesh position={[3.76, 4.0, 0]}>
        <boxGeometry args={[0.025, 6.2, 0.06]} />
        <meshBasicMaterial color={accent} transparent opacity={0.45} toneMapped={false} />
      </mesh>
    </group>
  );
}

function SplitfinBalanceNodes({ accent }) {
  const nodes = [
    [-2.5, 2.2, -7.0, 0.8],
    [2.5, 2.7, -19.0, 1.1],
    [-2.5, 2.4, -31.5, 0.9],
    [2.5, 2.1, -43.0, 1.2],
  ];
  return (
    <>
      {nodes.map(([x, y, z, h], idx) => (
        <group key={idx} position={[x, y, z]}>
          <mesh>
            <boxGeometry args={[0.06, h, 1.1]} />
            <meshStandardMaterial color="#0D3B3E" roughness={0.18} metalness={0.8} transparent opacity={0.78} />
          </mesh>
          <mesh position={[0, h / 2 + 0.03, 0]}>
            <boxGeometry args={[0.08, 0.025, 1.12]} />
            <meshBasicMaterial color={accent} transparent opacity={0.62} />
          </mesh>
        </group>
      ))}
    </>
  );
}

function KineticSculpture({ variant, accent }) {
  const groupRef = useRef(null);
  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.rotation.y = t * 0.16;
    groupRef.current.position.y = 2.5 + Math.sin(t * 0.8) * 0.15;
  });

  if (variant === "splitfin") {
    return (
      <group ref={groupRef} position={[0, 2.5, -53]}>
        <mesh rotation={[0.25, 0, 0]}>
          <torusGeometry args={[2.1, 0.035, 16, 80]} />
          <meshBasicMaterial color={accent} transparent opacity={0.62} />
        </mesh>
        <mesh rotation={[-0.35, 0.5, 0]}>
          <torusGeometry args={[1.55, 0.025, 14, 72]} />
          <meshBasicMaterial color="#F3F0E6" transparent opacity={0.34} />
        </mesh>
        <mesh>
          <boxGeometry args={[1.15, 2.35, 0.08]} />
          <meshStandardMaterial color="#0D3B3E" roughness={0.18} metalness={0.75} transparent opacity={0.75} />
        </mesh>
      </group>
    );
  }

  if (variant === "stockpilot") {
    return (
      <group ref={groupRef} position={[0, 2.5, -53]}>
        {[-1.1, 0, 1.1].map((x, idx) => (
          <mesh key={idx} position={[x, (idx - 1) * 0.35, (idx % 2) * 0.5]}>
            <boxGeometry args={[0.82, 0.82, 0.82]} />
            <meshStandardMaterial color="#2C3442" roughness={0.36} metalness={0.55} />
          </mesh>
        ))}
        <mesh>
          <torusGeometry args={[2.35, 0.035, 12, 64]} />
          <meshBasicMaterial color={accent} transparent opacity={0.65} />
        </mesh>
      </group>
    );
  }

  return (
    <group ref={groupRef} position={[0, 2.5, -53]}>
      <mesh>
        <torusGeometry args={[2.15, 0.038, 16, 80, Math.PI]} />
        <meshBasicMaterial color={accent} transparent opacity={0.68} />
      </mesh>
      <mesh position={[0, -0.4, 0]}>
        <boxGeometry args={[1.4, 2.1, 0.14]} />
        <meshStandardMaterial color="#131E3D" roughness={0.25} metalness={0.7} />
      </mesh>
    </group>
  );
}

const SLAB_POSITIONS = [
  [-3.35, 2.7, 1.0, Math.PI / 2.2, 3.0, 2.0],
  [3.35, 2.7, -9.5, -Math.PI / 2.2, 3.0, 2.0],
  [-3.35, 2.7, -20.0, Math.PI / 2.2, 2.8, 2.4],
  [3.35, 2.7, -30.5, -Math.PI / 2.2, 3.0, 2.0],
  [-3.35, 2.7, -40.5, Math.PI / 2.2, 2.6, 2.6],
  [3.35, 2.7, -48.5, -Math.PI / 2.2, 3.0, 2.0],
];

function SpatialTextureSlabs({ keys, accent }) {
  const paths = useMemo(() => keys.map(A), [keys]);
  const tex = useTexture(paths);
  return (
    <>
      {SLAB_POSITIONS.map(([x, y, z, rotY, w, h], i) => (
        <group key={i} position={[x, y, z]} rotation={[0, rotY, 0]}>
          <mesh position={[0, 0, -0.03]}>
            <planeGeometry args={[w + 0.16, h + 0.16]} />
            <meshBasicMaterial color={accent} transparent opacity={0.55} />
          </mesh>
          <mesh>
            <planeGeometry args={[w, h]} />
            <meshBasicMaterial map={tex[i % tex.length]} color="#ededed" toneMapped={false} />
          </mesh>
        </group>
      ))}
    </>
  );
}

function ProductWorld({ variant, progressRef, isMobile }) {
  const cfg = WORLDS[variant] || WORLDS.stayease;
  const { camera, size, gl } = useThree();
  const stacked = size.width / Math.max(1, size.height) < 0.85;
  const travelLightRef = useRef(null);
  const cur = useRef({ z: 10.0, x: 0, y: 2.08, yaw: 0, roll: 0, fovOffset: 0, mx: 0, my: 0, tx: 0, ty: 0 });
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
    const k = 1 - Math.pow(0.0025, Math.min(dt, 0.05));
    c.z += (z - c.z) * k;
    c.x += (x - c.x) * k;
    c.y += (y - c.y) * k;
    c.yaw += (yaw - c.yaw) * k;
    c.roll += ((isMobile ? roll * 0.45 : roll) - c.roll) * k;
    c.fovOffset += (fovOffset - c.fovOffset) * k;
    c.mx += (c.tx - c.mx) * k * 0.55;
    c.my += (c.ty - c.my) * k * 0.55;

    const baseFov = stacked ? 68 : 54;
    if (Math.abs(camera.fov - (baseFov + c.fovOffset)) > 0.05) {
      camera.fov = baseFov + c.fovOffset;
      camera.updateProjectionMatrix();
    }

    camera.position.set(c.x + c.mx * 0.25, c.y - c.my * 0.08, c.z);
    camera.rotation.set(-c.my * 0.025, c.yaw - c.mx * 0.05, c.roll, "YXZ");

    if (travelLightRef.current) {
      travelLightRef.current.position.set(c.x * 0.4, 5.4, c.z - 7.5);
      travelLightRef.current.intensity = 90 + Math.sin(p * Math.PI * 3) * 16;
    }
    gl.domElement.dataset.camZ = c.z.toFixed(2);
    gl.domElement.dataset.scrollP = p.toFixed(3);
  });

  const ribZ = isMobile ? [5, -7, -19, -31, -43, -55] : [6, -1, -8, -15, -22, -29, -36, -43, -50, -56];

  return (
    <>
      <color attach="background" args={[cfg.bg]} />
      <fog attach="fog" args={[cfg.fog, 14, 62]} />
      <ambientLight intensity={0.62} />
      <pointLight ref={travelLightRef} position={[0, 5.4, 2.5]} intensity={95} distance={30} color={cfg.accent} />
      <pointLight position={[0, 5.8, -24]} intensity={70} distance={38} color={cfg.secondary} />
      {!isMobile && <pointLight position={[0, 5.4, -49]} intensity={88} distance={34} color={cfg.accent} />}

      {/* Corridor walls */}
      <mesh position={[-4.55, 4.2, -24]}>
        <boxGeometry args={[0.9, 8.6, 80]} />
        <meshStandardMaterial color={cfg.wallColor} roughness={0.78} metalness={0.18} />
      </mesh>
      <mesh position={[4.55, 4.2, -24]}>
        <boxGeometry args={[0.9, 8.6, 80]} />
        <meshStandardMaterial color={cfg.wallColor} roughness={0.78} metalness={0.18} />
      </mesh>
      <mesh position={[0, 8.6, -24]}>
        <boxGeometry args={[10.5, 0.9, 80]} />
        <meshStandardMaterial color={cfg.bg} roughness={0.88} metalness={0.1} />
      </mesh>

      {ribZ.map((z) =>
        variant === "stayease" ? (
          <StayEaseArchRib key={z} z={z} ribColor={cfg.ribColor} accent={cfg.accent} />
        ) : variant === "stockpilot" ? (
          <StockPilotRetailBay key={z} z={z} ribColor={cfg.ribColor} accent={cfg.accent} />
        ) : (
          <SplitfinLedgerRib key={z} z={z} ribColor={cfg.ribColor} accent={cfg.accent} />
        ),
      )}

      {variant === "stockpilot" && <StockPilotShelfMarkers accent={cfg.accent} />}
      {variant === "splitfin" && !isMobile && <SplitfinBalanceNodes accent={cfg.accent} />}

      {/* Reflective floor */}
      <mesh rotation={[R, 0, 0]} position={[0, 0, -24]}>
        <planeGeometry args={[10, 80]} />
        <meshStandardMaterial color={cfg.floorColor} roughness={0.18} metalness={0.74} />
      </mesh>

      {/* Luminous center path axis */}
      <mesh rotation={[R, 0, 0]} position={[0, 0.015, -24]}>
        <planeGeometry args={[0.055, 72]} />
        <meshBasicMaterial color={cfg.accent} transparent opacity={0.58} toneMapped={false} />
      </mesh>

      <KineticSculpture variant={variant} accent={cfg.accent} />

      <Suspense fallback={null}>
        <SpatialTextureSlabs keys={cfg.textures} accent={cfg.accent} />
      </Suspense>
    </>
  );
}

export default function ProductWorldScene({
  variant,
  progressRef,
  running = true,
  isMobile = false,
  onContextLost,
}) {
  return (
    <Canvas
      dpr={isMobile ? [1, 1.25] : [1, 1.5]}
      frameloop={running ? "always" : "never"}
      gl={{ antialias: !isMobile, powerPreference: "high-performance" }}
      camera={{ position: [0, 2.08, 10], fov: 54, near: 0.1, far: 100 }}
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
      data-testid={`${variant}-canvas`}
    >
      <ProductWorld variant={variant} progressRef={progressRef} isMobile={isMobile} />
    </Canvas>
  );
}
