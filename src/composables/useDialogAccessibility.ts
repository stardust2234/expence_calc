import { nextTick, onBeforeUnmount, onMounted, watch, type Ref } from "vue";

const focusableSelector =
  'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])';

export function useDialogAccessibility(
  open: Ref<boolean>,
  dialog: Ref<HTMLElement | null>,
  close: () => void,
) {
  let previouslyFocused: HTMLElement | null = null;

  const focusFirst = async () => {
    await nextTick();
    dialog.value?.querySelector<HTMLElement>(focusableSelector)?.focus();
  };

  const handleKeydown = (event: KeyboardEvent) => {
    if (!open.value || !dialog.value) return;
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }
    if (event.key !== "Tab") return;

    const focusable = Array.from(
      dialog.value.querySelectorAll<HTMLElement>(focusableSelector),
    );
    if (focusable.length === 0) {
      event.preventDefault();
      dialog.value.focus();
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (!dialog.value.contains(document.activeElement)) {
      event.preventDefault();
      (event.shiftKey ? last : first).focus();
      return;
    }
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  watch(open, (isOpen) => {
    if (isOpen) {
      previouslyFocused = document.activeElement as HTMLElement | null;
      void focusFirst();
    } else if (previouslyFocused?.isConnected) {
      previouslyFocused.focus();
      previouslyFocused = null;
    }
  }, { immediate: true });
  onMounted(() => document.addEventListener("keydown", handleKeydown));
  onBeforeUnmount(() => {
    document.removeEventListener("keydown", handleKeydown);
    if (previouslyFocused?.isConnected) previouslyFocused.focus();
  });
}
