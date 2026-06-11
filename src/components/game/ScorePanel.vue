<script setup lang="ts">
import { Trophy, Zap, Target, BookOpen } from 'lucide-vue-next';
import { ref, watch, computed, h } from 'vue';

const props = defineProps<{
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

function AnimatedNumber({ value, className }: { value: number | string; className?: string }) {
  const displayValue = ref(String(value));
  const animKey = ref(0);

  watch(
    () => value,
    (newVal, oldVal) => {
      if (String(newVal) !== String(oldVal)) {
        animKey.value++;
        displayValue.value = String(newVal);
      }
    }
  );

  return () =>
    h(
      'span',
      {
        class: ['inline-block relative overflow-hidden', className],
        key: animKey.value,
      },
      [
        h(
          'span',
          {
            class: 'inline-block animate-number-roll',
            style: { display: 'inline-block' },
          },
          displayValue.value
        ),
      ]
    );
}

const accValue = computed(() => accuracy(props.correct, props.answered));
</script>

<template>
  <div class="w-full relative px-6">
    <div class="scroll-panel rounded-xl p-4 md:p-5 relative overflow-hidden shadow-paper border border-paper-200/50">
      <div class="scroll-rod scroll-rod-left"></div>
      <div class="scroll-rod scroll-rod-right"></div>

      <div class="absolute top-0 left-1/2 -translate-x-1/2 px-4 py-0.5 bg-gradient-to-r from-vermilion-500 via-vermilion-400 to-vermilion-500 text-paper-50 font-song text-xs rounded-b-md shadow-sm tracking-wider">
        卷
      </div>

      <div class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-paper-300/50 to-transparent"></div>
      <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-paper-300/50 to-transparent opacity-60"></div>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
        <div class="flex flex-col items-center text-center p-2">
          <div class="flex items-center gap-1.5 mb-1">
            <Trophy class="w-4 h-4 text-vermilion-400" />
            <span class="font-song text-xs text-ink-100 tracking-wider">得分数</span>
          </div>
          <div class="font-song text-3xl md:text-4xl font-black text-ink-400 tabular-nums leading-none perspective-800">
            <AnimatedNumber :value="score" />
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
            class="font-song text-3xl md:text-4xl font-black tabular-nums leading-none transition-colors perspective-800"
            :class="combo >= 3 ? 'text-vermilion-500 combo-score-text' : 'text-ink-400'"
          >
            <AnimatedNumber :value="combo" />
          </div>
        </div>
        <div class="flex flex-col items-center text-center p-2">
          <div class="flex items-center gap-1.5 mb-1">
            <Target class="w-4 h-4 text-bamboo-400" />
            <span class="font-song text-xs text-ink-100 tracking-wider">正确率</span>
          </div>
          <div class="font-song text-3xl md:text-4xl font-black text-ink-400 tabular-nums leading-none perspective-800">
            <AnimatedNumber :value="accValue" /><span class="text-lg font-semibold ml-0.5 text-ink-100">%</span>
          </div>
        </div>
        <div class="flex flex-col items-center text-center p-2">
          <div class="flex items-center gap-1.5 mb-1">
            <BookOpen class="w-4 h-4 text-ink-200" />
            <span class="font-song text-xs text-ink-100 tracking-wider">题次</span>
          </div>
          <div class="font-song text-3xl md:text-4xl font-black text-ink-400 tabular-nums leading-none perspective-800">
            <AnimatedNumber :value="correct" /><span class="text-lg font-semibold mx-0.5 text-ink-100">/</span><AnimatedNumber :value="answered" />
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
  </div>
</template>
