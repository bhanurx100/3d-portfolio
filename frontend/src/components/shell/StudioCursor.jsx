import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * Subtle studio pointer indicator for desktop fine-pointer devices only.
 * Never mounts on touch / mobile viewports or when prefers-reduced-motion is enabled.
 */
export default function StudioCursor() {
  const reduced = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const [mode, setMode] = useState("default"); // "default" | "interactive" | "project"
  const [visible, setVisible] = useState(false);

  const ringRef = useRef(null);
  const dotRef = useRef(null);
  const pos = useRef({ tx: -100, ty: -100, rx: -100, ry: -100 });

  useEffect(() => {
    if (reduced || typeof window === "undefined") {
      setEnabled(false);
      return undefined;
    }
    const mq = window.matchMedia("(pointer: fine) and (hover: hover)");
    const sync = () => setEnabled(mq.matches && window.innerWidth >= 1024);
    sync();
    mq.addEventListener?.("change", sync);
    window.addEventListener("resize", sync);
    return () => {
      mq.removeEventListener?.("change", sync);
      window.removeEventListener("resize", sync);
    };
  }, [reduced]);

  useEffect(() => {
    if (!enabled) return undefined;
    let rafId = null;

    const onMove = (e) => {
      pos.current.tx = e.clientX;
      pos.current.ty = e.clientY;
      const target = e.target instanceof Element ? e.target : null;
      if (target?.closest('input, textarea, select, option, [data-cursor="phone"]')) {
        setVisible(false);
        return;
      }
      setVisible(true);
      if (target?.closest('[data-cursor="project"]')) {
        setMode("project");
      } else if (target?.closest('a, button, [data-cursor="interactive"]')) {
        setMode("interactive");
      } else {
        setMode("default");
      }
    };

    const onLeave = () => setVisible(false);

    const tick = () => {
      const p = pos.current;
      p.rx += (p.tx - p.rx) * 0.2;
      p.ry += (p.ty - p.ry) * 0.2;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${p.rx}px, ${p.ry}px, 0) translate(-50%, -50%)`;
      }
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${p.tx}px, ${p.ty}px, 0) translate(-50%, -50%)`;
      }
      rafId = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, [enabled]);

  if (!enabled) return null;

  const isProject = mode === "project";
  const isInteractive = mode === "interactive";

  return (
    <div
      aria-hidden="true"
      data-testid="studio-cursor"
      className="pointer-events-none fixed inset-0 z-[95] hidden lg:block"
      style={{ opacity: visible ? 1 : 0, transition: "opacity 220ms ease-out" }}
    >
      <div
        ref={ringRef}
        className="fixed left-0 top-0 flex items-center justify-center rounded-full border transition-[width,height,border-color,background-color] duration-200 ease-out"
        style={{
          width: isProject ? 66 : isInteractive ? 38 : 26,
          height: isProject ? 66 : isInteractive ? 38 : 26,
          borderColor: isProject
            ? "rgba(216, 192, 138, 0.85)"
            : isInteractive
              ? "rgba(216, 192, 138, 0.6)"
              : "rgba(237, 233, 224, 0.28)",
          backgroundColor: isProject ? "rgba(7, 8, 10, 0.72)" : "transparent",
          backdropFilter: isProject ? "blur(6px)" : "none",
        }}
      >
        {isProject && (
          <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#D8C08A]">
            Open
          </span>
        )}
      </div>
      <div
        ref={dotRef}
        className="fixed left-0 top-0 h-1.5 w-1.5 rounded-full bg-[#D8C08A]"
        style={{
          opacity: isProject ? 0 : 0.9,
          transition: "opacity 150ms ease-out",
        }}
      />
    </div>
  );
}
