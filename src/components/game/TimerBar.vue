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

const barColor = computed(() => {
  if (props.critical) return 'from-vermilion-500 via-vermilion-400 to-vermilion-300';
  if (props.urgent) return 'from-vermilion-400 via-vermilion-300 to-paper-400';
  return 'from-bamboo-400 via-bamboo-300 to-paper-400';
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
            critical ? 'animate-shimmer' : ''
          ]"
        />
        <span class="font-song text-sm text-ink-200">余时</span>
      </div>
      <div class="flex items-baseline gap-1">
        <span
          class="font-song font-bold text-2xl tabular-nums transition-colors duration-300"
          :class="[
            textColor,
            critical ? 'animate-shimmer' : ''
          ]"
        >
          {{ String(remaining).padStart(2, '0') }}
        </span>
        <span class="font-song text-xs text-ink-100">/ {{ total }}秒</span>
      </div>
    </div>
    <div class="relative w-full h-2.5 rounded-full bg-paper-200/60 overflow-hidden">
      <div
        class="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r transition-all duration-1000 ease-linear"
        :class="[
          barColor,
          critical ? 'animate-shimmer' : ''
        ]"
        :style="{ width: `${progress}%` }"
      >
        <div class="absolute inset-0 bg-white/20 blur-[1px]"></div>
      </div>
    </div>
  </div>
</template>
