<script setup lang="ts">
import { CheckCircle2, HandCoins, Home, ShieldCheck } from "lucide-vue-next";
defineProps<{ modelValue: "purchase" | "move" | "safety" | "results" }>();
const emit = defineEmits<{
  (
    e: "update:modelValue",
    value: "purchase" | "move" | "safety" | "results",
  ): void;
}>();
</script>
<template>
  <div class="tabs">
    <button
      :class="{ selected: modelValue === 'purchase' }"
      @click="emit('update:modelValue', 'purchase')"
    >
      <HandCoins :size="16" /> Big purchase</button
    ><button
      :class="{ selected: modelValue === 'move' }"
      @click="emit('update:modelValue', 'move')"
    >
      <Home :size="16" /> Moving home</button
    ><button
      :class="{ selected: modelValue === 'safety' }"
      @click="emit('update:modelValue', 'safety')"
    >
      <ShieldCheck :size="16" /> Safety net</button
    ><button
      :class="{ selected: modelValue === 'results' }"
      @click="emit('update:modelValue', 'results')"
    >
      <CheckCircle2 :size="16" /> Results
    </button>
  </div>
</template>
