<script setup lang="ts">
import { computed } from 'vue';
import { Clock } from 'lucide-vue-next';

const props = defineProps<{
  progress: number;
  remaining: number;
  total: number;
  urgent?: boolean;
  critical?: boolean;
}>();

const barClass = computed(() => {
  if (props.critical) return 'timer-critical-fill';
  if (props.urgent) return 'timer-vermilion-fill';
  return 'bg-gradient-to-r from-bamboo-400 via-bamboo-300 to-paper-400';
});

const textColor = computed(() => {
  if (props.critical) return 'text-vermilion-500';
  if (props.urgent) return 'text-vermilion-400';
  return 'text-ink-300';
});
</script>

<template>
  <div class="w-full">
    <div class="flex items-center justify-between mb-2">
      <div class="flex items-center gap-2">
        <Clock
          class="w-4 h-4 transition-colors duration-300"
          :class="[
            textColor,
            critical ? 'animate-urgent-blink' : ''
          ]"
        />
        <span class="font-song text-sm text-ink-200">余时</span>
      </div>
      <div class="flex items-baseline gap-1">
        <span
          class="font-song font-bold text-2xl tabular-nums transition-colors duration-300"
          :class="[
            textColor,
            critical ? 'animate-urgent-blink combo-score-text' : ''
          ]"
        >
          {{ String(remaining).padStart(2, '0') }}
        </span>
        <span class="font-song text-xs text-ink-100">/ {{ total }}秒</span>
      </div>
    </div>
    <div
      class="relative w-full h-3 rounded-full bg-paper-200/60 overflow-hidden shadow-inner"
      :class="critical ? 'ring-2 ring-vermilion-400/30 animate-urgent-blink' : ''"
    >
      <div
        class="absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-linear"
        :class="[barClass]"
        :style="{ width: `${progress}%` }"
      >
        <div class="absolute inset-0 bg-white/15 blur-[1px]"></div>
        <div
          v-if="critical"
          class="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"
        ></div>
      </div>
      <div
        v-if="critical"
        class="absolute inset-0 pointer-events-none"
      >
        <div class="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-transparent via-vermilion-300 to-transparent opacity-60 animate-shimmer" :style="{ left: `${Math.min(progress, 98)}%` }"></div>
      </div>
    </div>
  </div>
</template>
