<script setup lang="ts">
import { Lightbulb, BookOpen, Lock } from 'lucide-vue-next';
import type { HintLevel } from '@/types';

const props = defineProps<{
  currentLevel: HintLevel;
  charHint: string;
  sentenceHint: string;
  score?: number;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  (e: 'char-hint'): void;
  (e: 'sentence-hint'): void;
}>();

const charHintCost = -3;
const sentenceHintCost = -8;

function canAfford(cost: number): boolean {
  return (props.score ?? 999) >= Math.abs(cost) || (props.score ?? 0) >= 0;
}
</script>

<template>
  <div class="w-full space-y-3">
    <div
      class="card-paper p-4 transition-all duration-300"
      :class="currentLevel !== 'none' ? 'border-bamboo-300/70 bg-bamboo-50/30' : ''"
    >
      <div class="flex items-center justify-between mb-2">
        <div class="flex items-center gap-2">
          <div
            class="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            :class="currentLevel !== 'none' ? 'bg-bamboo-400 text-paper-50' : 'bg-paper-200/60 text-ink-200'"
          >
            <Lightbulb class="w-4 h-4" />
          </div>
          <div>
            <div class="font-song text-sm font-semibold text-ink-400">字提示</div>
            <div class="font-kai text-xs text-ink-100">揭示该字相邻字的位置</div>
          </div>
        </div>
        <button
          type="button"
          @click="emit('char-hint')"
          :disabled="disabled || currentLevel !== 'none'"
          class="shrink-0 px-3 py-2 rounded-lg border text-sm font-song transition-all duration-200 flex items-center gap-1.5"
          :class="[
            currentLevel !== 'none'
              ? 'border-bamboo-200 bg-bamboo-50 text-bamboo-500 cursor-default'
              : 'border-paper-300 bg-paper-50 text-ink-300 hover:border-bamboo-300 hover:bg-bamboo-50 hover:text-bamboo-500 hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0'
          ]"
        >
          <Lock v-if="currentLevel === 'none'" class="w-3.5 h-3.5" />
          <span>{{ currentLevel !== 'none' ? '已解锁' : `消耗 ${charHintCost} 分` }}</span>
        </button>
      </div>
      <div
        v-if="currentLevel !== 'none' && charHint"
        class="mt-3 p-3 rounded-lg bg-paper-50 border border-paper-200/60 animate-fade-in"
      >
        <div class="font-song text-xs text-ink-100 mb-1.5">相邻字暗示（○ 代表其他字）</div>
        <div class="font-kai text-2xl text-ink-400 tracking-[0.5em] text-center">
          {{ charHint }}
        </div>
      </div>
    </div>

    <div
      class="card-paper p-4 transition-all duration-300"
      :class="currentLevel === 'sentence' ? 'border-vermilion-300/60 bg-vermilion-50/20' : ''"
    >
      <div class="flex items-center justify-between mb-2">
        <div class="flex items-center gap-2">
          <div
            class="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            :class="currentLevel === 'sentence' ? 'bg-vermilion-400 text-paper-50' : 'bg-paper-200/60 text-ink-200'"
          >
            <BookOpen class="w-4 h-4" />
          </div>
          <div>
            <div class="font-song text-sm font-semibold text-ink-400">句提示</div>
            <div class="font-kai text-xs text-ink-100">直接揭示一句完整诗句</div>
          </div>
        </div>
        <button
          type="button"
          @click="emit('sentence-hint')"
          :disabled="disabled || currentLevel === 'sentence'"
          class="shrink-0 px-3 py-2 rounded-lg border text-sm font-song transition-all duration-200 flex items-center gap-1.5"
          :class="[
            currentLevel === 'sentence'
              ? 'border-vermilion-200 bg-vermilion-50 text-vermilion-500 cursor-default'
              : 'border-paper-300 bg-paper-50 text-ink-300 hover:border-vermilion-300 hover:bg-vermilion-50/40 hover:text-vermilion-500 hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0'
          ]"
        >
          <Lock v-if="currentLevel !== 'sentence'" class="w-3.5 h-3.5" />
          <span>{{ currentLevel === 'sentence' ? '已解锁' : `消耗 ${sentenceHintCost} 分` }}</span>
        </button>
      </div>
      <div
        v-if="currentLevel === 'sentence' && sentenceHint"
        class="mt-3 p-3 rounded-lg bg-paper-50 border border-paper-200/60 animate-fade-in"
      >
        <div class="font-song text-xs text-ink-100 mb-1.5">参考诗句</div>
        <div class="font-kai text-xl text-ink-400 leading-relaxed text-center">
          {{ sentenceHint }}
        </div>
      </div>
    </div>
  </div>
</template>
