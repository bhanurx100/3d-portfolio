import { Component, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { Smartphone } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { scrollToY } from "@/components/shell/Chrome";

gsap.registerPlugin(ScrollTrigger);

export const Platform = ({ p }) => (
  <span
    className="f-mono inline-flex items-center gap-2 rounded-full border px-3 py-1"
    style={{ borderColor: p.theme.acc, color: p.theme.acc }}
    data-testid={`platform-tag-${p.key}`}
  >
    <Smartphone size={12} />
    {p.mobileBadge || "MOBILE APP"}
  </span>
);

class WebGLBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onFail?.();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export const supportsWebGL = () => {
  try {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
};

const REVEAL_PRESETS = {
  left: {
    from: { x: -34, y: 12, opacity: 0, clipPath: "inset(0 14% 0 0)" },
    to: { x: 0, y: 0, opacity: 1, clipPath: "inset(0 0% 0 0)", duration: 0.78, ease: "power3.out" },
  },
  right: {
    from: { x: 34, y: 12, opacity: 0, clipPath: "inset(0 0 0 14%)" },
    to: { x: 0, y: 0, opacity: 1, clipPath: "inset(0 0 0 0%)", duration: 0.78, ease: "power3.out" },
  },
  timeline: {
    from: { y: 26, opacity: 0, scale: 0.985 },
    to: { y: 0, opacity: 1, scale: 1, duration: 0.72, ease: "power3.out" },
  },
  curtain: {
    from: { y: 22, opacity: 0, clipPath: "inset(0 0 100% 0)" },
    to: { y: 0, opacity: 1, clipPath: "inset(0 0 0% 0)", duration: 0.85, ease: "power3.out" },
  },
  clip: {
    from: { y: 28, opacity: 0, clipPath: "inset(0 0 100% 0)" },
    to: { y: 0, opacity: 1, clipPath: "inset(0 0 0% 0)", duration: 0.78, ease: "power3.out" },
  },
};

/**
 * Registers passage-specific GSAP ScrollTrigger reveal animations for `[data-passage-reveal]` nodes
 * within the provided container ref while respecting prefers-reduced-motion.
 */
export const usePassageChoreography = (containerRef) => {
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced || !containerRef.current) return undefined;
    const ctx = gsap.context(() => {
      const nodes = gsap.utils.toArray("[data-passage-reveal]");
      nodes.forEach((el, idx) => {
        const mode = el.getAttribute("data-passage-reveal") || "clip";
        const preset = REVEAL_PRESETS[mode] || REVEAL_PRESETS.clip;
        const delay = mode === "timeline" ? (idx % 3) * 0.08 : 0;

        gsap.fromTo(el, preset.from, {
          ...preset.to,
          delay,
          clearProps: "transform,clipPath",
          scrollTrigger: {
            trigger: el,
            start: "top 95%",
            once: true,
          },
        });
      });
    }, containerRef);

    const refreshId = setTimeout(() => ScrollTrigger.refresh(), 350);
    return () => {
      clearTimeout(refreshId);
      ctx.revert();
    };
  }, [containerRef, reduced]);
};

/**
 * Default architectural CSS 3D perspective fallback background when WebGL is disabled or reduced motion is active.
 */
export const PassageCssBackdrop = ({ accent = "#D8C08A", bg = "#060709" }) => (
  <div
    aria-hidden="true"
    data-testid="passage-fallback"
    className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    style={{ background: bg, perspective: "920px" }}
  >
    <div
      className="absolute inset-y-0 left-0 w-1/2 origin-left opacity-50"
      style={{
        transform: "rotateY(64deg)",
        background: `linear-gradient(90deg, ${accent}14 0%, transparent 72%)`,
      }}
    />
    <div
      className="absolute inset-y-0 right-0 w-1/2 origin-right opacity-50"
      style={{
        transform: "rotateY(-64deg)",
        background: `linear-gradient(-90deg, ${accent}14 0%, transparent 72%)`,
      }}
    />
    <div
      className="absolute inset-0"
      style={{
        background: `radial-gradient(ellipse at 50% 42%, ${accent}22 0%, transparent 62%)`,
      }}
    />
  </div>
);

/**
 * Continuous scroll-driven 3D Passage wrapper shared across Home and all three Product routes.
 * Renders a fixed WebGL scene synced 1:1 with document scroll (`progressRef`) behind readable spatial bands,
 * plus desktop rail & mobile waypoint pills.
 */
export default function PassageWorld({
  waypoints = [],
  accent = "#D8C08A",
  bg = "#060709",
  renderScene,
  testid = "passage-world",
  children,
}) {
  const reduced = useReducedMotion();
  const containerRef = useRef(null);
  const progressRef = useRef(0);
  const hairlineRef = useRef(null);
  const [activeId, setActiveId] = useState(waypoints[0]?.id || "");
  const [failed, setFailed] = useState(false);
  const [pageVisible, setPageVisible] = useState(() =>
    typeof document !== "undefined" ? document.visibilityState === "visible" : true,
  );
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 768 : false,
  );
  const webglOk = useMemo(() => !reduced && supportsWebGL(), [reduced]);

  usePassageChoreography(containerRef);

  useEffect(() => {
    const syncVisibility = () => setPageVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", syncVisibility);
    return () => document.removeEventListener("visibilitychange", syncVisibility);
  }, []);

  useEffect(() => {
    const checkMob = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", checkMob);
    return () => window.removeEventListener("resize", checkMob);
  }, []);

  // Single authoritative GSAP ScrollTrigger source driving progressRef (0 -> 1)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: el,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          progressRef.current = self.progress;
          if (hairlineRef.current) {
            hairlineRef.current.style.transform = `scaleX(${self.progress})`;
          }
        },
        onRefresh: (self) => {
          progressRef.current = self.progress;
          if (hairlineRef.current) {
            hairlineRef.current.style.transform = `scaleX(${self.progress})`;
          }
        },
      });
    }, containerRef);

    const ro = new ResizeObserver(() => {
      ScrollTrigger.refresh();
    });
    ro.observe(el);

    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);

    const refreshSlow = setTimeout(() => ScrollTrigger.refresh(), 600);

    return () => {
      clearTimeout(refreshSlow);
      window.removeEventListener("load", onLoad);
      ro.disconnect();
      ctx.revert();
    };
  }, []);

  useEffect(() => {
    if (!waypoints.length) return undefined;
    const observers = [];
    waypoints.forEach((wp) => {
      const target = document.getElementById(wp.id);
      if (!target) return;
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) setActiveId(wp.id);
          });
        },
        { rootMargin: "-35% 0px -45% 0px", threshold: 0.01 },
      );
      io.observe(target);
      observers.push(io);
    });
    return () => observers.forEach((io) => io.disconnect());
  }, [waypoints]);

  const jumpToWaypoint = (id) => {
    const target = document.getElementById(id);
    if (!target) return;
    scrollToY(target.getBoundingClientRect().top + window.scrollY);
  };

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen"
      style={{ background: bg }}
      data-testid={testid}
    >
      {/* Top subtle scroll progress hairline */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed left-0 right-0 top-0 z-40 h-[2px] bg-white/5"
      >
        <div
          ref={hairlineRef}
          className="h-full w-full origin-left will-change-transform"
          style={{
            transform: "scaleX(0)",
            background: `linear-gradient(90deg, ${accent}55 0%, ${accent} 100%)`,
          }}
        />
      </div>

      {/* Persistent Continuous 3D Passage Canvas or Graceful Fallback */}
      {webglOk && !failed ? (
        <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
          <WebGLBoundary onFail={() => setFailed(true)}>
            <Suspense
              fallback={
                <div
                  className="absolute inset-0"
                  style={{
                    background: `radial-gradient(ellipse at 52% 45%, ${accent}1c 0%, ${bg} 72%)`,
                  }}
                />
              }
            >
              {renderScene({
                progressRef,
                running: pageVisible,
                isMobile,
                onContextLost: () => setFailed(true),
              })}
            </Suspense>
          </WebGLBoundary>
          {/* Edge contrast vignette leaving central 3D depth luminous */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(105% 88% at 54% 44%, rgba(5,6,8,0.14) 18%, rgba(5,6,8,0.68) 86%)",
            }}
          />
        </div>
      ) : (
        <PassageCssBackdrop accent={accent} bg={bg} />
      )}

      {/* Desktop Right Passage Waypoint Rail */}
      {waypoints.length > 0 && (
        <nav
          className="fixed right-4 top-1/2 z-30 hidden -translate-y-1/2 flex-col items-end gap-4 md:right-7 lg:flex"
          aria-label="Passage sections"
        >
          {waypoints.map((wp) => {
            const active = activeId === wp.id;
            const wpColor = wp.accent || accent;
            return (
              <button
                key={wp.id}
                type="button"
                onClick={() => jumpToWaypoint(wp.id)}
                data-testid={`passage-rail-${wp.id}`}
                className="group flex items-center gap-3"
              >
                <span
                  className={`f-mono transition-opacity duration-300 ${
                    active ? "opacity-100" : "opacity-0 group-hover:opacity-80"
                  }`}
                  style={active ? { color: wpColor } : undefined}
                >
                  {wp.label}
                </span>
                <span
                  className="block h-px transition-all duration-500"
                  style={{
                    width: active ? 34 : 14,
                    background: active ? wpColor : "rgba(237,233,224,0.45)",
                  }}
                />
              </button>
            );
          })}
        </nav>
      )}

      {/* Mobile Whisper-Thin Architectural Progress Scrubber (replaces chunky pill dock) */}
      {waypoints.length > 0 && (
        <nav
          className="pointer-events-none fixed inset-x-4 bottom-[max(0.65rem,env(safe-area-inset-bottom))] z-30 flex justify-center lg:hidden"
          aria-label="Passage sections"
        >
          <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-white/10 bg-[#050608]/72 px-3 py-1.5 backdrop-blur-md">
            <span
              className="font-mono text-[9px] uppercase tracking-[0.2em]"
              style={{ color: accent }}
              data-testid="mobile-active-waypoint-label"
            >
              {String(Math.max(1, waypoints.findIndex((w) => w.id === activeId) + 1)).padStart(2, "0")} ·{" "}
              {waypoints.find((w) => w.id === activeId)?.label || waypoints[0]?.label}
            </span>
            <span className="h-2.5 w-px bg-white/15" aria-hidden="true" />
            <div className="flex items-center gap-1.5">
              {waypoints.map((wp) => {
                const active = activeId === wp.id;
                const wpColor = wp.accent || accent;
                return (
                  <button
                    key={wp.id}
                    type="button"
                    onClick={() => jumpToWaypoint(wp.id)}
                    aria-label={`Jump to ${wp.label}`}
                    aria-current={active ? "location" : undefined}
                    data-testid={`passage-mobile-pill-${wp.id}`}
                    className="flex h-4 items-center px-0.5 transition-all"
                  >
                    <span
                      className="block h-[2px] rounded-full transition-all duration-300"
                      style={{
                        width: active ? 20 : 8,
                        background: active ? wpColor : "rgba(237,233,224,0.34)",
                      }}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </nav>
      )}

      {/* Continuous Scrollable Spatial Layers */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
