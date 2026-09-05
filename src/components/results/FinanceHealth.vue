<script setup lang="ts">
import { ref } from "vue";
import { HelpCircle, X } from "lucide-vue-next";
import type { GuidelineStatus } from "../../calculations";

defineProps<{
  indicators: Array<{
    label: string;
    percentage: number;
    status: GuidelineStatus;
    position?: string;
  }>;
}>();

const statusLabel = (status: GuidelineStatus) =>
  status === "within"
    ? "Within guideline"
    : status === "below"
      ? "Below guideline"
      : "Above guideline";
const positionLabel = (position?: string) =>
  position
    ? position
        .replace(/-/g, " ")
        .replace(/^\w/, (letter: string) => letter.toUpperCase())
    : undefined;
const showHelp = ref(false);
</script>

<template>
  <section class="finance-health" aria-labelledby="finance-health-title">
    <div class="finance-health-heading">
      <div class="metric-card-heading">
        <div>
          <p class="eyebrow">FINANCE HEALTH</p>
          <h3 id="finance-health-title">How your spending compares</h3>
        </div>
        <button
          class="help-button"
          type="button"
          aria-label="Explain finance health guideline thresholds"
          @click="showHelp = true"
        >
          <HelpCircle :size="17" />
        </button>
      </div>
    </div>
    <div
      v-for="indicator in indicators"
      :key="indicator.label"
      class="health-row"
    >
      <span>{{ indicator.label }}</span>
      <strong>{{ indicator.percentage }}%</strong>
      <small :class="indicator.status">{{
        positionLabel(indicator.position) || statusLabel(indicator.status)
      }}</small>
    </div>
    <div
      v-if="showHelp"
      class="preferences-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="finance-health-help-title"
      @click.self="showHelp = false"
    >
      <div class="preferences-panel explainer-panel">
        <button
          class="close-preferences"
          type="button"
          aria-label="Close finance health explanation"
          @click="showHelp = false"
        >
          <X :size="20" />
        </button>
        <p class="eyebrow">FINANCE HEALTH GUIDELINES</p>
        <h2 id="finance-health-help-title">How thresholds work</h2>
        <p class="preferences-copy">
          These comparisons use common budgeting heuristics: 
          <br>Housing up to 30%,
          <br>Housing plus debt up to 36%, 
          <br>Debt repayments up to 20%,
          <br>Transport 10-15%,
          <br>Food 10-15%,
          <br>Utilities 5-10%,
          <br>Savings/Investing 10-20%.
          <br>They are estimates to support planning, not a validated financial assessment or advice.
        </p>
      </div>
    </div>
  </section>
</template>
