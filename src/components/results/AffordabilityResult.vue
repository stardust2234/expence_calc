<script setup lang="ts">
defineProps<{
  title: string;
  score: number;
  copy: string;
  primaryLabel: string;
  primaryValue: string;
  secondaryLabel: string;
  secondaryValue: string;
  warning?: string;
}>();
const emit = defineEmits<{ (event: "save"): void }>();
</script>
<template>
  <section class="card result">
    <div class="result-top">
      <div>
        <p class="eyebrow">TOTAL CASH-FLOW SCORE</p>
        <h2>{{ title }}</h2>
      </div>
      <div class="score">
        <strong>{{ score }}</strong
        ><small>/100</small>
      </div>
    </div>
    <div class="meter"><div :style="{ width: score + '%' }" /></div>
    <p class="copy">{{ copy }}</p>
    <p class="score-note">
      Score is an estimate based on the figures entered, not financial advice.
    </p>
    <div v-if="warning" class="salary">
      <span>!</span>
      <div>
        <b>Above the 30% comfort rule</b>
        <small>{{ warning }}</small>
      </div>
    </div>
    <div v-else class="rule">
      <span>✓</span>
      <div>
        <b>Under the 30% comfort rule</b>
        <small
          >Your listed monthly costs leave room for the rest of your
          life.</small
        >
      </div>
    </div>
    <div class="breakdown">
      <div>
        <span>{{ primaryLabel }}</span
        ><b>{{ primaryValue }}</b>
      </div>
      <div>
        <span>{{ secondaryLabel }}</span
        ><b>{{ secondaryValue }}</b>
      </div>
    </div>
    <button class="save" @click="emit('save')">Save this plan ↗</button>
  </section>
</template>
