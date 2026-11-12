/**
 * Splitfin Single-Source-of-Truth Financial Ledger
 *
 * All monetary amounts are stored and calculated in integer minor units (cents)
 * to eliminate IEEE-754 floating-point drift.
 *
 * Balance convention:
 *   > 0 : participant is owed money (creditor)
 *   < 0 : participant owes money (debtor)
 *   = 0 : participant is settled
 */

export const toCents = (dollars) => {
  const n = Number(dollars);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.round(n * 100);
};

export const formatCents = (cents, { signed = false } = {}) => {
  const value = Math.round(Number(cents) || 0);
  const abs = (Math.abs(value) / 100).toFixed(2);
  if (!signed) return `$${abs}`;
  if (value > 0) return `+$${abs}`;
  if (value < 0) return `-$${abs}`;
  return `$0.00`;
};

/**
 * Computes exact per-participant shares in integer cents such that
 * sum(sharesCents) === totalCents for every equal or weighted split.
 */
export const computeExpenseSharesCents = ({
  subtotalCents,
  tipPercent = 0,
  tipCents = null,
  participantIds = [],
  splitMode = "equal",
  weights = {},
}) => {
  const cleanSubtotal = Math.max(0, Math.round(Number(subtotalCents) || 0));
  const resolvedTipCents =
    tipCents !== null && tipCents !== undefined
      ? Math.max(0, Math.round(Number(tipCents) || 0))
      : Math.round((cleanSubtotal * Math.max(0, Number(tipPercent) || 0)) / 100);
  const totalCents = cleanSubtotal + resolvedTipCents;

  const uniqueParticipants = Array.from(new Set(participantIds));
  if (uniqueParticipants.length === 0 || totalCents <= 0) {
    return { subtotalCents: cleanSubtotal, tipCents: resolvedTipCents, totalCents, sharesCents: {} };
  }

  const sharesCents = {};
  if (splitMode === "equal") {
    const n = uniqueParticipants.length;
    const base = Math.floor(totalCents / n);
    let remainder = totalCents - base * n;
    uniqueParticipants.forEach((id) => {
      const extra = remainder > 0 ? 1 : 0;
      if (remainder > 0) remainder -= 1;
      sharesCents[id] = base + extra;
    });
    return { subtotalCents: cleanSubtotal, tipCents: resolvedTipCents, totalCents, sharesCents };
  }

  // Weighted split using Hamilton (largest remainder) apportionment
  const positiveWeights = uniqueParticipants.map((id) => ({
    id,
    w: Math.max(1, Number(weights[id]) || 1),
  }));
  const totalWeight = positiveWeights.reduce((acc, item) => acc + item.w, 0);

  const preliminary = positiveWeights.map((item, idx) => {
    const exact = (totalCents * item.w) / totalWeight;
    const floored = Math.floor(exact);
    return {
      id: item.id,
      idx,
      floored,
      frac: exact - floored,
    };
  });

  let remainder = totalCents - preliminary.reduce((acc, p) => acc + p.floored, 0);
  const byRemainder = [...preliminary].sort((a, b) => {
    if (b.frac !== a.frac) return b.frac - a.frac;
    return a.idx - b.idx;
  });

  for (let i = 0; i < byRemainder.length && remainder > 0; i += 1) {
    byRemainder[i].floored += 1;
    remainder -= 1;
  }

  preliminary.forEach((p) => {
    sharesCents[p.id] = p.floored;
  });

  return { subtotalCents: cleanSubtotal, tipCents: resolvedTipCents, totalCents, sharesCents };
};

/**
 * Builds an expense record with precomputed exact shares in cents.
 */
export const createExpense = ({
  id,
  groupId,
  title,
  payerId,
  subtotalCents,
  tipPercent = 0,
  tipCents = null,
  participantIds,
  splitMode = "equal",
  weights = {},
}) => {
  const calc = computeExpenseSharesCents({
    subtotalCents,
    tipPercent,
    tipCents,
    participantIds,
    splitMode,
    weights,
  });

  if (calc.totalCents <= 0) {
    throw new Error("Expense total must be greater than $0.00.");
  }
  if (!payerId) {
    throw new Error("Expense requires a payer.");
  }
  if (Object.keys(calc.sharesCents).length === 0) {
    throw new Error("Expense requires at least one participant.");
  }

  return {
    id: id || `exp-${Date.now()}`,
    groupId,
    title: (title || "Shared Expense").trim(),
    payerId,
    subtotalCents: calc.subtotalCents,
    tipCents: calc.tipCents,
    totalCents: calc.totalCents,
    participantIds: Object.keys(calc.sharesCents),
    splitMode,
    sharesCents: calc.sharesCents,
  };
};

/**
 * Computes net balances (in cents) across expenses and completed settlements.
 * Positive = owed money; Negative = owes money; 0 = settled.
 */
export const computeNetBalancesCents = (memberIds, expenses = [], settlements = []) => {
  const net = {};
  memberIds.forEach((id) => {
    net[id] = 0;
  });

  expenses.forEach((exp) => {
    if (net[exp.payerId] === undefined) net[exp.payerId] = 0;
    net[exp.payerId] += exp.totalCents;
    Object.entries(exp.sharesCents || {}).forEach(([pid, shareCents]) => {
      if (net[pid] === undefined) net[pid] = 0;
      net[pid] -= shareCents;
    });
  });

  settlements.forEach((stl) => {
    if (net[stl.fromId] === undefined) net[stl.fromId] = 0;
    if (net[stl.toId] === undefined) net[stl.toId] = 0;
    net[stl.fromId] += stl.amountCents;
    net[stl.toId] -= stl.amountCents;
  });

  return net;
};

/**
 * Computes simplified minimal-transfer settlement suggestions directly from live net balances.
 */
export const computeSettlementSuggestions = (netBalancesCents) => {
  const creditors = [];
  const debtors = [];

  Object.entries(netBalancesCents).forEach(([id, bal]) => {
    if (bal > 0) creditors.push({ id, amount: bal });
    else if (bal < 0) debtors.push({ id, amount: -bal });
  });

  creditors.sort((a, b) => b.amount - a.amount || a.id.localeCompare(b.id));
  debtors.sort((a, b) => b.amount - a.amount || a.id.localeCompare(b.id));

  const suggestions = [];
  let ci = 0;
  let di = 0;

  while (ci < creditors.length && di < debtors.length) {
    const c = creditors[ci];
    const d = debtors[di];
    const transfer = Math.min(c.amount, d.amount);
    if (transfer > 0) {
      suggestions.push({
        key: `${d.id}->${c.id}`,
        fromId: d.id,
        toId: c.id,
        amountCents: transfer,
      });
    }
    c.amount -= transfer;
    d.amount -= transfer;
    if (c.amount === 0) ci += 1;
    if (d.amount === 0) di += 1;
  }

  return suggestions;
};

/**
 * Validates and constructs a new settlement record against live balances,
 * preventing self-settlement, invalid amounts, overpayments, and duplicate submissions.
 */
export const validateAndCreateSettlement = ({
  groupId,
  fromId,
  toId,
  amountCents,
  netBalancesCents,
  existingSettlements = [],
  idempotencyKey = null,
}) => {
  const cleanAmount = Math.round(Number(amountCents) || 0);
  if (!fromId || !toId) {
    return { ok: false, error: "Both debtor and creditor are required." };
  }
  if (fromId === toId) {
    return { ok: false, error: "A participant cannot settle with themselves." };
  }
  if (cleanAmount <= 0) {
    return { ok: false, error: "Settlement amount must be greater than $0.00." };
  }
  if (idempotencyKey && existingSettlements.some((s) => s.idempotencyKey === idempotencyKey)) {
    return { ok: false, error: "This settlement has already been recorded." };
  }

  const debtorBalance = netBalancesCents[fromId] || 0;
  const creditorBalance = netBalancesCents[toId] || 0;

  if (debtorBalance >= 0) {
    return { ok: false, error: "Selected payer does not currently owe anything." };
  }
  if (creditorBalance <= 0) {
    return { ok: false, error: "Selected recipient is not currently owed anything." };
  }

  const maxSettleable = Math.min(-debtorBalance, creditorBalance);
  if (cleanAmount > maxSettleable) {
    return {
      ok: false,
      error: `Amount exceeds remaining settleable balance (${formatCents(maxSettleable)}).`,
    };
  }

  return {
    ok: true,
    settlement: {
      id: `stl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      groupId: groupId || "overall",
      fromId,
      toId,
      amountCents: cleanAmount,
      idempotencyKey: idempotencyKey || `${groupId || "overall"}:${fromId}->${toId}:${cleanAmount}:${existingSettlements.length}`,
      recordedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  };
};

/**
 * Single source of truth deriving per-group and overall Splitfin views.
 */
export const deriveSplitfinState = (members, groups, expenses, settlements) => {
  const memberIds = members.map((m) => m.id);

  const groupViews = groups.map((g) => {
    const groupExpenses = expenses.filter((e) => e.groupId === g.id);
    const groupSettlements = settlements.filter((s) => s.groupId === g.id);
    const balancesCents = computeNetBalancesCents(memberIds, groupExpenses, groupSettlements);
    const suggestions = computeSettlementSuggestions(balancesCents);
    const totalSpentCents = groupExpenses.reduce((acc, e) => acc + e.totalCents, 0);
    const remainingOwedCents = suggestions.reduce((acc, s) => acc + s.amountCents, 0);

    return {
      ...g,
      expenses: groupExpenses,
      settlements: groupSettlements,
      balancesCents,
      suggestions,
      totalSpentCents,
      remainingOwedCents,
    };
  });

  const overallBalancesCents = computeNetBalancesCents(memberIds, expenses, settlements);
  const overallSuggestions = computeSettlementSuggestions(overallBalancesCents);
  const totalOutstandingCents = overallSuggestions.reduce((acc, s) => acc + s.amountCents, 0);

  return {
    groups: groupViews,
    overallBalancesCents,
    overallSuggestions,
    totalOutstandingCents,
  };
};

/**
 * Unifies Personal Finance (accounts, income, personal expenses, category budgets)
 * with Shared Expenses & Settlements into one single-source-of-truth financial model.
 */
export const deriveUnifiedFinanceState = ({
  members,
  groups,
  expenses,
  settlements,
  accounts = [],
  personalTransactions = [],
  monthlyBudgetCents = 240000,
}) => {
  const shared = deriveSplitfinState(members, groups, expenses, settlements);

  // Compute live account balances in cents
  const accountBalances = {};
  accounts.forEach((acc) => {
    accountBalances[acc.id] = acc.openingBalanceCents || 0;
  });

  let totalIncomeCents = 0;
  let personalOnlyExpenseCents = 0;
  const categorySpendCents = {};

  personalTransactions.forEach((tx) => {
    if (tx.kind === "income") {
      totalIncomeCents += tx.amountCents;
      if (accountBalances[tx.accountId] !== undefined) {
        accountBalances[tx.accountId] += tx.amountCents;
      }
    } else {
      personalOnlyExpenseCents += tx.amountCents;
      categorySpendCents[tx.category] = (categorySpendCents[tx.category] || 0) + tx.amountCents;
      if (accountBalances[tx.accountId] !== undefined) {
        accountBalances[tx.accountId] -= tx.amountCents;
      }
    }
  });

  // Apply shared expenses: account cash outflow is full paid amount; personal spend is strictly your share!
  let sharedYourShareCents = 0;
  expenses.forEach((exp) => {
    if (exp.payerId === "you" && exp.accountId && accountBalances[exp.accountId] !== undefined) {
      accountBalances[exp.accountId] -= exp.totalCents;
    }
    const yourShare = exp.sharesCents?.you || 0;
    if (yourShare > 0) {
      sharedYourShareCents += yourShare;
      const cat = exp.category || "Shared";
      categorySpendCents[cat] = (categorySpendCents[cat] || 0) + yourShare;
    }
  });

  // Apply recorded settlements to default/primary account ("checking")
  settlements.forEach((stl) => {
    const targetAcc = stl.accountId || accounts[0]?.id;
    if (!targetAcc || accountBalances[targetAcc] === undefined) return;
    if (stl.toId === "you") accountBalances[targetAcc] += stl.amountCents;
    if (stl.fromId === "you") accountBalances[targetAcc] -= stl.amountCents;
  });

  const enrichedAccounts = accounts.map((acc) => ({
    ...acc,
    balanceCents: accountBalances[acc.id] ?? acc.openingBalanceCents,
  }));

  const totalLiquidCents = enrichedAccounts.reduce((acc, a) => acc + a.balanceCents, 0);
  const yourSharedNetCents = shared.overallBalancesCents.you || 0;
  const totalSpendingCents = personalOnlyExpenseCents + sharedYourShareCents;
  const netPositionCents = totalLiquidCents + yourSharedNetCents;

  const categories = Object.entries(categorySpendCents)
    .map(([name, cents]) => ({ name, cents }))
    .sort((a, b) => b.cents - a.cents);

  return {
    ...shared,
    accounts: enrichedAccounts,
    totalLiquidCents,
    totalIncomeCents,
    personalOnlyExpenseCents,
    sharedYourShareCents,
    totalSpendingCents,
    monthlyBudgetCents,
    budgetRemainingCents: monthlyBudgetCents - totalSpendingCents,
    yourSharedNetCents,
    netPositionCents,
    categories,
  };
};

