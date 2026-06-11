<script setup lang="ts">
import { ref, computed } from 'vue';
import { useHistory } from '@/composables/useHistory';
import NavBar from '@/components/layout/NavBar.vue';
import RecordCard from '@/components/history/RecordCard.vue';
import AnswerDetail from '@/components/history/AnswerDetail.vue';
import InsightTab from '@/components/history/InsightTab.vue';
import { Trophy, Target, Zap, Gamepad2, Trash2, Inbox, Sparkles, Scroll, BarChart3 } from 'lucide-vue-next';
import type { GameRecord } from '@/types';

const history = useHistory();

const activeTab = ref<'records' | 'insight'>('records');

const selectedId = ref<string | null>(null);

const selectedRecord = computed(() =>
  selectedId.value ? history.getRecord(selectedId.value) : undefined
);

const sortedRecords = computed(() => {
  return [...history.sortedRecords.value];
});

const recordsByScore = computed(() =>
  [...history.records.value].sort((a, b) => b.finalScore - a.finalScore)
);

const topThree = computed(() => {
  const result: (GameRecord & { rank: number })[] = [];
  const used = new Set<string>();
  let rank = 1;
  for (const r of recordsByScore.value) {
    if (used.has(r.id)) continue;
    used.add(r.id);
    result.push({ ...r, rank });
    rank++;
    if (rank > 3) break;
  }
  return result;
});

function handleView(id: string) {
  selectedId.value = id;
}

function handleDelete(id: string) {
  if (confirm('确定要删除这条对局记录吗？此操作无法撤销。')) {
    history.deleteRecord(id);
    if (selectedId.value === id) {
      selectedId.value = null;
    }
  }
}

function handleClearAll() {
  if (confirm('确定要清空所有对局记录吗？此操作无法撤销！')) {
    history.clearAll();
    selectedId.value = null;
  }
}

const avgAccPct = computed(() => Math.round(history.averageAccuracy.value * 100));
</script>

<template>
  <div class="min-h-screen">
    <NavBar />

    <main class="container mx-auto px-4 py-6 md:py-10 max-w-6xl">
      <div class="mb-8 animate-fade-in-up">
        <div class="flex items-end justify-between gap-4 mb-6 flex-wrap">
          <div>
            <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-bamboo-50 border border-bamboo-200/60 text-bamboo-500 font-song text-xs mb-4">
              <Sparkles class="w-3.5 h-3.5" />
              <span>历史对局</span>
            </div>
            <h1 class="font-song font-black text-3xl md:text-5xl text-ink-400 tracking-wider mb-2">
              对局录
            </h1>
            <p class="font-kai text-ink-200 text-base md:text-lg">
              往昔吟咏犹在耳，温故知新再启程
            </p>
          </div>
          <div class="flex items-center gap-2">
            <button
              v-if="history.totalGames.value > 0"
              type="button"
              @click="handleClearAll"
              class="px-4 py-2 rounded-lg border border-vermilion-200/70 bg-vermilion-50/60 text-vermilion-500 font-song text-sm
                     transition-all duration-200 hover:bg-vermilion-50 hover:-translate-y-0.5 flex items-center gap-2"
            >
              <Trash2 class="w-4 h-4" />
              <span>清空记录</span>
            </button>
            <button
              type="button"
              router-link="/game"
              class="btn-primary px-5 py-2.5 flex items-center gap-2"
            >
              <Gamepad2 class="w-4.5 h-4.5" />
              <span>开始新局</span>
            </button>
          </div>
        </div>

        <div v-if="history.totalGames.value > 0" class="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in">
          <div class="card-paper p-4 md:p-5 relative overflow-hidden">
            <div class="flex items-center gap-2 text-vermilion-400 mb-2">
              <Trophy class="w-5 h-5" />
              <span class="font-song text-xs tracking-wider text-ink-200">最高得分</span>
            </div>
            <div class="font-song font-black text-3xl md:text-4xl text-ink-400 tabular-nums leading-none">
              {{ history.bestScore.value }}
            </div>
            <div class="font-kai text-xs text-ink-100 mt-2">分</div>
            <div class="absolute -right-4 -top-4 w-20 h-20 bg-vermilion-400/5 rounded-full"></div>
          </div>

          <div class="card-paper p-4 md:p-5 relative overflow-hidden">
            <div class="flex items-center gap-2 text-bamboo-400 mb-2">
              <Target class="w-5 h-5" />
              <span class="font-song text-xs tracking-wider text-ink-200">平均正确率</span>
            </div>
            <div class="font-song font-black text-3xl md:text-4xl text-ink-400 tabular-nums leading-none">
              {{ avgAccPct }}<span class="text-lg font-semibold ml-0.5 text-ink-100">%</span>
            </div>
            <div class="font-kai text-xs text-ink-100 mt-2">共 {{ history.totalGames.value }} 局</div>
            <div class="absolute -right-4 -top-4 w-20 h-20 bg-bamboo-400/5 rounded-full"></div>
          </div>

          <div class="card-paper p-4 md:p-5 relative overflow-hidden">
            <div class="flex items-center gap-2 text-paper-500 mb-2">
              <Zap class="w-5 h-5" />
              <span class="font-song text-xs tracking-wider text-ink-200">平均最高连击</span>
            </div>
            <div class="font-song font-black text-3xl md:text-4xl text-ink-400 tabular-nums leading-none">
              {{ history.averageMaxCombo.value }}
            </div>
            <div class="font-kai text-xs text-ink-100 mt-2">次连击</div>
            <div class="absolute -right-4 -top-4 w-20 h-20 bg-paper-400/10 rounded-full"></div>
          </div>

          <div class="card-paper p-4 md:p-5 relative overflow-hidden">
            <div class="flex items-center gap-2 text-ink-200 mb-2">
              <Gamepad2 class="w-5 h-5" />
              <span class="font-song text-xs tracking-wider text-ink-200">累计得分</span>
            </div>
            <div class="font-song font-black text-3xl md:text-4xl text-ink-400 tabular-nums leading-none">
              {{ history.totalScore.value.toLocaleString() }}
            </div>
            <div class="font-kai text-xs text-ink-100 mt-2">分</div>
            <div class="absolute -right-4 -top-4 w-20 h-20 bg-ink-400/5 rounded-full"></div>
          </div>
        </div>

        <div v-if="topThree.length >= 2" class="mt-6 card-paper p-6 animate-fade-in-up">
          <div class="font-song text-sm font-semibold text-ink-300 mb-4 flex items-center gap-2">
            <Trophy class="w-4 h-4 text-vermilion-400" />
            <span>排行榜 · 按分数排序 Top 3</span>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              v-for="r in topThree"
              :key="r.id"
              class="relative p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-paper"
              :class="[
                r.rank === 1 ? 'border-vermilion-300/70 bg-vermilion-50/40' :
                r.rank === 2 ? 'border-paper-300/70 bg-paper-50' :
                'border-bamboo-300/60 bg-bamboo-50/40'
              ]"
              @click="handleView(r.id)"
            >
              <div
                class="absolute -top-3 left-4 w-10 h-10 rounded-full flex items-center justify-center font-song font-black text-white shadow-md"
                :class="[
                  r.rank === 1 ? 'bg-vermilion-400' :
                  r.rank === 2 ? 'bg-paper-500' :
                  'bg-bamboo-400'
                ]"
              >
                {{ r.rank }}
              </div>
              <div class="mt-3">
                <div
                  class="font-song font-black text-3xl tabular-nums mb-1"
                  :class="r.rank === 1 ? 'text-vermilion-500' : 'text-ink-400'"
                >
                  {{ r.finalScore }}
                </div>
                <div class="font-kai text-xs text-ink-100 mb-3">分</div>
                <div class="flex items-center gap-3 font-song text-xs text-ink-200 flex-wrap">
                  <span>正确 {{ r.correctCount }}/{{ r.totalQuestions }}</span>
                  <span class="text-paper-300">·</span>
                  <span>连击 {{ r.maxCombo }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="history.totalGames.value === 0" class="text-center py-20 animate-fade-in">
        <div class="w-24 h-24 mx-auto mb-6 rounded-full bg-paper-200/50 flex items-center justify-center">
          <Inbox class="w-12 h-12 text-paper-400" />
        </div>
        <h3 class="font-song text-xl text-ink-200 mb-3">暂无对局记录</h3>
        <p class="font-kai text-ink-100 mb-8">开启你的第一场飞花令吧</p>
        <button type="button" router-link="/game" class="btn-primary px-8 py-3.5 inline-flex items-center gap-2">
          <Gamepad2 class="w-5 h-5" />
          <span>开始游戏</span>
        </button>
      </div>

      <div v-else>
        <div class="flex items-center gap-1 mb-6 p-1 bg-paper-100 rounded-xl border border-paper-200/50 w-fit">
          <button
            type="button"
            @click="activeTab = 'records'"
            class="flex items-center gap-1.5 px-4 py-2 rounded-lg font-song text-sm transition-all duration-200"
            :class="activeTab === 'records'
              ? 'bg-paper-50 text-ink-400 shadow-paper border border-paper-200/60'
              : 'text-ink-200 hover:text-ink-300 border border-transparent'"
          >
            <Scroll class="w-4 h-4" />
            <span>对局记录</span>
          </button>
          <button
            type="button"
            @click="activeTab = 'insight'"
            class="flex items-center gap-1.5 px-4 py-2 rounded-lg font-song text-sm transition-all duration-200"
            :class="activeTab === 'insight'
              ? 'bg-paper-50 text-ink-400 shadow-paper border border-paper-200/60'
              : 'text-ink-200 hover:text-ink-300 border border-transparent'"
          >
            <BarChart3 class="w-4 h-4" />
            <span>学情洞察</span>
          </button>
        </div>

        <Transition
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="opacity-0 translate-y-2"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
          mode="out-in"
        >
          <div v-if="activeTab === 'records'" key="records" class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <RecordCard
              v-for="(record, idx) in sortedRecords"
              :key="record.id"
              :record="record"
              :rank="undefined"
              @view="handleView"
              @delete="handleDelete"
            />
          </div>
          <div v-else key="insight">
            <InsightTab />
          </div>
        </Transition>
      </div>
    </main>

    <AnswerDetail
      v-if="selectedRecord"
      :record="selectedRecord"
      @close="selectedId = null"
    />

    <footer class="mt-16 pb-8 text-center">
      <p class="font-kai text-xs text-ink-100/80 tracking-wider">
        诗词飞花令 · 传承千古文脉 · 共赏雅韵流芳
      </p>
    </footer>
  </div>
</template>
