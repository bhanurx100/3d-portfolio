import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  LayoutGrid,
  Minus,
  Package,
  PackageCheck,
  Plus,
  Receipt,
  RotateCcw,
  ScanBarcode,
  Search,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { PRODUCTS } from "@/data/products";

const INITIAL_PRODUCTS = [
  {
    id: "p1",
    sku: "GR-101",
    barcode: "8901012011",
    name: "Basmati Rice (5 kg)",
    category: "Staples",
    price: 11.5,
    stock: 18,
    min: 8,
    unit: "bags",
    supplier: "Kaveri Grain Co.",
  },
  {
    id: "p2",
    sku: "GR-104",
    barcode: "8901014088",
    name: "Cold-Pressed Mustard Oil (1 L)",
    category: "Oils",
    price: 5.2,
    stock: 9,
    min: 10,
    unit: "bottles",
    supplier: "Narmada Millers",
  },
  {
    id: "p3",
    sku: "GR-112",
    barcode: "8901029103",
    name: "Organic Toor Dal (1 kg)",
    category: "Staples",
    price: 3.4,
    stock: 26,
    min: 10,
    unit: "packs",
    supplier: "Kaveri Grain Co.",
  },
  {
    id: "p4",
    sku: "BV-205",
    barcode: "8901045512",
    name: "Roasted Filter Coffee (250 g)",
    category: "Beverages",
    price: 4.8,
    stock: 14,
    min: 6,
    unit: "tins",
    supplier: "Coorg Roasters",
  },
  {
    id: "p5",
    sku: "GR-118",
    barcode: "8901051904",
    name: "Unrefined Jaggery Block (500 g)",
    category: "Staples",
    price: 2.6,
    stock: 7,
    min: 8,
    unit: "packs",
    supplier: "Mysuru Organics",
  },
  {
    id: "p6",
    sku: "HH-302",
    barcode: "8901077210",
    name: "Herbal Bath Soap (4-Pack)",
    category: "Household",
    price: 4.0,
    stock: 22,
    min: 8,
    unit: "packs",
    supplier: "Vana Home Care",
  },
];

const INITIAL_BILLS = [
  {
    id: "BILL-1041",
    time: "10:15 AM",
    itemsCount: 3,
    total: 20.1,
    summary: "Basmati Rice ×1, Mustard Oil ×1, Toor Dal ×1",
    customer: "Walk-in Customer",
  },
];

const INITIAL_MOVEMENTS = [
  { id: "m1", text: "BILL-1041 sold · -3 units", time: "10:15 AM", type: "sale" },
  { id: "m2", text: "Restocked Toor Dal +12 packs", time: "09:10 AM", type: "restock" },
];

const CUSTOMERS = [
  { name: "Walk-in Counter", visits: "18 bills today", note: "Cash / UPI" },
  { name: "Sharma Residence", visits: "Regular monthly", note: "Cleared $0 due" },
  { name: "Cafe Verandah", visits: "Twice weekly", note: "Beverages & Staples" },
];

const SUPPLIERS = [
  { name: "Kaveri Grain Co.", lead: "Next morning", items: "Basmati, Toor Dal" },
  { name: "Narmada Millers", lead: "2 days", items: "Cold-Pressed Oils" },
  { name: "Coorg Roasters", lead: "3 days", items: "Coffee Tins" },
];

const StockPilotContext = createContext(null);

export const StockPilotStoreProvider = ({ children }) => {
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [bills, setBills] = useState(INITIAL_BILLS);
  const [movements, setMovements] = useState(INITIAL_MOVEMENTS);
  const [cart, setCart] = useState({ p1: 1, p2: 1 });
  const [discountPct, setDiscountPct] = useState(0);
  const [taxPct, setTaxPct] = useState(5);

  const adjustCart = (id, delta) => {
    const prod = products.find((p) => p.id === id);
    if (!prod) return;
    setCart((prev) => {
      const nextQty = Math.min(prod.stock, Math.max(0, (prev[id] || 0) + delta));
      if (nextQty === 0) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return { ...prev, [id]: nextQty };
    });
  };

  const adjustStock = (id, delta) => {
    const prod = products.find((p) => p.id === id);
    if (!prod) return;
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, stock: Math.max(0, p.stock + delta) } : p)),
    );
    setMovements((prev) => [
      {
        id: `m-${Date.now()}`,
        text: `${delta > 0 ? "Restocked" : "Adjusted"} ${prod.name.split(" (")[0]} ${delta > 0 ? "+" : ""}${delta}`,
        time: "Just now",
        type: delta > 0 ? "restock" : "sale",
      },
      ...prev.slice(0, 7),
    ]);
  };

  const addProduct = ({ name, category, price, stock }) => {
    const clean = name.trim();
    if (!clean) return;
    const id = `p-${Date.now()}`;
    setProducts((prev) => [
      {
        id,
        sku: `NW-${120 + prev.length}`,
        barcode: `89010${880 + prev.length}1`,
        name: clean,
        category: category || "Staples",
        price: Math.max(0.5, Number(price) || 3.0),
        stock: Math.max(1, Number(stock) || 10),
        min: 5,
        unit: "units",
        supplier: "Local Wholesale",
      },
      ...prev,
    ]);
  };

  const updateProductPrice = (id, delta) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, price: Number(Math.max(0.5, p.price + delta).toFixed(2)) } : p,
      ),
    );
  };

  const cartLines = useMemo(
    () =>
      Object.entries(cart)
        .map(([id, qty]) => {
          const item = products.find((p) => p.id === id);
          return item ? { ...item, qty, lineTotal: Number((item.price * qty).toFixed(2)) } : null;
        })
        .filter(Boolean),
    [cart, products],
  );

  const subtotal = useMemo(() => cartLines.reduce((acc, l) => acc + l.lineTotal, 0), [cartLines]);
  const discountAmt = Number(((subtotal * discountPct) / 100).toFixed(2));
  const taxable = Math.max(0, subtotal - discountAmt);
  const taxAmt = Number(((taxable * taxPct) / 100).toFixed(2));
  const grandTotal = Number((taxable + taxAmt).toFixed(2));

  const completeSale = () => {
    if (cartLines.length === 0) return null;
    const count = cartLines.reduce((a, b) => a + b.qty, 0);
    setProducts((prev) =>
      prev.map((p) => {
        const sold = cart[p.id] || 0;
        return sold > 0 ? { ...p, stock: Math.max(0, p.stock - sold) } : p;
      }),
    );
    const newBill = {
      id: `BILL-${1042 + bills.length}`,
      time: "Just now",
      itemsCount: count,
      total: grandTotal,
      summary: cartLines.map((l) => `${l.name.split(" (")[0]} ×${l.qty}`).join(", "),
      customer: "Counter Sale",
    };
    setBills((prev) => [newBill, ...prev]);
    setMovements((prev) => [
      { id: `m-${Date.now()}`, text: `${newBill.id} sold · -${count} units`, time: "Just now", type: "sale" },
      ...prev.slice(0, 7),
    ]);
    setCart({});
    return newBill;
  };

  const resetStore = () => {
    setProducts(INITIAL_PRODUCTS);
    setBills(INITIAL_BILLS);
    setMovements(INITIAL_MOVEMENTS);
    setCart({ p1: 1, p2: 1 });
    setDiscountPct(0);
    setTaxPct(5);
  };

  return (
    <StockPilotContext.Provider
      value={{
        products,
        bills,
        movements,
        cart,
        cartLines,
        subtotal,
        discountPct,
        setDiscountPct,
        taxPct,
        setTaxPct,
        discountAmt,
        taxAmt,
        grandTotal,
        adjustCart,
        adjustStock,
        addProduct,
        updateProductPrice,
        completeSale,
        resetStore,
      }}
    >
      {children}
    </StockPilotContext.Provider>
  );
};

export const useStockPilotStore = () => {
  const ctx = useContext(StockPilotContext);
  if (!ctx) throw new Error("Must use inside StockPilotStoreProvider");
  return ctx;
};

export const StockPilotMobileApp = ({ activeStage = "overview" }) => {
  const {
    products,
    bills,
    movements,
    cart,
    cartLines,
    subtotal,
    discountPct,
    setDiscountPct,
    taxPct,
    setTaxPct,
    grandTotal,
    adjustCart,
    adjustStock,
    addProduct,
    updateProductPrice,
    completeSale,
    resetStore,
  } = useStockPilotStore();

  const [tab, setTab] = useState("bill"); // "overview" | "catalog" | "stock" | "bill" | "insights"
  const [shopScale, setShopScale] = useState("kirana");
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("All");
  const [selectedProdId, setSelectedProdId] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("3.50");
  const [lastBill, setLastBill] = useState(null);
  const [scanNotice, setScanNotice] = useState("");

  useEffect(() => {
    if (["overview", "catalog", "stock", "bill", "insights"].includes(activeStage)) {
      setTab(activeStage);
    }
  }, [activeStage]);

  const lowStock = products.filter((p) => p.stock <= p.min);
  const totalUnits = products.reduce((a, p) => a + p.stock, 0);
  const totalRevenue = bills.reduce((a, b) => a + b.total, 0);

  const visibleProducts = useMemo(
    () =>
      products.filter((p) => {
        const matchCat = cat === "All" || p.category === cat;
        const q = search.trim().toLowerCase();
        const matchQ = !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
        return matchCat && matchQ;
      }),
    [products, cat, search],
  );

  const handleScanSample = () => {
    const target = products[2] || products[0];
    if (!target) return;
    adjustCart(target.id, 1);
    setScanNotice(`Scanned ${target.sku} · Added ${target.name.split(" (")[0]}`);
    setTimeout(() => setScanNotice(""), 2400);
  };

  const handleCheckout = () => {
    const bill = completeSale();
    if (bill) setLastBill(bill);
  };

  const handleCreateProduct = (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    addProduct({ name: newName, price: newPrice, stock: 12, category: "Staples" });
    setNewName("");
    setShowAdd(false);
  };

  const inspProd = products.find((p) => p.id === selectedProdId);

  return (
    <div
      className="flex h-full w-full flex-col bg-[#111317] text-[#F1F3F5]"
      data-testid="stockpilot-mobile-preview"
    >
      {/* Top Bar */}
      <div className="border-b border-white/10 bg-[#16191E] px-4 pb-2.5 pt-11">
        <div className="flex items-center justify-between gap-2">
          <div>
            <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-[#F59E0B]">
              {PRODUCTS.stockpilot.status?.demoLabel || "Interactive demo · Sample data"}
            </span>
            <h4 className="text-base font-semibold leading-tight">
              {tab === "overview"
                ? "Shop Overview"
                : tab === "catalog"
                  ? "Product Catalog"
                  : tab === "stock"
                    ? "Inventory & Suppliers"
                    : tab === "bill"
                      ? "Counter Quick Bill"
                      : "Business Insights"}
            </h4>
          </div>
          <button
            type="button"
            onClick={() => {
              resetStore();
              setLastBill(null);
            }}
            data-testid="stockpilot-mobile-reset"
            className="inline-flex items-center gap-1 rounded-full border border-[#F59E0B]/40 bg-[#F59E0B]/10 px-2.5 py-1 font-mono text-[8.5px] text-[#F59E0B]"
          >
            <RotateCcw size={9} /> Reset
          </button>
        </div>

        <div className="mt-2 grid grid-cols-2 gap-1 rounded-lg bg-[#101216] p-1">
          {[
            { id: "kirana", label: "Kirana Shop" },
            { id: "expanded", label: "Multi-Shelf Store" },
          ].map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setShopScale(m.id)}
              className={`rounded py-1 font-mono text-[8.5px] uppercase tracking-wider ${
                shopScale === m.id ? "bg-[#F59E0B] font-bold text-[#111317]" : "text-[#949BA6]"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div data-lenis-prevent className="no-scrollbar flex-1 overflow-y-auto px-3.5 py-3">
        {/* ================= OVERVIEW ================= */}
        {tab === "overview" && (
          <div className="space-y-3" data-testid="stockpilot-overview-tab">
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl border border-white/10 bg-[#1A1D24] p-3">
                <span className="font-mono text-[8.5px] text-[#949BA6]">TODAY’S SALES</span>
                <p className="mt-1 font-mono text-xl font-bold text-[#F59E0B]">${totalRevenue.toFixed(2)}</p>
                <p className="text-[10px] text-[#949BA6]">{bills.length} bills synced</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-[#1A1D24] p-3">
                <span className="font-mono text-[8.5px] text-[#949BA6]">CATALOG &amp; UNITS</span>
                <p className="mt-1 font-mono text-xl font-bold text-white">{products.length} SKUs</p>
                <p className="text-[10px] text-[#949BA6]">{totalUnits} units in store</p>
              </div>
            </div>

            {lowStock.length > 0 && (
              <button
                type="button"
                onClick={() => setTab("stock")}
                className="flex w-full items-center justify-between rounded-xl border border-[#F59E0B]/40 bg-[#F59E0B]/12 px-3 py-2.5 text-left"
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle size={14} className="shrink-0 text-[#F59E0B]" />
                  <div>
                    <p className="text-xs font-semibold text-[#F59E0B]">{lowStock.length} items running low</p>
                    <p className="text-[10px] text-[#E5E7EB]/75">{lowStock.map((i) => i.name.split(" (")[0]).join(", ")}</p>
                  </div>
                </div>
                <span className="font-mono text-[9px] text-[#F59E0B]">Restock →</span>
              </button>
            )}

            <div className="space-y-2">
              <span className="font-mono text-[8.5px] text-[#949BA6]">RECENT STORE ACTIVITY</span>
              {movements.slice(0, 4).map((m) => (
                <div key={m.id} className="flex items-center justify-between rounded-xl border border-white/8 bg-[#181B21] px-3 py-2 text-[11px]">
                  <span>{m.text}</span>
                  <span className="font-mono text-[9px] text-[#949BA6]">{m.time}</span>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setTab("bill")}
              className="w-full rounded-xl bg-[#F59E0B] py-2.5 text-xs font-bold uppercase tracking-wider text-[#111317]"
            >
              Open Counter Billing
            </button>
          </div>
        )}

        {/* ================= CATALOG ================= */}
        {tab === "catalog" && (
          <div className="space-y-3" data-testid="stockpilot-catalog-tab">
            <div className="flex gap-1.5">
              <div className="flex flex-1 items-center gap-2 rounded-xl border border-white/10 bg-[#1A1D24] px-2.5 py-1.5">
                <Search size={12} className="text-[#F59E0B]" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search product or SKU..."
                  className="w-full bg-transparent text-[11px] text-white placeholder:text-[#949BA6]"
                />
              </div>
              <button
                type="button"
                onClick={() => setShowAdd((s) => !s)}
                className="rounded-xl bg-[#F59E0B] px-2.5 font-mono text-[9.5px] font-bold text-[#111317]"
              >
                {showAdd ? "Close" : "+ Item"}
              </button>
            </div>

            {showAdd && (
              <form onSubmit={handleCreateProduct} className="space-y-2 rounded-xl border border-[#F59E0B]/35 bg-[#1A1D24] p-3">
                <span className="font-mono text-[8.5px] text-[#F59E0B]">ADD ITEM (SAMPLE CATALOG)</span>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Organic Honey (500 g)"
                  className="w-full rounded-lg border border-white/10 bg-[#111317] px-2.5 py-1.5 text-[11px]"
                />
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.1"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-24 rounded-lg border border-white/10 bg-[#111317] px-2.5 py-1.5 font-mono text-[11px]"
                  />
                  <button type="submit" className="flex-1 rounded-lg bg-[#F59E0B] py-1.5 text-[11px] font-bold text-[#111317]">
                    Save Item
                  </button>
                </div>
              </form>
            )}

            <div className="no-scrollbar flex gap-1.5 overflow-x-auto pb-0.5">
              {["All", "Staples", "Oils", "Beverages", "Household"].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCat(c)}
                  className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] ${
                    cat === c ? "bg-[#F59E0B] font-bold text-[#111317]" : "border border-white/12 bg-[#1A1D24] text-[#949BA6]"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            {inspProd && (
              <div className="space-y-2 rounded-xl border border-[#F59E0B]/35 bg-[#191D24] p-3 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[9px] text-[#F59E0B]">SKU {inspProd.sku} · #{inspProd.barcode}</span>
                  <button type="button" onClick={() => setSelectedProdId(null)} className="text-[10px] text-[#949BA6]">Close</button>
                </div>
                <p className="text-xs font-semibold text-white">{inspProd.name}</p>
                <p className="text-[10px] text-[#949BA6]">
                  Supplier: {inspProd.supplier} · Stock: {inspProd.stock} {inspProd.unit}
                </p>
                <div className="flex items-center justify-between border-t border-white/10 pt-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => updateProductPrice(inspProd.id, -0.5)}
                      className="rounded border border-white/15 px-2 py-0.5 font-mono text-[9.5px]"
                    >
                      -$0.50
                    </button>
                    <span className="font-mono font-bold text-[#F59E0B]">${inspProd.price.toFixed(2)}</span>
                    <button
                      type="button"
                      onClick={() => updateProductPrice(inspProd.id, 0.5)}
                      className="rounded border border-white/15 px-2 py-0.5 font-mono text-[9.5px]"
                    >
                      +$0.50
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      adjustCart(inspProd.id, 1);
                      setTab("bill");
                    }}
                    className="rounded-lg bg-[#F59E0B] px-2.5 py-1 font-mono text-[9.5px] font-bold text-[#111317]"
                  >
                    + Bill
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {visibleProducts.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedProdId(p.id)}
                  className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-[#1A1D24] px-3 py-2.5 text-left"
                >
                  <div>
                    <p className="text-xs font-medium text-white">{p.name}</p>
                    <p className="font-mono text-[9.5px] text-[#949BA6]">
                      {p.sku} · {p.category} · {p.stock} {p.unit}
                    </p>
                  </div>
                  <span className="font-mono text-xs font-bold text-[#F59E0B]">${p.price.toFixed(2)}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ================= STOCK ================= */}
        {tab === "stock" && (
          <div className="space-y-2.5" data-testid="stockpilot-stock-tab">
            {products.map((p) => {
              const low = p.stock <= p.min;
              return (
                <div key={p.id} className="rounded-xl border border-white/10 bg-[#1A1D24] p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white">{p.name}</span>
                    <span className={`font-mono text-xs font-bold ${low ? "text-[#F59E0B]" : "text-emerald-300"}`}>
                      {p.stock} {p.unit}
                    </span>
                  </div>
                  <div className="mt-1.5 flex items-center justify-between">
                    <span className="font-mono text-[9.5px] text-[#949BA6]">
                      <Truck size={10} className="mr-1 inline" />
                      {p.supplier}
                    </span>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => adjustStock(p.id, -1)}
                        className="rounded border border-white/15 px-2 py-0.5 font-mono text-[9.5px] text-[#949BA6]"
                      >
                        -1
                      </button>
                      <button
                        type="button"
                        onClick={() => adjustStock(p.id, 5)}
                        className="rounded border border-[#F59E0B]/40 bg-[#F59E0B]/10 px-2 py-0.5 font-mono text-[9.5px] text-[#F59E0B]"
                      >
                        +5 Restock
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ================= QUICK BILL (MOBILE POS) ================= */}
        {tab === "bill" && (
          <div className="space-y-3" data-testid="stockpilot-bill-tab">
            {lastBill && (
              <div
                data-testid="stockpilot-bill-receipt"
                className="rounded-xl border border-emerald-400/40 bg-emerald-500/15 p-3 text-xs text-emerald-200"
              >
                <div className="flex items-center justify-between font-mono text-[9.5px]">
                  <span>{lastBill.id} · SAMPLE RECEIPT</span>
                  <span>${lastBill.total.toFixed(2)}</span>
                </div>
                <p className="mt-1 text-[11px]">Stock deducted live: {lastBill.summary}</p>
              </div>
            )}

            <div className="flex items-center gap-1.5">
              <div className="flex flex-1 items-center gap-2 rounded-xl border border-white/10 bg-[#1A1D24] px-2.5 py-1.5">
                <Search size={12} className="text-[#F59E0B]" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Quick search SKU..."
                  className="w-full bg-transparent text-[11px] text-white placeholder:text-[#949BA6]"
                />
              </div>
              <button
                type="button"
                onClick={handleScanSample}
                title="Simulate barcode scan"
                className="inline-flex items-center gap-1 rounded-xl border border-[#F59E0B]/40 bg-[#1A1D24] px-2.5 py-1.5 font-mono text-[9px] text-[#F59E0B]"
              >
                <ScanBarcode size={12} /> Scan
              </button>
            </div>

            {scanNotice && (
              <p className="font-mono text-[9.5px] text-[#F59E0B]">{scanNotice}</p>
            )}

            <div className="space-y-2">
              {visibleProducts.map((p) => {
                const qty = cart[p.id] || 0;
                const low = p.stock <= p.min;
                return (
                  <div
                    key={p.id}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-[#1A1D24] px-3 py-2"
                  >
                    <div className="pr-2">
                      <p className="text-xs font-medium text-[#F1F3F5]">{p.name}</p>
                      <p className="font-mono text-[9.5px] text-[#949BA6]">
                        ${p.price.toFixed(2)} ·{" "}
                        <span className={low ? "text-[#F59E0B]" : ""}>{p.stock} left</span>
                        {shopScale === "expanded" && ` · ${p.sku}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => adjustCart(p.id, -1)}
                        data-testid={`stockpilot-cart-dec-${p.id}`}
                        className="grid h-6 w-6 place-items-center rounded border border-white/15 bg-[#111317]"
                        aria-label={`Remove one ${p.name}`}
                      >
                        <Minus size={11} />
                      </button>
                      <span className="w-4 text-center font-mono text-xs font-bold text-[#F59E0B]">
                        {qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => adjustCart(p.id, 1)}
                        data-testid={`stockpilot-cart-inc-${p.id}`}
                        className="grid h-6 w-6 place-items-center rounded border border-white/15 bg-[#111317]"
                        aria-label={`Add one ${p.name}`}
                      >
                        <Plus size={11} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="rounded-xl border border-[#F59E0B]/35 bg-[#16191E] p-3">
              <div className="flex items-center justify-between text-[11px] text-[#949BA6]">
                <span>Subtotal ({cartLines.reduce((a, b) => a + b.qty, 0)} items)</span>
                <span className="font-mono text-[#F1F3F5]">${subtotal.toFixed(2)}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-[9.5px]">
                <span className="font-mono text-[#949BA6]">DISCOUNT / TAX</span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setDiscountPct((d) => (d === 0 ? 5 : 0))}
                    className={`rounded px-2 py-0.5 font-mono ${
                      discountPct > 0 ? "bg-[#F59E0B] text-[#111317]" : "border border-white/15 text-[#949BA6]"
                    }`}
                  >
                    -{discountPct}% Disc
                  </button>
                  <button
                    type="button"
                    onClick={() => setTaxPct((t) => (t === 5 ? 0 : 5))}
                    className={`rounded px-2 py-0.5 font-mono ${
                      taxPct > 0 ? "bg-white/15 text-white" : "border border-white/15 text-[#949BA6]"
                    }`}
                  >
                    +{taxPct}% Tax
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCheckout}
                disabled={cartLines.length === 0}
                data-testid="stockpilot-mobile-bill-btn"
                className="mt-2.5 w-full rounded-xl bg-[#F59E0B] py-2 text-xs font-bold uppercase tracking-wider text-[#111317] disabled:opacity-40"
              >
                Complete Sale · ${grandTotal.toFixed(2)}
              </button>
            </div>
          </div>
        )}

        {/* ================= INSIGHTS & RECORDS ================= */}
        {tab === "insights" && (
          <div className="space-y-3" data-testid="stockpilot-insights-tab">
            <div className="rounded-xl border border-white/10 bg-[#1A1D24] p-3">
              <span className="font-mono text-[8.5px] text-[#F59E0B]">RECENT SAMPLE BILLS ({bills.length})</span>
              <div className="mt-2 space-y-2">
                {bills.slice(0, 3).map((b) => (
                  <div key={b.id} className="flex items-center justify-between border-b border-white/8 pb-1.5 text-[10.5px] last:border-none last:pb-0">
                    <div>
                      <span className="font-mono text-[#F59E0B]">{b.id}</span> · {b.summary}
                    </div>
                    <span className="font-mono font-bold">${b.total.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#1A1D24] p-3">
              <span className="font-mono text-[8.5px] text-[#949BA6]">REGULAR CUSTOMERS</span>
              <div className="mt-2 space-y-1.5">
                {CUSTOMERS.map((c) => (
                  <div key={c.name} className="flex items-center justify-between text-[10.5px]">
                    <span>{c.name}</span>
                    <span className="font-mono text-[9px] text-[#949BA6]">{c.visits}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#1A1D24] p-3">
              <span className="font-mono text-[8.5px] text-[#949BA6]">SUPPLIER RECORDS</span>
              <div className="mt-2 space-y-1.5">
                {SUPPLIERS.map((s) => (
                  <div key={s.name} className="flex items-center justify-between text-[10.5px]">
                    <span>{s.name}</span>
                    <span className="font-mono text-[9px] text-[#F59E0B]">{s.lead}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom 5-Tab Bar */}
      <div className="grid grid-cols-5 border-t border-white/10 bg-[#16191E] pb-4 pt-2">
        {[
          { id: "overview", label: "Home", Icon: LayoutGrid },
          { id: "catalog", label: "Items", Icon: Package },
          { id: "bill", label: "Bill", Icon: ShoppingBag },
          { id: "stock", label: "Stock", Icon: PackageCheck },
          { id: "insights", label: "Insights", Icon: BarChart3 },
        ].map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            data-testid={`stockpilot-mobile-tab-${id}`}
            className={`flex flex-col items-center gap-0.5 font-mono text-[8.5px] transition-colors ${
              tab === id ? "text-[#F59E0B]" : "text-[#949BA6]"
            }`}
          >
            <Icon size={14} />
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
