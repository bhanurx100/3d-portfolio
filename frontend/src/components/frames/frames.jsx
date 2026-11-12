import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useSpring } from "framer-motion";

export const ScaledStage = ({ w, h, children }) => {
  const ref = useRef(null);
  const [s, setS] = useState(0);
  useEffect(() => {
    if (!ref.current) return undefined;
    const ro = new ResizeObserver(([e]) => setS(e.contentRect.width / w));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, [w]);
  return (
    <div ref={ref} className="relative w-full overflow-hidden" style={{ aspectRatio: `${w} / ${h}` }}>
      <div
        className="absolute left-0 top-0"
        style={{
          width: w,
          height: h,
          transform: `scale(${s})`,
          transformOrigin: "0 0",
          visibility: s ? "visible" : "hidden",
          willChange: "transform",
          pointerEvents: "auto",
          touchAction: "pan-y",
        }}
      >
        <div className="h-full w-full" style={{ pointerEvents: "auto" }}>
          {children}
        </div>
      </div>
    </div>
  );
};

const PHONE_MOTION_PROFILES = {
  architectural: { stiffness: 85, damping: 20 },
  mechanical: { stiffness: 160, damping: 24 },
  fluid: { stiffness: 70, damping: 18 },
};

/**
 * Sculpted Titanium & Optical Glass 3D iPhone Chassis.
 * Flattens cleanly toward 0deg when hovered/focused so every inner tap, scroll, and form input
 * receives 100% pixel-exact pointer coordinates with zero overlay interception.
 */
export const PhoneFrame = ({
  children,
  className = "",
  accent = "#D8C08A",
  poseRotateY = 0,
  poseRotateX = 0,
  motionMode = "architectural",
}) => {
  const reduced = useReducedMotion();
  const [engaged, setEngaged] = useState(false);
  const springConfig = PHONE_MOTION_PROFILES[motionMode] || PHONE_MOTION_PROFILES.architectural;
  const baseRx = useSpring(poseRotateX, springConfig);
  const baseRy = useSpring(poseRotateY, springConfig);

  useEffect(() => {
    if (reduced || engaged) {
      baseRx.set(0);
      baseRy.set(0);
    } else {
      baseRx.set(poseRotateX);
      baseRy.set(poseRotateY);
    }
  }, [poseRotateX, poseRotateY, engaged, reduced, baseRx, baseRy]);

  return (
    <div
      className={`relative ${className}`}
      style={{ containerType: "inline-size", perspective: 1800 }}
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") setEngaged(true);
      }}
      onPointerLeave={(e) => {
        if (!e.currentTarget.contains(document.activeElement)) {
          setEngaged(false);
        }
      }}
      onFocusCapture={() => setEngaged(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
          setEngaged(false);
        }
      }}
      data-cursor="phone"
    >
      {/* Subtle 3D floor reflection halo matched to product accent */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-7 left-1/2 h-10 w-[82%] -translate-x-1/2 rounded-full blur-2xl"
        style={{
          background: `radial-gradient(ellipse at center, ${accent}44 0%, rgba(0,0,0,0.65) 55%, transparent 78%)`,
        }}
      />

      <motion.div
        style={{
          rotateX: reduced ? 0 : baseRx,
          rotateY: reduced ? 0 : baseRy,
          transformStyle: "preserve-3d",
        }}
      >
        {/* Outer Titanium Metallic Bezel */}
        <div
          className="relative p-[2.7cqw]"
          style={{
            borderRadius: "15.2cqw",
            background:
              "linear-gradient(135deg, #3c4049 0%, #17191f 28%, #0c0d11 58%, #2a2d35 88%, #4b4f5a 100%)",
            boxShadow:
              "0 45px 110px -22px rgba(0,0,0,0.92), 0 0 0 1px rgba(255,255,255,0.16), inset 0 1px 1px rgba(255,255,255,0.28)",
          }}
        >
          {/* Side hardware buttons (strictly pointer-events-none) */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -left-[0.95cqw] top-[15%] h-[5.5%] w-[0.95cqw] rounded-l bg-gradient-to-b from-white/35 to-white/10"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -left-[0.95cqw] top-[23%] h-[9.5%] w-[0.95cqw] rounded-l bg-gradient-to-b from-white/35 to-white/10"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -left-[0.95cqw] top-[35%] h-[9.5%] w-[0.95cqw] rounded-l bg-gradient-to-b from-white/35 to-white/10"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-[0.95cqw] top-[26%] h-[15%] w-[0.95cqw] rounded-r bg-gradient-to-b from-white/35 to-white/10"
          />

          {/* Inner Obsidian Glass Frame */}
          <div
            className="relative overflow-hidden bg-black p-[1.1cqw]"
            style={{
              borderRadius: "13.2cqw",
              boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)",
            }}
          >
            {/* Interactive 375x812 Logical Mobile Screen */}
            <div
              className="relative overflow-hidden bg-black"
              style={{ borderRadius: "12.1cqw" }}
              data-lenis-prevent
            >
              <ScaledStage w={375} h={812}>
                {children}
              </ScaledStage>

              {/* Subtle edge glass specular reflection (strictly pointer-events-none) */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "linear-gradient(125deg, rgba(255,255,255,0.05) 0%, transparent 25%, transparent 76%, rgba(255,255,255,0.025) 100%)",
                }}
              />

              {/* Dynamic Island (strictly pointer-events-none) */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 flex -translate-x-1/2 items-center justify-end rounded-full bg-[#050507] px-[2.4cqw] ring-1 ring-white/12"
                style={{ top: "2.3cqw", width: "26.5cqw", height: "6.9cqw" }}
              >
                <span
                  className="h-[2.4cqw] w-[2.4cqw] rounded-full"
                  style={{
                    background: "radial-gradient(circle at 35% 35%, #233252 0%, #090b10 75%)",
                    boxShadow: "inset 0 0 0 0.5px rgba(255,255,255,0.18)",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export const Tilt = ({ children, className = "", max = 4 }) => {
  const reduced = useReducedMotion();
  const rx = useSpring(0, { stiffness: 110, damping: 18 });
  const ry = useSpring(0, { stiffness: 110, damping: 18 });
  if (reduced) {
    return <div className={className}>{children}</div>;
  }
  const move = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    ry.set(((e.clientX - r.left) / r.width - 0.5) * max * 2);
    rx.set(-((e.clientY - r.top) / r.height - 0.5) * max * 2);
  };
  const leave = () => {
    rx.set(0);
    ry.set(0);
  };
  return (
    <div className={className} style={{ perspective: 1800 }} onMouseMove={move} onMouseLeave={leave}>
      <motion.div style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}>{children}</motion.div>
    </div>
  );
};
