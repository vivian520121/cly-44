<script setup lang="ts">
import { Trophy, Zap, Target, BookOpen } from 'lucide-vue-next';

defineProps<{
  score: number;
  combo: number;
  answered: number;
  correct: number;
  hintsUsed?: number;
}>();

function accuracy(correct: number, answered: number): string {
  if (answered === 0) return '0';
  return Math.round((correct / answered) * 100).toString();
}
</script>

<template>
  <div class="w-full card-paper p-4 md:p-5 relative overflow-hidden">
    <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-vermilion-400 via-paper-400 to-bamboo-400 opacity-60"></div>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="flex flex-col items-center text-center p-2">
        <div class="flex items-center gap-1.5 mb-1">
          <Trophy class="w-4 h-4 text-vermilion-400" />
          <span class="font-song text-xs text-ink-100 tracking-wider">得分数</span>
        </div>
        <div class="font-song text-3xl md:text-4xl font-black text-ink-400 tabular-nums leading-none">
          {{ score }}
        </div>
      </div>
      <div class="flex flex-col items-center text-center p-2">
        <div class="flex items-center gap-1.5 mb-1">
          <Zap
            class="w-4 h-4 transition-colors"
            :class="combo >= 3 ? 'text-vermilion-500 animate-pulse-glow' : 'text-paper-400'"
          />
          <span class="font-song text-xs text-ink-100 tracking-wider">连击数</span>
        </div>
        <div
          class="font-song text-3xl md:text-4xl font-black tabular-nums leading-none transition-colors"
          :class="combo >= 3 ? 'text-vermilion-500' : 'text-ink-400'"
        >
          {{ combo }}
        </div>
      </div>
      <div class="flex flex-col items-center text-center p-2">
        <div class="flex items-center gap-1.5 mb-1">
          <Target class="w-4 h-4 text-bamboo-400" />
          <span class="font-song text-xs text-ink-100 tracking-wider">正确率</span>
        </div>
        <div class="font-song text-3xl md:text-4xl font-black text-ink-400 tabular-nums leading-none">
          {{ accuracy(correct, answered) }}<span class="text-lg font-semibold ml-0.5 text-ink-100">%</span>
        </div>
      </div>
      <div class="flex flex-col items-center text-center p-2">
        <div class="flex items-center gap-1.5 mb-1">
          <BookOpen class="w-4 h-4 text-ink-200" />
          <span class="font-song text-xs text-ink-100 tracking-wider">题次</span>
        </div>
        <div class="font-song text-3xl md:text-4xl font-black text-ink-400 tabular-nums leading-none">
          {{ correct }}<span class="text-lg font-semibold mx-0.5 text-ink-100">/</span>{{ answered }}
        </div>
      </div>
    </div>
    <div
      v-if="hintsUsed !== undefined && hintsUsed > 0"
      class="mt-3 pt-3 border-t border-paper-200/60 text-center"
    >
      <span class="font-kai text-xs text-ink-100">
        本局已用提示 · <span class="text-paper-400 font-semibold">{{ hintsUsed }}</span> 次
      </span>
    </div>
  </div>
</template>
