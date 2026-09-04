import { onMounted, ref, watch, type Ref } from "vue";
import { sanitizeNumber } from "../calculations";

type PersistedValues = Record<string, Ref<unknown>>;
type ExtraCost = { id: number; name: string; amount: number };

export function usePersistence(
  storageKey: string,
  values: PersistedValues,
  extraCosts: Ref<ExtraCost[]>,
  notify: (message: string) => void,
) {
  const skipNextSave = ref(false);
  const snapshot = () => ({
    ...Object.fromEntries(
      Object.entries(values).map(([key, refValue]) => [key, refValue.value]),
    ),
    extraCosts: extraCosts.value,
  });
  const save = (message = "Plan saved on this device.") => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(snapshot()));
      notify(message);
    } catch {
      notify("Could not save on this device.");
    }
  };
  const clear = () => {
    try {
      localStorage.removeItem(storageKey);
      skipNextSave.value = true;
      // Ensure any already-queued reactive save cannot restore the cleared snapshot.
      setTimeout(() => localStorage.removeItem(storageKey), 0);
      notify("Saved data cleared from this device.");
    } catch {
      notify("Could not clear saved data.");
    }
  };
  onMounted(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(storageKey) || "null");
      if (!stored) return;
      Object.entries(stored).forEach(([key, value]) => {
        if (key === "extraCosts" && Array.isArray(value)) {
          extraCosts.value = value as ExtraCost[];
        } else if (key in values) {
          const target = values[key];
          target.value =
            typeof target.value === "number"
              ? sanitizeNumber(value as number)
              : value;
        }
      });
    } catch {
      notify("Saved data could not be loaded.");
    }
  });
  watch(
    [...Object.values(values), extraCosts],
    () => {
      if (skipNextSave.value) {
        skipNextSave.value = false;
        return;
      }
      try {
        localStorage.setItem(storageKey, JSON.stringify(snapshot()));
      } catch {}
    },
    { deep: true },
  );
  return { save, clear };
}
