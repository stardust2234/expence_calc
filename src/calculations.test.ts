import { describe, expect, it } from "vitest";
import {
  calculateCashPurchase,
  calculateEmergencyMonths,
  calculateEmergencyTarget,
  calculateHousingRatio,
  calculateInterestCost,
  calculateMonthlyPayment,
  calculateMoveInTotal,
  calculateSuggestedSaving,
  isWithinComfortRule,
  sanitizeNumber,
  sanitizeRate,
  calculateBudgetRatio,
  evaluateGuideline,
  getEssentialCostPosition,
  getGuidelineStatus,
} from "./calculations";
describe("financial calculations", () => {
  it("calculates amortised and zero-interest payments", () => {
    expect(calculateMonthlyPayment(28000, 5000, 48, 6.9)).toBe(550);
    expect(calculateMonthlyPayment(12000, 2000, 20, 0)).toBe(500);
  });
  it("calculates the total interest cost of a financed purchase", () => {
    expect(calculateInterestCost(28000, 5000, 48, 6.9)).toBe(3385);
    expect(calculateInterestCost(12000, 2000, 20, 0)).toBe(0);
  });
  it("uses the full price for cash purchases", () =>
    expect(calculateCashPurchase(28000)).toBe(28000));
  it("calculates move-in costs without ongoing utilities", () =>
    expect(calculateMoveInTotal(1450, 1200, 1800)).toBe(4450));
  it("applies the 30% rule", () => {
    expect(calculateHousingRatio(1260, 4200)).toBe(0.3);
    expect(isWithinComfortRule(0.3)).toBe(true);
    expect(isWithinComfortRule(0.301)).toBe(false);
  });
  it("calculates six months and saving time", () => {
    expect(calculateEmergencyTarget(2200)).toBe(13200);
    expect(calculateEmergencyMonths(13200, 1800, 350)).toBe(33);
  });
  it("suggests saving based on the remaining income threshold", () => {
    expect(calculateSuggestedSaving(1000, 90)).toBe(0);
    expect(calculateSuggestedSaving(1000, 200)).toBe(100);
    expect(calculateSuggestedSaving(1000, 201)).toBe(150);
  });
  it("sanitizes negative and empty values", () => {
    expect(sanitizeNumber(-10)).toBe(0);
    expect(sanitizeNumber("")).toBe(0);
    expect(sanitizeNumber(Number.NaN)).toBe(0);
    expect(sanitizeNumber(Number.POSITIVE_INFINITY)).toBe(0);
    expect(sanitizeNumber(2_000_000_000)).toBe(1_000_000_000);
  });
  it("bounds rates consistently with loan calculations", () => {
    expect(sanitizeRate(200)).toBe(100);
    expect(calculateMonthlyPayment(12000, 0, 12, sanitizeRate(200))).toBe(
      calculateMonthlyPayment(12000, 0, 12, 100),
    );
  });
  it("keeps loan calculations finite for extreme inputs", () => {
    expect(calculateMonthlyPayment(1e12, 0, 1e12, 1e12)).toBe(84_023_052);
    expect(Number.isFinite(calculateInterestCost(1e12, 0, 1e12, 1e12))).toBe(
      true,
    );
  });
  it("uses the bounded term for interest as well as payment", () => {
    expect(calculateInterestCost(12000, 0, 1e12, 0)).toBe(0);
  });
  it("treats zero income as unaffordable", () =>
    expect(calculateHousingRatio(500, 0)).toBe(1));
  it("handles zero saving pace and a reached target", () => {
    expect(calculateEmergencyMonths(1000, 0, 0)).toBe(Infinity);
    expect(calculateEmergencyMonths(1000, 1000, 0)).toBe(0);
  });
  it("calculates one-month and multi-month cash saving timelines", () => {
    expect(Math.ceil(calculateCashPurchase(130) / 150)).toBe(1);
    expect(Math.ceil(calculateCashPurchase(500) / 150)).toBe(4);
  });
  it("handles a deposit equal to the purchase price", () =>
    expect(calculateMonthlyPayment(5000, 5000, 48, 6.9)).toBe(0));
  it("keeps utilities out of one-time move-in costs", () =>
    expect(calculateMoveInTotal(1000, 500, 750)).toBe(2250));
  it("checks the comfort boundary precisely", () => {
    expect(isWithinComfortRule(calculateHousingRatio(300, 1000))).toBe(true);
    expect(isWithinComfortRule(calculateHousingRatio(301, 1000))).toBe(false);
  });
  it("calculates finance affordability with existing commitments", () => {
    const payment = calculateMonthlyPayment(28000, 0, 48, 0);
    const ratio = calculateHousingRatio(900 + 180 + 250 + 400 + payment, 4200);
    expect(payment).toBe(583);
    expect(ratio).toBeCloseTo(0.55);
    expect(isWithinComfortRule(ratio)).toBe(false);
  });
  it("handles zero cash prices and deposits above price", () => {
    expect(calculateCashPurchase(0)).toBe(0);
    expect(calculateMonthlyPayment(1000, 1500, 12, 6)).toBe(0);
  });
  it("handles a zero-income affordability ratio safely", () => {
    expect(calculateHousingRatio(0, 0)).toBe(1);
    expect(isWithinComfortRule(calculateHousingRatio(500, 0))).toBe(false);
  });
  it("preserves aggregate costs above the per-input limit", () => {
    expect(sanitizeAggregate(6_000_000_000)).toBe(6_000_000_000);
    expect(calculateHousingRatio(6_000_000_000, 1_000_000_000)).toBe(6);
    expect(calculateEmergencyTarget(6_000_000_000)).toBe(36_000_000_000);
    expect(calculateEmergencyMonths(36_000_000_000, 0, 1_000_000_000)).toBe(36);
  });
  it("evaluates reusable budget guidelines", () => {
    expect(calculateBudgetRatio(300, 1000)).toBe(0.3);
    expect(getGuidelineStatus(0.08, { min: 0.1, max: 0.15 })).toBe("below");
    expect(getGuidelineStatus(0.12, { min: 0.1, max: 0.15 })).toBe("within");
    expect(getGuidelineStatus(0.2, { min: 0.1, max: 0.15 })).toBe("above");
    expect(evaluateGuideline(150, 1000, { max: 0.15 })).toEqual({
      ratio: 0.15,
      percentage: 15,
      status: "within",
    });
    expect(evaluateGuideline(100, 0, { max: 0.3 }).status).toBe("above");
    expect(getGuidelineStatus(0.1, { min: 0.05, max: 0.1 })).toBe("within");
    expect(getGuidelineStatus(0.1001, { min: 0.05, max: 0.1 })).toBe("above");
  });
  it("classifies essential cost ratio positions", () => {
    expect(getEssentialCostPosition(0.5)).toBe("comfortable");
    expect(getEssentialCostPosition(0.6)).toBe("manageable");
    expect(getEssentialCostPosition(0.7)).toBe("constrained");
    expect(getEssentialCostPosition(0.8)).toBe("vulnerable");
    expect(getEssentialCostPosition(0.9)).toBe("little-flexibility");
    expect(getEssentialCostPosition(0.95)).toBe("fragile");
    expect(getEssentialCostPosition(1)).toBe("structurally-unaffordable");
  });
});
