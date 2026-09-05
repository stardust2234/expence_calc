<script setup lang="ts">
import type { FinancialResults } from "../../types/financial";
defineProps<{ cashFlow: FinancialResults["cashFlow"] }>();
</script>
<template>
  <div class="cash-flow-heading">
    <div>
      <p class="eyebrow">MONTHLY CASH FLOW</p>
      <h3>Where your money goes</h3>
    </div>
    <strong>{{ cashFlow.income }}</strong>
  </div>
  <div class="cash-row">
    <span>Rent</span><b>{{ cashFlow.rent }}</b>
  </div>
  <div class="cash-row">
    <span>Utilities</span><b>{{ cashFlow.utilities }}</b>
  </div>
  <div class="cash-row">
    <span>Transport</span><b>{{ cashFlow.transport }}</b>
  </div>
  <div class="cash-row">
    <span>Food</span><b>{{ cashFlow.food }}</b>
  </div>
  <div class="cash-row">
    <span>Total debt payments</span><b>{{ cashFlow.debtPayments }}</b>
  </div>
  <div class="cash-row">
    <span>Other commitments</span><b>{{ cashFlow.otherCommitments }}</b>
  </div>
  <div class="cash-row">
    <span>Planned saving</span><b>{{ cashFlow.saving }}</b>
  </div>
  <div :class="['cash-total', { negative: cashFlow.remaining.includes('-') }]">
    <span>Left after listed costs and saving</span
    ><b>{{ cashFlow.remaining }}</b>
  </div>
</template>
