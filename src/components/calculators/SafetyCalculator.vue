<script setup lang="ts">
import { computed } from "vue";
import { ShieldCheck } from "lucide-vue-next";
import { calculateSuggestedSaving } from "../../calculations";
const props = defineProps<{
  essentials: number;
  saved: number;
  monthlySaving: number;
  availableMonthly: number;
  income: number;
}>();
const emit = defineEmits<{
  (
    e: "update:essentials" | "update:saved" | "update:monthlySaving",
    value: number,
  ): void;
}>();
const suggestedSaving = computed(() =>
  calculateSuggestedSaving(props.income, props.availableMonthly),
);
const suggestedSavingRate = computed(() =>
  props.income > 0 ? (suggestedSaving.value / props.income) * 100 : 0,
);
const savingIsPossible = computed(() => suggestedSaving.value > 0);
const savingPace = computed(() =>
  props.monthlySaving > 0 ? props.monthlySaving : suggestedSaving.value,
);
const savingIsRealistic = computed(
  () => savingIsPossible.value && savingPace.value <= props.availableMonthly,
);
const essentialSpendDisplay = computed(() => props.essentials.toFixed(2));
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
      :value="essentialSpendDisplay"
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
  <div :class="['saving-check', { realistic: savingIsRealistic }]">
    <b>{{
      !savingIsPossible
        ? "Saving is not currently possible"
        : savingIsRealistic
          ? "Looks realistic"
          : "This saving pace needs adjusting"
    }}</b>
    <small>{{
      !savingIsPossible
        ? "Less than 10% of take-home income remains after listed monthly costs."
        : `You have ${new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(props.availableMonthly)} left after listed monthly costs. Suggested saving: ${new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(suggestedSaving)} per month (${suggestedSavingRate}%).`
    }}</small>
  </div>
</template>
