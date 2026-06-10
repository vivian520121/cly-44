import { ref, computed, onUnmounted, watch } from 'vue';

export interface UseTimerOptions {
  initialSeconds?: number;
  autoStart?: boolean;
  onTick?: (remaining: number) => void;
  onComplete?: () => void;
}

export function useTimer(options: UseTimerOptions = {}) {
  const {
    initialSeconds = 30,
    autoStart = false,
    onTick,
    onComplete,
  } = options;

  const totalSeconds = ref(initialSeconds);
  const remaining = ref(initialSeconds);
  const isRunning = ref(false);
  const isPaused = ref(false);
  let intervalId: number | null = null;

  const progress = computed(() => {
    if (totalSeconds.value <= 0) return 0;
    return Math.max(0, Math.min(100, (remaining.value / totalSeconds.value) * 100));
  });

  const isUrgent = computed(() => remaining.value <= 10 && remaining.value > 0);
  const isCritical = computed(() => remaining.value <= 5 && remaining.value > 0);
  const isComplete = computed(() => remaining.value <= 0 && !isRunning.value);

  function clearTimer() {
    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  function start(seconds?: number) {
    clearTimer();
    if (seconds !== undefined) {
      totalSeconds.value = seconds;
      remaining.value = seconds;
    } else {
      remaining.value = totalSeconds.value;
    }
    isRunning.value = true;
    isPaused.value = false;

    intervalId = window.setInterval(() => {
      if (isPaused.value) return;
      remaining.value -= 1;
      onTick?.(remaining.value);
      if (remaining.value <= 0) {
        stop();
        onComplete?.();
      }
    }, 1000);
  }

  function stop() {
    clearTimer();
    isRunning.value = false;
    isPaused.value = false;
  }

  function pause() {
    if (isRunning.value && !isPaused.value) {
      isPaused.value = true;
    }
  }

  function resume() {
    if (isRunning.value && isPaused.value) {
      isPaused.value = false;
    }
  }

  function reset(seconds?: number) {
    clearTimer();
    if (seconds !== undefined) {
      totalSeconds.value = seconds;
    }
    remaining.value = totalSeconds.value;
    isRunning.value = false;
    isPaused.value = false;
  }

  function addSeconds(seconds: number) {
    remaining.value = Math.max(0, Math.min(totalSeconds.value, remaining.value + seconds));
  }

  watch(remaining, (val) => {
    if (val <= 0) {
      clearTimer();
    }
  });

  onUnmounted(() => {
    clearTimer();
  });

  if (autoStart) {
    start();
  }

  return {
    remaining,
    totalSeconds,
    progress,
    isRunning,
    isPaused,
    isUrgent,
    isCritical,
    isComplete,
    start,
    stop,
    pause,
    resume,
    reset,
    addSeconds,
  };
}
