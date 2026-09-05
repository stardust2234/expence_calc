<script setup lang="ts">
import { HandCoins } from "lucide-vue-next";
defineProps<{
  purchaseType: "finance" | "cash";
  price: number;
  deposit: number;
  term: number;
  rate: number;
  cashAvailable: number;
}>();
const emit = defineEmits<{
  (e: "update:purchaseType", value: "finance" | "cash"): void;
  (
    e: "update:price" | "update:deposit" | "update:term" | "update:rate",
    value: number,
  ): void;
}>();
</script>
<template>
  <div class="heading">
    <div>
      <h2><HandCoins :size="20" /> Can I afford this?</h2>
      <p>See how this purchase fits into your monthly life.</p>
    </div>
  </div>
  <div class="choice">
    <button
      :class="{ chosen: purchaseType === 'finance' }"
      @click="emit('update:purchaseType', 'finance')"
    >
      Finance
    </button>
    <button
      :class="{ chosen: purchaseType === 'cash' }"
      @click="emit('update:purchaseType', 'cash')"
    >
      Pay cash
    </button>
  </div>
  <label for="purchase-price"
    >Purchase price<input
      id="purchase-price"
      :value="price"
      type="number"
      min="0"
      @input="
        emit('update:price', Number(($event.target as HTMLInputElement).value))
      "
    />
    <span>£</span>
  </label>
  <div v-if="purchaseType === 'finance'" class="two">
    <label for="purchase-deposit"
      >Deposit<input
        id="purchase-deposit"
        :value="deposit"
        type="number"
        min="0"
        @input="
          emit(
            'update:deposit',
            Number(($event.target as HTMLInputElement).value),
          )
        "
      />
      <span>£</span>
    </label>
    <label for="purchase-term"
      >Term<select
        id="purchase-term"
        :value="term"
        @change="
          emit(
            'update:term',
            Number(($event.target as HTMLSelectElement).value),
          )
        "
      >
        <option :value="12">1 year</option>
        <option :value="24">2 years</option>
        <option :value="36">3 years</option>
        <option :value="48">4 years</option>
        <option :value="60">5 years</option>
      </select>
    </label>
  </div>
  <label v-if="purchaseType === 'finance'" for="purchase-rate"
    >Estimated interest rate<input
      id="purchase-rate"
      :value="rate"
      type="number"
      min="0"
      step=".1"
      @input="
        emit('update:rate', Number(($event.target as HTMLInputElement).value))
      "
    />
    <span>%</span>
  </label>
</template>
