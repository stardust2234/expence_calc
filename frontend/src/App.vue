<script setup lang="ts">
import { computed, ref, watch } from "vue";
import {
  AppHeader,
  CalculatorTabs,
  PreferencesModal,
  ResultsPage,
  AffordabilityResult,
} from "./components";
import PurchaseCalculator from "./components/calculators/PurchaseCalculator.vue";
import MoveCalculator from "./components/calculators/MoveCalculator.vue";
import SafetyCalculator from "./components/calculators/SafetyCalculator.vue";
import { ShieldCheck } from "lucide-vue-next";
import type { FinancialResults } from "./types/financial";
import {
  useFinancialState,
  type CalculatorMode,
} from "./composables/useFinancialState";
import { useCalculations } from "./composables/useCalculations";
import { usePersistence } from "./composables/usePersistence";
import { sanitizeNumber } from "./calculations";
const {
  mode,
  view,
  purchaseType,
  income,
  price,
  deposit,
  term,
  rate,
  rent,
  moving,
  furnishings,
  utilities,
  transport,
  food,
  monthlyCommitments,
  debtPayments,
  essentials,
  saved,
  monthlySaving,
  extraCosts,
} = useFinancialState();
const preferencesOpen = ref(false),
  menuOpen = ref(false),
  notice = ref("");
watch(
  [rent, utilities, transport, food, debtPayments, monthlyCommitments],
  () => {
    essentials.value =
      sanitizeNumber(rent.value) +
      sanitizeNumber(utilities.value) +
      sanitizeNumber(transport.value) +
      sanitizeNumber(food.value) +
      sanitizeNumber(debtPayments.value) +
      sanitizeNumber(monthlyCommitments.value);
  },
  { immediate: true },
);
const {
  extraMonthlyCosts,
  housingRatio,
  housingCost,
  monthlyHousing,
  monthlyPayment,
  fullPurchasePrice,
  moveTotal,
  emergencyTarget,
  cashAvailable,
  cashPurchaseMonths,
  cashAmountStillNeeded,
  emergencyGap,
  emergencyMonths,
  ratio,
  score,
  verdict,
  minSalary,
  formatCurrency: fmt,
  isWithinComfortRule,
  results: calculatedResults,
} = useCalculations({
  mode,
  purchaseType,
  income,
  price,
  deposit,
  term,
  rate,
  rent,
  moving,
  furnishings,
  utilities,
  transport,
  food,
  monthlyCommitments,
  debtPayments,
  essentials,
  saved,
  monthlySaving,
  extraCosts,
});
const storageKey = "worthwhile-calculator-state",
  results = computed<FinancialResults>(() => ({
    overallStatus:
      housingRatio.value <= 0.3
        ? "Housing looks manageable"
        : "This plan needs a closer look",
    score: score.value,
    purchaseSummary:
      purchaseType.value === "cash"
        ? fmt(fullPurchasePrice.value)
        : fmt(monthlyPayment.value),
    emergencySummary: fmt(emergencyTarget.value),
    monthlyCosts: fmt(
      monthlyHousing.value +
        (purchaseType.value === "cash" ? 0 : monthlyPayment.value) +
        monthlyCommitments.value +
        debtPayments.value +
        extraMonthlyCosts.value,
    ),
    cashFlow: {
      income: fmt(income.value),
      rent: fmt(rent.value),
      utilities: fmt(utilities.value),
      debtPayments: fmt(
        debtPayments.value +
          (purchaseType.value === "cash" ? 0 : monthlyPayment.value),
      ),
      otherCommitments: fmt(monthlyCommitments.value + extraMonthlyCosts.value),
      saving: fmt(monthlySaving.value),
      remaining: fmt(
        income.value -
          monthlyHousing.value -
          debtPayments.value -
          monthlyCommitments.value -
          extraMonthlyCosts.value -
          (purchaseType.value === "cash" ? 0 : monthlyPayment.value) -
          monthlySaving.value,
      ),
    },
  })),
  persistedValues = {
    mode,
    view,
    purchaseType,
    price,
    deposit,
    term,
    rate,
    income,
    rent,
    utilities,
    transport,
    food,
    monthlyCommitments,
    debtPayments,
    saved,
    monthlySaving,
    essentials,
    moving,
    furnishings,
  };
const showNotice = (message: string) => {
    notice.value = message;
    setTimeout(() => (notice.value = ""), 4000);
  },
  persistence = usePersistence(
    storageKey,
    persistedValues,
    extraCosts,
    showNotice,
  ),
  addCost = () =>
    extraCosts.value.push({
      id: Date.now(),
      name: "New monthly cost",
      amount: 0,
    }),
  removeCost = (id: number) =>
    (extraCosts.value = extraCosts.value.filter((cost) => cost.id !== id)),
  savePlan = () => persistence.save(),
  clearSavedData = () => persistence.clear();
const selectCalculator = (next: CalculatorMode | "results") => {
  if (next === "results") {
    view.value = "results";
    menuOpen.value = false;
    return;
  }
  mode.value = next;
  view.value = "calculators";
};
</script>
<template>
  <div class="shell">
    <main>
      <div class="top-bar">
        <div class="app-brand">
          <span><ShieldCheck :size="17" /></span>worthwhile
        </div>
        <AppHeader />
        <button
          class="menu-button"
          type="button"
          aria-label="Open menu"
          :aria-expanded="menuOpen"
          @click="menuOpen = !menuOpen"
        >
          <span class="menu-icon" aria-hidden="true">☰</span>
        </button>
        <div v-if="menuOpen" class="menu-panel">
          <button
            @click="
              preferencesOpen = true;
              menuOpen = false;
            "
          >
            Preferences
          </button>
          <button
            @click="
              showNotice(
                'Enter your numbers in any calculator, then review Results.',
              );
              menuOpen = false;
            "
          >
            How it works
          </button>
          <button
            @click="
              clearSavedData();
              menuOpen = false;
            "
          >
            Clear saved data
          </button>
        </div>
      </div>
      <PreferencesModal
        :open="preferencesOpen"
        :income="income"
        :rent="rent"
        :utilities="utilities"
        :transport="transport"
        :food="food"
        :debt-payments="debtPayments"
        :monthly-saving="monthlySaving"
        :monthly-commitments="monthlyCommitments"
        :saved="saved"
        @close="preferencesOpen = false"
        @save="
          preferencesOpen = false;
          showNotice('Preferences saved on this device.');
        "
        @update:income="income = $event"
        @update:rent="rent = $event"
        @update:utilities="utilities = $event"
        @update:transport="transport = $event"
        @update:food="food = $event"
        @update:debt-payments="debtPayments = $event"
        @update:monthly-saving="monthlySaving = $event"
        @update:monthly-commitments="monthlyCommitments = $event"
        @update:saved="saved = $event"
      />
      <div v-if="notice" class="notice" role="status">{{ notice }} ×</div>
      <CalculatorTabs
        :model-value="view === 'results' ? 'results' : mode"
        @update:model-value="selectCalculator"
      />
      <template v-if="view === 'calculators'"
        ><div class="grid">
          <section class="card inputs">
            <label for="monthly-income"
              >Monthly take-home income<input
                id="monthly-income"
                v-model.number="income"
                type="number"
                min="0"
              /><span>£</span></label
            ><PurchaseCalculator
              v-if="mode === 'purchase'"
              v-model:purchase-type="purchaseType"
              v-model:price="price"
              v-model:deposit="deposit"
              v-model:term="term"
              v-model:rate="rate"
              :cash-available="cashAvailable"
            /><MoveCalculator
              v-else-if="mode === 'move'"
              v-model:rent="rent"
              v-model:moving="moving"
              v-model:furnishings="furnishings"
              v-model:utilities="utilities"
            /><SafetyCalculator
              v-else
              v-model:essentials="essentials"
              v-model:saved="saved"
              v-model:monthly-saving="monthlySaving"
              :available-monthly="
                Math.max(
                  0,
                  income -
                    monthlyHousing -
                    monthlyCommitments -
                    debtPayments -
                    extraMonthlyCosts,
                )
              "
            /><button v-if="mode !== 'safety'" class="add" @click="addCost">
              ＋ Add another cost
            </button>
            <div v-for="cost in extraCosts" :key="cost.id" class="extra-cost">
              <input
                v-model="cost.name"
                :aria-label="`${cost.name} name`"
              /><input
                v-model.number="cost.amount"
                type="number"
                min="0"
                aria-label="Monthly cost amount"
              /><button
                class="remove-cost"
                type="button"
                @click="removeCost(cost.id)"
                :aria-label="`Remove ${cost.name}`"
              >
                ×
              </button>
            </div>
          </section>
          <AffordabilityResult
            :title="mode === 'safety' ? 'Preparedness plan' : verdict"
            :score="score"
            :copy="
              mode === 'safety'
                ? `Your target is ${fmt(emergencyTarget)}. You have ${fmt(saved)} saved so far. ${emergencyGap === 0 ? 'Your target is reached.' : emergencyMonths === Infinity ? 'Increase your monthly saving pace to calculate a finish date.' : `At ${fmt(monthlySaving)} per month, you have ${emergencyMonths} month${emergencyMonths === 1 ? '' : 's'} to go.`}`
                : mode === 'purchase' && purchaseType === 'cash'
                  ? cashAmountStillNeeded === 0
                    ? `The full purchase price is ${fmt(fullPurchasePrice)}. It fits within your ${fmt(cashAvailable)} available monthly surplus after expenses (shown as £0 when expenses exceed income).`
                    : `The full purchase price is ${fmt(fullPurchasePrice)}. You can afford this without borrowing in approximately ${cashPurchaseMonths === Infinity ? 'an unknown number of' : cashPurchaseMonths} month${cashPurchaseMonths === 1 ? '' : 's'} if your current income and essential expenses remain unchanged.`
                  : mode === 'move'
                    ? `Your first-month move-in cost is ${fmt(moveTotal)}. Housing is ${fmt(housingCost)} per month (${Math.round(housingRatio * 100)}% of income); housing and listed commitments together use ${Math.round(ratio * 100)}%.`
                    : `Your estimated monthly purchase payment is ${fmt(monthlyPayment)} per month (${Math.round(housingRatio * 100)}% of take-home income). Housing and listed commitments together use ${Math.round(ratio * 100)}%.`
            "
            :primary-label="
              mode === 'safety'
                ? 'Emergency fund target'
                : mode === 'purchase' && purchaseType === 'cash'
                  ? 'Available after expenses (minimum £0)'
                  : mode === 'purchase'
                    ? 'Monthly payment'
                    : 'Monthly rent'
            "
            :primary-value="
              fmt(
                mode === 'safety'
                  ? emergencyTarget
                  : mode === 'purchase'
                    ? purchaseType === 'cash'
                      ? cashAvailable
                      : monthlyPayment
                    : rent,
              )
            "
            :secondary-label="
              mode === 'purchase' && purchaseType === 'cash'
                ? 'Time to save'
                : 'Suggested housing max'
            "
            :secondary-value="
              mode === 'purchase' && purchaseType === 'cash'
                ? cashAmountStillNeeded === 0
                  ? 'Covered this month'
                  : cashPurchaseMonths === Infinity
                    ? 'Not possible'
                    : `${cashPurchaseMonths} month${cashPurchaseMonths === 1 ? '' : 's'}`
                : fmt(income * 0.3)
            "
            :warning="
              mode !== 'safety' && !isWithinComfortRule(housingRatio)
                ? `Minimum housing income: ${fmt(minSalary)} / month. Housing currently uses ${Math.round(housingRatio * 100)}% of take-home income.`
                : undefined
            "
            @save="savePlan"
          /></div></template
      ><ResultsPage
        v-else
        :results="calculatedResults"
        @back="view = 'calculators'"
      />
      <footer>
        <span class="privacy-note"
          ><ShieldCheck :size="14" /> Privacy: your figures are stored only in
          this browser and are not uploaded.</span
        >
        <span>Built for real life, not perfect spreadsheets.</span>
      </footer>
    </main>
  </div>
</template>
