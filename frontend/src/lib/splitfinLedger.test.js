import assert from "node:assert/strict";
import {
  computeExpenseSharesCents,
  computeNetBalancesCents,
  computeSettlementSuggestions,
  createExpense,
  deriveSplitfinState,
  deriveUnifiedFinanceState,
  formatCents,
  toCents,
  validateAndCreateSettlement,
} from "./splitfinLedger.js";

const MEMBERS = [
  { id: "you", name: "You" },
  { id: "maya", name: "Maya" },
  { id: "arjun", name: "Arjun" },
  { id: "sora", name: "Sora" },
];
const IDS = MEMBERS.map((m) => m.id);

const sumValues = (obj) => Object.values(obj).reduce((a, b) => a + b, 0);

const results = [];
const runCase = (name, fn) => {
  fn();
  results.push(`PASS: ${name}`);
};

// 1. One person pays entire bill and all split equally
runCase("1. Equal split paid by one member", () => {
  const exp = createExpense({
    id: "t1",
    groupId: "g1",
    title: "Dinner",
    payerId: "you",
    subtotalCents: 12000,
    participantIds: IDS,
    splitMode: "equal",
  });
  const bal = computeNetBalancesCents(IDS, [exp], []);
  assert.equal(bal.you, 9000);
  assert.equal(bal.maya, -3000);
  assert.equal(bal.arjun, -3000);
  assert.equal(bal.sora, -3000);
  assert.equal(sumValues(bal), 0);
});

// 2. One person pays for multiple expenses
runCase("2. One person pays multiple expenses", () => {
  const e1 = createExpense({ id: "a", groupId: "g1", title: "Mains", payerId: "you", subtotalCents: 8000, participantIds: IDS });
  const e2 = createExpense({ id: "b", groupId: "g1", title: "Drinks", payerId: "you", subtotalCents: 4000, participantIds: IDS });
  const bal = computeNetBalancesCents(IDS, [e1, e2], []);
  assert.equal(bal.you, 9000);
  assert.equal(bal.maya, -3000);
  assert.equal(sumValues(bal), 0);
});

// 3. Expenses have different contributors
runCase("3. Multiple contributors across expenses", () => {
  const e1 = createExpense({ id: "a", groupId: "g1", title: "Dinner", payerId: "you", subtotalCents: 10000, participantIds: IDS });
  const e2 = createExpense({ id: "b", groupId: "g1", title: "Dessert", payerId: "maya", subtotalCents: 4000, participantIds: IDS });
  const bal = computeNetBalancesCents(IDS, [e1, e2], []);
  // Each owes 3500 total. You paid 10000 (+6500), Maya paid 4000 (+500), Arjun -3500, Sora -3500
  assert.equal(bal.you, 6500);
  assert.equal(bal.maya, 500);
  assert.equal(bal.arjun, -3500);
  assert.equal(bal.sora, -3500);
  assert.equal(sumValues(bal), 0);
});

// 4. Participant excluded from an expense
runCase("4. Participant excluded from an expense", () => {
  const e1 = createExpense({
    id: "a",
    groupId: "g1",
    title: "Rail Passes",
    payerId: "arjun",
    subtotalCents: 9000,
    participantIds: ["you", "arjun", "sora"], // Maya excluded
  });
  const bal = computeNetBalancesCents(IDS, [e1], []);
  assert.equal(bal.maya, 0);
  assert.equal(bal.arjun, 6000);
  assert.equal(bal.you, -3000);
  assert.equal(bal.sora, -3000);
});

// 5. Unequal / weighted expense shares
runCase("5. Unequal / weighted splitting", () => {
  const e1 = createExpense({
    id: "a",
    groupId: "g1",
    title: "Tasting Menu",
    payerId: "you",
    subtotalCents: 10000,
    participantIds: ["you", "maya"],
    splitMode: "weighted",
    weights: { you: 3, maya: 1 },
  });
  assert.equal(e1.sharesCents.you, 7500);
  assert.equal(e1.sharesCents.maya, 2500);
  const bal = computeNetBalancesCents(["you", "maya"], [e1], []);
  assert.equal(bal.you, 2500);
  assert.equal(bal.maya, -2500);
});

// 6. Tip included in bill
runCase("6. Tip inclusion in expense total", () => {
  const e1 = createExpense({
    id: "a",
    groupId: "g1",
    title: "Bistro",
    payerId: "you",
    subtotalCents: 12400,
    tipPercent: 10,
    participantIds: IDS,
    splitMode: "equal",
  });
  assert.equal(e1.tipCents, 1240);
  assert.equal(e1.totalCents, 13640);
  assert.equal(e1.sharesCents.you, 3410);
});

// 7. Multiple expenses within same group + settlement suggestions
runCase("7. Multiple expenses in same group derive consistent suggestions", () => {
  const g1Expenses = [
    createExpense({ id: "e1", groupId: "g1", title: "Osteria", payerId: "you", subtotalCents: 9600, participantIds: IDS }),
    createExpense({ id: "e2", groupId: "g1", title: "Gelato", payerId: "maya", subtotalCents: 2400, participantIds: IDS }),
  ];
  const state = deriveSplitfinState(MEMBERS, [{ id: "g1", name: "Friday Table" }], g1Expenses, []);
  const g = state.groups[0];
  // Total = 12000 -> 3000 each. You: +6600, Maya: -600, Arjun: -3000, Sora: -3000
  assert.equal(g.balancesCents.you, 6600);
  assert.equal(g.balancesCents.maya, -600);
  assert.equal(g.remainingOwedCents, 6600);
  assert.deepEqual(
    g.suggestions.map((s) => `${s.fromId}->${s.toId}:${s.amountCents}`),
    ["arjun->you:3000", "sora->you:3000", "maya->you:600"],
  );
});

// 8. Partial settlement updates remaining balance
runCase("8. Partial settlement updates remaining owed amount", () => {
  const exp = createExpense({ id: "e1", groupId: "g1", title: "Cab", payerId: "you", subtotalCents: 5000, participantIds: ["you", "maya"] });
  const balBefore = computeNetBalancesCents(["you", "maya"], [exp], []);
  const res = validateAndCreateSettlement({
    groupId: "g1",
    fromId: "maya",
    toId: "you",
    amountCents: 1000, // partial out of 2500
    netBalancesCents: balBefore,
    existingSettlements: [],
  });
  assert.equal(res.ok, true);
  const balAfter = computeNetBalancesCents(["you", "maya"], [exp], [res.settlement]);
  assert.equal(balAfter.you, 1500);
  assert.equal(balAfter.maya, -1500);
});

// 9. Completed settlement brings balances to zero
runCase("9. Completed settlement zeroes balances and suggestions", () => {
  const exp = createExpense({ id: "e1", groupId: "g1", title: "Cab", payerId: "you", subtotalCents: 5000, participantIds: ["you", "maya"] });
  const balBefore = computeNetBalancesCents(["you", "maya"], [exp], []);
  const res = validateAndCreateSettlement({
    groupId: "g1",
    fromId: "maya",
    toId: "you",
    amountCents: 2500,
    netBalancesCents: balBefore,
    existingSettlements: [],
  });
  assert.equal(res.ok, true);
  const balAfter = computeNetBalancesCents(["you", "maya"], [exp], [res.settlement]);
  assert.equal(balAfter.you, 0);
  assert.equal(balAfter.maya, 0);
  assert.equal(computeSettlementSuggestions(balAfter).length, 0);
});

// 10. Multiple settlements involving different members
runCase("10. Multiple settlements across members", () => {
  const exp = createExpense({ id: "e1", groupId: "g1", title: "Hotel", payerId: "you", subtotalCents: 12000, participantIds: IDS });
  const s1 = validateAndCreateSettlement({
    groupId: "g1",
    fromId: "maya",
    toId: "you",
    amountCents: 3000,
    netBalancesCents: computeNetBalancesCents(IDS, [exp], []),
    existingSettlements: [],
    idempotencyKey: "k1",
  }).settlement;
  const s2 = validateAndCreateSettlement({
    groupId: "g1",
    fromId: "arjun",
    toId: "you",
    amountCents: 3000,
    netBalancesCents: computeNetBalancesCents(IDS, [exp], [s1]),
    existingSettlements: [s1],
    idempotencyKey: "k2",
  }).settlement;
  const bal = computeNetBalancesCents(IDS, [exp], [s1, s2]);
  assert.equal(bal.you, 3000);
  assert.equal(bal.sora, -3000);
  assert.equal(bal.maya, 0);
  assert.equal(bal.arjun, 0);
});

// 11. Duplicate & invalid settlement prevention
runCase("11. Duplicate and over-settlement rejected", () => {
  const exp = createExpense({ id: "e1", groupId: "g1", title: "Coffee", payerId: "you", subtotalCents: 2000, participantIds: ["you", "maya"] });
  const bal0 = computeNetBalancesCents(["you", "maya"], [exp], []);
  const first = validateAndCreateSettlement({
    groupId: "g1",
    fromId: "maya",
    toId: "you",
    amountCents: 1000,
    netBalancesCents: bal0,
    existingSettlements: [],
    idempotencyKey: "dup-key",
  });
  assert.equal(first.ok, true);

  // Duplicate idempotencyKey
  const dup = validateAndCreateSettlement({
    groupId: "g1",
    fromId: "maya",
    toId: "you",
    amountCents: 1000,
    netBalancesCents: bal0,
    existingSettlements: [first.settlement],
    idempotencyKey: "dup-key",
  });
  assert.equal(dup.ok, false);

  // Settling already settled balance
  const bal1 = computeNetBalancesCents(["you", "maya"], [exp], [first.settlement]);
  const over = validateAndCreateSettlement({
    groupId: "g1",
    fromId: "maya",
    toId: "you",
    amountCents: 100,
    netBalancesCents: bal1,
    existingSettlements: [first.settlement],
  });
  assert.equal(over.ok, false);

  // Self-settlement rejected
  const self = validateAndCreateSettlement({
    groupId: "g1",
    fromId: "you",
    toId: "you",
    amountCents: 100,
    netBalancesCents: bal0,
  });
  assert.equal(self.ok, false);
});

// 12. Rounding edge cases (e.g. $10.00 / 3, $100.01 / 4, weighted odd cents)
runCase("12. Rounding edge cases preserve exact cent conservation", () => {
  const eq3 = computeExpenseSharesCents({ subtotalCents: 1000, participantIds: ["you", "maya", "arjun"], splitMode: "equal" });
  assert.equal(sumValues(eq3.sharesCents), 1000);
  assert.deepEqual(Object.values(eq3.sharesCents), [334, 333, 333]);

  const eq4 = computeExpenseSharesCents({ subtotalCents: 10001, participantIds: IDS, splitMode: "equal" });
  assert.equal(sumValues(eq4.sharesCents), 10001);
  assert.deepEqual(Object.values(eq4.sharesCents), [2501, 2500, 2500, 2500]);

  const weighted = computeExpenseSharesCents({
    subtotalCents: toCents(33.33),
    tipPercent: 15,
    participantIds: ["you", "maya", "arjun"],
    splitMode: "weighted",
    weights: { you: 17, maya: 29, arjun: 41 },
  });
  assert.equal(weighted.totalCents, 3333 + 500);
  assert.equal(sumValues(weighted.sharesCents), weighted.totalCents);
  assert.equal(formatCents(-150, { signed: true }), "-$1.50");
  assert.equal(formatCents(0, { signed: true }), "$0.00");
});

// 13. Connected Personal Finance + Shared Expenses unification
runCase("13. Shared expense paid on card updates both liquid account, personal spend & group receivable", () => {
  const accounts = [{ id: "card", name: "Everyday Card", openingBalanceCents: 100000 }];
  const personalTransactions = [
    { id: "p1", title: "Salary", category: "Income", kind: "income", amountCents: 50000, accountId: "card" },
    { id: "p2", title: "Groceries", category: "Groceries", kind: "expense", amountCents: 10000, accountId: "card" },
  ];
  const sharedExp = {
    ...createExpense({
      id: "s1",
      groupId: "g1",
      title: "Group Dinner",
      payerId: "you",
      subtotalCents: 12000,
      participantIds: IDS,
    }),
    accountId: "card",
    category: "Dining",
  };
  const unified = deriveUnifiedFinanceState({
    members: MEMBERS,
    groups: [{ id: "g1", name: "Friday Table" }],
    expenses: [sharedExp],
    settlements: [],
    accounts,
    personalTransactions,
  });
  // Liquid card balance: 100000 + 50000 - 10000 - 12000 = 128000 ($1,280.00)
  assert.equal(unified.totalLiquidCents, 128000);
  // Personal spending includes Groceries ($100) + your 1/4 share of dinner ($30) = $130 (13000 cents)
  assert.equal(unified.totalSpendingCents, 13000);
  // Shared receivable: +$90 (9000 cents)
  assert.equal(unified.yourSharedNetCents, 9000);
  // Net financial position: 128000 + 9000 = 137000 ($1,370.00)
  assert.equal(unified.netPositionCents, 137000);
});

// 14. Recording a settlement increases liquid account and reduces receivable without changing net worth
runCase("14. Settlement converts shared receivable into liquid cash without double-counting net worth", () => {
  const accounts = [{ id: "checking", name: "Checking", openingBalanceCents: 100000 }];
  const sharedExp = {
    ...createExpense({
      id: "s1",
      groupId: "g1",
      title: "Cab",
      payerId: "you",
      subtotalCents: 4000,
      participantIds: ["you", "maya"],
    }),
    accountId: "checking",
    category: "Transit",
  };
  const stl = { id: "st1", groupId: "g1", fromId: "maya", toId: "you", amountCents: 2000, accountId: "checking" };
  const unified = deriveUnifiedFinanceState({
    members: ["you", "maya"].map((id) => ({ id, name: id })),
    groups: [{ id: "g1", name: "Trip" }],
    expenses: [sharedExp],
    settlements: [stl],
    accounts,
    personalTransactions: [],
  });
  // Paid 4000, received 2000 back -> liquid = 98000, shared net = 0, net position = 98000
  assert.equal(unified.totalLiquidCents, 98000);
  assert.equal(unified.yourSharedNetCents, 0);
  assert.equal(unified.netPositionCents, 98000);
});

console.log(results.join("\n"));
console.log(`ALL ${results.length} SPLITFIN LEDGER TESTS PASSED`);
