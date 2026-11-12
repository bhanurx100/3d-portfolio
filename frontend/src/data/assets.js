// Central asset manifest mapping internal semantic keys to organized /public/assets/<group>/<file>.jpg paths.
// Internal keys and paths must never be rendered as visible UI text or captions.

const ASSETS = {
  // Personal portrait (exact original ratios: folded-hands 3:4 for Hero, MacBook working 4:3 for About)
  profile_hero_folded: { path: "/assets/profile-about.png", ratio: "3 / 4" },
  profile_working: { path: "/assets/profile-hero.png", ratio: "4 / 3" },
  home_atrium: { path: "/assets/home/gallery-atrium.jpg", ratio: "3 / 2" },
  home_studio: { path: "/assets/home/builder-studio.jpg", ratio: "3 / 2" },
  home_journey: { path: "/assets/home/journey-atelier.jpg", ratio: "3 / 2" },
  home_terminus: { path: "/assets/home/obsidian-monolith.jpg", ratio: "3 / 2" },

  // StayEase — diverse hospitality & property ecosystem
  se_hotel: { path: "/assets/stayease/courtyard-hotel.jpg", ratio: "2 / 3" },
  se_pg: { path: "/assets/stayease/cozy-hostel-pg.jpg", ratio: "3 / 2" },
  se_apartment: { path: "/assets/stayease/contemporary-apartment.jpg", ratio: "3 / 2" },
  se_homestay: { path: "/assets/stayease/mountain-lodge.jpg", ratio: "3 / 2" },
  se_villa: { path: "/assets/stayease/coastal-villa.jpg", ratio: "3 / 2" },
  se_townhouse: { path: "/assets/stayease/city-townhouse.jpg", ratio: "2 / 3" },
  se_studio: { path: "/assets/stayease/studio-interior.jpg", ratio: "3 / 2" },
  se_twin: { path: "/assets/stayease/twin-room.jpg", ratio: "3 / 2" },

  // StockPilot — everyday retail shops, kirana counters & scalable stockrooms
  sp_atelier: { path: "/assets/stockpilot/retail-counter-atelier.jpg", ratio: "3 / 2" },
  sp_counter: { path: "/assets/stockpilot/local-shop-counter.jpg", ratio: "3 / 2" },
  sp_aisle: { path: "/assets/stockpilot/grocery-aisle-shelves.jpg", ratio: "2 / 3" },
  sp_backroom: { path: "/assets/stockpilot/retail-backroom-check.jpg", ratio: "1 / 1" },
  sp_shelf: { path: "/assets/stockpilot/shelf-stock.jpg", ratio: "2 / 3" },
  sp_scanner: { path: "/assets/stockpilot/counter-scanner.jpg", ratio: "1 / 1" },
  sp_stockroom: { path: "/assets/stockpilot/stockroom-aisle.jpg", ratio: "1 / 1" },

  // Splitfin — connected personal finance & shared expenses (mobile-only)
  sf_workspace: { path: "/assets/splitfin/finance-workspace.jpg", ratio: "3 / 2" },
  sf_receipt: { path: "/assets/splitfin/expense-receipt-studio.jpg", ratio: "3 / 2" },
  sf_budget: { path: "/assets/splitfin/budget-analytics.jpg", ratio: "3 / 2" },
  sf_settle: { path: "/assets/splitfin/shared-settlement.jpg", ratio: "3 / 2" },
  sf_atelier: { path: "/assets/splitfin/fintech-atelier.jpg", ratio: "3 / 2" },
  sf_emblem: { path: "/assets/splitfin/mobile-emblem.jpg", ratio: "2 / 3" },
  sf_finance: { path: "/assets/splitfin/personal-finance-desk.jpg", ratio: "3 / 2" },
  sf_evening: { path: "/assets/splitfin/evening-split-moment.jpg", ratio: "3 / 2" },
  sf_cafe: { path: "/assets/splitfin/cafe-table.jpg", ratio: "1 / 1" },
  sf_transit: { path: "/assets/splitfin/trip-transit.jpg", ratio: "2 / 3" },
};

export const A = (id) => {
  const item = ASSETS[id];
  if (!item) return "";
  return `${process.env.PUBLIC_URL || ""}${item.path}`;
};

export const ratio = (id) => ASSETS[id]?.ratio || "3 / 2";
