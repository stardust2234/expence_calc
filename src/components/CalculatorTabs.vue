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
const selectRelativeTab = (current: (typeof tabs)[number], offset: number) => {
  const nextIndex =
    (tabs.indexOf(current) + offset + tabs.length) % tabs.length;
  emit("update:modelValue", tabs[nextIndex]);
  void nextTick(() =>
    document
      .querySelector<HTMLElement>(`[data-tab="${tabs[nextIndex]}"]`)
      ?.focus(),
  );
};
</script>
<template>
  <div class="tabs" role="tablist" aria-label="Financial calculators">
    <button
      type="button"
      role="tab"
      data-tab="purchase"
      :class="{ selected: modelValue === 'purchase' }"
      :aria-selected="modelValue === 'purchase'"
      :tabindex="modelValue === 'purchase' ? 0 : -1"
      @keydown.left.prevent="selectRelativeTab('purchase', -1)"
      @keydown.right.prevent="selectRelativeTab('purchase', 1)"
      @keydown.home.prevent="
        selectRelativeTab('purchase', -tabs.indexOf('purchase'))
      "
      @keydown.end.prevent="selectRelativeTab('purchase', tabs.length - 1)"
      @click="emit('update:modelValue', 'purchase')"
    >
      <HandCoins :size="16" /> Big purchase</button
    ><button
      type="button"
      role="tab"
      data-tab="move"
      :class="{ selected: modelValue === 'move' }"
      :aria-selected="modelValue === 'move'"
      :tabindex="modelValue === 'move' ? 0 : -1"
      @keydown.left.prevent="selectRelativeTab('move', -1)"
      @keydown.right.prevent="selectRelativeTab('move', 1)"
      @keydown.home.prevent="selectRelativeTab('move', -tabs.indexOf('move'))"
      @keydown.end.prevent="selectRelativeTab('move', tabs.length - 1)"
      @click="emit('update:modelValue', 'move')"
    >
      <Home :size="16" /> Moving home</button
    ><button
      type="button"
      role="tab"
      data-tab="safety"
      :class="{ selected: modelValue === 'safety' }"
      :aria-selected="modelValue === 'safety'"
      :tabindex="modelValue === 'safety' ? 0 : -1"
      @keydown.left.prevent="selectRelativeTab('safety', -1)"
      @keydown.right.prevent="selectRelativeTab('safety', 1)"
      @keydown.home.prevent="
        selectRelativeTab('safety', -tabs.indexOf('safety'))
      "
      @keydown.end.prevent="selectRelativeTab('safety', tabs.length - 1)"
      @click="emit('update:modelValue', 'safety')"
    >
      <ShieldCheck :size="16" /> Safety net</button
    ><button
      type="button"
      role="tab"
      data-tab="results"
      :class="{ selected: modelValue === 'results' }"
      :aria-selected="modelValue === 'results'"
      :tabindex="modelValue === 'results' ? 0 : -1"
      @keydown.left.prevent="selectRelativeTab('results', -1)"
      @keydown.right.prevent="selectRelativeTab('results', 1)"
      @keydown.home.prevent="
        selectRelativeTab('results', -tabs.indexOf('results'))
      "
      @keydown.end.prevent="selectRelativeTab('results', 0)"
      @click="emit('update:modelValue', 'results')"
    >
      <CheckCircle2 :size="16" /> Results
    </button>
  </div>
</template>
