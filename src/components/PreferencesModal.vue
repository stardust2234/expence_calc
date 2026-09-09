<script setup lang="ts">
defineProps<{
  open: boolean;
  income: number;
  rent: number;
  utilities: number;
  transport: number;
  food: number;
  debtPayments: number;
  monthlySaving: number;
  monthlyCommitments: number;
  saved: number;
}>();
const emit = defineEmits<{
  (e: "close"): void;
  (e: "save"): void;
  (
    e:
      | "update:income"
      | "update:rent"
      | "update:utilities"
      | "update:transport"
      | "update:food"
      | "update:debtPayments"
      | "update:monthlySaving"
      | "update:monthlyCommitments"
      | "update:saved",
    value: number,
  ): void;
}>();
</script>
<template>
  <div v-if="open" class="preferences-overlay" @click.self="emit('close')">
    <section
      class="preferences-panel"
      role="dialog"
      aria-modal="true"
      aria-labelledby="preferences-title"
    >
      <button
        class="close-preferences"
        @click="emit('close')"
        aria-label="Close preferences"
      >
        ×
      </button>
      <p class="eyebrow">YOUR DEFAULTS</p>
      <h2 id="preferences-title">Preferences</h2>
      <p class="preferences-copy">
        Set the figures used across every calculator.
      </p>
      <label for="preference-income"
        >Monthly take-home income<input
          id="preference-income"
          :value="income"
          type="number"
          min="0"
          @input="
            emit(
              'update:income',
              Number(($event.target as HTMLInputElement).value),
            )
          "
        /><span>£</span></label
      ><label for="preference-rent"
        >Rent<input
          id="preference-rent"
          :value="rent"
          type="number"
          min="0"
          @input="
            emit(
              'update:rent',
              Number(($event.target as HTMLInputElement).value),
            )
          "
        /><span>£</span></label
      ><label for="preference-utilities"
        >Utilities<input
          id="preference-utilities"
          :value="utilities"
          type="number"
          min="0"
          @input="
            emit(
              'update:utilities',
              Number(($event.target as HTMLInputElement).value),
            )
          "
        /><span>£</span></label
      ><label for="preference-debt"
        >Debt payments<input
          id="preference-debt"
          :value="debtPayments"
          type="number"
          min="0"
          @input="
            emit(
              'update:debtPayments',
              Number(($event.target as HTMLInputElement).value),
            )
          "
        /><span>£</span></label
      ><label for="preference-transport"
        >Transport<input
          id="preference-transport"
          :value="transport"
          type="number"
          min="0"
          @input="
            emit(
              'update:transport',
              Number(($event.target as HTMLInputElement).value),
            )
          "
        /><span>£</span></label
      ><label for="preference-food"
        >Food<input
          id="preference-food"
          :value="food"
          type="number"
          min="0"
          @input="
            emit(
              'update:food',
              Number(($event.target as HTMLInputElement).value),
            )
          "
        /><span>£</span></label
      ><label for="preference-saving"
        >Monthly saving pace<input
          id="preference-saving"
          :value="monthlySaving"
          type="number"
          min="0"
          @input="
            emit(
              'update:monthlySaving',
              Number(($event.target as HTMLInputElement).value),
            )
          "
        /><span>£</span></label
      ><label for="preference-commitments"
        >Other commitments<input
          id="preference-commitments"
          :value="monthlyCommitments"
          type="number"
          min="0"
          @input="
            emit(
              'update:monthlyCommitments',
              Number(($event.target as HTMLInputElement).value),
            )
          "
        /><span>£</span></label
      ><label for="preference-saved"
        >Already saved<input
          id="preference-saved"
          :value="saved"
          type="number"
          min="0"
          @input="
            emit(
              'update:saved',
              Number(($event.target as HTMLInputElement).value),
            )
          "
        /><span>£</span></label
      ><button class="save" @click="emit('save')">Save preferences</button>
    </section>
  </div>
</template>
