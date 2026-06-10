<script setup lang="ts">
import { computed } from 'vue';
import { Trophy, Target, Zap, Clock, ChevronRight, Trash2, Eye } from 'lucide-vue-next';
import type { GameRecord } from '@/types';

const props = defineProps<{
  record: GameRecord;
  rank?: number;
}>();

const emit = defineEmits<{
  (e: 'view', id: string): void;
  (e: 'delete', id: string): void;
}>();

const formattedDate = computed(() => {
  const d = new Date(props.record.endTime);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
});

const duration = computed(() => {
  const sec = Math.round((props.record.endTime - props.record.startTime) / 1000);
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m > 0 ? `${m}分${s}秒` : `${s}秒`;
});

const accuracyPct = computed(() => Math.round(props.record.accuracy * 100));

const rankColors = [
  'bg-vermilion-400 text-paper-50',
  'bg-paper-400 text-paper-50',
  'bg-bamboo-300 text-paper-50',
];
</script>

<template>
  <div
    class="card-paper p-5 transition-all duration-300 hover:shadow-paper-lg hover:-translate-y-0.5 cursor-pointer group relative overflow-hidden"
    @click="emit('view', record.id)"
  >
    <div
      v-if="rank !== undefined && rank <= 3"
      class="absolute top-0 right-0 w-16 h-16 overflow-hidden pointer-events-none"
    >
      <div
        class="absolute top-3 right-[-32px] w-[120px] py-1 text-center font-song text-xs font-bold rotate-45 shadow-sm"
        :class="rankColors[rank - 1]"
      >
        第 {{ rank }} 名
      </div>
    </div>

    <div class="flex items-start justify-between gap-4 mb-4">
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 mb-1.5 flex-wrap">
          <div
            class="font-song font-black text-3xl tabular-nums transition-colors group-hover:text-vermilion-500"
            :class="record.finalScore >= 0 ? 'text-ink-400' : 'text-vermilion-500'"
          >
            {{ record.finalScore }}
          </div>
          <div class="font-song text-sm text-ink-100 pb-1">分</div>
        </div>
        <div class="flex items-center gap-3 font-song text-xs text-ink-100">
          <span class="flex items-center gap-1">
            <Clock class="w-3 h-3" />
            {{ formattedDate }}
          </span>
          <span class="text-paper-300">·</span>
          <span>{{ duration }}</span>
        </div>
      </div>
      <div class="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          @click.stop="emit('view', record.id)"
          class="p-2 rounded-lg hover:bg-paper-100 text-ink-200 hover:text-bamboo-500 transition-colors"
          title="查看详情"
        >
          <Eye class="w-4 h-4" />
        </button>
        <button
          type="button"
          @click.stop="emit('delete', record.id)"
          class="p-2 rounded-lg hover:bg-vermilion-50 text-ink-200 hover:text-vermilion-500 transition-colors"
          title="删除记录"
        >
          <Trash2 class="w-4 h-4" />
        </button>
      </div>
    </div>

    <div class="grid grid-cols-3 gap-3 pt-4 border-t border-paper-200/60">
      <div class="flex flex-col items-center text-center">
        <div class="flex items-center gap-1 mb-1 text-ink-100">
          <Target class="w-3.5 h-3.5" />
          <span class="font-song text-[11px]">正确率</span>
        </div>
        <div
          class="font-song text-xl font-bold tabular-nums"
          :class="accuracyPct >= 70 ? 'text-bamboo-500' : accuracyPct >= 40 ? 'text-paper-500' : 'text-vermilion-400'"
        >
          {{ accuracyPct }}%
        </div>
        <div class="font-kai text-[10px] text-ink-100 mt-0.5">
          {{ record.correctCount }}/{{ record.totalQuestions }}
        </div>
      </div>
      <div class="flex flex-col items-center text-center">
        <div class="flex items-center gap-1 mb-1 text-ink-100">
          <Zap class="w-3.5 h-3.5" />
          <span class="font-song text-[11px]">最高连击</span>
        </div>
        <div
          class="font-song text-xl font-bold tabular-nums"
          :class="record.maxCombo >= 5 ? 'text-vermilion-500' : 'text-ink-400'"
        >
          {{ record.maxCombo }}
        </div>
      </div>
      <div class="flex flex-col items-center text-center">
        <div class="flex items-center gap-1 mb-1 text-ink-100">
          <Trophy class="w-3.5 h-3.5" />
          <span class="font-song text-[11px]">答题数</span>
        </div>
        <div class="font-song text-xl font-bold tabular-nums text-ink-400">
          {{ record.totalQuestions }}
        </div>
      </div>
    </div>

    <div class="mt-4 flex items-center justify-end text-vermilion-400 font-song text-xs opacity-0 group-hover:opacity-100 transition-opacity">
      查看详情
      <ChevronRight class="w-4 h-4 ml-0.5" />
    </div>
  </div>
</template>
