// Central product registry reflecting accurate product scope, platform boundaries, and visual themes.

export const ORDER = ["stayease", "stockpilot", "splitfin"];

export const PRODUCTS = {
  stayease: {
    key: "stayease",
    index: "01",
    name: "StayEase",
    route: "/products/stayease",
    domain: "Travel, Stays & Property Operations",
    platform: "WEB + MOBILE",
    surfaces: ["web", "mobile"],
    stage: "Connected Three-Role Platform",
    status: {
      badge: "Currently building",
      demoLabel: "Interactive demo · Sample data",
      actionNote: "Demo booking",
    },
    door: "se_hotel",
    heroImage: "se_apartment",
    line: "A connected hospitality platform uniting traveller discovery, owner property management, and platform oversight across hotels, PGs, hostels, homestays, apartments, and villas.",
    shortLine: "Traveller discovery, Owner Hub, and Admin Console across every type of stay.",
    summary:
      "Built around three interconnected perspectives: travellers comparing rooms, beds, and whole flats without dark-pattern urgency; owners managing property-specific workflows from PG bed rent to hotel calendars; and operators overseeing verification and trust.",
    problem:
      "Accommodations are treated as one generic template — forcing a PG bed manager, a homestay host, an apartment operator, and a hotelier into rigid tools while travellers wade through noisy booking clutter.",
    promise:
      "Adapt each workflow to the property type: travellers browse clear pricing, policies, trips, and rewards; owners manage beds, rooms, units, and payouts; admins verify listings and oversee platform safety.",
    audience: "Travellers, PG & hostel managers, homestay hosts, apartment operators, boutique hoteliers, and platform admins.",
    perspectives: [
      { role: "User App", detail: "Discovery across hotels, PGs, hostels, homestays, apartments & villas, bookings, wallet & trip planning." },
      { role: "Owner Hub", detail: "Property configuration, room/bed/unit inventory, pricing calendars, tenant/guest lists & payouts." },
      { role: "Admin Console", detail: "Property verification approvals, user & owner oversight, trust workflows & platform monitoring." },
    ],
    theme: {
      bg: "#0A1128",
      surf: "#131E3D",
      cream: "#F8F5EE",
      sand: "#E2D9C8",
      ink: "#F8F5EE",
      mut: "#9CA8C2",
      acc: "#D4AF37",
      line: "rgba(226, 217, 200, 0.14)",
      glow: "rgba(212, 175, 55, 0.25)",
    },
    marquee: [
      "Traveller App · Hotels, PGs, Hostels & Flats",
      "Owner Hub · Beds, Rooms, Units & Payouts",
      "Admin Console · Verification & Trust",
      "Web + Mobile Connected Hospitality",
    ],
  },
  stockpilot: {
    key: "stockpilot",
    index: "02",
    name: "StockPilot",
    route: "/products/stockpilot",
    domain: "Retail Inventory & Billing",
    platform: "WEB + MOBILE // CONCEPT",
    surfaces: ["web", "mobile"],
    stage: "Product Exploration & Concept Screens",
    status: {
      badge: "Currently building",
      demoLabel: "Interactive demo · Sample data",
      actionNote: "Simulated sale",
    },
    isConcept: true,
    conceptNote:
      "Product exploration using illustrative retail catalog and sales data — demonstrating how everyday shop billing and multi-shelf inventory connect across mobile and web.",
    door: "sp_aisle",
    heroImage: "sp_counter",
    line: "Inventory management and day-to-day billing built for neighbourhood kirana shops, local retailers, and growing multi-shelf stores.",
    shortLine: "Mobile counter billing and live stock control that scales from a kirana shop to larger retail.",
    summary:
      "Small shopkeepers shouldn't need complex enterprise warehouse software just to track stock and ring up a customer bill. StockPilot pairs fast mobile counter billing with clear web inventory oversight.",
    problem:
      "Local general stores and neighbourhood retailers either rely on paper registers or struggle with bloated enterprise ERP tools built for giant distribution centres.",
    promise:
      "Let a shopkeeper check stock, add customer items, apply tax or discount, generate a clear bill on their phone, and watch inventory update automatically — while scaling cleanly on the web as the catalog grows.",
    audience: "Kirana & general store owners, neighbourhood grocers, local retail counters, and growing multi-shelf shops.",
    perspectives: [
      { role: "Mobile Billing", detail: "Pick products, set quantities, apply discounts or tax, issue a bill & deduct stock in one tap." },
      { role: "Everyday Stock", detail: "Clear prices, available counts, low-stock awareness & fast restock adjustments." },
      { role: "Web Store Desk", detail: "Broader catalog management, sales logs & multi-shelf oversight as operations expand." },
    ],
    theme: {
      bg: "#121417",
      surf: "#1E2228",
      charcoal: "#292E36",
      slate: "#3A414D",
      ink: "#F1F3F5",
      mut: "#949BA6",
      acc: "#F59E0B",
      accMuted: "#D97706",
      line: "rgba(245, 158, 11, 0.16)",
      glow: "rgba(217, 119, 6, 0.25)",
    },
    marquee: [
      "Kirana & Local Retail Ready",
      "Mobile Counter Billing",
      "Live Stock Deduction",
      "Scales Without Enterprise Bloat",
    ],
  },
  splitfin: {
    key: "splitfin",
    index: "03",
    name: "Splitfin",
    route: "/products/splitfin",
    domain: "Personal Finance & Shared Expenses",
    platform: "MOBILE ONLY",
    surfaces: ["mobile"],
    stage: "Mobile-First Product Build",
    status: {
      badge: "Currently building",
      demoLabel: "Interactive demo · Sample data",
      actionNote: "Sample settlement",
    },
    door: "sf_emblem",
    heroImage: "sf_finance",
    line: "One mobile-only product connecting personal money tracking — accounts, income, budgets, and spending — with shared group expenses and settlements.",
    shortLine: "Accounts, budgets & personal spending connected directly to group splits and settlements.",
    summary:
      "Most apps isolate personal budgeting from group bill-splitting, leaving your true financial picture out of sync. Splitfin brings accounts, income, transactions, spending insights, and shared group splits into one mobile-only instrument.",
    problem:
      "When you pay for a group dinner on your card, your bank feed shows the full charge while your real cost was only your share — and separate split apps leave your personal budget out of sync.",
    promise:
      "Unify personal accounts, budgets, and category spending with shared expenses and deterministic cent-level settlements, engineered exclusively for the phone.",
    audience: "Individuals tracking everyday accounts & budgets alongside friends, roommates, and travel groups.",
    perspectives: [
      { role: "Personal Money", detail: "Bank/card/wallet balances, income vs expense tracking, budgets & category trends." },
      { role: "Shared Groups", detail: "Equal or weighted splits, excluded members, group balances & simplified settle-up paths." },
      { role: "Unified Picture", detail: "Every shared expense updates both who owes whom and your personal account & budget state." },
    ],
    theme: {
      bg: "#0A1628",
      surf: "#0D3B3E",
      deepTeal: "#114B4F",
      warm: "#F3F0E6",
      ink: "#F3F0E6",
      mut: "#93B5B3",
      acc: "#2DD4BF",
      line: "rgba(45, 212, 191, 0.18)",
      glow: "rgba(45, 212, 191, 0.25)",
    },
    marquee: [
      "Strictly Mobile Only",
      "Accounts, Income & Budgets",
      "Shared Expenses & Settlements",
      "One Connected Money Picture",
    ],
  },
};
