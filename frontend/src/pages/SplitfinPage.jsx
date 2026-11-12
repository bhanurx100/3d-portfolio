import { lazy, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Smartphone } from "lucide-react";
import { PhoneFrame, Tilt } from "@/components/frames/frames";
import { SplitfinLedgerProvider, SplitfinMobilePrototype } from "@/components/previews/SplitfinPreviews";
import { ArrowLink, MaskLines, Note, Plate } from "@/components/shell/Primitives";
import PassageWorld, { Platform } from "@/components/three/PassageWorld";
import { A } from "@/data/assets";
import { PRODUCTS } from "@/data/products";

const ProductWorldScene = lazy(() => import("@/components/three/ProductWorldScene"));

const p = PRODUCTS.splitfin;

const SPLITFIN_WAYPOINTS = [
  { id: "sf-horizon", label: "Overview", accent: p.theme.acc },
  { id: "sf-iphone", label: "App", accent: p.theme.acc },
  { id: "sf-moments", label: "Workflows", accent: p.theme.acc },
  { id: "sf-terminus", label: "Next", accent: p.theme.acc },
];

const SF_CHAPTERS = [
  {
    id: "money",
    eyebrow: "Accounts & Transactions",
    title: "Checking, cards, income & true personal spend",
    copy: "Track checking, card, and cash balances together. Add an income or expense entry to any account and watch your balances and spending breakdown update immediately.",
    rotY: -5,
    rotX: 2,
  },
  {
    id: "budgets",
    eyebrow: "Budgets & Analytics",
    title: "Category limits & live budget utilization",
    copy: "Set monthly caps per spending category, track remaining headroom, and compare actual spend across categories without leaving the phone.",
    rotY: 4,
    rotX: -2,
  },
  {
    id: "groups",
    eyebrow: "Shared Groups & Splits",
    title: "Equal or custom group splits tied to your accounts",
    copy: "Log a shared bill inside a group, pick who paid and who participated, and automatically separate your personal share from what friends owe you.",
    rotY: -4,
    rotX: 2,
  },
  {
    id: "settle",
    eyebrow: "Settlements & Ledger",
    title: "Full or partial transfers clear balances live",
    copy: "Record an illustrative settlement transfer and watch group receivables convert into liquid cash without double-counting net worth.",
    rotY: 5,
    rotX: 1,
  },
];

export default function SplitfinPage() {
  const [activeStage, setActiveStage] = useState("money");
  const activeChapter = SF_CHAPTERS.find((c) => c.id === activeStage) || SF_CHAPTERS[0];

  useEffect(() => {
    const els = SF_CHAPTERS.map((c) => document.getElementById(`sf-chap-${c.id}`)).filter(Boolean);
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
    <SplitfinLedgerProvider>
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
        data-testid="splitfin-page"
      >
        <PassageWorld
          waypoints={SPLITFIN_WAYPOINTS}
          accent={p.theme.acc}
          bg="#071120"
          testid="splitfin-passage"
          renderScene={({ progressRef, running, isMobile, onContextLost }) => (
            <ProductWorldScene
              variant="splitfin"
              progressRef={progressRef}
              running={running}
              isMobile={isMobile}
              onContextLost={onContextLost}
            />
          )}
        >
          {/* SCENE 01 — PERSONAL FINANCE & SHARED LEDGER ARRIVAL */}
          <section
            id="sf-horizon"
            className="relative flex min-h-[100dvh] items-center border-b b-line px-5 pb-20 pt-24 md:px-12 lg:px-16"
          >
            <div className="mx-auto grid w-full max-w-[1400px] gap-12 lg:grid-cols-12 lg:items-end">
              <div className="min-w-0 lg:col-span-6">
                <div className="mb-6 flex flex-wrap items-center gap-4">
                  <Link
                    to="/#projects"
                    data-testid="splitfin-return-portfolio"
                    className="f-mono inline-flex items-center gap-2 text-[#F3F0E6]/75 transition-colors hover:text-[#2DD4BF]"
                  >
                    <ArrowLeft size={13} />
                    Back to Work
                  </Link>
                  <span className="h-3 w-px bg-white/15" />
                  <Note accent>{p.domain}</Note>
                  <Platform p={{ ...p, mobileBadge: "MOBILE ONLY" }} />
                  {p.status?.badge && (
                    <span
                      className="rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-widest text-[#F3F0E6]/80"
                      data-testid="splitfin-status-badge"
                    >
                      {p.status.badge}
                    </span>
                  )}
                </div>

                <MaskLines
                  as="h1"
                  inView={false}
                  lines={[p.name]}
                  className="f-display text-[clamp(2.6rem,9.5vw,6.2rem)] leading-[0.92]"
                  style={{ color: p.theme.acc }}
                  data-testid="splitfin-title"
                />

                <p className="f-serif mt-5 max-w-xl text-xl leading-snug text-[#F3F0E6] md:text-2xl">{p.line}</p>

                <div
                  className="mt-6 flex max-w-xl items-start gap-3 border border-[#2DD4BF]/35 bg-[#0D3B3E]/65 px-4 py-3.5 backdrop-blur-md"
                  data-testid="splitfin-mobile-only-callout"
                >
                  <Smartphone size={18} className="mt-0.5 shrink-0 text-[#2DD4BF]" />
                  <p className="text-xs leading-relaxed text-[#F3F0E6]/85">
                    Mobile-only personal finance and shared ledger app using deterministic sample accounts, budgets, and illustrative splits.
                  </p>
                </div>
              </div>

              <div data-passage-reveal className="lg:col-span-6">
                <Tilt max={3.5}>
                  <div className="cinematic-frame focus-ring overflow-hidden border border-[#2DD4BF]/25 bg-[#081526]/85 backdrop-blur-md">
                    <img
                      src={A("sf_workspace")}
                      alt="Smartphone displaying personal account balances beside metal debit card and dark notebook"
                      className="image-reveal aspect-[3/2] w-full object-cover"
                    />
                    <div className="flex items-center justify-between px-5 py-3">
                      <span className="f-mono c-acc">Personal Money + Shared Splits</span>
                      <span className="f-mono c-mut">Mobile App Experience</span>
                    </div>
                  </div>
                </Tilt>
              </div>
            </div>
          </section>

          {/* SCENE 02 — INTERACTIVE MOBILE FINANCE APPLICATION */}
          <section
            id="sf-iphone"
            data-testid="splitfin-mobile-section"
            className="relative border-b b-line px-5 py-20 md:px-12 lg:px-16 lg:py-28"
          >
            <div className="mx-auto grid w-full max-w-[1400px] gap-12 lg:grid-cols-12 lg:items-start">
              <div className="space-y-6 lg:col-span-6 lg:space-y-16">
                <div>
                  <Note accent>Connected Financial Workflows</Note>
                  <h2 className="f-display mt-3 text-[clamp(2.1rem,5.5vw,3.8rem)] leading-[0.95]">
                    Accounts, budgets &amp; group bills in sync
                  </h2>
                  <div className="mt-4 flex flex-wrap gap-2 lg:hidden">
                    {SF_CHAPTERS.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setActiveStage(c.id)}
                        className={`rounded-full border px-3 py-1 font-mono text-[9.5px] uppercase tracking-wider ${
                          activeStage === c.id
                            ? "border-[#2DD4BF] bg-[#2DD4BF] text-[#071120]"
                            : "border-white/15 text-[#F3F0E6]/75"
                        }`}
                      >
                        {c.id}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-6 lg:space-y-24">
                  {SF_CHAPTERS.map((ch) => {
                    const selected = activeStage === ch.id;
                    return (
                      <article
                        key={ch.id}
                        id={`sf-chap-${ch.id}`}
                        data-stage={ch.id}
                        onClick={() => setActiveStage(ch.id)}
                        className={`cursor-pointer border-t pt-5 transition-opacity duration-500 ${
                          selected ? "border-[#2DD4BF] opacity-100" : "border-white/15 opacity-55 hover:opacity-85"
                        }`}
                      >
                        <span className="f-mono c-acc block">{ch.eyebrow}</span>
                        <h3 className="mt-2 font-serif text-2xl text-[#F3F0E6] md:text-3xl">{ch.title}</h3>
                        <p className="mt-3 max-w-lg text-sm leading-relaxed text-[#93B5B3]">{ch.copy}</p>
                      </article>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col items-center lg:sticky lg:top-24 lg:col-span-5 lg:col-start-8">
                <span className="f-mono c-acc mb-4">
                  Interactive iPhone · {activeChapter.eyebrow}
                </span>
                <div className="w-full max-w-[335px] sm:max-w-[355px]">
                  <PhoneFrame
                    accent={p.theme.acc}
                    poseRotateY={activeChapter.rotY}
                    poseRotateX={activeChapter.rotX}
                    motionMode="fluid"
                  >
                    <SplitfinMobilePrototype initialTab="money" activeStage={activeStage} />
                  </PhoneFrame>
                </div>
              </div>
            </div>
          </section>

          {/* SCENE 03 — PRODUCT VISUAL EVIDENCE (STRICTLY FINANCE & LEDGER CONTEXT) */}
          <section id="sf-moments" className="relative border-b b-line px-5 py-20 md:px-12 lg:px-16">
            <div className="mx-auto max-w-[1400px]">
              <div data-passage-reveal className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                <div>
                  <Note accent>Financial Architecture</Note>
                  <h2 className="f-display mt-3 text-4xl sm:text-5xl">Accounts, Receipts &amp; Ledgers</h2>
                </div>
                <Note>Personal tracking unified with shared balances</Note>
              </div>

              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 md:items-start">
                <Plate
                  id="sf_workspace"
                  variant="fluid"
                  label="Accounts & Net Position"
                  spec="Checking · Card · Cash"
                  caption="See liquid checking, card, and cash wallet balances alongside shared receivables in one unified total"
                />
                <Plate
                  id="sf_finance"
                  variant="fluid"
                  label="Income & Expenses"
                  spec="Account Ledger"
                  caption="Record solo income or daily expenses into specific accounts and update category spend immediately"
                />
                <Plate
                  id="sf_budget"
                  variant="fluid"
                  label="Budgets & Analytics"
                  spec="Category Caps"
                  caption="Set monthly spending limits per category and watch live utilization bars update as entries arrive"
                />
                <Plate
                  id="sf_receipt"
                  variant="fluid"
                  label="Bill Extraction"
                  spec="Equal & Custom Splits"
                  caption="Extract itemized receipts into shared group bills with flexible participant inclusion and tip math"
                />
                <Plate
                  id="sf_settle"
                  variant="fluid"
                  label="Group Settlements"
                  spec="Who Owes Whom"
                  caption="Record full or partial transfers that clear member balances and flow straight into liquid cash"
                />
                <Plate
                  id="sf_cafe"
                  variant="fluid"
                  label="Shared Cost Clarity"
                  spec="True Personal Share"
                  caption="When you cover a group bill on your card, your personal budget tracks only your actual share"
                />
              </div>
            </div>
          </section>

          {/* SCENE 04 — LOOP BACK */}
          <section id="sf-terminus" className="relative px-5 py-20 md:px-12 lg:px-16">
            <div className="mx-auto max-w-[1400px]">
              <div
                data-passage-reveal
                className="flex flex-col items-start justify-between gap-6 border border-[#2DD4BF]/25 bg-[#081221]/80 p-8 backdrop-blur-md md:flex-row md:items-center"
              >
                <div>
                  <Note accent>Next Showcase</Note>
                  <h3 className="f-display mt-2 text-4xl text-[#D4AF37] md:text-5xl">StayEase</h3>
                  <p className="f-serif mt-2 text-lg text-[#93B5B3]">
                    Revisit the accommodation discovery and property operations showcase.
                  </p>
                </div>
                <div className="flex flex-wrap gap-4">
                  <ArrowLink to="/products/stayease" testid="splitfin-next-stayease">
                    Open StayEase
                  </ArrowLink>
                  <ArrowLink to="/#projects" testid="splitfin-back-home">
                    Back to Work
                  </ArrowLink>
                </div>
              </div>
            </div>
          </section>
        </PassageWorld>
      </main>
    </SplitfinLedgerProvider>
  );
}
