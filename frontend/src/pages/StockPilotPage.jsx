import { lazy, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, ArrowLeft, BarChart3 } from "lucide-react";
import { PhoneFrame, Tilt } from "@/components/frames/frames";
import {
  StockPilotMobileApp,
  StockPilotStoreProvider,
  useStockPilotStore,
} from "@/components/previews/StockPilotPreviews";
import { ArrowLink, MaskLines, Note, Plate } from "@/components/shell/Primitives";
import PassageWorld, { Platform } from "@/components/three/PassageWorld";
import { A } from "@/data/assets";
import { PRODUCTS } from "@/data/products";

const ProductWorldScene = lazy(() => import("@/components/three/ProductWorldScene"));

const p = PRODUCTS.stockpilot;

const STOCKPILOT_WAYPOINTS = [
  { id: "sp-opening", label: "Atelier", accent: p.theme.acc },
  { id: "sp-iphone", label: "iPhone", accent: p.theme.acc },
  { id: "sp-analytics", label: "Telemetry", accent: p.theme.acc },
  { id: "sp-closing", label: "Next", accent: p.theme.acc },
];

const SP_CHAPTERS = [
  {
    id: "overview",
    eyebrow: "Daily Store Pulse",
    title: "Sales total, SKU count & low-stock alerts",
    copy: "Open on any morning counter phone to check how many bills were synced today, total shelf volume, and which staples need an immediate restock.",
    rotY: -6,
    rotX: 2,
  },
  {
    id: "catalog",
    eyebrow: "Catalog & Product Entry",
    title: "Search SKUs, inspect barcodes & add items",
    copy: "Keep prices, barcode numbers, and local supplier metadata clean whether running one neighbourhood shelf or expanding across categories.",
    rotY: 5,
    rotX: -2,
  },
  {
    id: "bill",
    eyebrow: "Counter Mobile Billing",
    title: "Ring up bills & watch inventory deduct live",
    copy: "Tap + on items or trigger a simulated barcode scan, toggle discount/GST tax rates, and issue a sample receipt that automatically reduces stock counts.",
    rotY: -4,
    rotX: 3,
  },
  {
    id: "stock",
    eyebrow: "Stock & Suppliers",
    title: "Fast +5 restocks & supplier lead tracking",
    copy: "Log restock deliveries directly on the phone beside shelves without clunky warehouse spreadsheets.",
    rotY: 6,
    rotX: 1,
  },
  {
    id: "insights",
    eyebrow: "Business Insights",
    title: "Repeat buyers, bills & supply logs together",
    copy: "View recorded sample bills, frequent counter customers, and wholesale vendor turnaround in one focused mobile instrument.",
    rotY: 0,
    rotX: 2,
  },
];

/** Live spatial telemetry band synchronized with StockPilotStoreProvider state. */
const LiveRetailPulse = () => {
  const { products, bills } = useStockPilotStore();
  const totalRevenue = bills.reduce((sum, b) => sum + b.total, 0);
  const totalUnits = products.reduce((sum, item) => sum + item.stock, 0);
  const lowStockCount = products.filter((item) => item.stock <= item.min).length;

  return (
    <div
      data-passage-reveal
      data-testid="stockpilot-analytics-panel"
      className="border border-[#F59E0B]/25 bg-[#12151B]/82 p-6 backdrop-blur-md md:p-8"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-2.5 text-[#F59E0B]">
          <BarChart3 size={16} />
          <span className="f-mono">Live Retail Telemetry (Synced With iPhone Billing)</span>
        </div>
        <span className="f-mono c-mut">Illustrative Store Data</span>
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-3">
        <div>
          <span className="f-mono c-mut block">Bills Issued</span>
          <p className="mt-2 font-mono text-3xl font-bold text-[#F59E0B]" data-testid="analytics-bills-count">
            {bills.length}
          </p>
        </div>
        <div>
          <span className="f-mono c-mut block">Session Revenue</span>
          <p className="mt-2 font-mono text-3xl font-bold text-[#F1F3F5]">${totalRevenue.toFixed(2)}</p>
        </div>
        <div>
          <span className="f-mono c-mut block">Units Remaining / Low</span>
          <p className="mt-2 font-mono text-3xl font-bold text-[#F1F3F5]">
            {totalUnits} <span className="text-sm font-normal text-[#949BA6]">({lowStockCount} low alerts)</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default function StockPilotPage() {
  const [activeStage, setActiveStage] = useState("bill");
  const activeChapter = SP_CHAPTERS.find((c) => c.id === activeStage) || SP_CHAPTERS[2];

  useEffect(() => {
    const els = SP_CHAPTERS.map((c) => document.getElementById(`sp-chap-${c.id}`)).filter(Boolean);
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
    <StockPilotStoreProvider>
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
        data-testid="stockpilot-page"
      >
        <PassageWorld
          waypoints={STOCKPILOT_WAYPOINTS}
          accent={p.theme.acc}
          bg="#12151B"
          testid="stockpilot-passage"
          renderScene={({ progressRef, running, isMobile, onContextLost }) => (
            <ProductWorldScene
              variant="stockpilot"
              progressRef={progressRef}
              running={running}
              isMobile={isMobile}
              onContextLost={onContextLost}
            />
          )}
        >
          {/* STAGE 01 — MODERN RETAIL ATELIER OPENING */}
          <section
            id="sp-opening"
            className="relative flex min-h-[100dvh] items-center border-b b-line px-5 pb-20 pt-24 md:px-12 lg:px-16"
          >
            <div className="mx-auto grid w-full max-w-[1400px] gap-12 lg:grid-cols-12 lg:items-end">
              <div className="min-w-0 lg:col-span-6">
                <div className="mb-6 flex flex-wrap items-center gap-4">
                  <Link
                    to="/#projects"
                    data-testid="stockpilot-return-portfolio"
                    className="f-mono inline-flex items-center gap-2 text-[#F1F3F5]/75 transition-colors hover:text-[#F59E0B]"
                  >
                    <ArrowLeft size={13} />
                    Back to Passage
                  </Link>
                  <span className="h-3 w-px bg-white/15" />
                  <Note accent>{p.index} // {p.domain}</Note>
                  <Platform p={{ ...p, mobileBadge: "MOBILE POS CONCEPT" }} />
                  {p.status?.badge && (
                    <span
                      className="rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-widest text-[#F1F3F5]/80"
                      data-testid="stockpilot-status-badge"
                    >
                      {p.status.badge}
                    </span>
                  )}
                </div>

                <MaskLines
                  as="h1"
                  inView={false}
                  lines={[p.name]}
                  className="f-display text-[clamp(2.4rem,9vw,5.8rem)] leading-[0.92]"
                  style={{ color: p.theme.acc }}
                  data-testid="stockpilot-title"
                />

                <p className="f-serif mt-5 max-w-xl text-xl leading-snug text-[#F1F3F5] md:text-2xl">
                  {p.line}
                </p>

                <div
                  className="mt-6 flex max-w-xl items-start gap-3 border border-[#F59E0B]/35 bg-[#191D24]/82 px-4 py-3 backdrop-blur-md"
                  data-testid="stockpilot-concept-disclosure"
                >
                  <AlertCircle size={16} className="mt-0.5 shrink-0 text-[#F59E0B]" />
                  <p className="text-xs leading-relaxed text-[#F1F3F5]/85">
                    <strong className="font-mono uppercase tracking-wider text-[#F59E0B]">
                      Interactive Product Concept:
                    </strong>{" "}
                    Uses illustrative sample SKUs and billing receipts inside a dedicated 3D mobile experience.
                  </p>
                </div>
              </div>

              <div data-passage-reveal className="lg:col-span-6">
                <Tilt max={3.5}>
                  <div className="cinematic-frame focus-ring overflow-hidden border border-[#F59E0B]/25 bg-[#161920]/85 backdrop-blur-md">
                    <img
                      src={A("sp_atelier")}
                      alt="Warm oak local neighbourhood grocery store counter and illuminated amber pendant fixtures"
                      className="image-reveal aspect-[3/2] w-full object-cover"
                    />
                    <div className="flex items-center justify-between px-5 py-3">
                      <span className="f-mono c-acc">Kirana Counter To Multi-Shelf</span>
                      <span className="f-mono c-mut">Mobile Billing · Live Stock</span>
                    </div>
                  </div>
                </Tilt>
              </div>
            </div>
          </section>

          {/* STAGE 02 — CHOREOGRAPHED 3D IPHONE COUNTER WORKFLOW */}
          <section
            id="sp-iphone"
            data-testid="stockpilot-mobile-section"
            className="relative border-b b-line px-5 py-20 md:px-12 lg:px-16 lg:py-28"
          >
            <div className="mx-auto grid w-full max-w-[1400px] gap-12 lg:grid-cols-12 lg:items-start">
              <div className="space-y-6 lg:col-span-6 lg:space-y-16">
                <div>
                  <Note accent>Mobile Counter Architecture</Note>
                  <h2 className="f-display mt-3 text-[clamp(2.4rem,6vw,4.5rem)]">
                    Ring up a bill. Watch shelves update.
                  </h2>
                  <div className="mt-4 flex flex-wrap gap-2 lg:hidden">
                    {SP_CHAPTERS.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setActiveStage(c.id)}
                        className={`rounded-full border px-3 py-1 font-mono text-[9.5px] uppercase tracking-wider ${
                          activeStage === c.id
                            ? "border-[#F59E0B] bg-[#F59E0B] text-[#111317]"
                            : "border-white/15 text-[#F1F3F5]/75"
                        }`}
                      >
                        {c.id}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-6 lg:space-y-24">
                  {SP_CHAPTERS.map((ch) => {
                    const selected = activeStage === ch.id;
                    return (
                      <article
                        key={ch.id}
                        id={`sp-chap-${ch.id}`}
                        data-stage={ch.id}
                        onClick={() => setActiveStage(ch.id)}
                        className={`cursor-pointer border-t pt-5 transition-opacity duration-500 ${
                          selected ? "border-[#F59E0B] opacity-100" : "border-white/15 opacity-55 hover:opacity-85"
                        }`}
                      >
                        <span className="f-mono c-acc block">{ch.eyebrow}</span>
                        <h3 className="mt-2 font-serif text-2xl text-[#F1F3F5] md:text-3xl">{ch.title}</h3>
                        <p className="mt-3 max-w-lg text-sm leading-relaxed text-[#949BA6]">{ch.copy}</p>
                      </article>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col items-center lg:sticky lg:top-24 lg:col-span-5 lg:col-start-8">
                <span className="f-mono c-acc mb-4">
                  Interactive iPhone App · {activeChapter.eyebrow}
                </span>
                <div className="w-full max-w-[335px] sm:max-w-[355px]">
                  <PhoneFrame
                    accent={p.theme.acc}
                    poseRotateY={activeChapter.rotY}
                    poseRotateX={activeChapter.rotX}
                    motionMode="mechanical"
                  >
                    <StockPilotMobileApp activeStage={activeStage} />
                  </PhoneFrame>
                </div>
              </div>
            </div>
          </section>

          {/* STAGE 03 — LIVE TELEMETRY & RETAIL PHOTOGRAPHY */}
          <section id="sp-analytics" className="relative border-b b-line px-5 py-20 md:px-12 lg:px-16">
            <div className="mx-auto max-w-[1400px] space-y-12">
              <LiveRetailPulse />

              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 md:items-start">
                <Plate
                  id="sp_counter"
                  variant="precision"
                  label="Mobile Counter Billing"
                  spec="One-Handed POS"
                  caption="Ring up customer items, apply discounts or GST tax, and issue digital receipts straight from a counter phone"
                />
                <Plate
                  id="sp_aisle"
                  variant="precision"
                  label="Aisle Stock Control"
                  spec="Live Shelf Counts"
                  caption="Every completed mobile sale deducts remaining shelf quantities instantaneously across categories"
                />
                <Plate
                  id="sp_scanner"
                  variant="precision"
                  label="Barcode & SKU Lookup"
                  spec="Catalog & Pricing"
                  caption="Search by SKU or scan barcodes to add new products, adjust unit pricing, and inspect supplier links"
                />
                <Plate
                  id="sp_shelf"
                  variant="precision"
                  label="Low-Stock Thresholds"
                  spec="Proactive Restock"
                  caption="Automatic low-stock alerts surface staples running below minimum count with one-tap +5 restock actions"
                />
                <Plate
                  id="sp_stockroom"
                  variant="precision"
                  label="Multi-Shelf Expansion"
                  spec="Suppliers & Logs"
                  caption="Scales smoothly from a single kirana shelf to multi-aisle stores with supplier lead-time tracking"
                />
                <Plate
                  id="sp_atelier"
                  variant="precision"
                  label="Daily Sales Pulse"
                  spec="Zero ERP Bloat"
                  caption="Morning-to-evening revenue totals, recorded bills, and repeat customer summaries in one calm view"
                />
              </div>
            </div>
          </section>

          {/* STAGE 04 — NEXT PRODUCT DOORWAY */}
          <section id="sp-closing" className="relative px-5 py-20 md:px-12 lg:px-16">
            <div className="mx-auto max-w-[1400px]">
              <div
                data-passage-reveal
                className="flex flex-col items-start justify-between gap-6 border border-[#F59E0B]/25 bg-[#12151B]/85 p-8 backdrop-blur-md md:flex-row md:items-center"
              >
                <div>
                  <Note accent>Next Product Passage // 03</Note>
                  <h3 className="f-display mt-2 text-4xl text-[#2DD4BF] md:text-5xl">Splitfin</h3>
                  <p className="f-serif mt-2 text-lg text-[#949BA6]">
                    Step into mobile-only personal money tracking unified with group settlements.
                  </p>
                </div>
                <div className="flex flex-wrap gap-4">
                  <ArrowLink to="/products/splitfin" testid="stockpilot-next-splitfin">
                    Open Splitfin
                  </ArrowLink>
                  <ArrowLink to="/#projects" testid="stockpilot-back-home">
                    All Projects
                  </ArrowLink>
                </div>
              </div>
            </div>
          </section>
        </PassageWorld>
      </main>
    </StockPilotStoreProvider>
  );
}
