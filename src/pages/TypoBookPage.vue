<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useTypoBook } from '@/composables/useTypoBook';
import NavBar from '@/components/layout/NavBar.vue';
import InkBorder from '@/components/layout/InkBorder.vue';
import {
  BookOpen, AlertCircle, Trash2, Inbox, ArrowLeft,
  Play, BarChart2, Clock, X, ChevronDown, ChevronRight,
  Scroll, Sparkles
} from 'lucide-vue-next';
import type { TypoCharStats } from '@/types';

const router = useRouter();
const typoBook = useTypoBook();

const expandedChar = ref<string | null>(null);
const expandedPoemId = ref<number | null>(null);
const sortMode = ref<'count' | 'recent'>('count');

const sortedChars = computed(() => {
  return sortMode.value === 'count'
    ? typoBook.charStats.value
    : typoBook.sortedByRecent.value;
});

function toggleChar(char: string) {
  expandedChar.value = expandedChar.value === char ? null : char;
  expandedPoemId.value = null;
}

function togglePoem(poemId: number) {
  expandedPoemId.value = expandedPoemId.value === poemId ? null : poemId;
}

function handlePracticeChar(char: string) {
  typoBook.startPracticeForChar(char, router);
}

function handleRemoveChar(char: string) {
  if (confirm(`确定要移除所有关于「${char}」的错字记录吗？此操作无法撤销。`)) {
    typoBook.removeChar(char);
    if (expandedChar.value === char) {
      expandedChar.value = null;
    }
  }
}

function handleClearAll() {
  if (confirm('确定要清空所有错字本记录吗？此操作无法撤销！')) {
    typoBook.clearAll();
    expandedChar.value = null;
    expandedPoemId.value = null;
  }
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - ts;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return '刚刚';
  if (diffMins < 60) return `${diffMins}分钟前`;
  if (diffHours < 24) return `${diffHours}小时前`;
  if (diffDays < 30) return `${diffDays}天前`;
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function highlightChar(sentence: string, char: string): string {
  return sentence.split('').map(ch =>
    ch === char ? `<mark class="bg-vermilion-100 text-vermilion-500 px-0.5 rounded">${ch}</mark>` : ch
  ).join('');
}

const poemsForExpandedChar = computed(() => {
  if (!expandedChar.value) return [];
  return typoBook.getPoemsForChar(expandedChar.value).slice(0, 20);
});

const statsForExpandedChar = computed<TypoCharStats | undefined>(() => {
  if (!expandedChar.value) return undefined;
  return typoBook.getStatsForChar(expandedChar.value);
});
</script>

<template>
  <div class="min-h-screen">
    <NavBar />

    <main class="container mx-auto px-4 py-6 md:py-10 max-w-6xl">
      <div class="mb-8 animate-fade-in-up">
        <div class="flex items-end justify-between gap-4 mb-6 flex-wrap">
          <div>
            <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-vermilion-50 border border-vermilion-200/60 text-vermilion-500 font-song text-xs mb-4">
              <AlertCircle class="w-3.5 h-3.5" />
              <span>错字本</span>
            </div>
            <h1 class="font-song font-black text-3xl md:text-5xl text-ink-400 tracking-wider mb-2">
              错字本
            </h1>
            <p class="font-kai text-ink-200 text-base md:text-lg">
              记录答错与待修正之字，温故知新，精益求精
            </p>
          </div>
          <div class="flex items-center gap-2">
            <button
              v-if="typoBook.totalEntries.value > 0"
              type="button"
              @click="handleClearAll"
              class="px-4 py-2 rounded-lg border border-vermilion-200/70 bg-vermilion-50/60 text-vermilion-500 font-song text-sm
                     transition-all duration-200 hover:bg-vermilion-50 hover:-translate-y-0.5 flex items-center gap-2"
            >
              <Trash2 class="w-4 h-4" />
              <span>清空错字本</span>
            </button>
            <button
              type="button"
              @click="router.push('/history')"
              class="px-4 py-2 rounded-lg border border-paper-300/70 bg-paper-50 text-ink-200 font-song text-sm
                     transition-all duration-200 hover:bg-paper-100 hover:-translate-y-0.5 flex items-center gap-2"
            >
              <ArrowLeft class="w-4 h-4" />
              <span>返回</span>
            </button>
          </div>
        </div>

        <div v-if="typoBook.totalEntries.value > 0" class="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in">
          <div class="card-paper p-4 md:p-5 relative overflow-hidden">
            <div class="flex items-center gap-2 text-vermilion-400 mb-2">
              <AlertCircle class="w-5 h-5" />
              <span class="font-song text-xs tracking-wider text-ink-200">累计错字</span>
            </div>
            <div class="font-song font-black text-3xl md:text-4xl text-ink-400 tabular-nums leading-none">
              {{ typoBook.totalEntries.value }}
            </div>
            <div class="font-kai text-xs text-ink-100 mt-2">次记录</div>
            <div class="absolute -right-4 -top-4 w-20 h-20 bg-vermilion-400/5 rounded-full"></div>
          </div>

          <div class="card-paper p-4 md:p-5 relative overflow-hidden">
            <div class="flex items-center gap-2 text-bamboo-400 mb-2">
              <BookOpen class="w-5 h-5" />
              <span class="font-song text-xs tracking-wider text-ink-200">涉及令字</span>
            </div>
            <div class="font-song font-black text-3xl md:text-4xl text-ink-400 tabular-nums leading-none">
              {{ typoBook.uniqueChars.value }}
            </div>
            <div class="font-kai text-xs text-ink-100 mt-2">个汉字</div>
            <div class="absolute -right-4 -top-4 w-20 h-20 bg-bamboo-400/5 rounded-full"></div>
          </div>

          <div class="card-paper p-4 md:p-5 relative overflow-hidden">
            <div class="flex items-center gap-2 text-paper-500 mb-2">
              <BarChart2 class="w-5 h-5" />
              <span class="font-song text-xs tracking-wider text-ink-200">高频错字</span>
            </div>
            <div class="font-song font-black text-2xl md:text-3xl text-ink-400 leading-none truncate">
              {{ typoBook.charStats.value[0]?.char || '—' }}
            </div>
            <div class="font-kai text-xs text-ink-100 mt-2">
              {{ typoBook.charStats.value[0]?.totalErrors || 0 }} 次错误
            </div>
            <div class="absolute -right-4 -top-4 w-20 h-20 bg-paper-400/10 rounded-full"></div>
          </div>

          <div class="card-paper p-4 md:p-5 relative overflow-hidden">
            <div class="flex items-center gap-2 text-ink-200 mb-2">
              <Clock class="w-5 h-5" />
              <span class="font-song text-xs tracking-wider text-ink-200">最近错误</span>
            </div>
            <div class="font-song font-black text-2xl md:text-3xl text-ink-400 leading-none truncate">
              {{ typoBook.sortedByRecent.value[0]?.char || '—' }}
            </div>
            <div class="font-kai text-xs text-ink-100 mt-2">
              {{ typoBook.sortedByRecent.value[0] ? formatTime(typoBook.sortedByRecent.value[0].lastErrorAt) : '暂无' }}
            </div>
            <div class="absolute -right-4 -top-4 w-20 h-20 bg-ink-400/5 rounded-full"></div>
          </div>
        </div>

        <div v-if="typoBook.totalEntries.value > 0" class="mt-6 flex items-center gap-1 p-1 bg-paper-100 rounded-xl border border-paper-200/50 w-fit animate-fade-in">
          <button
            type="button"
            @click="sortMode = 'count'"
            class="flex items-center gap-1.5 px-4 py-2 rounded-lg font-song text-sm transition-all duration-200"
            :class="sortMode === 'count'
              ? 'bg-paper-50 text-ink-400 shadow-paper border border-paper-200/60'
              : 'text-ink-200 hover:text-ink-300 border border-transparent'"
          >
            <BarChart2 class="w-4 h-4" />
            <span>按错误次数</span>
          </button>
          <button
            type="button"
            @click="sortMode = 'recent'"
            class="flex items-center gap-1.5 px-4 py-2 rounded-lg font-song text-sm transition-all duration-200"
            :class="sortMode === 'recent'
              ? 'bg-paper-50 text-ink-400 shadow-paper border border-paper-200/60'
              : 'text-ink-200 hover:text-ink-300 border border-transparent'"
          >
            <Clock class="w-4 h-4" />
            <span>按时间最近</span>
          </button>
        </div>
      </div>

      <div v-if="typoBook.totalEntries.value === 0" class="text-center py-20 animate-fade-in">
        <div class="w-24 h-24 mx-auto mb-6 rounded-full bg-paper-200/50 flex items-center justify-center">
          <Inbox class="w-12 h-12 text-paper-400" />
        </div>
        <h3 class="font-song text-xl text-ink-200 mb-3">错字本空空如也</h3>
        <p class="font-kai text-ink-100 mb-8">答错的题目会自动记录在此，助你查漏补缺</p>
        <button type="button" @click="router.push('/game')" class="btn-primary px-8 py-3.5 inline-flex items-center gap-2">
          <Sparkles class="w-5 h-5" />
          <span>开始飞花令</span>
        </button>
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="stats in sortedChars"
          :key="stats.char"
          class="animate-fade-in-up"
        >
          <div
            class="card-paper overflow-hidden transition-all duration-300"
            :class="expandedChar === stats.char ? 'ring-2 ring-vermilion-300/50' : ''"
          >
            <div
              class="p-4 md:p-5 cursor-pointer transition-all duration-200 hover:bg-paper-50/50"
              @click="toggleChar(stats.char)"
            >
              <div class="flex items-center gap-4">
                <div class="shrink-0 relative">
                  <div class="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-gradient-to-br from-vermilion-50 to-vermilion-100/70 border-2 border-vermilion-200/60 flex items-center justify-center shadow-sm">
                    <span class="font-song font-black text-3xl md:text-4xl text-vermilion-500">
                      {{ stats.char }}
                    </span>
                  </div>
                </div>

                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-3 mb-2 flex-wrap">
                    <div class="flex items-center gap-1.5">
                      <span class="px-2 py-0.5 rounded bg-vermilion-400/10 text-vermilion-500 font-song text-xs font-bold">
                        {{ stats.totalErrors }} 次错误
                      </span>
                      <span class="px-2 py-0.5 rounded bg-paper-200/60 text-ink-200 font-song text-xs">
                        {{ formatTime(stats.lastErrorAt) }}
                      </span>
                    </div>
                  </div>
                  <div class="font-kai text-sm text-ink-200 truncate">
                    最近作答：{{ stats.entries[0]?.userInput ? '「' + stats.entries[0].userInput + '」' : '（超时未答）' }}
                  </div>
                </div>

                <div class="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    @click.stop="handlePracticeChar(stats.char)"
                    class="px-3 py-2 rounded-lg bg-vermilion-400/10 border border-vermilion-300/50 text-vermilion-500 font-song text-xs
                           hover:bg-vermilion-400/20 hover:border-vermilion-400/60 transition-all duration-200 flex items-center gap-1.5"
                  >
                    <Play class="w-3.5 h-3.5 fill-current" />
                    <span>专项练习</span>
                  </button>
                  <button
                    type="button"
                    @click.stop="handleRemoveChar(stats.char)"
                    class="w-9 h-9 rounded-lg flex items-center justify-center text-paper-400
                           hover:bg-vermilion-50 hover:text-vermilion-500 transition-all duration-200"
                    title="移除该字所有记录"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                  <component
                    :is="expandedChar === stats.char ? ChevronDown : ChevronRight"
                    class="w-5 h-5 text-ink-100 transition-transform duration-200"
                  />
                </div>
              </div>
            </div>

            <Transition
              enter-active-class="transition-all duration-300 ease-out"
              enter-from-class="max-h-0 opacity-0"
              enter-to-class="max-h-[2000px] opacity-100"
              leave-active-class="transition-all duration-200 ease-in"
              leave-from-class="max-h-[2000px] opacity-100"
              leave-to-class="max-h-0 opacity-0"
            >
              <div v-if="expandedChar === stats.char" class="border-t border-paper-200/50 overflow-hidden">
                <div class="p-5 bg-paper-50/60">
                  <div class="mb-6">
                    <div class="font-song text-sm font-bold text-ink-300 mb-3 flex items-center gap-2">
                      <Scroll class="w-4 h-4 text-vermilion-400" />
                      <span>错误记录 · 共 {{ statsForExpandedChar?.totalErrors || 0 }} 条</span>
                    </div>
                    <div class="space-y-2 max-h-64 overflow-y-auto scrollbar-thin pr-1">
                      <div
                        v-for="entry in statsForExpandedChar?.entries.slice(0, 20)"
                        :key="entry.id"
                        class="p-3 rounded-lg bg-white/70 border border-paper-200/50"
                      >
                        <div class="flex items-start justify-between gap-3">
                          <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-2 mb-1 flex-wrap">
                              <span
                                v-if="entry.wasAutoCorrected"
                                class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-600 font-song text-xs"
                              >
                                自动修正
                              </span>
                              <span
                                v-else
                                class="px-1.5 py-0.5 rounded bg-vermilion-100 text-vermilion-500 font-song text-xs"
                              >
                                未匹配
                              </span>
                              <span class="font-song text-xs text-ink-100">
                                {{ formatTime(entry.timestamp) }}
                              </span>
                            </div>
                            <div v-if="entry.userInput" class="font-kai text-sm text-ink-300">
                              作答：
                              <span class="font-bold text-ink-400">{{ entry.userInput }}</span>
                            </div>
                            <div v-else class="font-kai text-sm text-paper-400 italic">
                              （超时未作答）
                            </div>
                            <div
                              v-if="entry.correctedInput && entry.correctedInput !== entry.userInput"
                              class="font-kai text-sm text-bamboo-600 mt-0.5"
                            >
                              修正：<span class="font-bold">{{ entry.correctedInput }}</span>
                            </div>
                            <div v-if="entry.matchedSentence" class="font-kai text-xs text-ink-200 mt-1">
                              关联诗句：{{ entry.matchedSentence }}
                            </div>
                          </div>
                          <span
                            class="shrink-0 font-song text-xs font-bold tabular-nums"
                            :class="entry.scoreChange >= 0 ? 'text-bamboo-500' : 'text-vermilion-500'"
                          >
                            {{ entry.scoreChange > 0 ? '+' : '' }}{{ entry.scoreChange }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div class="font-song text-sm font-bold text-ink-300 mb-3 flex items-center gap-2">
                      <BookOpen class="w-4 h-4 text-bamboo-500" />
                      <span>收录诗句 · 包含「{{ stats.char }}」的诗句（最多展示 20 首）</span>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div
                        v-for="poem in poemsForExpandedChar"
                        :key="poem.id"
                        class="p-4 rounded-xl bg-white/80 border border-paper-200/60 transition-all duration-200 hover:shadow-sm"
                      >
                        <div
                          class="cursor-pointer"
                          @click="togglePoem(poem.id)"
                        >
                          <div class="flex items-start justify-between gap-2 mb-2">
                            <div class="flex-1 min-w-0">
                              <div class="font-song font-bold text-ink-400 truncate">
                                《{{ poem.title }}》
                              </div>
                              <div class="flex items-center gap-1 text-xs text-ink-200 mt-0.5">
                                <span class="font-kai">〔{{ poem.dynasty }}〕</span>
                                <span class="font-kai">{{ poem.author }}</span>
                              </div>
                            </div>
                            <component
                              :is="expandedPoemId === poem.id ? ChevronDown : ChevronRight"
                              class="w-4 h-4 text-ink-100 shrink-0 mt-1"
                            />
                          </div>
                          <div
                            v-for="(sentence, sIdx) in poem.sentences"
                            :key="sIdx"
                            class="font-kai text-sm text-ink-300 leading-relaxed mb-0.5"
                            v-html="highlightChar(sentence, stats.char)"
                          />
                        </div>

                        <Transition
                          enter-active-class="transition-all duration-250 ease-out"
                          enter-from-class="max-h-0 opacity-0 mt-0"
                          enter-to-class="max-h-[600px] opacity-100 mt-3"
                          leave-active-class="transition-all duration-200 ease-in"
                          leave-from-class="max-h-[600px] opacity-100 mt-3"
                          leave-to-class="max-h-0 opacity-0 mt-0"
                        >
                          <div v-if="expandedPoemId === poem.id" class="border-t border-paper-200/50 pt-3 overflow-hidden">
                            <div class="paper-deluxe -m-2 p-3 rounded-lg">
                              <div class="space-y-1 font-kai text-sm text-ink-300 leading-loose">
                                <p v-for="(line, lIdx) in poem.content" :key="lIdx">{{ line }}</p>
                              </div>
                              <div v-if="poem.tags && poem.tags.length > 0" class="flex items-center gap-1.5 mt-3 flex-wrap">
                                <span
                                  v-for="tag in poem.tags"
                                  :key="tag"
                                  class="px-2 py-0.5 rounded bg-paper-200/60 text-ink-200 font-song text-xs"
                                >
                                  {{ tag }}
                                </span>
                              </div>
                            </div>
                          </div>
                        </Transition>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Transition>
          </div>
        </div>
      </div>
    </main>

    <footer class="mt-16 pb-8 text-center">
      <p class="font-kai text-xs text-ink-100/80 tracking-wider">
        诗词飞花令 · 传承千古文脉 · 共赏雅韵流芳
      </p>
    </footer>
  </div>
</template>
