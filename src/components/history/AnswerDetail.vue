<script setup lang="ts">
import { computed } from 'vue';
import { X, Check, XCircle, Clock, Zap, ArrowUp, ArrowDown } from 'lucide-vue-next';
import type { GameRecord, AnswerRecord } from '@/types';

const props = defineProps<{
  record: GameRecord;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const formattedDate = computed(() => {
  const d = new Date(props.record.endTime);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}年${pad(d.getMonth() + 1)}月${pad(d.getDate())}日 ${pad(d.getHours())}:${pad(d.getMinutes())}`;
});

const accuracyPct = computed(() => Math.round(props.record.accuracy * 100));

function formatTime(ts: number): string {
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

const sortedAnswers = computed(() =>
  [...props.record.answers].sort((a, b) => a.timestamp - b.timestamp)
);

function answerHintLabel(hint: AnswerRecord['hintUsed']): string {
  if (hint === 'char') return '字提示';
  if (hint === 'sentence') return '句提示';
  return '无';
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-500/40 backdrop-blur-sm animate-fade-in" @click.self="emit('close')">
    <div
      class="relative w-full max-w-3xl max-h-[85vh] rounded-2xl bg-paper-50 bg-paper-texture shadow-paper-lg border border-paper-200/80 overflow-hidden animate-scale-in flex flex-col"
    >
      <div class="sticky top-0 z-10 flex items-start justify-between gap-4 p-5 border-b border-paper-200/70 bg-paper-50/90 backdrop-blur">
        <div class="flex-1 min-w-0">
          <div class="flex items-baseline gap-3 flex-wrap">
            <div class="font-song font-black text-3xl text-ink-400 tabular-nums">
              {{ record.finalScore }}
            </div>
            <div class="font-song text-base text-ink-100">分</div>
            <div
              class="font-song text-sm px-2.5 py-0.5 rounded-full"
              :class="accuracyPct >= 70 ? 'bg-bamboo-50 text-bamboo-500' : 'bg-vermilion-50 text-vermilion-500'"
            >
              正确率 {{ accuracyPct }}%
            </div>
          </div>
          <div class="mt-1 font-kai text-xs text-ink-100">{{ formattedDate }} · 最高连击 {{ record.maxCombo }}</div>
        </div>
        <button
          type="button"
          @click="emit('close')"
          class="shrink-0 p-2 rounded-lg hover:bg-paper-100 text-ink-200 hover:text-ink-400 transition-colors"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <div class="overflow-y-auto scrollbar-thin p-5 space-y-3">
        <div
          v-for="(ans, idx) in sortedAnswers"
          :key="idx"
          class="rounded-xl border transition-all duration-200 overflow-hidden"
          :class="ans.isCorrect ? 'border-bamboo-200/60 bg-bamboo-50/30 hover:bg-bamboo-50/50' : 'border-vermilion-200/50 bg-vermilion-50/20 hover:bg-vermilion-50/40'"
        >
          <div class="flex items-start gap-3 p-4">
            <div
              class="shrink-0 w-9 h-9 rounded-full flex items-center justify-center shadow-sm"
              :class="ans.isCorrect ? 'bg-bamboo-400 text-paper-50' : 'bg-vermilion-400 text-paper-50'"
            >
              <Check v-if="ans.isCorrect" class="w-4.5 h-4.5" />
              <XCircle v-else class="w-4.5 h-4.5" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-2 mb-2 flex-wrap">
                <div class="flex items-center gap-2">
                  <span class="font-song text-sm text-ink-100">第 {{ idx + 1 }} 题</span>
                  <span class="font-song text-xs px-2 py-0.5 rounded-full bg-paper-100 text-ink-200">
                    「{{ ans.targetChar }}」
                  </span>
                  <span
                    v-if="ans.hintUsed !== 'none'"
                    class="font-song text-xs px-2 py-0.5 rounded-full bg-paper-200/60 text-paper-500"
                  >
                    {{ answerHintLabel(ans.hintUsed) }}
                  </span>
                </div>
                <div class="flex items-center gap-1 shrink-0">
                  <span
                    class="font-song font-bold tabular-nums text-sm flex items-center gap-0.5"
                    :class="ans.scoreChange >= 0 ? 'text-bamboo-500' : 'text-vermilion-500'"
                  >
                    <ArrowUp v-if="ans.scoreChange >= 0" class="w-3 h-3" />
                    <ArrowDown v-else class="w-3 h-3" />
                    {{ Math.abs(ans.scoreChange) }}
                  </span>
                  <span class="flex items-center gap-1 font-song text-xs text-ink-100 ml-2">
                    <Clock class="w-3 h-3" />
                    {{ ans.timeSpent.toFixed(1) }}s
                  </span>
                </div>
              </div>

              <div v-if="ans.userInput" class="font-kai text-base text-ink-300 leading-relaxed mb-2 break-all">
                用户输入：<span class="text-ink-400">{{ ans.userInput }}</span>
                <template v-if="ans.correctedInput !== ans.userInput">
                  <span class="mx-1 text-paper-400">→</span>
                  <span class="text-bamboo-500">{{ ans.correctedInput }}</span>
                </template>
              </div>
              <div v-else class="font-kai text-base text-ink-100 italic mb-2">
                （未作答或超时）
              </div>

              <div
                v-if="ans.isCorrect && ans.matchedSentence"
                class="rounded-lg bg-white/60 border border-paper-200/50 p-3 animate-fade-in"
              >
                <div class="font-kai text-lg text-ink-400 leading-relaxed mb-2">
                  {{ ans.matchedSentence }}
                </div>
                <div class="font-song text-xs text-ink-100 flex items-center gap-2 flex-wrap">
                  <template v-if="ans.matchedPoemDynasty">
                    <span class="px-1.5 py-0.5 rounded bg-paper-200/60 text-ink-200">{{ ans.matchedPoemDynasty }}</span>
                  </template>
                  <template v-if="ans.matchedPoemTitle">
                    <span>《{{ ans.matchedPoemTitle }}》</span>
                  </template>
                  <template v-if="ans.matchedPoemAuthor">
                    <span class="text-ink-200">{{ ans.matchedPoemAuthor }}</span>
                  </template>
                </div>
              </div>

              <div v-if="!ans.isCorrect" class="flex items-center gap-1.5 mt-1">
                <Zap v-if="ans.scoreChange === -5 && !ans.userInput" class="w-3.5 h-3.5 text-paper-500" />
                <span class="font-kai text-xs text-ink-100">
                  {{ !ans.userInput ? '超时未作答' : '未能匹配题库诗句' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="sortedAnswers.length === 0" class="text-center py-12">
          <div class="font-kai text-ink-100 text-lg">本局暂无答题记录</div>
        </div>
      </div>
    </div>
  </div>
</template>
