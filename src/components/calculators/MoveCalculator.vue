<script setup lang="ts">
import { Home } from "lucide-vue-next";
defineProps<{
  rent: number;
  moving: number;
  furnishings: number;
  utilities: number;
}>();
const emit = defineEmits<{
  (
    e:
      | "update:rent"
      | "update:moving"
      | "update:furnishings"
      | "update:utilities",
    value: number,
  ): void;
}>();
</script>
<template>
  <div class="heading">
    <div>
      <h2><Home :size="20" /> What will moving cost?</h2>
      <p>Plan the upfront and ongoing cost of a new place.</p>
    </div>
  </div>
  <label for="monthly-rent"
    >Monthly rent<input
      id="monthly-rent"
      :value="rent"
      type="number"
      min="0"
      max="1000000000"
      @input="
        emit('update:rent', Number(($event.target as HTMLInputElement).value))
      "
    />
    <span>£</span>
  </label>
  <div class="two">
    <label for="moving-costs"
      >Moving costs<input
        id="moving-costs"
        :value="moving"
        type="number"
        min="0"
        max="1000000000"
        @input="
          emit(
            'update:moving',
            Number(($event.target as HTMLInputElement).value),
          )
        "
      />
      <span>£</span>
    </label>
    <label for="furniture-setup"
      >Furniture &amp; setup<input
        id="furniture-setup"
        :value="furnishings"
        type="number"
        min="0"
        max="1000000000"
        @input="
          emit(
            'update:furnishings',
            Number(($event.target as HTMLInputElement).value),
          )
        "
      />
      <span>£</span>
    </label>
  </div>
  <label for="monthly-utilities"
    >Utilities &amp; other monthly costs<input
      id="monthly-utilities"
      :value="utilities"
      type="number"
      min="0"
      max="1000000000"
      @input="
        emit(
          'update:utilities',
          Number(($event.target as HTMLInputElement).value),
        )
      "
    />
    <span>£</span>
  </label>
</template>
