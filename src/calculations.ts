export const sanitizeNumber = (value: number | string): number =>
  Math.max(0, Number(value) || 0);
export function calculateMonthlyPayment(
  price: number,
  deposit: number,
  termMonths: number,
  annualRate: number,
): number {
  const principal = Math.max(
    0,
    sanitizeNumber(price) - sanitizeNumber(deposit),
  );
  const months = Math.max(1, sanitizeNumber(termMonths));
  const monthlyRate = sanitizeNumber(annualRate) / 1200;
  if (monthlyRate === 0) return Math.round(principal / months);
  return Math.round(
    (principal * monthlyRate * (1 + monthlyRate) ** months) /
      ((1 + monthlyRate) ** months - 1),
  );
}
export const calculateCashPurchase = (price: number): number =>
  sanitizeNumber(price);
export const calculateMoveInTotal = (
  rent: number,
  moving: number,
  furnishings: number,
): number =>
  sanitizeNumber(rent) + sanitizeNumber(moving) + sanitizeNumber(furnishings);
export const calculateEmergencyTarget = (
  essentialMonthlySpend: number,
): number => sanitizeNumber(essentialMonthlySpend) * 6;
export const calculateEmergencyMonths = (
  target: number,
  saved: number,
  monthlySaving: number,
): number => {
  const gap = Math.max(0, sanitizeNumber(target) - sanitizeNumber(saved));
  const pace = sanitizeNumber(monthlySaving);
  return gap === 0 ? 0 : pace > 0 ? Math.ceil(gap / pace) : Infinity;
};
export const calculateHousingRatio = (
  monthlyCosts: number,
  income: number,
): number =>
  sanitizeNumber(income) > 0
    ? sanitizeNumber(monthlyCosts) / sanitizeNumber(income)
    : 1;
export const isWithinComfortRule = (ratio: number): boolean => ratio <= 0.3;

export type Guideline = {
  min?: number;
  max?: number;
};

export type GuidelineStatus = "below" | "within" | "above";

export const calculateBudgetRatio = (amount: number, income: number): number =>
  calculateHousingRatio(amount, income);

export const getGuidelineStatus = (
  ratio: number,
  guideline: Guideline,
): GuidelineStatus => {
  if (guideline.min !== undefined && ratio < guideline.min) return "below";
  if (guideline.max !== undefined && ratio > guideline.max) return "above";
  return "within";
};

export const evaluateGuideline = (
  amount: number,
  income: number,
  guideline: Guideline,
) => {
  const ratio = calculateBudgetRatio(amount, income);
  return {
    ratio,
    percentage: Math.round(ratio * 100),
    status: getGuidelineStatus(ratio, guideline),
  };
};

export type EssentialCostPosition =
  | "comfortable"
  | "manageable"
  | "constrained"
  | "vulnerable"
  | "little-flexibility"
  | "fragile"
  | "structurally-unaffordable";

export const getEssentialCostPosition = (
  ratio: number,
): EssentialCostPosition =>
  ratio >= 1
    ? "structurally-unaffordable"
    : ratio > 0.9
      ? "fragile"
      : ratio > 0.8
        ? "little-flexibility"
        : ratio > 0.7
          ? "vulnerable"
          : ratio > 0.6
            ? "constrained"
            : ratio > 0.5
              ? "manageable"
              : "comfortable";
