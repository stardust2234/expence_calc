<script setup lang="ts">
import { ShieldCheck } from "lucide-vue-next";
const props = defineProps<{
  essentials: number;
  saved: number;
  monthlySaving: number;
  availableMonthly: number;
}>();
const emit = defineEmits<{
  (
    e: "update:essentials" | "update:saved" | "update:monthlySaving",
    value: number,
  ): void;
}>();
const savingIsRealistic = () => props.monthlySaving <= props.availableMonthly;
</script>
<template>
  <div class="heading">
    <div>
      <h2><ShieldCheck :size="20" /> Build a 6-month safety net</h2>
      <p>Build a buffer for the unexpected.</p>
    </div>
  </div>
  <label for="essential-spend"
    >Essential monthly spend
    <input
      id="essential-spend"
      :value="essentials"
      type="number"
      min="0"
      readonly
    />
    <span>£</span>
  </label>
  <small class="field-help"
    >Automatically calculated from your preferences.</small
  >
  <label for="saved-amount"
    >Already saved<input
      id="saved-amount"
      :value="saved"
      type="number"
      min="0"
      @input="
        emit('update:saved', Number(($event.target as HTMLInputElement).value))
      "
    />
    <span>£</span>
  </label>
  <label for="monthly-saving"
    >Monthly saving pace<input
      id="monthly-saving"
      :value="monthlySaving"
      type="number"
      min="0"
      @input="
        emit(
          'update:monthlySaving',
          Number(($event.target as HTMLInputElement).value),
        )
      "
    />
    <span>£</span>
  </label>
  <div :class="['saving-check', { realistic: savingIsRealistic() }]">
    <b>{{
      savingIsRealistic()
        ? "Looks realistic"
        : "This saving pace may be too high"
    }}</b>
    <small>{{
      savingIsRealistic()
        ? `You have ${new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(props.availableMonthly)} left after listed monthly costs.`
        : "Your saving pace is higher than the money left after listed monthly costs."
    }}</small>
  </div>
</template>
