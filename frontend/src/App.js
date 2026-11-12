import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "@/App.css";
import { DoorTransition, Nav, SmoothScroll } from "@/components/shell/Chrome";
import StudioCursor from "@/components/shell/StudioCursor";
import { ArrowLink, Note } from "@/components/shell/Primitives";
import { AnalyticsTracker } from "@/lib/analytics";
import HomePage from "@/pages/HomePage";
import StayEasePage from "@/pages/StayEasePage";
import StockPilotPage from "@/pages/StockPilotPage";
import SplitfinPage from "@/pages/SplitfinPage";
import { Analytics } from "@vercel/analytics/react";

const NotFoundPage = () => (
  <main
    className="flex min-h-screen flex-col items-start justify-center bg-[#070809] px-5 pt-24 text-[#EDE9E0] md:px-10"
    data-testid="not-found-page"
  >
    <Note accent>404 // Uncharted Corridor</Note>
    <h1 className="f-display mt-4 text-6xl sm:text-8xl">This doorway does not exist.</h1>
    <p className="f-serif mt-4 max-w-md text-xl c-mut">
      Return to the main passage to explore Bhanuprasad L, StayEase, StockPilot, or Splitfin.
    </p>
    <div className="mt-8">
      <ArrowLink to="/" testid="not-found-home-link">
        Return to Passage
      </ArrowLink>
    </div>
  </main>
);

export default function App() {
  return (
    <div className="grain route-shell min-h-screen bg-[#070809] text-[#EDE9E0]">
      <BrowserRouter>
        <AnalyticsTracker />
        <SmoothScroll />
        <StudioCursor />
        <DoorTransition />
        <Nav />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<Navigate to="/#about" replace />} />
          <Route path="/products/stayease" element={<StayEasePage />} />
          <Route path="/products/stockpilot" element={<StockPilotPage />} />
          <Route path="/products/splitfin" element={<SplitfinPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
      <Analytics />
    </div>
  );
}
