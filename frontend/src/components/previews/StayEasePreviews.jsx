import { useEffect, useMemo, useState } from "react";
import {
  Bookmark,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  Compass,
  Heart,
  KeyRound,
  MapPin,
  Minus,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Wallet,
} from "lucide-react";
import { A } from "@/data/assets";

export const STAYEASE_PROPERTIES = [
  {
    id: "elm-pg",
    name: "Elm Street Co-Living & PG",
    type: "PG & Hostels",
    unitWord: "Bed",
    location: "Indiranagar, Bengaluru",
    rate: 19,
    rating: "4.82",
    reviewsCount: 92,
    gallery: ["se_pg", "se_twin", "se_studio"],
    policy: "Biometric entry · Homestyle meals & laundry included",
    review: { author: "Rohan K.", quote: "Quiet reading lamps, private lockers, and fast Wi-Fi for workdays." },
    amenities: ["Private Locker", "Meals Included", "Fiber Wi-Fi", "Housekeeping"],
    options: [
      { id: "twin-pod", name: "Twin-Sharing Timber Pod", spec: "1 Bed · Study Desk", delta: 0 },
      { id: "single-studio", name: "Private Single Room", spec: "1 Bed · Ensuite Bath", delta: 12 },
    ],
  },
  {
    id: "skyline-flat",
    name: "Canal Terrace 2BHK Flat",
    type: "Apartments",
    unitWord: "Unit",
    location: "Bandra West, Mumbai",
    rate: 142,
    rating: "4.94",
    reviewsCount: 37,
    gallery: ["se_apartment", "se_studio", "se_townhouse"],
    policy: "Self check-in · Full kitchen & weekly linen refresh",
    review: { author: "Ananya M.", quote: "Calm evening skyline light and an equipped kitchen for weeklong stays." },
    amenities: ["Full Kitchen", "Washer", "Workstation", "Terrace"],
    options: [
      { id: "whole-1bhk", name: "1BHK Corner Residence", spec: "52 m² · Up to 2 guests", delta: 0 },
      { id: "whole-2bhk", name: "2BHK Panoramic Flat", spec: "84 m² · Up to 4 guests", delta: 55 },
    ],
  },
  {
    id: "dar-noor",
    name: "Dar Noor Courtyard",
    type: "Hotel",
    unitWord: "Room",
    location: "Old Quarter, Jaipur",
    rate: 118,
    rating: "4.88",
    reviewsCount: 64,
    gallery: ["se_hotel", "se_studio", "se_twin"],
    policy: "Check-in 14:00 · Free cancellation 48h prior",
    review: { author: "Vikram S.", quote: "Restored sandstone courtyard arches and peaceful rooms off the bazaar." },
    amenities: ["Courtyard Tea", "Fiber Wi-Fi", "Quiet Wing", "24h Desk"],
    options: [
      { id: "courtyard-queen", name: "Courtyard Queen Room", spec: "28 m² · 1 Queen", delta: 0 },
      { id: "arch-suite", name: "Arch Balcony Suite", spec: "44 m² · 1 King", delta: 45 },
    ],
  },
  {
    id: "pine-homestay",
    name: "Deodar Ridge Homestay",
    type: "Homestays",
    unitWord: "Room",
    location: "Landour, Mussoorie",
    rate: 76,
    rating: "4.91",
    reviewsCount: 51,
    gallery: ["se_homestay", "se_twin", "se_studio"],
    policy: "Home breakfast · Hosted by the Rawat family",
    review: { author: "Meera P.", quote: "Misty cedar mornings, warm blankets, and ginger tea on the timber deck." },
    amenities: ["Family Kitchen", "Fireplace", "Valley Porch", "Trail Map"],
    options: [
      { id: "pine-twin", name: "Pine View Twin Room", spec: "30 m² · 2 Single Beds", delta: 0 },
      { id: "attic-king", name: "Timber Attic Room", spec: "38 m² · 1 King", delta: 24 },
    ],
  },
  {
    id: "cove-villa",
    name: "Limestone Cove Villa",
    type: "Villas & Resorts",
    unitWord: "Villa",
    location: "Alibaug Coast",
    rate: 260,
    rating: "4.95",
    reviewsCount: 28,
    gallery: ["se_villa", "se_apartment", "se_hotel"],
    policy: "Private caretaker · Entire 3-bedroom coastal villa",
    review: { author: "Dev R.", quote: "Ideal for three friends catching up by the pool with zero resort crowd." },
    amenities: ["Plunge Pool", "Caretaker", "Sea Lawn", "Parking"],
    options: [
      { id: "garden-wing", name: "2-Bed Coastal Wing", spec: "110 m² · 4 guests", delta: 0 },
      { id: "entire-villa", name: "Full 3-Bed Villa", spec: "165 m² · 6 guests", delta: 90 },
    ],
  },
];

const CATEGORIES = ["All", "Hotel", "PG & Hostels", "Apartments", "Homestays", "Villas & Resorts"];

const INITIAL_OWNER_UNITS = {
  pg: {
    label: "Elm Street PG",
    title: "24-Bed Co-Living",
    baseRate: 19,
    items: [
      { code: "POD-01A", occupant: "Rohan K.", status: "Occupied", note: "Rent paid" },
      { code: "POD-01B", occupant: "Open", status: "Available", note: "Ready today" },
      { code: "POD-02A", occupant: "Ananya S.", status: "Occupied", note: "Meal plan" },
      { code: "POD-03B", occupant: "Meera P.", status: "Notice", note: "Checkout Nov 30" },
    ],
  },
  hotel: {
    label: "Dar Noor Hotel",
    title: "14 Boutique Rooms",
    baseRate: 118,
    items: [
      { code: "RM-101", occupant: "2 Guests", status: "Occupied", note: "3 nights" },
      { code: "RM-104", occupant: "Open", status: "Available", note: "Inspected" },
      { code: "RM-202", occupant: "Vikram S.", status: "Arriving", note: "ETA 15:00" },
      { code: "RM-205", occupant: "Open", status: "Available", note: "Clean" },
    ],
  },
};

const INITIAL_APPROVALS = [
  { id: "v1", name: "Cedar Nest Homestay", kind: "Homestay · Coorg", docs: "ID & Deed Verified", status: "Pending" },
  { id: "v2", name: "North Campus Men's PG", kind: "PG (36 Beds) · Delhi", docs: "Safety NOC Uploaded", status: "Pending" },
  { id: "v3", name: "Harbour View Suites", kind: "Boutique Hotel · Kochi", docs: "Audit Complete", status: "Approved" },
];

export const StayEaseMobileApp = ({ activeStage = "explore" }) => {
  const [role, setRole] = useState("traveller"); // "traveller" | "owner" | "admin"
  const [tab, setTab] = useState("explore"); // "explore" | "saved" | "trips" | "wallet"
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [nights, setNights] = useState(3);
  const [guests, setGuests] = useState(2);
  const [selectedStayId, setSelectedStayId] = useState("elm-pg");
  const [showDetail, setShowDetail] = useState(false);
  const [photoIdx, setPhotoIdx] = useState(0);
  const [optionIdx, setOptionIdx] = useState(0);
  const [savedIds, setSavedIds] = useState(["elm-pg", "cove-villa"]);
  const [trips, setTrips] = useState([
    {
      id: "TRP-402",
      stayName: "Dar Noor Courtyard",
      option: "Courtyard Queen Room",
      dates: "Nov 22–25",
      nights: 3,
      total: 354,
      passReady: true,
    },
  ]);
  const [unlockedTripId, setUnlockedTripId] = useState(null);

  const [ownerSub, setOwnerSub] = useState("availability"); // "overview" | "availability" | "pricing"
  const [ownerProp, setOwnerProp] = useState("pg");
  const [ownerUnits, setOwnerUnits] = useState(INITIAL_OWNER_UNITS);

  const [adminSub, setAdminSub] = useState("approvals");
  const [approvals, setApprovals] = useState(INITIAL_APPROVALS);

  // Sync softly with scroll stage in StayEasePage without locking out manual taps
  useEffect(() => {
    if (activeStage === "explore") {
      setRole("traveller");
      setShowDetail(false);
      setTab("explore");
    } else if (activeStage === "detail") {
      setRole("traveller");
      setTab("explore");
      setShowDetail(true);
    } else if (activeStage === "owner") {
      setRole("owner");
    } else if (activeStage === "admin") {
      setRole("admin");
    }
  }, [activeStage]);

  const filtered = useMemo(
    () =>
      STAYEASE_PROPERTIES.filter((s) => {
        const matchCat = category === "All" || s.type === category;
        const q = query.trim().toLowerCase();
        const matchQ =
          !q ||
          s.name.toLowerCase().includes(q) ||
          s.location.toLowerCase().includes(q) ||
          s.type.toLowerCase().includes(q);
        return matchCat && matchQ;
      }),
    [category, query],
  );

  const selectedStay = STAYEASE_PROPERTIES.find((s) => s.id === selectedStayId) || STAYEASE_PROPERTIES[0];
  const selectedOption = selectedStay.options[optionIdx] || selectedStay.options[0];
  const simTotal = (selectedStay.rate + selectedOption.delta) * nights;

  const toggleSave = (id) => {
    setSavedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const openStayDetail = (stay) => {
    setSelectedStayId(stay.id);
    setPhotoIdx(0);
    setOptionIdx(0);
    setShowDetail(true);
  };

  const simulateBooking = () => {
    const nextTrip = {
      id: `TRP-${403 + trips.length}`,
      stayName: selectedStay.name,
      option: selectedOption.name,
      dates: `${nights} Nights · ${guests} Guests`,
      nights,
      total: simTotal,
      passReady: true,
    };
    setTrips((prev) => [nextTrip, ...prev]);
    setShowDetail(false);
    setTab("trips");
  };

  const toggleUnitAvailability = (code) => {
    setOwnerUnits((prev) => ({
      ...prev,
      [ownerProp]: {
        ...prev[ownerProp],
        items: prev[ownerProp].items.map((u) =>
          u.code === code
            ? {
                ...u,
                status: u.status === "Available" ? "Occupied" : "Available",
                occupant: u.status === "Available" ? "Walk-In" : "Open",
              }
            : u,
        ),
      },
    }));
  };

  const adjustOwnerRate = (delta) => {
    setOwnerUnits((prev) => ({
      ...prev,
      [ownerProp]: {
        ...prev[ownerProp],
        baseRate: Math.max(10, prev[ownerProp].baseRate + delta),
      },
    }));
  };

  const approveListing = (id, nextStatus) => {
    setApprovals((prev) => prev.map((a) => (a.id === id ? { ...a, status: nextStatus } : a)));
  };

  const currentOwner = ownerUnits[ownerProp];

  return (
    <div
      className="flex h-full w-full flex-col bg-[#080E20] text-[#F8F5EE]"
      data-testid="stayease-mobile-preview"
    >
      {/* Clean iPhone Header below Dynamic Island */}
      <div className="border-b border-white/10 bg-[#070B19] px-4 pb-3 pt-11">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-mono text-[8.5px] uppercase tracking-[0.22em] text-[#D4AF37]">
              StayEase App
            </span>
            <h4 className="font-serif text-lg leading-tight">
              {role === "traveller" ? "Find & Manage Stays" : role === "owner" ? "Owner Hub" : "Admin Oversight"}
            </h4>
          </div>
          <span className="rounded-full border border-[#D4AF37]/35 bg-[#131E3D] px-2 py-0.5 font-mono text-[8px] uppercase text-[#D4AF37]">
            Simulated
          </span>
        </div>

        {/* Clear Role Switcher */}
        <div className="mt-2.5 grid grid-cols-3 gap-1 rounded-xl border border-white/10 bg-[#0D1633] p-1">
          {[
            { id: "traveller", label: "Traveller" },
            { id: "owner", label: "Owner" },
            { id: "admin", label: "Admin" },
          ].map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setRole(r.id)}
              data-testid={`stayease-role-${r.id}`}
              className={`rounded-lg py-1 font-mono text-[9.5px] uppercase tracking-wider transition-colors ${
                role === r.id ? "bg-[#D4AF37] font-bold text-[#080E20]" : "text-[#9CA8C2] hover:text-white"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Scrollable App Viewport */}
      <div data-lenis-prevent className="no-scrollbar flex-1 overflow-y-auto px-3.5 py-3">
        {/* ================= ROLE: TRAVELLER ================= */}
        {role === "traveller" && !showDetail && tab === "explore" && (
          <div className="space-y-3">
            {/* Search & Trip Bar */}
            <div className="space-y-2 rounded-2xl border border-white/10 bg-[#101A36] p-2.5">
              <div className="flex items-center gap-2 rounded-xl bg-[#091024] px-3 py-2">
                <Search size={13} className="shrink-0 text-[#D4AF37]" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="City, PG, hotel, villa..."
                  data-testid="stayease-mobile-search"
                  className="w-full bg-transparent text-[11px] text-[#F8F5EE] placeholder:text-[#9CA8C2]"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto px-0.5 text-[9.5px]">
                <span className="font-mono text-[#9CA8C2]">Recent:</span>
                {["Bengaluru", "Mumbai", "Jaipur"].map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => setQuery(query === city ? "" : city)}
                    className={`rounded-full border px-2 py-0.5 font-mono transition-colors ${
                      query === city
                        ? "border-[#D4AF37] bg-[#D4AF37]/20 text-[#D4AF37]"
                        : "border-white/10 text-[#E2D9C8]/75"
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between px-1 text-[10px] text-[#E2D9C8]/85">
                <div className="flex items-center gap-1.5">
                  <Calendar size={11} className="text-[#D4AF37]" />
                  <span>{nights} nights</span>
                  <button
                    type="button"
                    onClick={() => setNights((n) => Math.max(1, n - 1))}
                    aria-label="Fewer nights"
                    className="grid h-4 w-4 place-items-center rounded bg-white/10"
                  >
                    <Minus size={9} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setNights((n) => Math.min(30, n + 1))}
                    aria-label="More nights"
                    className="grid h-4 w-4 place-items-center rounded bg-white/10"
                  >
                    <Plus size={9} />
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <Users size={11} className="text-[#D4AF37]" />
                  <span>{guests} guests</span>
                  <button
                    type="button"
                    onClick={() => setGuests((g) => (g >= 6 ? 1 : g + 1))}
                    className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[8.5px]"
                  >
                    +1
                  </button>
                </div>
              </div>
            </div>

            {/* Category Chip Strip */}
            <div className="no-scrollbar flex gap-1.5 overflow-x-auto pb-0.5" style={{ scrollSnapType: "x mandatory" }}>
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] transition-colors ${
                    category === c
                      ? "border-[#D4AF37] bg-[#D4AF37] font-semibold text-[#080E20]"
                      : "border-white/12 bg-[#131E3D] text-[#E2D9C8]"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Stay Listing Cards */}
            <div className="space-y-3">
              {filtered.map((s) => {
                const isSaved = savedIds.includes(s.id);
                return (
                  <div
                    key={s.id}
                    className="overflow-hidden rounded-2xl border border-white/12 bg-[#111B38]"
                    data-testid={`stayease-card-${s.id}`}
                  >
                    <div className="relative h-36">
                      <img src={A(s.gallery[0])} alt={s.name} className="h-full w-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#080E20] via-transparent to-black/25" />
                      <div className="absolute left-2.5 right-2.5 top-2.5 flex items-center justify-between">
                        <span className="rounded-full bg-black/65 px-2 py-0.5 font-mono text-[8.5px] uppercase text-[#D4AF37] backdrop-blur">
                          {s.type}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleSave(s.id)}
                          aria-label={`Save ${s.name}`}
                          className="grid h-7 w-7 place-items-center rounded-full bg-black/55 text-white backdrop-blur"
                        >
                          <Heart size={12} fill={isSaved ? "#D4AF37" : "none"} color={isSaved ? "#D4AF37" : "#F8F5EE"} />
                        </button>
                      </div>
                      <div className="absolute bottom-2.5 left-3 right-3 flex items-end justify-between">
                        <div>
                          <p className="font-serif text-base leading-tight text-white">{s.name}</p>
                          <p className="flex items-center gap-1 text-[10px] text-[#E2D9C8]/80">
                            <MapPin size={9} className="text-[#D4AF37]" />
                            {s.location}
                          </p>
                        </div>
                        <span className="flex items-center gap-0.5 rounded bg-black/60 px-1.5 py-0.5 font-mono text-[9px] text-[#D4AF37]">
                          <Star size={9} fill="#D4AF37" />
                          {s.rating}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between px-3 py-2.5">
                      <div>
                        <span className="text-sm font-bold text-[#D4AF37]">${s.rate}</span>
                        <span className="text-[10px] text-[#9CA8C2]"> / night · {s.unitWord}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => openStayDetail(s)}
                        data-testid={`stayease-inspect-${s.id}`}
                        className="rounded-full bg-[#D4AF37] px-3 py-1 text-[10px] font-bold text-[#080E20]"
                      >
                        Inspect Stay
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= TRAVELLER DETAIL & SIMULATED BOOKING ================= */}
        {role === "traveller" && showDetail && (
          <div className="space-y-3.5" data-testid="stayease-detail-view">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowDetail(false)}
                className="font-mono text-[9.5px] uppercase tracking-wider text-[#D4AF37]"
              >
                ← All Stays
              </button>
              <button
                type="button"
                onClick={() => toggleSave(selectedStay.id)}
                className="inline-flex items-center gap-1 font-mono text-[9px] text-[#E2D9C8]"
              >
                <Bookmark size={11} className="text-[#D4AF37]" />
                {savedIds.includes(selectedStay.id) ? "Saved" : "Save"}
              </button>
            </div>

            {/* Interactive Gallery Switcher */}
            <div className="relative h-44 overflow-hidden rounded-2xl border border-white/15">
              <img
                src={A(selectedStay.gallery[photoIdx])}
                alt={selectedStay.name}
                className="h-full w-full object-cover"
              />
              <div className="absolute bottom-2 left-2 right-2 flex justify-center gap-1.5">
                {selectedStay.gallery.map((g, i) => (
                  <button
                    key={g + i}
                    type="button"
                    onClick={() => setPhotoIdx(i)}
                    aria-label={`View gallery photo ${i + 1}`}
                    className={`h-1.5 rounded-full transition-all ${
                      photoIdx === i ? "w-5 bg-[#D4AF37]" : "w-2 bg-white/50"
                    }`}
                  />
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-start justify-between gap-2">
                <h5 className="font-serif text-xl leading-tight">{selectedStay.name}</h5>
                <span className="shrink-0 font-mono text-[10px] text-[#D4AF37]">★ {selectedStay.rating} ({selectedStay.reviewsCount})</span>
              </div>
              <p className="mt-1 text-[11px] text-[#9CA8C2]">{selectedStay.location} · {selectedStay.policy}</p>
            </div>

            {/* Amenities */}
            <div className="flex flex-wrap gap-1.5">
              {selectedStay.amenities.map((a) => (
                <span key={a} className="rounded-lg border border-white/10 bg-[#131E3D] px-2 py-1 text-[9.5px] text-[#E2D9C8]">
                  {a}
                </span>
              ))}
            </div>

            {/* Room / Bed / Unit Option Selector */}
            <div className="space-y-1.5">
              <span className="font-mono text-[9px] uppercase tracking-wider text-[#D4AF37]">
                Select {selectedStay.unitWord} Type
              </span>
              {selectedStay.options.map((o, idx) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => setOptionIdx(idx)}
                  className={`flex w-full items-center justify-between rounded-xl border p-2.5 text-left transition-colors ${
                    optionIdx === idx
                      ? "border-[#D4AF37] bg-[#D4AF37]/12"
                      : "border-white/10 bg-[#111B38]"
                  }`}
                >
                  <div>
                    <p className="text-[11px] font-semibold text-[#F8F5EE]">{o.name}</p>
                    <p className="text-[9.5px] text-[#9CA8C2]">{o.spec}</p>
                  </div>
                  <span className="font-mono text-[11px] font-bold text-[#D4AF37]">
                    ${selectedStay.rate + o.delta}/nt
                  </span>
                </button>
              ))}
            </div>

            {/* Guest Review Sample */}
            <div className="rounded-xl border border-white/10 bg-[#111B38] p-2.5 text-[10.5px]">
              <p className="italic text-[#E2D9C8]/90">“{selectedStay.review.quote}”</p>
              <p className="mt-1 font-mono text-[8.5px] text-[#D4AF37]">— {selectedStay.review.author} (Sample review)</p>
            </div>

            {/* Booking Summary CTA */}
            <div className="rounded-2xl border border-[#D4AF37]/35 bg-[#0D1633] p-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#9CA8C2]">{nights} nights · {guests} guests</span>
                <span className="font-mono text-sm font-bold text-[#D4AF37]">${simTotal} total</span>
              </div>
              <button
                type="button"
                onClick={simulateBooking}
                data-testid="stayease-simulate-book-btn"
                className="mt-2.5 w-full rounded-xl bg-[#D4AF37] py-2 text-[11px] font-bold uppercase tracking-wider text-[#080E20]"
              >
                Preview Stay Reservation
              </button>
            </div>
          </div>
        )}

        {/* ================= TRAVELLER: SAVED ================= */}
        {role === "traveller" && !showDetail && tab === "saved" && (
          <div className="space-y-3">
            <span className="font-mono text-[9.5px] uppercase tracking-wider text-[#D4AF37]">
              Saved Shortlist ({savedIds.length})
            </span>
            {STAYEASE_PROPERTIES.filter((p) => savedIds.includes(p.id)).map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-3 rounded-2xl border border-white/12 bg-[#111B38] p-2.5"
              >
                <img src={A(s.gallery[0])} alt={s.name} className="h-14 w-16 rounded-xl object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-serif text-sm text-white">{s.name}</p>
                  <p className="text-[10px] text-[#9CA8C2]">{s.type} · ${s.rate}/nt</p>
                </div>
                <button
                  type="button"
                  onClick={() => openStayDetail(s)}
                  className="rounded-lg bg-[#D4AF37] px-2.5 py-1 text-[10px] font-bold text-[#080E20]"
                >
                  Open
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ================= TRAVELLER: TRIPS & CHECK-IN ================= */}
        {role === "traveller" && !showDetail && tab === "trips" && (
          <div className="space-y-3" data-testid="stayease-trips-view">
            <span className="font-mono text-[9.5px] uppercase tracking-wider text-[#D4AF37]">
              Upcoming Stays (Simulated)
            </span>
            {trips.map((t) => {
              const unlocked = unlockedTripId === t.id;
              return (
                <div key={t.id} className="rounded-2xl border border-white/12 bg-[#111B38] p-3.5">
                  <div className="flex items-center justify-between font-mono text-[9px] text-[#D4AF37]">
                    <span>{t.id}</span>
                    <span>${t.total}</span>
                  </div>
                  <p className="mt-1 font-serif text-base text-white">{t.stayName}</p>
                  <p className="text-[10.5px] text-[#9CA8C2]">{t.option} · {t.dates}</p>
                  <button
                    type="button"
                    onClick={() => setUnlockedTripId(unlocked ? null : t.id)}
                    data-testid={`stayease-trip-pass-${t.id}`}
                    className={`mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-[11px] font-semibold ${
                      unlocked
                        ? "bg-[#2DD4BF]/20 text-[#2DD4BF] ring-1 ring-[#2DD4BF]/40"
                        : "bg-[#D4AF37] text-[#080E20]"
                    }`}
                  >
                    <KeyRound size={13} />
                    {unlocked ? "Pass Code: SE-842 (Sample)" : "Show Check-In Pass"}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* ================= TRAVELLER: WALLET ================= */}
        {role === "traveller" && !showDetail && tab === "wallet" && (
          <div className="space-y-3">
            <div className="rounded-2xl border border-[#D4AF37]/30 bg-gradient-to-br from-[#162347] to-[#0D1530] p-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[9px] text-[#D4AF37]">STAY WALLET CREDIT</span>
                <Wallet size={14} className="text-[#D4AF37]" />
              </div>
              <p className="mt-2 font-serif text-3xl text-white">$45.00</p>
              <p className="mt-1 text-[10.5px] text-[#9CA8C2]">Applies across verified PGs, homestays & hotels.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#111B38] p-3.5 text-[11px] text-[#E2D9C8]/85">
              <div className="mb-1.5 flex items-center gap-1.5 font-mono text-[9.5px] text-[#D4AF37]">
                <Sparkles size={12} /> Smart Trip Readiness
              </div>
              Flexible monthly PG reminders, transparent host cancellation rules, and digital check-in passes synced cleanly.
            </div>
          </div>
        )}

        {/* ================= ROLE: OWNER ================= */}
        {role === "owner" && (
          <div className="space-y-3" data-testid="stayease-owner-mobile">
            <div className="flex gap-1.5">
              {["pg", "hotel"].map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setOwnerProp(k)}
                  className={`flex-1 rounded-xl border py-1.5 text-[10px] font-medium ${
                    ownerProp === k
                      ? "border-[#D4AF37] bg-[#D4AF37]/15 text-[#D4AF37]"
                      : "border-white/10 bg-[#111B38] text-[#9CA8C2]"
                  }`}
                >
                  {ownerUnits[k].label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-1 rounded-lg bg-[#101830] p-1">
              {["availability", "overview", "pricing"].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setOwnerSub(s)}
                  className={`rounded py-1 font-mono text-[8.5px] uppercase ${
                    ownerSub === s ? "bg-white/15 text-white" : "text-[#9CA8C2]"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {ownerSub === "availability" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-[#9CA8C2]">{currentOwner.title}</span>
                  <span className="font-mono text-[#D4AF37]">Tap status to toggle</span>
                </div>
                {currentOwner.items.map((u) => (
                  <button
                    key={u.code}
                    type="button"
                    onClick={() => toggleUnitAvailability(u.code)}
                    className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-[#111B38] px-3 py-2.5 text-left"
                  >
                    <div>
                      <span className="font-mono text-[10px] font-bold text-[#D4AF37]">{u.code}</span>
                      <p className="text-xs text-white">{u.occupant}</p>
                      <p className="text-[9.5px] text-[#9CA8C2]">{u.note}</p>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-0.5 font-mono text-[8.5px] uppercase ${
                        u.status === "Available"
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-white/10 text-[#E2D9C8]"
                      }`}
                    >
                      {u.status}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {ownerSub === "overview" && (
              <div className="space-y-2.5">
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl border border-white/10 bg-[#111B38] p-3">
                    <span className="font-mono text-[8.5px] text-[#9CA8C2]">OCCUPANCY</span>
                    <p className="mt-1 font-serif text-2xl text-[#D4AF37]">
                      {Math.round(
                        (currentOwner.items.filter((i) => i.status !== "Available").length /
                          currentOwner.items.length) *
                          100,
                      )}
                      %
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-[#111B38] p-3">
                    <span className="font-mono text-[8.5px] text-[#9CA8C2]">BASE RATE</span>
                    <p className="mt-1 font-serif text-2xl text-white">${currentOwner.baseRate}</p>
                  </div>
                </div>
                <div className="rounded-xl border border-white/10 bg-[#111B38] p-3 text-[11px] text-[#E2D9C8]/85">
                  Calendar turnarounds, rent checks, and guest arrivals stay accessible directly on the owner’s phone.
                </div>
              </div>
            )}

            {ownerSub === "pricing" && (
              <div className="space-y-3 rounded-2xl border border-white/12 bg-[#111B38] p-4">
                <span className="font-mono text-[9px] text-[#D4AF37]">LIVE BASE PRICING CONTROL</span>
                <div className="flex items-center justify-between">
                  <p className="font-serif text-2xl text-white">${currentOwner.baseRate} / unit</p>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => adjustOwnerRate(-5)}
                      className="rounded-lg border border-white/15 px-3 py-1 font-mono text-xs"
                    >
                      -$5
                    </button>
                    <button
                      type="button"
                      onClick={() => adjustOwnerRate(5)}
                      className="rounded-lg bg-[#D4AF37] px-3 py-1 font-mono text-xs font-bold text-[#080E20]"
                    >
                      +$5
                    </button>
                  </div>
                </div>
                <p className="text-[10.5px] text-[#9CA8C2]">Simulated owner tariff change applied instantaneously.</p>
              </div>
            )}
          </div>
        )}

        {/* ================= ROLE: ADMIN ================= */}
        {role === "admin" && (
          <div className="space-y-3" data-testid="stayease-admin-mobile">
            <div className="grid grid-cols-2 gap-1 rounded-lg bg-[#101830] p-1">
              {[
                { id: "approvals", label: "Property Approvals" },
                { id: "health", label: "Platform Health" },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setAdminSub(s.id)}
                  className={`rounded py-1 font-mono text-[8.5px] uppercase ${
                    adminSub === s.id ? "bg-white/15 text-white" : "text-[#9CA8C2]"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {adminSub === "approvals" ? (
              <div className="space-y-2.5">
                {approvals.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-white/12 bg-[#111B38] p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-serif text-sm text-white">{item.name}</p>
                        <p className="text-[10px] text-[#9CA8C2]">{item.kind} · {item.docs}</p>
                      </div>
                      <span
                        className={`rounded-full px-2 py-0.5 font-mono text-[8px] uppercase ${
                          item.status === "Approved"
                            ? "bg-emerald-500/20 text-emerald-300"
                            : "bg-[#D4AF37]/20 text-[#D4AF37]"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                    {item.status !== "Approved" && (
                      <button
                        type="button"
                        onClick={() => approveListing(item.id, "Approved")}
                        className="mt-2.5 flex w-full items-center justify-center gap-1 rounded-xl bg-[#D4AF37] py-1.5 text-[10px] font-bold text-[#080E20]"
                      >
                        <Check size={12} /> Approve Listing
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2.5">
                <div className="rounded-2xl border border-emerald-400/25 bg-emerald-500/10 p-3.5">
                  <div className="flex items-center gap-2 font-mono text-[9.5px] text-emerald-300">
                    <ShieldCheck size={14} /> Verification Pipeline Active
                  </div>
                  <p className="mt-1.5 text-[11px] text-[#E2D9C8]/90">
                    {approvals.filter((a) => a.status === "Approved").length} of {approvals.length} sample listings verified · owner identity & safety checks monitored.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Tab Navigation (Traveller mode) */}
      {role === "traveller" && (
        <div className="grid grid-cols-4 border-t border-white/10 bg-[#070B19] pb-4 pt-2.5">
          {[
            { id: "explore", label: "Explore", Icon: Compass },
            { id: "saved", label: "Saved", Icon: Heart },
            { id: "trips", label: "Trips", Icon: Calendar },
            { id: "wallet", label: "Wallet", Icon: Wallet },
          ].map(({ id, label, Icon }) => {
            const active = tab === id && !showDetail;
            return (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setShowDetail(false);
                  setTab(id);
                }}
                data-testid={`stayease-mobile-tab-${id}`}
                className={`flex flex-col items-center gap-0.5 text-[9.5px] font-medium transition-colors ${
                  active ? "text-[#D4AF37]" : "text-[#9CA8C2]"
                }`}
              >
                <Icon size={14} />
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
