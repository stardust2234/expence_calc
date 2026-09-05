import { computed, type Ref } from "vue";
import {
  calculateCashPurchase,
  calculateEmergencyMonths,
  calculateEmergencyTarget,
  calculateHousingRatio,
  calculateMonthlyPayment,
  calculateMoveInTotal,
  evaluateGuideline,
  isWithinComfortRule,
  sanitizeNumber,
} from "../calculations";
import type { FinancialResults } from "../types/financial";

export function useCalculations(state: {
  mode: Ref<"purchase" | "move" | "safety">;
  purchaseType: Ref<"finance" | "cash">;
  income: Ref<number>;
  price: Ref<number>;
  deposit: Ref<number>;
  term: Ref<number>;
  rate: Ref<number>;
  rent: Ref<number>;
  moving: Ref<number>;
  furnishings: Ref<number>;
  utilities: Ref<number>;
  transport: Ref<number>;
  food: Ref<number>;
  monthlyCommitments: Ref<number>;
  debtPayments: Ref<number>;
  essentials: Ref<number>;
  saved: Ref<number>;
  monthlySaving: Ref<number>;
  extraCosts: Ref<{ id: number; name: string; amount: number }[]>;
}) {
  const extraMonthlyCosts = computed(() =>
    state.extraCosts.value.reduce(
      (sum, cost) => sum + sanitizeNumber(cost.amount),
      0,
    ),
  );
  const monthlyHousing = computed(
    () =>
      sanitizeNumber(state.rent.value) + sanitizeNumber(state.utilities.value),
  );
  const monthlyPayment = computed(() =>
    calculateMonthlyPayment(
      state.price.value,
      state.deposit.value,
      state.term.value,
      state.rate.value,
    ),
  );
  const housingCost = computed(() =>
    state.mode.value === "purchase"
      ? state.purchaseType.value === "cash"
        ? 0
        : monthlyPayment.value
      : monthlyHousing.value,
  );
  const housingRatio = computed(() =>
    sanitizeNumber(state.income.value) === 0
      ? 1
      : housingCost.value / sanitizeNumber(state.income.value),
  );
  const fullPurchasePrice = computed(() =>
    calculateCashPurchase(state.price.value),
  );
  const moveTotal = computed(() =>
    calculateMoveInTotal(
      state.rent.value,
      state.moving.value,
      state.furnishings.value,
    ),
  );
  const emergencyTarget = computed(
    () =>
      calculateEmergencyTarget(state.essentials.value) +
      extraMonthlyCosts.value * 6,
  );
  const cashAvailable = computed(() => Math.max(0, disposableMargin.value));
  const disposableMargin = computed(
    () =>
      sanitizeNumber(state.income.value) -
      sanitizeNumber(state.essentials.value) -
      extraMonthlyCosts.value,
  );
  const disposableMarginPercentage = computed(() =>
    sanitizeNumber(state.income.value) > 0
      ? disposableMargin.value / sanitizeNumber(state.income.value)
      : 0,
  );
  const cashAmountStillNeeded = computed(() =>
    Math.max(0, fullPurchasePrice.value - cashAvailable.value),
  );
  const cashPurchaseMonths = computed(() =>
    cashAmountStillNeeded.value === 0
      ? 0
      : sanitizeNumber(state.monthlySaving.value) > 0
        ? Math.ceil(cashAmountStillNeeded.value / disposableMargin.value)
        : Infinity,
  );
  const emergencyGap = computed(() =>
    Math.max(0, emergencyTarget.value - sanitizeNumber(state.saved.value)),
  );
  const emergencyMonths = computed(() =>
    calculateEmergencyMonths(
      emergencyTarget.value,
      state.saved.value,
      state.monthlySaving.value,
    ),
  );
  const ratio = computed(() => {
    const costs =
      state.mode.value === "purchase"
        ? state.purchaseType.value === "cash"
          ? monthlyHousing.value + state.monthlyCommitments.value
          : monthlyHousing.value +
            monthlyPayment.value +
            state.monthlyCommitments.value
        : monthlyHousing.value + state.monthlyCommitments.value;
    return calculateHousingRatio(
      costs + state.debtPayments.value + extraMonthlyCosts.value,
      state.income.value,
    );
  });
  const score = computed(() =>
    state.mode.value === "safety"
      ? Math.min(
          100,
          Math.round(
            (sanitizeNumber(state.saved.value) /
              Math.max(1, emergencyTarget.value)) *
              100,
          ),
        )
      : Math.max(
          0,
          Math.min(
            100,
            Math.round(
              100 -
                ratio.value * 145 -
                (state.mode.value === "move"
                  ? moveTotal.value /
                    Math.max(1, sanitizeNumber(state.income.value)) /
                    2
                  : 0),
            ),
          ),
        ),
  );
  const verdict = computed(() =>
    housingRatio.value <= 0.3
      ? "Comfortable"
      : score.value >= 50
        ? "Worth a closer look"
        : "This may stretch you",
  );
  const minSalary = computed(
    () =>
      Math.ceil(
        (state.mode.value === "purchase"
          ? monthlyPayment.value
          : monthlyHousing.value) /
          0.3 /
          100,
      ) * 100,
  );

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
      maximumFractionDigits: 0,
    }).format(value);

  const results = computed<FinancialResults>(() => ({
    overallStatus:
      housingRatio.value <= 0.3
        ? "Housing looks manageable"
        : "This plan needs a closer look",
    score: score.value,
    purchaseSummary:
      state.purchaseType.value === "cash"
        ? formatCurrency(fullPurchasePrice.value)
        : formatCurrency(monthlyPayment.value),
    emergencySummary: formatCurrency(emergencyTarget.value),
    monthlyCosts: formatCurrency(
      monthlyHousing.value +
        (state.purchaseType.value === "cash" ? 0 : monthlyPayment.value) +
        state.monthlyCommitments.value +
        state.debtPayments.value +
        state.transport.value +
        state.food.value +
        extraMonthlyCosts.value,
    ),
    disposableMargin: formatCurrency(disposableMargin.value),
    disposableMarginPercentage: Math.round(
      disposableMarginPercentage.value * 100,
    ),
    essentialCostRatio: Math.round(
      calculateHousingRatio(
        state.essentials.value + extraMonthlyCosts.value,
        state.income.value,
      ) * 100,
    ),
    cashFlow: {
      income: formatCurrency(state.income.value),
      rent: formatCurrency(state.rent.value),
      utilities: formatCurrency(state.utilities.value),
      transport: formatCurrency(state.transport.value),
      food: formatCurrency(state.food.value),
      debtPayments: formatCurrency(
        state.debtPayments.value +
          (state.purchaseType.value === "cash" ? 0 : monthlyPayment.value),
      ),
      otherCommitments: formatCurrency(
        state.monthlyCommitments.value + extraMonthlyCosts.value,
      ),
      saving: formatCurrency(state.monthlySaving.value),
      remaining: formatCurrency(
        state.income.value -
          monthlyHousing.value -
          state.transport.value -
          state.food.value -
          state.debtPayments.value -
          state.monthlyCommitments.value -
          extraMonthlyCosts.value -
          (state.purchaseType.value === "cash" ? 0 : monthlyPayment.value) -
          state.monthlySaving.value,
      ),
    },
    financeHealth: [
      {
        label: "Housing",
        ...evaluateGuideline(housingCost.value, state.income.value, {
          max: 0.3,
        }),
      },
      {
        label: "Housing + debt",
        ...evaluateGuideline(
          housingCost.value + state.debtPayments.value,
          state.income.value,
          { max: 0.36 },
        ),
      },
      {
        label: "Transport",
        ...evaluateGuideline(state.transport.value, state.income.value, {
          min: 0.1,
          max: 0.15,
        }),
      },
      {
        label: "Food",
        ...evaluateGuideline(state.food.value, state.income.value, {
          min: 0.1,
          max: 0.15,
        }),
      },
      {
        label: "Utilities",
        ...evaluateGuideline(state.utilities.value, state.income.value, {
          min: 0.05,
          max: 0.1,
        }),
      },
      {
        label: "Savings",
        ...evaluateGuideline(state.monthlySaving.value, state.income.value, {
          min: 0.1,
        }),
      },
      {
        label: "Debt repayments",
        ...evaluateGuideline(state.debtPayments.value, state.income.value, {
          max: 0.2,
        }),
      },
    ],
  }));

  return {
    extraMonthlyCosts,
    housingRatio,
    housingCost,
    monthlyHousing,
    monthlyPayment,
    fullPurchasePrice,
    moveTotal,
    emergencyTarget,
    cashAvailable,
    disposableMargin,
    disposableMarginPercentage,
    cashPurchaseMonths,
    cashAmountStillNeeded,
    emergencyGap,
    emergencyMonths,
    ratio,
    score,
    verdict,
    minSalary,
    formatCurrency,
    results,
    isWithinComfortRule,
  };
}
