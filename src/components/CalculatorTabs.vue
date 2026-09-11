<script setup lang="ts">
import { nextTick } from "vue";
import { CheckCircle2, HandCoins, Home, ShieldCheck } from "lucide-vue-next";
defineProps<{ modelValue: "purchase" | "move" | "safety" | "results" }>();
const emit = defineEmits<{
  (
    e: "update:modelValue",
    value: "purchase" | "move" | "safety" | "results",
  ): void;
}>();
const tabs = ["purchase", "move", "safety", "results"] as const;
const selectTab = (tab: (typeof tabs)[number]) => {
  emit("update:modelValue", tab);
  void nextTick(() =>
    document.querySelector<HTMLElement>(`[data-tab="${tab}"]`)?.focus(),
  );
};
const selectRelativeTab = (current: (typeof tabs)[number], offset: number) => {
  selectTab(tabs[(tabs.indexOf(current) + offset + tabs.length) % tabs.length]);
};
</script>
<template>
  <div class="tabs" role="tablist" aria-label="Financial calculators">
    <button
      type="button"
      role="tab"
      id="calculator-tab-purchase"
      data-tab="purchase"
      aria-controls="calculator-panel"
      :class="{ selected: modelValue === 'purchase' }"
      :aria-selected="modelValue === 'purchase'"
      :tabindex="modelValue === 'purchase' ? 0 : -1"
      @keydown.left.prevent="selectRelativeTab('purchase', -1)"
      @keydown.right.prevent="selectRelativeTab('purchase', 1)"
      @keydown.home.prevent="
        selectRelativeTab('purchase', -tabs.indexOf('purchase'))
      "
      @keydown.end.prevent="selectTab('results')"
      @click="emit('update:modelValue', 'purchase')"
    >
      <HandCoins :size="16" /> Big purchase</button
    ><button
      type="button"
      role="tab"
      id="calculator-tab-move"
      data-tab="move"
      aria-controls="calculator-panel"
      :class="{ selected: modelValue === 'move' }"
      :aria-selected="modelValue === 'move'"
      :tabindex="modelValue === 'move' ? 0 : -1"
      @keydown.left.prevent="selectRelativeTab('move', -1)"
      @keydown.right.prevent="selectRelativeTab('move', 1)"
      @keydown.home.prevent="selectRelativeTab('move', -tabs.indexOf('move'))"
      @keydown.end.prevent="selectTab('results')"
      @click="emit('update:modelValue', 'move')"
    >
      <Home :size="16" /> Moving home</button
    ><button
      type="button"
      role="tab"
      id="calculator-tab-safety"
      data-tab="safety"
      aria-controls="calculator-panel"
      :class="{ selected: modelValue === 'safety' }"
      :aria-selected="modelValue === 'safety'"
      :tabindex="modelValue === 'safety' ? 0 : -1"
      @keydown.left.prevent="selectRelativeTab('safety', -1)"
      @keydown.right.prevent="selectRelativeTab('safety', 1)"
      @keydown.home.prevent="
        selectRelativeTab('safety', -tabs.indexOf('safety'))
      "
      @keydown.end.prevent="selectTab('results')"
      @click="emit('update:modelValue', 'safety')"
    >
      <ShieldCheck :size="16" /> Safety net</button
    ><button
      type="button"
      role="tab"
      id="calculator-tab-results"
      data-tab="results"
      aria-controls="calculator-panel"
      :class="{ selected: modelValue === 'results' }"
      :aria-selected="modelValue === 'results'"
      :tabindex="modelValue === 'results' ? 0 : -1"
      @keydown.left.prevent="selectRelativeTab('results', -1)"
      @keydown.right.prevent="selectRelativeTab('results', 1)"
      @keydown.home.prevent="
        selectRelativeTab('results', -tabs.indexOf('results'))
      "
      @keydown.end.prevent="selectTab('results')"
      @click="emit('update:modelValue', 'results')"
    >
      <CheckCircle2 :size="16" /> Results
    </button>
  </div>
</template>
