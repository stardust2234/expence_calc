export type FinancialResults = {
  overallStatus: string;
  score: number;
  purchaseSummary: string;
  emergencySummary: string;
  monthlyCosts: string;
  disposableMargin?: string;
  disposableMarginPercentage?: number;
  essentialCostRatio?: number;
  cashFlow: {
    income: string;
    rent: string;
    utilities: string;
    debtPayments: string;
    otherCommitments: string;
    saving: string;
    remaining: string;
  };
  financeHealth?: Array<{
    label: string;
    percentage: number;
    status: "below" | "within" | "above";
    position?: string;
  }>;
};
