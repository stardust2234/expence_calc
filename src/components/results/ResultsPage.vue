<script setup lang="ts">
import { ref } from "vue";
import { FileDown, HelpCircle, X } from "lucide-vue-next";
import type { FinancialResults } from "../../types/financial";
import CashFlowBreakdown from "./CashFlowBreakdown.vue";
import FinanceHealth from "./FinanceHealth.vue";
defineProps<{
  results: FinancialResults;
}>();
const emit = defineEmits<{ (e: "back"): void }>();
const help = ref<{ title: string; copy: string } | null>(null);
const exportPdf = () => window.print();
</script>
<template>
  <section class="results-page">
    <div class="results-heading">
      <div>
        <p class="eyebrow">YOUR COMPLETE PICTURE</p>
        <h2>{{ results.overallStatus }}</h2>
        <p>Here’s how your purchase, move, and safety net fit together.</p>
      </div>
      <div class="score">
        <strong>{{ results.score }}</strong
        ><small>/100</small>
      </div>
    </div>
    <div class="results-cards">
      <article>
        <div class="metric-card-heading">
          <p class="eyebrow">BIG PURCHASE</p>
          <button
            class="help-button"
            type="button"
            aria-label="Explain Big Purchase"
            @click="
              help = {
                title: 'Big Purchase',
                copy: 'This shows the purchase amount or monthly finance payment used in your current plan.',
              }
            "
          >
            <HelpCircle :size="16" />
          </button>
        </div>
        <h3>{{ results.purchaseSummary }}</h3>
      </article>
      <article>
        <div class="metric-card-heading">
          <p class="eyebrow">SAFETY NET</p>
          <button
            class="help-button"
            type="button"
            aria-label="Explain Safety Net"
            @click="
              help = {
                title: 'Safety Net',
                copy: 'This is your target emergency fund, based on six months of essential monthly spending.',
              }
            "
          >
            <HelpCircle :size="16" />
          </button>
        </div>
        <h3>{{ results.emergencySummary }}</h3>
      </article>
      <article>
        <div class="metric-card-heading">
          <p class="eyebrow">Total recurring costs</p>
          <button
            class="help-button"
            type="button"
            aria-label="Explain total recurring costs"
            @click="
              help = {
                title: 'Total recurring costs',
                copy: 'This combines your recurring housing, finance, debt, and other listed commitments.',
              }
            "
          >
            <HelpCircle :size="16" />
          </button>
        </div>
        <h3>{{ results.monthlyCosts }}</h3>
        <small>Housing, finance, debt, and other listed costs</small>
      </article>
      <article>
        <div class="metric-card-heading">
          <p class="eyebrow">DISPOSABLE MARGIN</p>
          <button
            class="help-button"
            type="button"
            aria-label="Explain disposable margin"
            @click="
              help = {
                title: 'Disposable margin',
                copy: 'This is net recurring income minus essential costs. It estimates your monthly capacity for unexpected costs or cash purchases.',
              }
            "
          >
            <HelpCircle :size="16" />
          </button>
        </div>
        <h3>{{ results.disposableMargin }}</h3>
        <small
          >{{ results.disposableMarginPercentage }}% of net income remains after
          essential costs</small
        >
      </article>
      <article>
        <div class="metric-card-heading">
          <p class="eyebrow">ESSENTIAL COST RATIO</p>
          <button
            class="help-button"
            type="button"
            aria-label="Explain essential cost ratio"
            @click="
              help = {
                title: 'Essential Cost Ratio',
                copy: 'This compares essential monthly expenses with net recurring income to show how much income is committed before discretionary spending.',
              }
            "
          >
            <HelpCircle :size="16" />
          </button>
        </div>
        <h3>{{ results.essentialCostRatio ?? 0 }}%</h3>
        <small
          >{{ results.essentialCostPosition }} · Essential costs as a share of
          net income</small
        >
      </article>
    </div>
    <div
      v-if="help"
      class="preferences-overlay"
      role="dialog"
      aria-modal="true"
      :aria-label="help.title"
      @click.self="help = null"
    >
      <div class="preferences-panel explainer-panel">
        <button
          class="close-preferences"
          type="button"
          aria-label="Close explainer"
          @click="help = null"
        >
          <X :size="20" />
        </button>
        <p class="eyebrow">ABOUT THIS METRIC</p>
        <h2>{{ help.title }}</h2>
        <p class="preferences-copy">{{ help.copy }}</p>
      </div>
    </div>
    <div class="results-detail-grid">
      <div class="cash-flow">
        <CashFlowBreakdown :cash-flow="results.cashFlow" />
      </div>
      <FinanceHealth
        v-if="results.financeHealth"
        :indicators="results.financeHealth"
      />
    </div>
    <div class="results-actions">
      <button class="export-pdf" type="button" @click="exportPdf">
        <FileDown :size="16" /> Export PDF</button
      ><button class="back-to-calculators" @click="emit('back')">
        Back to calculators
      </button>
    </div>
  </section>
</template>
