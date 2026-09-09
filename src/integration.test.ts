import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App.vue";
import ResultsPage from "./components/results/ResultsPage.vue";

const resultProps = {
  results: {
    overallStatus: "Housing looks manageable",
    score: 76,
    purchaseSummary: "£550",
    emergencySummary: "£13,200",
    monthlyCosts: "£1,122",
    cashFlow: {
      income: "£1,900",
      rent: "£672",
      utilities: "£250",
      debtPayments: "£300",
      otherCommitments: "£0",
      saving: "£150",
      remaining: "-£22",
    },
  },
};

describe("Results page integration", () => {
  it("renders the complete monthly cash-flow summary", () => {
    const wrapper = mount(ResultsPage, { props: resultProps });
    expect(wrapper.text()).toContain("Total recurring costs");
    expect(wrapper.text()).toContain("£1,122");
    expect(wrapper.text()).toContain("Total debt payments");
    expect(wrapper.text()).toContain("-£22");
  });

  it("opens the browser print dialog for PDF export", async () => {
    const print = vi.spyOn(window, "print").mockImplementation(() => {});
    const wrapper = mount(ResultsPage, { props: resultProps });

    await wrapper.get(".export-pdf").trigger("click");

    expect(print).toHaveBeenCalledOnce();
    print.mockRestore();
  });
});

describe("localStorage integration", () => {
  beforeEach(() => localStorage.clear());
  it("restores persisted income and preferences on mount", async () => {
    localStorage.setItem(
      "worthwhile-calculator-state",
      JSON.stringify({
        income: 5100,
        rent: 900,
        utilities: 180,
        monthlyCommitments: 250,
        debtPayments: 400,
        monthlySaving: 300,
      }),
    );
    const wrapper = mount(App);
    await wrapper.vm.$nextTick();
    expect(
      (wrapper.find("#monthly-income").element as HTMLInputElement).value,
    ).toBe("5100");
    wrapper.unmount();
  });
  it("persists a changed income value", async () => {
    const wrapper = mount(App);
    await wrapper.find("#monthly-income").setValue("5000");
    await wrapper.vm.$nextTick();
    expect(
      JSON.parse(localStorage.getItem("worthwhile-calculator-state") || "{}")
        .income,
    ).toBe(5000);
    wrapper.unmount();
  });
  it("updates Safety net essentials from Preferences", async () => {
    const wrapper = mount(App);
    await wrapper.find(".menu-button").trigger("click");
    await wrapper
      .findAll(".menu-panel button")
      .find((button) => button.text() === "Preferences")!
      .trigger("click");
    await wrapper.vm.$nextTick();
    await wrapper.find("#preference-rent").setValue("700");
    await wrapper.find("#preference-utilities").setValue("200");
    await wrapper.find("#preference-debt").setValue("100");
    await wrapper.find("#preference-commitments").setValue("50");
    await wrapper.find(".preferences-panel .save").trigger("click");
    await wrapper
      .findAll(".tabs button")
      .find((button) => button.text().includes("Safety net"))!
      .trigger("click");
    expect(
      (wrapper.find("#essential-spend").element as HTMLInputElement).value,
    ).toBe("1050.00");
    wrapper.unmount();
  });
  it("renders persisted user text as escaped DOM content", async () => {
    localStorage.setItem(
      "worthwhile-calculator-state",
      JSON.stringify({
        extraCosts: [
          { id: 1, name: "<img src=x onerror=alert(1)>", amount: 10 },
        ],
      }),
    );
    const wrapper = mount(App);
    await wrapper.vm.$nextTick();

    expect(wrapper.findAll("script")).toHaveLength(0);
    expect(wrapper.find('input[aria-label*="<img"]').exists()).toBe(true);
    wrapper.unmount();
  });
  it("sanitizes negative and empty persisted numeric values", async () => {
    localStorage.setItem(
      "worthwhile-calculator-state",
      JSON.stringify({ income: -100, rent: "", moving: -50, furnishings: -20 }),
    );
    const wrapper = mount(App);
    await wrapper.vm.$nextTick();
    expect(
      (wrapper.find("#monthly-income").element as HTMLInputElement).value,
    ).toBe("0");
    wrapper.unmount();
  });
  it("handles corrupted persisted data without preventing startup", async () => {
    localStorage.setItem("worthwhile-calculator-state", "not-json");
    const wrapper = mount(App);
    await wrapper.vm.$nextTick();
    expect(wrapper.find("#monthly-income").exists()).toBe(true);
    expect(wrapper.find('[role="status"]').text()).toContain(
      "could not be loaded",
    );
    wrapper.unmount();
  });
  it("persists moving costs and furnishings", async () => {
    const wrapper = mount(App);
    await wrapper
      .findAll(".tabs button")
      .find((button) => button.text().includes("Moving home"))!
      .trigger("click");
    await wrapper.find("#moving-costs").setValue("1200");
    await wrapper.find("#furniture-setup").setValue("800");
    await wrapper.vm.$nextTick();
    const saved = JSON.parse(
      localStorage.getItem("worthwhile-calculator-state") || "{}",
    );
    expect(saved.moving).toBe(1200);
    expect(saved.furnishings).toBe(800);
    wrapper.unmount();
  });
  it("clears saved data and shows confirmation", async () => {
    localStorage.setItem(
      "worthwhile-calculator-state",
      JSON.stringify({ income: 5000 }),
    );
    const wrapper = mount(App);
    await wrapper.find(".menu-button").trigger("click");
    await wrapper
      .findAll(".menu-panel button")
      .find((button) => button.text() === "Clear saved data")!
      .trigger("click");
    expect(localStorage.getItem("worthwhile-calculator-state")).toBe(null);
    expect(wrapper.find('[role="status"]').text()).toContain("cleared");
    wrapper.unmount();
  });
  it("includes the financed purchase payment once in the Results debt total", async () => {
    const wrapper = mount(App);
    await wrapper.find("#purchase-price").setValue("12000");
    await wrapper
      .findAll(".tabs button")
      .find((button) => button.text() === "Results")!
      .trigger("click");
    await wrapper.vm.$nextTick();
    expect(wrapper.find(".results-page").text()).toContain(
      "Total debt payments",
    );
    wrapper.unmount();
  });
  it("does not carry a purchase payment into moving Results", async () => {
    const wrapper = mount(App);
    await wrapper.find("#purchase-price").setValue("12000");
    await wrapper
      .findAll(".tabs button")
      .find((button) => button.text().includes("Moving home"))!
      .trigger("click");
    await wrapper
      .findAll(".tabs button")
      .find((button) => button.text() === "Results")!
      .trigger("click");
    await wrapper.vm.$nextTick();

    const debtRow = wrapper
      .findAll(".cash-row")
      .find((row) => row.text().includes("Total debt payments"));
    expect(debtRow?.text()).toContain("£0");
    wrapper.unmount();
  });
  it("includes transport and food in the cash-flow score ratio", async () => {
    const wrapper = mount(App);
    await wrapper.find("#monthly-income").setValue("1000");
    await wrapper.find("#purchase-price").setValue("0");
    await wrapper.find(".menu-button").trigger("click");
    await wrapper
      .findAll(".menu-panel button")
      .find((button) => button.text() === "Preferences")!
      .trigger("click");
    await wrapper.vm.$nextTick();
    await wrapper.find("#preference-food").setValue("200");
    await wrapper.find("#preference-transport").setValue("100");
    await wrapper.find(".preferences-panel .save").trigger("click");
    await wrapper
      .findAll(".tabs button")
      .find((button) => button.text() === "Results")!
      .trigger("click");
    await wrapper.vm.$nextTick();

    expect(wrapper.find(".results-heading").text()).toContain(
      "This plan needs a closer look",
    );
    wrapper.unmount();
  });
  it("keeps moving verdict and Results status aligned", async () => {
    const wrapper = mount(App);
    await wrapper.find(".menu-button").trigger("click");
    await wrapper
      .findAll(".menu-panel button")
      .find((button) => button.text() === "Preferences")!
      .trigger("click");
    await wrapper.vm.$nextTick();
    await wrapper.find("#preference-income").setValue("5000");
    await wrapper.find("#preference-rent").setValue("1000");
    await wrapper.find("#preference-utilities").setValue("200");
    await wrapper.find("#preference-transport").setValue("500");
    await wrapper.find("#preference-food").setValue("500");
    await wrapper.find(".preferences-panel .save").trigger("click");
    await wrapper
      .findAll(".tabs button")
      .find((button) => button.text().includes("Moving home"))!
      .trigger("click");

    expect(wrapper.find(".result h2").text()).toBe("This may stretch you");
    expect(wrapper.find(".result .salary").text()).toContain(
      "listed costs currently use 44%",
    );
    await wrapper
      .findAll(".tabs button")
      .find((button) => button.text() === "Results")!
      .trigger("click");
    await wrapper.vm.$nextTick();
    expect(wrapper.find(".results-heading h2").text()).toBe(
      "This plan needs a closer look",
    );
    wrapper.unmount();
  });
  it("warns when purchase debt is fractionally above the threshold", async () => {
    const wrapper = mount(App);
    await wrapper.find(".menu-button").trigger("click");
    await wrapper
      .findAll(".menu-panel button")
      .find((button) => button.text() === "Preferences")!
      .trigger("click");
    await wrapper.vm.$nextTick();
    await wrapper.find("#preference-income").setValue("1000");
    await wrapper.find("#preference-debt").setValue("200.04");
    await wrapper.find(".preferences-panel .save").trigger("click");

    expect(wrapper.find(".result .salary").text()).toContain(
      "Debt repayments use 20%",
    );
    wrapper.unmount();
  });
  it("keeps persisted housing costs in the Results finance health indicator", async () => {
    localStorage.setItem(
      "worthwhile-calculator-state",
      JSON.stringify({ income: 2000, rent: 800, utilities: 200 }),
    );
    const wrapper = mount(App);
    await wrapper
      .findAll(".tabs button")
      .find((button) => button.text() === "Results")!
      .trigger("click");
    await wrapper.vm.$nextTick();

    const housingRow = wrapper
      .findAll(".health-row")
      .find((row) => row.find("span").text() === "Housing");
    expect(housingRow?.text()).toContain("50%");
    wrapper.unmount();
  });
  it("shows the saved-plan confirmation", async () => {
    const wrapper = mount(App);
    await wrapper.find(".save").trigger("click");
    expect(wrapper.find('[role="status"]').text()).toContain("Plan saved");
    wrapper.unmount();
  });
  it("shows Essential Cost Ratio in the Results flow", async () => {
    const wrapper = mount(App);
    await wrapper
      .findAll(".tabs button")
      .find((button) => button.text() === "Results")!
      .trigger("click");
    await wrapper.vm.$nextTick();

    expect(wrapper.find(".results-page").text()).toContain(
      "ESSENTIAL COST RATIO",
    );
    wrapper.unmount();
  });
  it("shows purchase details and safety progress on Results", async () => {
    const wrapper = mount(App);
    await wrapper.find("#purchase-price").setValue("28000");
    await wrapper.find("#purchase-deposit").setValue("5000");
    await wrapper
      .findAll(".tabs button")
      .find((button) => button.text() === "Results")!
      .trigger("click");
    await wrapper.vm.$nextTick();

    expect(wrapper.find(".results-page").text()).toContain(
      "£23,000 borrowed · £3,385 interest · 4 years at 6.9%",
    );

    await wrapper
      .findAll(".tabs button")
      .find((button) => button.text().includes("Safety net"))!
      .trigger("click");
    await wrapper
      .findAll(".tabs button")
      .find((button) => button.text() === "Results")!
      .trigger("click");
    await wrapper.vm.$nextTick();

    expect(wrapper.find(".results-page").text()).toContain("18% funded");
    expect(wrapper.find(".results-page").text()).toContain(
      "Time to goal: 2.0 years",
    );
    wrapper.unmount();
  });
  it("does not apply safety saving suggestions to Purchase Finance Health", async () => {
    const wrapper = mount(App);
    await wrapper.find(".menu-button").trigger("click");
    await wrapper
      .findAll(".menu-panel button")
      .find((button) => button.text() === "Preferences")!
      .trigger("click");
    await wrapper.vm.$nextTick();
    await wrapper.find("#preference-saving").setValue("0");
    await wrapper.find(".preferences-panel .save").trigger("click");
    await wrapper
      .findAll(".tabs button")
      .find((button) => button.text() === "Results")!
      .trigger("click");
    await wrapper.vm.$nextTick();

    const savingsRow = wrapper
      .findAll(".health-row")
      .find((row) => row.find("span").text() === "Savings");
    expect(savingsRow?.text()).toContain("0%");
    expect(savingsRow?.text()).toContain("Below guideline");
    wrapper.unmount();
  });
  it("uses a planned saving pace for cash-purchase timelines", async () => {
    const wrapper = mount(App);
    await wrapper.find("#monthly-income").setValue("3000");
    await wrapper.find("#purchase-price").setValue("3000");
    await wrapper
      .findAll("button")
      .find((button) => button.text() === "Pay cash")!
      .trigger("click");
    expect(wrapper.find(".copy").text()).toContain("approximately 5 months");
    expect(wrapper.find(".copy").text()).not.toContain("approximately 4 months");
    wrapper.unmount();
  });
  it("keeps an explicit zero cash saving pace consistent", async () => {
    const wrapper = mount(App);
    await wrapper.find(".menu-button").trigger("click");
    await wrapper
      .findAll(".menu-panel button")
      .find((button) => button.text() === "Preferences")!
      .trigger("click");
    await wrapper.vm.$nextTick();
    await wrapper.find("#preference-saving").setValue("0");
    await wrapper.find(".preferences-panel .save").trigger("click");
    await wrapper.find("#purchase-price").setValue("3000");
    await wrapper
      .findAll(".choice button")
      .find((button) => button.text() === "Pay cash")!
      .trigger("click");

    expect(wrapper.find(".copy").text()).toContain(
      "cannot currently be funded",
    );
    await wrapper
      .findAll(".tabs button")
      .find((button) => button.text() === "Results")!
      .trigger("click");
    await wrapper.vm.$nextTick();
    const savingRow = wrapper
      .findAll(".cash-row")
      .find((row) => row.text().includes("Planned saving"));
    expect(savingRow?.text()).toContain("£0");
    wrapper.unmount();
  });
  it("does not give an unaffordable safety pace a finish date", async () => {
    const wrapper = mount(App);
    await wrapper
      .findAll(".tabs button")
      .find((button) => button.text().includes("Safety net"))!
      .trigger("click");
    await wrapper.find("#monthly-income").setValue("1000");
    await wrapper.find("#essential-spend").setValue("900");
    await wrapper.find("#saved-amount").setValue("0");
    await wrapper.find("#monthly-saving").setValue("200");
    expect(wrapper.find(".copy").text()).toContain(
      "Increase your monthly saving pace to calculate a finish date.",
    );
    await wrapper
      .findAll(".tabs button")
      .find((button) => button.text() === "Results")!
      .trigger("click");
    await wrapper.vm.$nextTick();
    const savingRow = wrapper
      .findAll(".cash-row")
      .find((row) => row.text().includes("Planned saving"));
    expect(savingRow?.text()).toContain("£0");
    wrapper.unmount();
  });
  it("does not give a sub-threshold safety pace a finish date", async () => {
    const wrapper = mount(App);
    await wrapper
      .findAll(".tabs button")
      .find((button) => button.text().includes("Safety net"))!
      .trigger("click");
    await wrapper.find("#monthly-income").setValue("1000");
    await wrapper.find("#essential-spend").setValue("920");
    await wrapper.find("#saved-amount").setValue("0");
    await wrapper.find("#monthly-saving").setValue("50");

    expect(wrapper.find(".copy").text()).toContain(
      "Increase your monthly saving pace to calculate a finish date.",
    );
    await wrapper
      .findAll(".tabs button")
      .find((button) => button.text() === "Results")!
      .trigger("click");
    await wrapper.vm.$nextTick();
    expect(wrapper.find(".results-page").text()).toContain(
      "Time to goal: Not possible",
    );
    const savingRow = wrapper
      .findAll(".cash-row")
      .find((row) => row.text().includes("Planned saving"));
    expect(savingRow?.text()).toContain("£0");
    expect(wrapper.find(".results-page").text()).toContain("£80");
    wrapper.unmount();
  });
});
