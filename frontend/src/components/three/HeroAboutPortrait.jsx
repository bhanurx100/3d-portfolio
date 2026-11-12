import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { A } from "@/data/assets";

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const smoothstep = (edge0, edge1, x) => {
  const t = clamp01((x - edge0) / Math.max(0.0001, edge1 - edge0));
  return t * t * (3 - 2 * t);
};

// Soft radial CSS edge integration so dark studio & desk borders melt seamlessly into the 3D corridor
const SEAMLESS_MASK =
  "radial-gradient(ellipse 84% 86% at 50% 48%, #000 58%, rgba(0,0,0,0.82) 78%, rgba(0,0,0,0.28) 92%, transparent 100%)";

/**
 * Scroll-choreographed Desktop Portrait Morph:
 * Hero (`profile_hero_folded` 3:4 folded-hands) -> About (`profile_working` 4:3 MacBook desk).
 * Preserves each image's exact original aspect ratio (`object-contain`), banks subtly in 3D space mid-scroll,
 * and integrates cleanly with the #050608 3D corridor via radial CSS edge masking.
 */
export default function HeroAboutPortrait({ heroSlotRef, aboutSlotRef, aboutSectionRef }) {
  const stageRef = useRef(null);
  const heroLayerRef = useRef(null);
  const aboutLayerRef = useRef(null);
  const glowRef = useRef(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    let rafId = null;

    const updatePosition = () => {
      const el = stageRef.current;
      const heroSlot = heroSlotRef.current;
      const aboutSlot = aboutSlotRef.current;
      const aboutSec = aboutSectionRef?.current;
      if (!el || !heroSlot || !aboutSlot) return;

      if (window.innerWidth < 1024) {
        el.style.display = "none";
        return;
      }

      const hr = heroSlot.getBoundingClientRect();
      const ar = aboutSlot.getBoundingClientRect();
      if (hr.width < 10 || ar.width < 10) return;

      const aboutTopDoc = aboutSec
        ? aboutSec.getBoundingClientRect().top + window.scrollY
        : Math.max(300, ar.top + window.scrollY - 160);
      const endScroll = Math.max(240, aboutTopDoc);
      const raw = clamp01(window.scrollY / endScroll);

      const tX = reduced ? (raw > 0.5 ? 1 : 0) : Math.pow(raw, 0.58);
      const tY = reduced ? (raw > 0.5 ? 1 : 0) : raw;
      const tSize = reduced ? (raw > 0.5 ? 1 : 0) : smoothstep(0, 1, raw);

      const x = hr.left + (ar.left - hr.left) * tX;
      const y = hr.top + (ar.top - hr.top) * tY;
      const w = hr.width + (ar.width - hr.width) * tSize;
      const h = hr.height + (ar.height - hr.height) * tSize;

      const midArc = Math.sin(raw * Math.PI);
      const rotY = reduced ? 0 : -11 * midArc;
      const rotX = reduced ? 0 : 3.5 * midArc;
      const scale = reduced ? 1 : 1 - 0.03 * midArc;

      const offScreen = y + h < -60 || y > window.innerHeight + 60;
      el.style.display = "block";
      el.style.visibility = offScreen ? "hidden" : "visible";
      el.style.width = `${w}px`;
      el.style.height = `${h}px`;
      el.style.transform = `translate3d(${x}px, ${y}px, 0) perspective(1400px) rotateY(${rotY.toFixed(2)}deg) rotateX(${rotX.toFixed(2)}deg) scale(${scale.toFixed(4)})`;
      el.dataset.progress = raw.toFixed(3);
      el.dataset.left = String(Math.round(x));
      el.dataset.top = String(Math.round(y));

      const heroOut = reduced ? (raw > 0.5 ? 1 : 0) : smoothstep(0.05, 0.58, raw);
      const aboutIn = reduced ? (raw > 0.5 ? 1 : 0) : smoothstep(0.32, 0.85, raw);

      if (heroLayerRef.current) {
        const op = 1 - heroOut;
        const s = reduced ? 1 : 1 + heroOut * 0.05;
        const blur = reduced ? 0 : heroOut * 6;
        heroLayerRef.current.style.opacity = op.toFixed(3);
        heroLayerRef.current.style.transform = `scale(${s.toFixed(4)})`;
        heroLayerRef.current.style.filter = `blur(${blur.toFixed(2)}px)`;
        heroLayerRef.current.style.visibility = op <= 0.01 ? "hidden" : "visible";
      }

      if (aboutLayerRef.current) {
        const s = reduced ? 1 : 0.94 + aboutIn * 0.06;
        const blur = reduced ? 0 : (1 - aboutIn) * 6;
        aboutLayerRef.current.style.opacity = aboutIn.toFixed(3);
        aboutLayerRef.current.style.transform = `scale(${s.toFixed(4)})`;
        aboutLayerRef.current.style.filter = `blur(${blur.toFixed(2)}px)`;
        aboutLayerRef.current.style.visibility = aboutIn <= 0.01 ? "hidden" : "visible";
      }

      if (glowRef.current) {
        glowRef.current.style.opacity = String((0.38 + midArc * 0.34).toFixed(3));
      }
    };

    const scheduleUpdate = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updatePosition);
    };

    updatePosition();
    window.addEventListener("scroll", updatePosition, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    ScrollTrigger.addEventListener("refresh", scheduleUpdate);

    const onLenis = () => updatePosition();
    if (window.__lenis?.on) {
      window.__lenis.on("scroll", onLenis);
    }

    const ro = new ResizeObserver(scheduleUpdate);
    if (heroSlotRef.current) ro.observe(heroSlotRef.current);
    if (aboutSlotRef.current) ro.observe(aboutSlotRef.current);

    const settleId = setTimeout(updatePosition, 200);

    return () => {
      clearTimeout(settleId);
      ro.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", updatePosition);
      window.removeEventListener("resize", scheduleUpdate);
      ScrollTrigger.removeEventListener("refresh", scheduleUpdate);
      if (window.__lenis?.off) {
        window.__lenis.off("scroll", onLenis);
      }
    };
  }, [heroSlotRef, aboutSlotRef, aboutSectionRef, reduced]);

  return (
    <div
      ref={stageRef}
      data-testid="shared-desktop-portrait"
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[15] hidden lg:block"
      style={{ willChange: "transform", transformStyle: "preserve-3d" }}
    >
      {/* Subtle warm champagne rim aura (subdued red/warm balance) */}
      <div
        ref={glowRef}
        className="pointer-events-none absolute -inset-8 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(ellipse 68% 64% at 52% 46%, rgba(216,192,138,0.18) 0%, rgba(16,18,24,0.22) 48%, transparent 74%)",
        }}
      />

      {/* Layer 1: Desktop Hero (`profile-hero.png` MacBook working 4:3 portrait, zero crop) */}
      <div
        ref={heroLayerRef}
        data-testid="portrait-hero-layer"
        className="absolute inset-0 flex items-center justify-center"
        style={{ willChange: "opacity, transform, filter" }}
      >
        <img
          src={A("profile_working")}
          alt="Bhanuprasad L working at desk with MacBook"
          className="h-full w-full object-contain"
          style={{
            maskImage: SEAMLESS_MASK,
            WebkitMaskImage: SEAMLESS_MASK,
            filter: "drop-shadow(0 28px 60px rgba(0, 0, 0, 0.85))",
          }}
        />
      </div>

      {/* Layer 2: Desktop About (`profile-about.png` folded-hands 3:4 portrait, zero crop) */}
      <div
        ref={aboutLayerRef}
        data-testid="portrait-about-layer"
        className="absolute inset-0 flex items-center justify-center"
        style={{ opacity: 0, visibility: "hidden", willChange: "opacity, transform, filter" }}
      >
        <img
          src={A("profile_hero_folded")}
          alt="Bhanuprasad L — Product Engineer"
          className="h-full w-full object-contain"
          style={{
            maskImage: SEAMLESS_MASK,
            WebkitMaskImage: SEAMLESS_MASK,
            filter: "saturate(0.88) contrast(1.03) drop-shadow(0 28px 60px rgba(0, 0, 0, 0.85))",
          }}
        />
      </div>
    </div>
  );
}
