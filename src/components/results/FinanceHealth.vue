<script setup lang="ts">
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
</script>

<template>
  <section class="finance-health" aria-labelledby="finance-health-title">
    <div class="finance-health-heading">
      <div>
        <p class="eyebrow">FINANCE HEALTH</p>
        <h3 id="finance-health-title">How your spending compares</h3>
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
  </section>
</template>
