import { lazy, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { PhoneFrame, Tilt } from "@/components/frames/frames";
import { StayEaseMobileApp } from "@/components/previews/StayEasePreviews";
import { ArrowLink, MaskLines, Note, Plate } from "@/components/shell/Primitives";
import PassageWorld, { Platform } from "@/components/three/PassageWorld";
import { A } from "@/data/assets";
import { PRODUCTS } from "@/data/products";

const ProductWorldScene = lazy(() => import("@/components/three/ProductWorldScene"));

const p = PRODUCTS.stayease;

const STAYEASE_WAYPOINTS = [
  { id: "se-arrival", label: "Horizon", accent: p.theme.acc },
  { id: "se-iphone", label: "iPhone", accent: p.theme.acc },
  { id: "se-spectrum", label: "Stays", accent: p.theme.acc },
  { id: "se-terminus", label: "Next", accent: p.theme.acc },
];

const CHAPTERS = [
  {
    id: "explore",
    eyebrow: "Traveller Discovery",
    title: "Search stays from PG beds to coastal villas",
    copy: "Compare rooms, bunk pods, apartments, and homestays in calm editorial layout with instant guest/night adjustments and transparent policies.",
    rotY: -7,
    rotX: 2,
  },
  {
    id: "detail",
    eyebrow: "Details & Simulated Trips",
    title: "Gallery inspection, unit choice & check-in passes",
    copy: "Swipe property photography, compare amenities or room tiers, preview total pricing, and generate sample trip passes without cluttered urgency.",
    rotY: 4,
    rotX: -2,
  },
  {
    id: "owner",
    eyebrow: "Owner Pocket Hub",
    title: "Beds, rooms & pricing updated on the move",
    copy: "Switch seamlessly to the Owner view inside the same mobile instrument to toggle pod/room availability and adjust nightly tariffs.",
    rotY: -5,
    rotX: 3,
  },
  {
    id: "admin",
    eyebrow: "Admin Verification",
    title: "Oversight across hosts, safety & approvals",
    copy: "Inspect onboarding documents and approve pending PGs, homestays, or boutique hotels directly through a streamlined verification queue.",
    rotY: 6,
    rotX: 1,
  },
];

export default function StayEasePage() {
  const [activeStage, setActiveStage] = useState("explore");
  const activeChapter = CHAPTERS.find((c) => c.id === activeStage) || CHAPTERS[0];

  useEffect(() => {
    const els = CHAPTERS.map((c) => document.getElementById(`se-chap-${c.id}`)).filter(Boolean);
    if (!els.length) return undefined;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveStage(entry.target.dataset.stage);
          }
        });
      },
      { rootMargin: "-38% 0px -42% 0px", threshold: 0.05 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <main
      className="min-h-screen"
      style={{
        background: p.theme.bg,
        color: p.theme.ink,
        "--bg": p.theme.bg,
        "--surface": p.theme.surf,
        "--ink": p.theme.ink,
        "--mut": p.theme.mut,
        "--acc": p.theme.acc,
        "--line": p.theme.line,
      }}
      data-testid="stayease-page"
    >
      <PassageWorld
        waypoints={STAYEASE_WAYPOINTS}
        accent={p.theme.acc}
        bg="#070D1F"
        testid="stayease-passage"
        renderScene={({ progressRef, running, isMobile, onContextLost }) => (
          <ProductWorldScene
            variant="stayease"
            progressRef={progressRef}
            running={running}
            isMobile={isMobile}
            onContextLost={onContextLost}
          />
        )}
      >
        {/* SCENE 01 — ARCHITECTURAL ARRIVAL */}
        <section
          id="se-arrival"
          className="relative flex min-h-[100dvh] items-center border-b b-line px-5 pb-20 pt-24 md:px-12 lg:px-16"
        >
          <div className="mx-auto grid w-full max-w-[1400px] gap-12 lg:grid-cols-12 lg:items-end">
            <div className="min-w-0 lg:col-span-6">
              <div className="mb-6 flex flex-wrap items-center gap-4">
                <Link
                  to="/#projects"
                  data-testid="stayease-return-portfolio"
                  className="f-mono inline-flex items-center gap-2 text-[#E2D9C8]/75 transition-colors hover:text-[#D4AF37]"
                >
                  <ArrowLeft size={13} />
                  Back to Passage
                </Link>
                <span className="h-3 w-px bg-white/15" />
                <Note accent>{p.index} // {p.domain}</Note>
                <Platform p={{ ...p, mobileBadge: "iPHONE SHOWCASE" }} />
              </div>

              <MaskLines
                as="h1"
                inView={false}
                lines={[p.name]}
                className="f-display text-[clamp(2.6rem,9.5vw,6.2rem)] leading-[0.92]"
                style={{ color: p.theme.acc }}
                data-testid="stayease-title"
              />

              <p className="f-serif mt-5 max-w-xl text-xl leading-snug text-[#F8F5EE] md:text-2xl">
                {p.line}
              </p>

              <p className="mt-4 max-w-lg text-sm leading-relaxed text-[#E2D9C8]/75">
                {p.promise}
              </p>
            </div>

            <div data-passage-reveal className="lg:col-span-6">
              <Tilt max={3.5}>
                <div className="cinematic-frame focus-ring overflow-hidden border border-[#D4AF37]/25 bg-[#0A132C]/80 backdrop-blur-md">
                  <img
                    src={A("se_villa")}
                    alt="Coastal stone hospitality villa lit warmly at twilight"
                    className="image-reveal aspect-[3/2] w-full object-cover"
                  />
                  <div className="flex items-center justify-between px-5 py-3">
                    <span className="f-mono c-acc">Three Roles · One Mobile Build</span>
                    <span className="f-mono c-mut">Traveller · Owner · Admin</span>
                  </div>
                </div>
              </Tilt>
            </div>
          </div>
        </section>

        {/* SCENE 02 — CHOREOGRAPHED 3D IPHONE MOBILE SHOWCASE */}
        <section
          id="se-iphone"
          data-testid="stayease-mobile-section"
          className="relative border-b b-line px-5 py-20 md:px-12 lg:px-16 lg:py-28"
        >
          <div className="mx-auto grid w-full max-w-[1400px] gap-12 lg:grid-cols-12 lg:items-start">
            {/* Left Scrolling Narrative Chapters */}
            <div className="space-y-6 lg:col-span-6 lg:space-y-16">
              <div>
                <Note accent>Interactive 3D iPhone Stage</Note>
                <h2 className="f-display mt-3 text-[clamp(2.4rem,6vw,4.5rem)]">
                  Explore every role inside the device
                </h2>
                <div className="mt-4 flex flex-wrap gap-2 lg:hidden">
                  {CHAPTERS.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setActiveStage(c.id)}
                      className={`rounded-full border px-3 py-1 font-mono text-[9.5px] uppercase tracking-wider ${
                        activeStage === c.id
                          ? "border-[#D4AF37] bg-[#D4AF37] text-[#070D1F]"
                          : "border-white/15 text-[#E2D9C8]/75"
                      }`}
                    >
                      {c.id}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-6 lg:space-y-24">
                {CHAPTERS.map((ch) => {
                  const selected = activeStage === ch.id;
                  return (
                    <article
                      key={ch.id}
                      id={`se-chap-${ch.id}`}
                      data-stage={ch.id}
                      onClick={() => setActiveStage(ch.id)}
                      className={`cursor-pointer border-t pt-5 transition-opacity duration-500 ${
                        selected ? "border-[#D4AF37] opacity-100" : "border-white/15 opacity-55 hover:opacity-85"
                      }`}
                    >
                      <span className="f-mono c-acc block">{ch.eyebrow}</span>
                      <h3 className="mt-2 font-serif text-2xl text-[#F8F5EE] md:text-3xl">{ch.title}</h3>
                      <p className="mt-3 max-w-lg text-sm leading-relaxed text-[#E2D9C8]/80">{ch.copy}</p>
                    </article>
                  );
                })}
              </div>
            </div>

            {/* Right Sticky Choreographed 3D iPhone Showcase */}
            <div className="flex flex-col items-center lg:sticky lg:top-24 lg:col-span-5 lg:col-start-8">
              <span className="f-mono c-acc mb-4">
                Live Interactive App · {activeChapter.eyebrow}
              </span>
              <div className="w-full max-w-[335px] sm:max-w-[355px]">
                <PhoneFrame
                  accent={p.theme.acc}
                  poseRotateY={activeChapter.rotY}
                  poseRotateX={activeChapter.rotX}
                  motionMode="architectural"
                >
                  <StayEaseMobileApp activeStage={activeStage} />
                </PhoneFrame>
              </div>
            </div>
          </div>
        </section>

        {/* SCENE 03 — HOSPITALITY SPECTRUM PLATES */}
        <section id="se-spectrum" className="relative border-b b-line px-5 py-20 md:px-12 lg:px-16">
          <div className="mx-auto max-w-[1400px]">
            <div data-passage-reveal className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <Note accent>03 // Accommodation Breadth</Note>
                <h2 className="f-display mt-3 text-4xl sm:text-5xl">
                  From PG pods to coastal villas
                </h2>
              </div>
              <Note>Hotels · PGs · Hostels · Homestays · Apartments · Villas</Note>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 md:items-start">
              <Plate
                id="se_hotel"
                variant="curtain"
                label="Boutique Hotels"
                spec="Rooms & Policies"
                caption="Compare room tiers, quiet wings, and transparent 48-hour cancellation rules without dark-pattern urgency"
              />
              <Plate
                id="se_pg"
                variant="curtain"
                label="PGs & Hostels"
                spec="Bed-Level Monthly Plans"
                caption="Private timber bunk pods with biometric entry, lockers, and meal plans managed bed by bed"
              />
              <Plate
                id="se_homestay"
                variant="curtain"
                label="Homestays & Lodges"
                spec="Host Calendars"
                caption="Hillside family stays and local lodges with live check-in passes and curated amenities"
              />
              <Plate
                id="se_apartment"
                variant="curtain"
                label="Apartments & Flats"
                spec="Whole-Unit Stays"
                caption="1BHK and 2BHK residences with self check-in, full kitchens, and work-ready desks for longer stays"
              />
              <Plate
                id="se_studio"
                variant="curtain"
                label="Private Studios"
                spec="Solo & Business Travel"
                caption="Compact urban studios filtered by location, guest count, and nightly tariff transparency"
              />
              <Plate
                id="se_townhouse"
                variant="curtain"
                label="Owner Hub & Admin"
                spec="Live Occupancy Control"
                caption="Owners toggle bed or room status and adjust pricing on mobile while admins verify onboarding safety docs"
              />
            </div>
          </div>
        </section>

        {/* SCENE 04 — NEXT PRODUCT DOORWAY */}
        <section id="se-terminus" className="relative px-5 py-20 md:px-12 lg:px-16">
          <div className="mx-auto max-w-[1400px]">
            <div
              data-passage-reveal
              className="flex flex-col items-start justify-between gap-6 border border-[#D4AF37]/25 bg-[#0A1128]/82 p-8 backdrop-blur-md md:flex-row md:items-center"
            >
              <div>
                <Note accent>Next Product Passage // 02</Note>
                <h3 className="f-display mt-2 text-4xl text-[#F59E0B] md:text-5xl">StockPilot</h3>
                <p className="f-serif mt-2 text-lg text-[#E2D9C8]/85">
                  Continue to mobile-first retail inventory and neighbourhood counter billing.
                </p>
              </div>
              <div className="flex flex-wrap gap-4">
                <ArrowLink to="/products/stockpilot" testid="stayease-next-stockpilot">
                  Open StockPilot
                </ArrowLink>
                <ArrowLink to="/#projects" testid="stayease-back-home">
                  All Projects
                </ArrowLink>
              </div>
            </div>
          </div>
        </section>
      </PassageWorld>
    </main>
  );
}
