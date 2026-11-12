import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  ArrowRightLeft,
  Check,
  CreditCard,
  PieChart,
  Plus,
  Receipt,
  RotateCcw,
  ScanLine,
  Users,
  Wallet,
} from "lucide-react";
import {
  computeExpenseSharesCents,
  createExpense,
  deriveUnifiedFinanceState,
  formatCents,
  toCents,
  validateAndCreateSettlement,
} from "@/lib/splitfinLedger";
import { PRODUCTS } from "@/data/products";

export const SPLITFIN_MEMBERS = [
  { id: "you", name: "You", initials: "BL" },
  { id: "maya", name: "Maya", initials: "MK" },
  { id: "arjun", name: "Arjun", initials: "AR" },
  { id: "sora", name: "Sora", initials: "ST" },
];

const INITIAL_ACCOUNTS = [
  { id: "checking", name: "Checking ••4821", kind: "Bank", openingBalanceCents: 318000 },
  { id: "card", name: "Everyday Card ••1904", kind: "Card", openingBalanceCents: 142000 },
  { id: "wallet", name: "Cash Wallet", kind: "Cash", openingBalanceCents: 18500 },
];

const INITIAL_PERSONAL_TX = [
  { id: "ptx-1", title: "Monthly Salary", category: "Income", kind: "income", amountCents: 420000, accountId: "checking", date: "Nov 01" },
  { id: "ptx-2", title: "Apartment Rent", category: "Housing", kind: "expense", amountCents: 115000, accountId: "checking", date: "Nov 02" },
  { id: "ptx-3", title: "Fresh Market Groceries", category: "Groceries", kind: "expense", amountCents: 14800, accountId: "card", date: "Nov 05" },
  { id: "ptx-4", title: "Transit Pass", category: "Transit", kind: "expense", amountCents: 6400, accountId: "wallet", date: "Nov 07" },
];

const INITIAL_GROUPS = [
  { id: "friday-table", name: "Friday Table", note: "Dinner & café rounds" },
  { id: "coastal-trip", name: "Coastal Weekend", note: "3-day shared road trip" },
];

const buildInitialExpenses = () => [
  {
    ...createExpense({
      id: "e1",
      groupId: "friday-table",
      title: "Osteria Mains",
      payerId: "you",
      subtotalCents: 9600,
      participantIds: ["you", "maya", "arjun", "sora"],
    }),
    accountId: "card",
    category: "Dining",
  },
  {
    ...createExpense({
      id: "e2",
      groupId: "friday-table",
      title: "Gelato Walk",
      payerId: "maya",
      subtotalCents: 2400,
      participantIds: ["you", "maya", "arjun", "sora"],
    }),
    accountId: "card",
    category: "Dining",
  },
  {
    ...createExpense({
      id: "e3",
      groupId: "coastal-trip",
      title: "Rail Passes",
      payerId: "arjun",
      subtotalCents: 12000,
      participantIds: ["you", "arjun", "sora"],
    }),
    accountId: "card",
    category: "Travel",
  },
  {
    ...createExpense({
      id: "e4",
      groupId: "coastal-trip",
      title: "Harbor Lunch",
      payerId: "you",
      subtotalCents: 6600,
      participantIds: ["you", "maya", "arjun"],
    }),
    accountId: "card",
    category: "Dining",
  },
];

const PRESETS = [
  { label: "Dinner · $124", title: "Bistro Dinner", amount: 124, category: "Dining" },
  { label: "Cab · $42", title: "Airport Ride", amount: 42, category: "Transit" },
  { label: "Groceries · $64", title: "Shared Pantry", amount: 64, category: "Groceries" },
];

const SplitfinContext = createContext(null);

export const SplitfinLedgerProvider = ({ children }) => {
  const [expenses, setExpenses] = useState(buildInitialExpenses);
  const [personalTransactions, setPersonalTransactions] = useState(INITIAL_PERSONAL_TX);
  const [settlements, setSettlements] = useState([]);
  const [activeGroupId, setActiveGroupId] = useState("friday-table");

  const derived = useMemo(
    () =>
      deriveUnifiedFinanceState({
        members: SPLITFIN_MEMBERS,
        groups: INITIAL_GROUPS,
        expenses,
        settlements,
        accounts: INITIAL_ACCOUNTS,
        personalTransactions,
        monthlyBudgetCents: 220000,
      }),
    [expenses, settlements, personalTransactions],
  );

  const addExpense = (payload) => {
    const exp = {
      ...createExpense(payload),
      accountId: payload.accountId || "card",
      category: payload.category || "Dining",
    };
    setExpenses((prev) => [exp, ...prev]);
    return exp;
  };

  const addPersonalTx = ({ title, category, kind, amountCents, accountId }) => {
    setPersonalTransactions((prev) => [
      {
        id: `ptx-${Date.now()}`,
        title: title.trim() || "Personal Entry",
        category,
        kind,
        amountCents,
        accountId,
        date: "Today",
      },
      ...prev,
    ]);
  };

  const settleBalance = ({ groupId = "overall", fromId, toId, amountCents, idempotencyKey }) => {
    const targetBalances =
      groupId === "overall"
        ? derived.overallBalancesCents
        : derived.groups.find((g) => g.id === groupId)?.balancesCents || derived.overallBalancesCents;

    const result = validateAndCreateSettlement({
      groupId,
      fromId,
      toId,
      amountCents,
      netBalancesCents: targetBalances,
      existingSettlements: settlements,
      idempotencyKey,
    });
    if (!result.ok) return result;
    setSettlements((prev) => [{ ...result.settlement, accountId: "checking" }, ...prev]);
    return result;
  };

  const resetLedger = () => {
    setExpenses(buildInitialExpenses());
    setPersonalTransactions(INITIAL_PERSONAL_TX);
    setSettlements([]);
    setActiveGroupId("friday-table");
  };

  return (
    <SplitfinContext.Provider
      value={{
        members: SPLITFIN_MEMBERS,
        expenses,
        personalTransactions,
        settlements,
        activeGroupId,
        setActiveGroupId,
        derived,
        addExpense,
        addPersonalTx,
        settleBalance,
        resetLedger,
      }}
    >
      {children}
    </SplitfinContext.Provider>
  );
};

const useSplitfinLedger = () => {
  const ctx = useContext(SplitfinContext);
  if (!ctx) throw new Error("Must use inside SplitfinLedgerProvider");
  return ctx;
};

const memberName = (id) => SPLITFIN_MEMBERS.find((m) => m.id === id)?.name || id;

export const SplitfinMobilePrototype = ({ initialTab = "money", activeStage = null }) => {
  const {
    members,
    expenses,
    personalTransactions,
    settlements,
    activeGroupId,
    setActiveGroupId,
    derived,
    addExpense,
    addPersonalTx,
    settleBalance,
    resetLedger,
  } = useSplitfinLedger();

  const [tab, setTab] = useState(initialTab); // "money" | "budgets" | "groups" | "split" | "settle"
  const [scanHint, setScanHint] = useState("");
  const [categoryBudgets, setCategoryBudgets] = useState({
    Housing: 120000,
    Groceries: 35000,
    Dining: 30000,
    Transit: 18000,
  });
  const [editBudgetCat, setEditBudgetCat] = useState("Dining");
  const [editBudgetInput, setEditBudgetInput] = useState("300");

  useEffect(() => {
    if (activeStage && ["money", "budgets", "groups", "split", "settle"].includes(activeStage)) {
      setTab(activeStage);
    }
  }, [activeStage]);
  const [billTitle, setBillTitle] = useState("Bistro Dinner");
  const [billAmount, setBillAmount] = useState("124");
  const [billCategory, setBillCategory] = useState("Dining");
  const [billAccount, setBillAccount] = useState("card");
  const [payerId, setPayerId] = useState("you");
  const [tipPct, setTipPct] = useState(10);
  const [splitMode, setSplitMode] = useState("equal");
  const [included, setIncluded] = useState(["you", "maya", "arjun", "sora"]);
  const [weights, setWeights] = useState({ you: 25, maya: 25, arjun: 25, sora: 25 });
  const [partialInputs, setPartialInputs] = useState({});
  const [quickTitle, setQuickTitle] = useState("");
  const [quickAmt, setQuickAmt] = useState("");
  const [quickKind, setQuickKind] = useState("expense");
  const [quickCategory, setQuickCategory] = useState("Dining");
  const [quickAccount, setQuickAccount] = useState("card");
  const [toast, setToast] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const activeGroup = derived.groups.find((g) => g.id === activeGroupId) || derived.groups[0];

  const previewCalc = useMemo(
    () =>
      computeExpenseSharesCents({
        subtotalCents: toCents(billAmount),
        tipPercent: tipPct,
        participantIds: included,
        splitMode,
        weights,
      }),
    [billAmount, tipPct, included, splitMode, weights],
  );

  const toggleMember = (id) => {
    setIncluded((prev) => {
      if (prev.includes(id)) return prev.length > 1 ? prev.filter((m) => m !== id) : prev;
      return [...prev, id];
    });
  };

  const showToast = (msg) => {
    setErrorMsg("");
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const recordSplit = () => {
    if (previewCalc.totalCents <= 0 || included.length === 0) {
      setErrorMsg("Enter an amount above $0.00 and keep at least one participant.");
      return;
    }
    const exp = addExpense({
      groupId: activeGroup.id,
      title: billTitle.trim() || "Shared Bill",
      payerId,
      subtotalCents: previewCalc.subtotalCents,
      tipPercent: tipPct,
      participantIds: included,
      splitMode,
      weights,
      accountId: billAccount,
      category: billCategory,
    });
    const yourShare = exp.sharesCents.you || 0;
    showToast(`Logged ${formatCents(exp.totalCents)} · Your share ${formatCents(yourShare)}`);
    setTab("money");
  };

  const handleQuickPersonal = (e) => {
    e.preventDefault();
    const cents = toCents(quickAmt);
    if (cents <= 0) {
      setErrorMsg("Enter a valid amount above $0.00.");
      return;
    }
    addPersonalTx({
      title: quickTitle || (quickKind === "income" ? "Freelance Income" : "Personal Expense"),
      category: quickKind === "income" ? "Income" : quickCategory,
      kind: quickKind,
      amountCents: cents,
      accountId: quickAccount,
    });
    setQuickTitle("");
    setQuickAmt("");
    showToast(`Logged ${quickKind} (${formatCents(cents)})`);
  };

  const handleSaveBudget = (e) => {
    e.preventDefault();
    const cents = toCents(editBudgetInput);
    if (cents <= 0) return;
    setCategoryBudgets((prev) => ({ ...prev, [editBudgetCat]: cents }));
    showToast(`Updated ${editBudgetCat} budget to ${formatCents(cents)}`);
  };

  const handleSettle = (suggestion, customCents = null) => {
    const amountCents = customCents ?? suggestion.amountCents;
    const res = settleBalance({
      groupId: "overall",
      fromId: suggestion.fromId,
      toId: suggestion.toId,
      amountCents,
      idempotencyKey: `${suggestion.key}:${amountCents}:${settlements.length}`,
    });
    if (!res.ok) {
      setErrorMsg(res.error);
      return;
    }
    setPartialInputs((prev) => ({ ...prev, [suggestion.key]: "" }));
    showToast(`Settled ${formatCents(amountCents)} (${memberName(suggestion.fromId)} → ${memberName(suggestion.toId)})`);
  };

  const budgetPct = Math.min(100, Math.round((derived.totalSpendingCents / derived.monthlyBudgetCents) * 100));

  return (
    <div
      className="flex h-full w-full flex-col bg-[#0A1628] text-[#F3F0E6]"
      data-testid={`splitfin-mobile-prototype-${initialTab}`}
    >
      <div className="flex items-center justify-between border-b border-[#2DD4BF]/15 bg-[#081221] px-5 pb-3 pt-12">
        <div>
          <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-[#2DD4BF]">
            {PRODUCTS.splitfin.status?.demoLabel || "Interactive demo · Sample data"}
          </span>
          <h4 className="font-serif text-xl text-[#F3F0E6]">
            {tab === "money"
              ? "My Money & Net"
              : tab === "budgets"
                ? "Budgets & Limits"
                : tab === "groups"
                  ? "Shared Groups"
                  : tab === "split"
                    ? "Split & Categorise"
                    : "Settle Up"}
          </h4>
        </div>
        <button
          type="button"
          onClick={resetLedger}
          data-testid={`splitfin-reset-${initialTab}`}
          className="inline-flex items-center gap-1 rounded-full border border-[#2DD4BF]/35 bg-[#0D3B3E] px-2.5 py-1 font-mono text-[9px] text-[#2DD4BF]"
        >
          <RotateCcw size={10} /> RESET
        </button>
      </div>

      <div data-lenis-prevent className="no-scrollbar flex-1 overflow-y-auto px-4 py-3.5">
        {toast && (
          <div
            data-testid="splitfin-toast"
            className="mb-3 flex items-center gap-2 rounded-xl border border-[#2DD4BF]/50 bg-[#0D3B3E] px-3 py-2 text-[11px] text-[#2DD4BF]"
          >
            <Check size={13} className="shrink-0" />
            <span>{toast}</span>
          </div>
        )}
        {errorMsg && (
          <div
            data-testid="splitfin-error"
            className="mb-3 rounded-xl border border-amber-400/50 bg-amber-500/15 px-3 py-2 text-[11px] text-amber-200"
          >
            {errorMsg}
          </div>
        )}

        {/* TAB 1: UNIFIED PERSONAL FINANCE + SHARED POSITION */}
        {tab === "money" && (
          <div className="space-y-3.5">
            <div className="rounded-2xl border border-[#2DD4BF]/25 bg-gradient-to-br from-[#0D3B3E] to-[#0A1628] p-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[9px] uppercase tracking-wider text-[#93B5B3]">
                  Unified Financial Position
                </span>
                <span className="font-mono text-[9px] text-[#2DD4BF]" data-testid="splitfin-net-balance">
                  Shared: {formatCents(derived.yourSharedNetCents, { signed: true })}
                </span>
              </div>
              <p className="mt-1 font-serif text-3xl text-[#F3F0E6]" data-testid="splitfin-net-position">
                {formatCents(derived.netPositionCents)}
              </p>
              <p className="mt-0.5 text-[11px] text-[#93B5B3]">
                Liquid {formatCents(derived.totalLiquidCents)} + Shared {formatCents(derived.yourSharedNetCents, { signed: true })}
              </p>

              {/* Accounts strip */}
              <div className="mt-3 grid grid-cols-3 gap-1.5 border-t border-white/10 pt-2.5">
                {derived.accounts.map((acc) => (
                  <div key={acc.id} className="rounded-lg bg-[#0A1628]/75 p-2">
                    <span className="flex items-center gap-1 text-[9px] text-[#93B5B3]">
                      {acc.kind === "Card" ? <CreditCard size={10} /> : <Wallet size={10} />}
                      {acc.kind}
                    </span>
                    <span className="mt-0.5 block font-mono text-[11px] font-semibold text-[#F3F0E6]">
                      {formatCents(acc.balanceCents)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Monthly spending vs budget + income/month comparison + category bars */}
            <div className="rounded-2xl border border-white/10 bg-[#0F2036] p-3.5">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-medium">
                  <PieChart size={13} className="text-[#2DD4BF]" /> Income &amp; Budget Progress
                </span>
                <span className="font-mono text-xs text-[#2DD4BF]" data-testid="splitfin-personal-spend">
                  {formatCents(derived.totalSpendingCents)} / {formatCents(derived.monthlyBudgetCents)}
                </span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-[#2DD4BF]" style={{ width: `${budgetPct}%` }} />
              </div>
              <div className="mt-2.5 grid grid-cols-2 gap-2 border-b border-white/10 pb-2.5 text-[10px]">
                <div className="rounded-lg bg-[#0A1628]/70 px-2.5 py-1.5">
                  <span className="text-[#93B5B3]">Nov Income</span>
                  <span className="block font-mono font-semibold text-[#2DD4BF]">$4,200.00</span>
                </div>
                <div className="rounded-lg bg-[#0A1628]/70 px-2.5 py-1.5">
                  <span className="text-[#93B5B3]">vs Oct Spend</span>
                  <span className="block font-mono font-semibold text-[#F3F0E6]">-6.4% lower</span>
                </div>
              </div>
              <div className="mt-2.5 space-y-1.5">
                {derived.categories.slice(0, 4).map((cat) => (
                  <div key={cat.name} className="flex items-center justify-between text-[11px]">
                    <span className="text-[#93B5B3]">{cat.name}</span>
                    <span className="font-mono text-[#F3F0E6]">{formatCents(cat.cents)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Add Personal Income or Expense Entry with Account & Category */}
            <form onSubmit={handleQuickPersonal} className="space-y-2 rounded-2xl border border-white/10 bg-[#0F2036] p-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[9px] uppercase text-[#93B5B3]">Add Entry</span>
                <div className="flex gap-1">
                  {["expense", "income"].map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setQuickKind(k)}
                      className={`rounded px-2 py-0.5 font-mono text-[8.5px] uppercase ${
                        quickKind === k ? "bg-[#2DD4BF] font-bold text-[#0A1628]" : "bg-[#0A1628] text-[#93B5B3]"
                      }`}
                    >
                      {k}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  placeholder={quickKind === "income" ? "Salary / payout..." : "Merchant or item..."}
                  value={quickTitle}
                  onChange={(e) => setQuickTitle(e.target.value)}
                  className="flex-1 rounded-lg border border-white/15 bg-[#0A1628] px-2.5 py-1.5 text-[11px] placeholder:text-white/30"
                />
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="$"
                  value={quickAmt}
                  onChange={(e) => setQuickAmt(e.target.value)}
                  className="w-16 rounded-lg border border-white/15 bg-[#0A1628] px-2 py-1.5 font-mono text-[11px]"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <select
                  value={quickAccount}
                  onChange={(e) => setQuickAccount(e.target.value)}
                  aria-label="Account"
                  className="flex-1 rounded-lg border border-white/15 bg-[#0A1628] px-2 py-1 font-mono text-[9px] text-[#F3F0E6]"
                >
                  <option value="checking">Checking ••4821</option>
                  <option value="card">Card ••1904</option>
                  <option value="wallet">Cash Wallet</option>
                </select>
                {quickKind === "expense" && (
                  <select
                    value={quickCategory}
                    onChange={(e) => setQuickCategory(e.target.value)}
                    aria-label="Category"
                    className="rounded-lg border border-white/15 bg-[#0A1628] px-2 py-1 font-mono text-[9px] text-[#2DD4BF]"
                  >
                    <option value="Dining">Dining</option>
                    <option value="Groceries">Groceries</option>
                    <option value="Transit">Transit</option>
                    <option value="Housing">Housing</option>
                  </select>
                )}
                <button
                  type="submit"
                  className="rounded-lg bg-[#2DD4BF] px-3 py-1 font-mono text-[9.5px] font-bold text-[#0A1628]"
                  aria-label="Save entry"
                >
                  Save
                </button>
              </div>
            </form>

            {/* Unified Transactions */}
            <div className="space-y-1.5">
              <span className="font-mono text-[9px] uppercase tracking-wider text-[#93B5B3]">
                Recent Personal & Shared Activity
              </span>
              {personalTransactions.slice(0, 3).map((tx) => (
                <div key={tx.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-[#0F2036] px-3 py-2">
                  <div>
                    <p className="text-xs font-medium">{tx.title}</p>
                    <p className="text-[10px] text-[#93B5B3]">{tx.category} · Personal</p>
                  </div>
                  <span className={`font-mono text-xs ${tx.kind === "income" ? "text-[#2DD4BF]" : "text-[#F3F0E6]"}`}>
                    {tx.kind === "income" ? `+${formatCents(tx.amountCents)}` : `-${formatCents(tx.amountCents)}`}
                  </span>
                </div>
              ))}
              {expenses.slice(0, 2).map((ex) => (
                <div key={ex.id} className="flex items-center justify-between rounded-xl border border-[#2DD4BF]/20 bg-[#0D2838] px-3 py-2">
                  <div>
                    <p className="text-xs font-medium">{ex.title}</p>
                    <p className="text-[10px] text-[#93B5B3]">
                      Shared ({ex.participantIds.length} ppl) · Your share {formatCents(ex.sharesCents.you || 0)}
                    </p>
                  </div>
                  <span className="font-mono text-xs text-[#2DD4BF]">{formatCents(ex.totalCents)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: BUDGETS & CATEGORY UTILIZATION */}
        {tab === "budgets" && (
          <div className="space-y-3" data-testid="splitfin-budgets-tab">
            <form onSubmit={handleSaveBudget} className="space-y-2 rounded-2xl border border-[#2DD4BF]/30 bg-[#0F2036] p-3">
              <span className="font-mono text-[9px] uppercase text-[#2DD4BF]">Set Category Budget</span>
              <div className="flex gap-1.5">
                <select
                  value={editBudgetCat}
                  onChange={(e) => {
                    const cat = e.target.value;
                    setEditBudgetCat(cat);
                    setEditBudgetInput(String(Math.round((categoryBudgets[cat] || 20000) / 100)));
                  }}
                  aria-label="Budget category"
                  className="flex-1 rounded-lg border border-white/15 bg-[#0A1628] px-2 py-1.5 text-xs"
                >
                  {Object.keys(categoryBudgets).map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <input
                  type="number"
                  min="10"
                  step="10"
                  value={editBudgetInput}
                  onChange={(e) => setEditBudgetInput(e.target.value)}
                  className="w-20 rounded-lg border border-white/15 bg-[#0A1628] px-2 py-1.5 font-mono text-xs"
                />
                <button type="submit" className="rounded-lg bg-[#2DD4BF] px-3 py-1 font-mono text-[10px] font-bold text-[#0A1628]">
                  Apply
                </button>
              </div>
            </form>

            <div className="space-y-2.5">
              {Object.entries(categoryBudgets).map(([catName, capCents]) => {
                const spent = derived.categories.find((c) => c.name === catName)?.cents || 0;
                const pct = Math.min(100, Math.round((spent / Math.max(1, capCents)) * 100));
                const rem = capCents - spent;
                return (
                  <div key={catName} className="rounded-xl border border-white/10 bg-[#0F2036] p-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium">{catName}</span>
                      <span className="font-mono text-[11px] text-[#2DD4BF]">
                        {formatCents(spent)} / {formatCents(capCents)}
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                      <div
                        className={`h-full rounded-full ${pct >= 90 ? "bg-amber-400" : "bg-[#2DD4BF]"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="mt-1.5 font-mono text-[9px] text-[#93B5B3]">
                      {rem >= 0 ? `${formatCents(rem)} remaining (${pct}% used)` : `${formatCents(Math.abs(rem))} over cap`}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: GROUPS */}
        {tab === "groups" && (
          <div className="space-y-3.5">
            {derived.groups.map((g) => {
              const isOpen = g.id === activeGroup.id;
              return (
                <div
                  key={g.id}
                  data-testid={`splitfin-group-${g.id}`}
                  className={`rounded-2xl border p-3.5 ${
                    isOpen ? "border-[#2DD4BF] bg-[#0D3B3E]/60" : "border-white/10 bg-[#0F2036]"
                  }`}
                >
                  <button type="button" onClick={() => setActiveGroupId(g.id)} className="w-full text-left">
                    <div className="flex items-center justify-between">
                      <span className="font-serif text-lg">{g.name}</span>
                      <span className="font-mono text-xs text-[#2DD4BF]">{formatCents(g.totalSpentCents)}</span>
                    </div>
                    <p className="text-[10px] text-[#93B5B3]">
                      {g.note} · Open: {formatCents(g.remainingOwedCents)}
                    </p>
                  </button>
                  <div className="mt-2.5 grid grid-cols-4 gap-1 border-y border-white/10 py-2">
                    {members.map((m) => (
                      <div key={m.id} className="text-center">
                        <span className="block text-[9px] text-[#93B5B3]">{m.name}</span>
                        <span className="font-mono text-[10px]">
                          {formatCents(g.balancesCents[m.id] || 0, { signed: true })}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 space-y-1">
                    {g.expenses.map((ex) => (
                      <div key={ex.id} className="flex justify-between text-[11px]">
                        <span>{ex.title} ({memberName(ex.payerId)})</span>
                        <span className="font-mono">{formatCents(ex.totalCents)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 3: SPLIT BILL */}
        {tab === "split" && (
          <div className="space-y-3">
            <div className="no-scrollbar flex gap-1.5 overflow-x-auto pb-0.5">
              <button
                type="button"
                onClick={() => {
                  setBillTitle("Metro Grocers");
                  setBillAmount("48.60");
                  setBillCategory("Groceries");
                  setScanHint("Receipt extracted (Illustrative): Metro Grocers · $48.60 · Groceries");
                }}
                data-testid="splitfin-scan-receipt-btn"
                className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[#2DD4BF] bg-[#2DD4BF]/15 px-2.5 py-1 font-mono text-[9px] text-[#2DD4BF]"
              >
                <ScanLine size={10} /> Scan Bill
              </button>
              {PRESETS.map((p) => (
                <button
                  key={p.title}
                  type="button"
                  onClick={() => {
                    setBillTitle(p.title);
                    setBillAmount(String(p.amount));
                    setBillCategory(p.category);
                    setScanHint("");
                  }}
                  className="shrink-0 rounded-full border border-[#2DD4BF]/30 bg-[#0D3B3E]/60 px-2.5 py-1 font-mono text-[9px] text-[#2DD4BF]"
                >
                  {p.label}
                </button>
              ))}
            </div>

            {scanHint && (
              <p className="rounded-lg border border-[#2DD4BF]/30 bg-[#0D3B3E]/45 px-2.5 py-1.5 font-mono text-[9px] text-[#2DD4BF]">
                {scanHint}
              </p>
            )}

            <div className="rounded-2xl border border-white/10 bg-[#0F2036] p-3">
              <div className="flex items-center justify-between gap-2">
                <input
                  type="text"
                  value={billTitle}
                  onChange={(e) => setBillTitle(e.target.value)}
                  aria-label="Bill title"
                  data-testid="splitfin-bill-title-input"
                  className="w-1/2 bg-transparent text-sm font-medium focus:outline-none"
                />
                <div className="flex items-center gap-1 rounded-lg border border-[#2DD4BF]/30 bg-[#0A1628] px-2 py-1">
                  <span className="font-mono text-xs text-[#2DD4BF]">$</span>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={billAmount}
                    onChange={(e) => setBillAmount(e.target.value)}
                    aria-label="Bill amount"
                    data-testid="splitfin-bill-amount-input"
                    className="w-16 bg-transparent text-right font-mono text-sm font-bold focus:outline-none"
                  />
                </div>
              </div>

              <input
                type="range"
                min="10"
                max="400"
                step="1"
                value={Math.min(400, Math.max(10, Number(billAmount) || 10))}
                onChange={(e) => setBillAmount(e.target.value)}
                aria-label="Adjust bill amount"
                className="mt-2 h-1.5 w-full accent-[#2DD4BF]"
              />

              <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-2">
                <select
                  value={payerId}
                  onChange={(e) => setPayerId(e.target.value)}
                  aria-label="Paid by"
                  data-testid="splitfin-payer-select"
                  className="rounded border border-white/15 bg-[#0A1628] px-2 py-0.5 font-mono text-[9px] text-[#F3F0E6]"
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>Paid: {m.name}</option>
                  ))}
                </select>

                <select
                  value={billAccount}
                  onChange={(e) => setBillAccount(e.target.value)}
                  aria-label="Payment account"
                  className="rounded border border-white/15 bg-[#0A1628] px-2 py-0.5 font-mono text-[9px] text-[#2DD4BF]"
                >
                  <option value="card">Card ••1904</option>
                  <option value="checking">Checking ••4821</option>
                  <option value="wallet">Cash Wallet</option>
                </select>

                <div className="flex gap-1">
                  {[0, 10, 15].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTipPct(t)}
                      data-testid={`splitfin-tip-${t}`}
                      className={`rounded px-1.5 py-0.5 font-mono text-[9px] ${
                        tipPct === t ? "bg-[#2DD4BF] font-bold text-[#0A1628]" : "border border-white/15 text-[#93B5B3]"
                      }`}
                    >
                      {t}%
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-1.5 rounded-xl border border-white/10 bg-[#081221] p-1">
              {[
                { id: "equal", label: "Equal Split" },
                { id: "weighted", label: "Weighted Sliders" },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSplitMode(m.id)}
                  data-testid={`splitfin-mode-${m.id}`}
                  className={`rounded-lg py-1 text-[11px] font-medium ${
                    splitMode === m.id ? "bg-[#0D3B3E] text-[#2DD4BF]" : "text-[#93B5B3]"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <div className="space-y-1.5">
              {members.map((m) => {
                const active = included.includes(m.id);
                const shareCents = previewCalc.sharesCents[m.id] || 0;
                return (
                  <div
                    key={m.id}
                    className={`rounded-xl border p-2 ${
                      active ? "border-[#2DD4BF]/35 bg-[#0F2036]" : "border-white/5 bg-[#0A1628] opacity-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => toggleMember(m.id)}
                        data-testid={`splitfin-member-${m.id}`}
                        className="flex items-center gap-2 text-left"
                      >
                        <span
                          className={`grid h-5 w-5 place-items-center rounded-full font-mono text-[9px] font-bold ${
                            active ? "bg-[#2DD4BF] text-[#0A1628]" : "bg-white/10 text-white/60"
                          }`}
                        >
                          {m.initials}
                        </span>
                        <span className="text-xs font-medium">
                          {m.name} {!active && "(Excluded)"}
                        </span>
                      </button>
                      <span className="font-mono text-xs font-semibold text-[#2DD4BF]" data-testid={`splitfin-share-${m.id}`}>
                        {formatCents(shareCents)}
                      </span>
                    </div>
                    {splitMode === "weighted" && active && (
                      <input
                        type="range"
                        min="5"
                        max="80"
                        value={weights[m.id]}
                        onChange={(e) => setWeights((prev) => ({ ...prev, [m.id]: Number(e.target.value) }))}
                        className="mt-1.5 h-1 w-full accent-[#2DD4BF]"
                      />
                    )}
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={recordSplit}
              data-testid="splitfin-record-btn"
              className="w-full rounded-xl bg-[#2DD4BF] py-2.5 text-xs font-bold uppercase tracking-wider text-[#0A1628]"
            >
              Log Split · {formatCents(previewCalc.totalCents)}
            </button>
          </div>
        )}

        {/* TAB 4: SETTLE UP */}
        {tab === "settle" && (
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase text-[#93B5B3]">Suggested Transfers</span>
              <span className="font-mono text-[10px] text-[#2DD4BF]" data-testid="splitfin-total-outstanding">
                {formatCents(derived.totalOutstandingCents)} open
              </span>
            </div>

            {derived.overallSuggestions.length === 0 ? (
              <div className="rounded-2xl border border-[#2DD4BF]/30 bg-[#0D3B3E]/40 p-4 text-center">
                <p className="font-serif text-lg text-[#2DD4BF]">All balances settled.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {derived.overallSuggestions.map((s) => {
                  const partialDollars = partialInputs[s.key] ?? "";
                  const partialCents = toCents(partialDollars);
                  return (
                    <div
                      key={s.key}
                      data-testid={`splitfin-suggestion-${s.fromId}-${s.toId}`}
                      className="rounded-2xl border border-white/10 bg-[#0F2036] p-3"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-semibold">
                            {memberName(s.fromId)} → {memberName(s.toId)}
                          </p>
                          <p className="font-mono text-[10px] text-[#93B5B3]">Owes {formatCents(s.amountCents)}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleSettle(s)}
                          data-testid={`splitfin-settle-full-${s.fromId}-${s.toId}`}
                          className="rounded-full bg-[#2DD4BF] px-3 py-1 font-mono text-[10px] font-bold text-[#0A1628]"
                        >
                          Settle {formatCents(s.amountCents)}
                        </button>
                      </div>
                      <div className="mt-2 flex items-center gap-2 border-t border-white/10 pt-2">
                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          placeholder="Partial $"
                          value={partialDollars}
                          onChange={(e) => setPartialInputs((prev) => ({ ...prev, [s.key]: e.target.value }))}
                          data-testid={`splitfin-partial-input-${s.fromId}-${s.toId}`}
                          className="w-24 rounded border border-white/15 bg-[#0A1628] px-2 py-1 font-mono text-[10px] focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleSettle(s, partialCents)}
                          data-testid={`splitfin-partial-btn-${s.fromId}-${s.toId}`}
                          className="rounded border border-[#2DD4BF]/40 px-2.5 py-1 font-mono text-[10px] text-[#2DD4BF]"
                        >
                          Pay Partial
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div>
              <span className="font-mono text-[10px] uppercase text-[#93B5B3]">
                Settlement History ({settlements.length})
              </span>
              <div className="mt-1.5 space-y-1.5" data-testid="splitfin-settlement-history">
                {settlements.map((stl) => (
                  <div key={stl.id} className="flex justify-between rounded-xl border border-[#2DD4BF]/20 bg-[#0D3B3E]/35 px-3 py-2 text-[11px]">
                    <span>{memberName(stl.fromId)} paid {memberName(stl.toId)}</span>
                    <span className="font-mono text-[#2DD4BF]">{formatCents(stl.amountCents)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom 5-tab bar */}
      <div className="grid grid-cols-5 border-t border-[#2DD4BF]/15 bg-[#081221] pb-4 pt-2.5">
        {[
          { id: "money", label: "Money", Icon: Wallet },
          { id: "budgets", label: "Budgets", Icon: PieChart },
          { id: "groups", label: "Groups", Icon: Users },
          { id: "split", label: "Split", Icon: Receipt },
          { id: "settle", label: "Settle", Icon: ArrowRightLeft },
        ].map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            data-testid={`splitfin-tab-${id}-${initialTab}`}
            className={`flex flex-col items-center gap-1 text-[9.5px] font-medium ${
              tab === id ? "text-[#2DD4BF]" : "text-[#93B5B3]"
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
