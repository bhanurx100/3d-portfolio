import { lazy, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Download, ExternalLink, Eye, X } from "lucide-react";
import { Closing, scrollToY } from "@/components/shell/Chrome";
import { Magnetic, Marquee, MaskLines } from "@/components/shell/Primitives";
import HeroAboutPortrait from "@/components/three/HeroAboutPortrait";
import PassageWorld from "@/components/three/PassageWorld";
import { A } from "@/data/assets";
import { ORDER, PRODUCTS } from "@/data/products";
import { getResumeDownloadMeta } from "@/data/siteConfig";
import { trackEvent } from "@/lib/analytics";

const CorridorScene = lazy(() => import("@/components/three/CorridorScene"));

const HOME_WAYPOINTS = [
  { id: "hero", label: "Hero", accent: "#D8C08A" },
  { id: "about", label: "About", accent: "#D8C08A" },
  { id: "journey", label: "Journey", accent: "#D8C08A" },
  { id: "projects", label: "Work", accent: "#D8C08A" },
  { id: "contact", label: "Contact", accent: "#D8C08A" },
];

const JOURNEY_STEPS = [
  {
    period: "Foundations",
    place: "NIE Mysuru",
    title: "Systems & Computer Science Core",
    summary:
      "Built engineering discipline at The National Institute of Engineering, Mysuru — grounding algorithms, data structures, and collaborative architecture.",
  },
  {
    period: "Production Engineering",
    place: "Cynosure Software Solutions",
    title: "Full-Stack Product Delivery",
    summary:
      "Shipped resilient backend services and responsive interfaces for live operational workflows — learning firsthand where software breaks down under pressure.",
  },
  {
    period: "Product Craft",
    place: "End-to-End Mobile & Web Systems",
    title: "Real-World Friction to Focused Apps",
    summary:
      "Turning everyday complexity across hospitality, local retail, and personal finance into fast, calm, deterministic software.",
  },
];

const PROJECT_EXHIBITIONS = {
  stayease: {
    img: "se_villa",
    alt: "StayEase twilight coastal stone villa and warm architectural lighting",
    deviceImg: "se_pg",
    deviceTitle: "All Stay Types",
    deviceSub: "PGs · Hotels · Flats · Villas",
    deviceStat: "$19–$260 / nt",
  },
  stockpilot: {
    img: "sp_atelier",
    alt: "StockPilot modern neighbourhood grocery counter and oak shelving",
    deviceImg: "sp_counter",
    deviceTitle: "Quick Counter Bill",
    deviceSub: "Kirana & Multi-Shelf POS",
    deviceStat: "Live Stock Sync",
  },
  splitfin: {
    img: "sf_workspace",
    alt: "Splitfin sleek matte smartphone displaying personal finance balances beside card and ledger notebook",
    deviceImg: "sf_receipt",
    deviceTitle: "My Money & Splits",
    deviceSub: "Accounts · Budgets · Groups",
    deviceStat: "Cent-Exact Net",
  },
};

const SEAMLESS_EDGE_MASK =
  "radial-gradient(ellipse 84% 86% at 50% 48%, #000 58%, rgba(0,0,0,0.82) 78%, rgba(0,0,0,0.28) 92%, transparent 100%)";

const scrollToSection = (id) => {
  const el = document.getElementById(id);
  if (el) scrollToY(el.getBoundingClientRect().top + window.scrollY);
};

export default function HomePage() {
  const focusedProjectRef = useRef(null);
  const heroSlotRef = useRef(null);
  const aboutSlotRef = useRef(null);
  const aboutSectionRef = useRef(null);
  const [activeKey, setActiveKey] = useState("stayease");
  const [resumeOpen, setResumeOpen] = useState(false);
  const resumeMeta = getResumeDownloadMeta();

  useEffect(() => {
    if (!resumeOpen) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") setResumeOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [resumeOpen]);

  const openResumeModal = () => {
    trackEvent("resume_view");
    setResumeOpen(true);
  };

  const focusProduct = (key) => {
    focusedProjectRef.current = key;
    if (key) setActiveKey(key);
  };

  return (
    <main className="passage-atmosphere bg-[#050608] text-[#EDE9E0]" data-testid="home-page">
      {/* Continuous Desktop Dual-Ratio Portrait Morph (3:4 Folded Hands -> 4:3 MacBook Desk) */}
      <HeroAboutPortrait
        heroSlotRef={heroSlotRef}
        aboutSlotRef={aboutSlotRef}
        aboutSectionRef={aboutSectionRef}
      />

      <PassageWorld
        waypoints={HOME_WAYPOINTS}
        accent="#D8C08A"
        bg="#050608"
        testid="passage-section"
        renderScene={({ progressRef, running, isMobile, onContextLost }) => (
          <CorridorScene
            progressRef={progressRef}
            focusedProjectRef={focusedProjectRef}
            running={running}
            isMobile={isMobile}
            onContextLost={onContextLost}
          />
        )}
      >
        {/* ============================================================
            PASSAGE 01 — OPENING HERO
            Desktop: Concise Identity Left + Folded-Hands 3:4 Portrait Right
            Mobile: Deliberate Mobile-First Composition with Prominent Folded-Hands Portrait
           ============================================================ */}
        <section
          id="hero"
          data-testid="hero-stage"
          className="relative flex min-h-[100dvh] items-center overflow-hidden px-5 pb-16 pt-20 md:px-12 lg:px-16"
        >
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
            <img
              src={A("home_atrium")}
              alt=""
              className="h-full w-full object-cover opacity-[0.18] lg:opacity-[0.1]"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(5,6,8,0.62) 0%, rgba(5,6,8,0.28) 46%, rgba(5,6,8,0.9) 100%)",
              }}
            />
            <div className="hero-glow absolute inset-0" />
            <div className="hairline-rule absolute left-[8%] top-[22%] h-px w-[38%] opacity-55" />
          </div>

          <div className="relative z-10 mx-auto grid w-full max-w-[1400px] items-center gap-6 lg:grid-cols-12 lg:gap-10">
            {/* Mobile Hero Folded-Hands Portrait — Exact 3:4 Natural Ratio, Zero Crop */}
            <div className="relative mx-auto aspect-[3/4] w-full max-w-[285px] sm:max-w-[320px] lg:hidden" data-testid="hero-portrait-mobile">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -inset-4 rounded-full blur-2xl"
                style={{
                  background:
                    "radial-gradient(ellipse 68% 64% at 50% 45%, rgba(216,192,138,0.16) 0%, rgba(16,18,24,0.22) 55%, transparent 80%)",
                }}
              />
              <img
                src={A("profile_hero_folded")}
                alt="Bhanuprasad L — Product Engineer"
                className="relative z-10 h-full w-full object-contain"
                style={{
                  maskImage: SEAMLESS_EDGE_MASK,
                  WebkitMaskImage: SEAMLESS_EDGE_MASK,
                  filter: "saturate(0.88) contrast(1.03) drop-shadow(0 24px 48px rgba(0, 0, 0, 0.85))",
                }}
              />
            </div>

            {/* Identity & Actions */}
            <div className="min-w-0 text-center lg:col-span-6 lg:text-left">
              <div className="flex items-center justify-center gap-3 lg:justify-start">
                <span className="h-px w-7 bg-[#D8C08A]/75 sm:w-10" />
                <span className="f-mono tracking-[0.24em] text-[#D8C08A]">
                  Product Engineer
                </span>
              </div>

              <MaskLines
                as="h1"
                inView={false}
                delay={0.06}
                lines={["Bhanuprasad L"]}
                className="f-display mt-3 text-[clamp(1.9rem,8.4vw,3.1rem)] leading-[0.94] tracking-[-0.03em] text-[#F5F1E8] lg:mt-4 lg:text-[clamp(2.85rem,4.1vw,4.35rem)]"
                data-testid="hero-headline"
              />

              <p className="f-serif mx-auto mt-3.5 max-w-xl text-[19px] leading-[1.3] text-[#F2EEE5] sm:text-[25px] lg:mx-0 lg:mt-5 lg:text-[29px]">
                I turn real-world friction into thoughtful, working web and mobile products.
              </p>

              <p className="mt-3.5 hidden max-w-lg text-[15px] leading-relaxed text-[#EDE9E0]/76 lg:block">
                From problem framing and resilient backend data models to tactile mobile-first interfaces across hospitality, local retail billing, and personal finance.
              </p>

              <div className="mt-6 hidden max-w-lg grid-cols-3 gap-5 border-y border-white/10 py-3.5 lg:grid">
                <div>
                  <span className="f-mono c-acc block">Focus</span>
                  <span className="mt-0.5 block text-xs text-[#EDE9E0]/85">Web &amp; Mobile Craft</span>
                </div>
                <div>
                  <span className="f-mono c-acc block">Experience</span>
                  <span className="mt-0.5 block text-xs text-[#EDE9E0]/85">Cynosure Solutions</span>
                </div>
                <div>
                  <span className="f-mono c-acc block">Education</span>
                  <span className="mt-0.5 block text-xs text-[#EDE9E0]/85">NIE Mysuru</span>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-5 lg:mt-8 lg:justify-start">
                <Magnetic>
                  <button
                    type="button"
                    onClick={openResumeModal}
                    data-testid="hero-view-resume-btn"
                    className="group inline-flex items-center gap-2.5 rounded-full border border-[#D8C08A] bg-[#D8C08A]/12 px-5 py-2.5 text-sm font-medium tracking-wide text-[#EDE9E0] transition-all duration-300 hover:bg-[#D8C08A] hover:text-[#070809] active:scale-[0.98]"
                  >
                    <Eye size={15} className="transition-transform duration-300 group-hover:scale-110" />
                    <span>View Resume</span>
                  </button>
                </Magnetic>

                <button
                  type="button"
                  onClick={() => scrollToSection("projects")}
                  data-testid="hero-explore-projects-btn"
                  className="f-mono link-line pb-1 text-[#EDE9E0]/82 transition-colors hover:text-[#D8C08A]"
                >
                  Explore Work ↓
                </button>
              </div>
            </div>

            {/* Desktop Hero MacBook Working Portrait Anchor — Exact 4:3 Natural Ratio */}
            <div className="hidden lg:col-span-6 lg:flex lg:items-center lg:justify-end">
              <div
                ref={heroSlotRef}
                data-testid="hero-portrait-anchor"
                className="aspect-[4/3] w-full max-w-[540px] xl:max-w-[590px]"
              />
            </div>
          </div>
        </section>

        <Marquee
          items={["Built around real workflows", "StayEase · StockPilot · Splitfin", "Full-stack & mobile craft"]}
          className="relative z-10 bg-black/20"
        />

        {/* ============================================================
            PASSAGE 02 — ABOUT ME
            Desktop: Morphs seamlessly into MacBook Working Portrait (4:3)
            Mobile: Reveals MacBook Working Portrait (4:3) naturally
           ============================================================ */}
        <section
          id="about"
          ref={aboutSectionRef}
          data-testid="about-passage-section"
          className="relative flex min-h-[100dvh] items-center overflow-hidden border-t border-white/10 px-5 py-20 md:px-12 lg:px-16"
        >
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
            <img
              src={A("home_studio")}
              alt=""
              className="h-full w-full object-cover opacity-[0.16]"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(5,6,8,0.8) 0%, rgba(5,6,8,0.48) 50%, rgba(5,6,8,0.88) 100%)",
              }}
            />
          </div>

          <div className="relative z-10 mx-auto grid w-full max-w-[1400px] items-center gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-5">
              {/* Desktop destination anchor — exact 3:4 natural ratio for `profile-about.png` (folded-hands portrait) */}
              <div
                ref={aboutSlotRef}
                data-testid="about-portrait-anchor"
                className="hidden aspect-[3/4] w-full max-w-[400px] xl:max-w-[440px] lg:block"
              />

              {/* Mobile MacBook Working Portrait (`profile-hero.png`) — exact 4:3 natural ratio */}
              <div
                className="relative mx-auto aspect-[4/3] w-full max-w-[360px] lg:hidden"
                data-testid="about-portrait-mobile"
              >
                <img
                  src={A("profile_working")}
                  alt="Bhanuprasad L working at desk with MacBook"
                  className="h-full w-full object-contain"
                  style={{
                    maskImage: SEAMLESS_EDGE_MASK,
                    WebkitMaskImage: SEAMLESS_EDGE_MASK,
                    filter: "drop-shadow(0 24px 48px rgba(0, 0, 0, 0.78))",
                  }}
                />
              </div>
            </div>

            <div className="min-w-0 space-y-7 lg:col-span-7">
              <div data-passage-reveal>
                <span className="f-mono c-acc block">About · Product Engineering</span>
                <MaskLines
                  as="h2"
                  lines={["Full-stack craft,", "shaped around real", "human workflows."]}
                  className="f-display mt-3 text-[clamp(1.85rem,6.2vw,3.6rem)] leading-[0.95] text-[#F5F1E8]"
                />
                <p className="f-serif mt-4 max-w-xl text-xl leading-relaxed text-[#EDE9E0]/90">
                  Solid backend systems still fail people when the surface opens noisily under pressure. I own problem framing, data models, and calm interfaces end to end.
                </p>
              </div>

              <div
                data-passage-reveal
                data-testid="about-credentials-grid"
                className="grid gap-6 border-t border-white/15 pt-6 sm:grid-cols-2"
              >
                <div>
                  <span className="f-mono c-acc block">Experience</span>
                  <h3 className="mt-1.5 font-serif text-xl text-[#F5F1E8]">
                    Cynosure Software Solutions
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-[#EDE9E0]/75">
                    Full-stack engineering across production services and everyday operational workflows.
                  </p>
                </div>

                <div>
                  <span className="f-mono c-acc block">Education</span>
                  <h3 className="mt-1.5 font-serif text-xl text-[#F5F1E8]">NIE Mysuru</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-[#EDE9E0]/75">
                    Computer science fundamentals and systems thinking at The National Institute of Engineering.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================
            PASSAGE 03 — PROFESSIONAL JOURNEY
           ============================================================ */}
        <section
          id="journey"
          data-testid="journey-passage-section"
          className="relative flex min-h-[100dvh] items-center overflow-hidden border-t border-white/10 px-5 py-20 md:px-12 lg:px-16"
        >
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
            <img
              src={A("home_journey")}
              alt=""
              className="h-full w-full object-cover opacity-[0.18]"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(5,6,8,0.82) 0%, rgba(5,6,8,0.46) 50%, rgba(5,6,8,0.88) 100%)",
              }}
            />
          </div>

          <div className="relative z-10 mx-auto w-full max-w-[1400px]">
            <div data-passage-reveal className="min-w-0 max-w-3xl">
              <span className="f-mono c-acc block">Journey</span>
              <MaskLines
                as="h2"
                lines={["From systems fundamentals", "to shipped product craft."]}
                className="f-display mt-3 text-[clamp(1.85rem,5.5vw,3.6rem)] leading-[0.95] text-[#F5F1E8]"
              />
            </div>

            <div className="mt-12 grid gap-8 border-t border-white/15 pt-8 lg:grid-cols-3">
              {JOURNEY_STEPS.map((step) => (
                <article
                  key={step.place}
                  data-passage-reveal="timeline"
                  className="border-l border-[#D8C08A]/35 pl-5 lg:border-l-0 lg:border-t lg:border-white/15 lg:pl-0 lg:pt-5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="f-mono c-acc">{step.period}</span>
                    <span className="f-mono c-mut">{step.place}</span>
                  </div>
                  <h3 className="mt-2.5 font-serif text-2xl text-[#F5F1E8]">{step.title}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-[#EDE9E0]/78">{step.summary}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================================
            PASSAGE 04 — SINGLE PROJECTS SHOWCASE (ENTIRE COMPOSITION CLICKABLE)
           ============================================================ */}
        <section
          id="projects"
          data-testid="projects-passage-section"
          className="relative flex min-h-[100dvh] items-center border-t border-white/10 px-5 py-20 md:px-12 lg:px-16"
        >
          <div className="mx-auto w-full max-w-[1400px]">
            <div data-passage-reveal className="mb-12 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div className="min-w-0">
                <span className="f-mono c-acc block">Selected Mobile Worlds</span>
                <MaskLines
                  as="h2"
                  lines={["Three products.", "Three live iPhone worlds."]}
                  className="f-display mt-3 text-[clamp(1.9rem,5.6vw,3.8rem)] leading-[0.95] text-[#F5F1E8]"
                />
              </div>
              <p className="f-serif max-w-md text-lg text-[#EDE9E0]/78 md:text-xl">
                Select any composition to step directly into its interactive mobile showcase.
              </p>
            </div>

            <div className="space-y-9" data-testid="door-links">
              {ORDER.map((key, idx) => {
                const p = PRODUCTS[key];
                const vis = PROJECT_EXHIBITIONS[key];
                const isActive = activeKey === key;
                const reverse = idx % 2 === 1;

                return (
                  <Link
                    key={key}
                    to={p.route}
                    data-testid={`door-link-${key}`}
                    data-cursor="project"
                    data-passage-reveal={idx % 2 === 0 ? "left" : "right"}
                    onMouseEnter={() => focusProduct(key)}
                    onFocus={() => focusProduct(key)}
                    className="group relative grid items-center gap-6 overflow-hidden border bg-[#080a0f]/82 p-4 backdrop-blur-md transition-all duration-500 hover:bg-[#0b0e15]/95 md:p-6 lg:grid-cols-12 lg:gap-10"
                    style={{
                      "--acc": p.theme.acc,
                      borderColor: isActive ? `${p.theme.acc}99` : "rgba(255,255,255,0.12)",
                      boxShadow: isActive ? `0 36px 90px -36px ${p.theme.glow}` : "none",
                    }}
                  >
                    <div
                      className={`cinematic-frame pointer-events-none relative aspect-[16/10] overflow-hidden bg-black/50 lg:col-span-7 ${
                        reverse ? "lg:order-2" : ""
                      }`}
                    >
                      <img
                        src={A(vis.img)}
                        alt={vis.alt}
                        className="image-reveal h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#06070a]/85 via-[#06070a]/20 to-transparent" />

                      <div
                        className="absolute bottom-3 right-3 w-[112px] overflow-hidden rounded-[22px] border border-white/25 bg-[#0a0b0e] p-1 shadow-[0_24px_48px_rgba(0,0,0,0.85)] transition-transform duration-500 ease-out group-hover:-translate-y-1.5 sm:bottom-5 sm:right-5 sm:w-[144px] sm:rounded-[26px]"
                      >
                        <div className="relative aspect-[9/17] overflow-hidden rounded-[18px] bg-[#080a0f] sm:rounded-[22px]">
                          <img
                            src={A(vis.deviceImg)}
                            alt=""
                            className="h-full w-full object-cover opacity-85"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-black/30" />
                          <div className="absolute left-1/2 top-1.5 h-2 w-10 -translate-x-1/2 rounded-full bg-black/90" />
                          <div className="absolute inset-x-2 bottom-2.5">
                            <span
                              className="block font-mono text-[7px] uppercase tracking-wider"
                              style={{ color: p.theme.acc }}
                            >
                              {vis.deviceStat}
                            </span>
                            <p className="mt-0.5 truncate text-[10px] font-semibold text-white sm:text-xs">
                              {vis.deviceTitle}
                            </p>
                            <p className="truncate text-[8px] text-white/70">{vis.deviceSub}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div
                      className={`pointer-events-none flex flex-col justify-between space-y-4 px-1 py-2 lg:col-span-5 ${
                        reverse ? "lg:order-1" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="f-mono" style={{ color: p.theme.acc }}>
                          {p.domain}
                        </span>
                        <ArrowUpRight
                          size={18}
                          className="shrink-0 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1"
                          style={{ color: p.theme.acc }}
                        />
                      </div>

                      <div>
                        <h3
                          className="f-display text-4xl transition-transform duration-500 group-hover:translate-x-1 sm:text-5xl"
                          style={{ color: p.theme.acc }}
                        >
                          {p.name}
                        </h3>
                        <p className="mt-3 max-w-md text-sm leading-relaxed text-[#EDE9E0]/84 sm:text-base">
                          {p.shortLine}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* ============================================================
            PASSAGE 05 — OBSIDIAN TERMINUS (CONTACT)
           ============================================================ */}
        <Closing />
      </PassageWorld>

      {/* Resume Preview Modal — View first, optional Download */}
      {resumeOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md md:p-8"
          data-testid="resume-preview-modal"
          role="dialog"
          aria-modal="true"
          aria-label="Resume Preview"
          onClick={() => setResumeOpen(false)}
        >
          <div
            className="flex h-[88dvh] w-full max-w-4xl flex-col overflow-hidden border border-white/15 bg-[#0b0d12] shadow-[0_40px_100px_rgba(0,0,0,0.9)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-3.5">
              <div>
                <span className="f-mono c-acc block">Curriculum Vitae</span>
                <span className="text-sm font-medium text-[#EDE9E0]">Bhanuprasad L — Product Engineer</span>
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                <a
                  href={resumeMeta.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="resume-open-tab-btn"
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/20 px-3.5 py-1.5 text-xs text-[#EDE9E0] transition-colors hover:border-[#D8C08A] hover:text-[#D8C08A]"
                >
                  <ExternalLink size={13} />
                  <span>Open Tab</span>
                </a>
                <a
                  href={resumeMeta.href}
                  download={resumeMeta.isExternalDrive ? undefined : resumeMeta.fileName}
                  target={resumeMeta.isExternalDrive ? "_blank" : undefined}
                  rel={resumeMeta.isExternalDrive ? "noopener noreferrer" : undefined}
                  onClick={() => trackEvent("resume_download")}
                  data-testid="resume-modal-download-btn"
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#D8C08A] bg-[#D8C08A] px-3.5 py-1.5 text-xs font-medium text-[#070809] transition-opacity hover:opacity-90"
                >
                  <Download size={13} />
                  <span>Download PDF</span>
                </a>
                <button
                  type="button"
                  onClick={() => setResumeOpen(false)}
                  aria-label="Close resume preview"
                  data-testid="resume-modal-close-btn"
                  className="ml-1 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-[#EDE9E0]/80 transition-colors hover:border-white/40 hover:text-white"
                >
                  <X size={15} />
                </button>
              </div>
            </div>
            <div className="relative flex-1 bg-[#111318]">
              <iframe
                src={resumeMeta.href}
                title="Bhanuprasad L Resume"
                className="h-full w-full border-0"
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
