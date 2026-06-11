<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useCollection } from '@/composables/useCollection';
import { usePoemMatcher } from '@/composables/usePoemMatcher';
import NavBar from '@/components/layout/NavBar.vue';
import InkBorder from '@/components/layout/InkBorder.vue';
import { Bookmark, BookmarkCheck, Inbox, Sparkles, Trash2, X, ArrowRight } from 'lucide-vue-next';
import type { Poem } from '@/types';

const router = useRouter();
const collection = useCollection();
const matcher = usePoemMatcher();

const expandedPoemId = ref<number | null>(null);

const dynastyOrder = ['先秦', '秦', '汉', '魏晋', '南北朝', '隋', '唐', '五代', '宋', '辽', '金', '元', '明', '清', '近代'];

const sortedDynasties = computed(() => {
  const dynasties = Object.keys(collection.groupedByDynasty.value);
  return dynasties.sort((a, b) => {
    const ia = dynastyOrder.indexOf(a);
    const ib = dynastyOrder.indexOf(b);
    return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
  });
});

function toggleExpand(poemId: number) {
  expandedPoemId.value = expandedPoemId.value === poemId ? null : poemId;
}

function handleRemove(poemId: number) {
  collection.remove(poemId);
  if (expandedPoemId.value === poemId) {
    expandedPoemId.value = null;
  }
}

function handleClearAll() {
  if (confirm('确定要清空所有收藏吗？此操作无法撤销！')) {
    collection.clearAll();
    expandedPoemId.value = null;
  }
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}
</script>

<template>
  <div class="min-h-screen">
    <NavBar />

    <main class="container mx-auto px-4 py-6 md:py-10 max-w-5xl">
      <div class="mb-8 animate-fade-in-up">
        <div class="flex items-end justify-between gap-4 mb-6 flex-wrap">
          <div>
            <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-vermilion-50 border border-vermilion-200/60 text-vermilion-500 font-song text-xs mb-4">
              <Bookmark class="w-3.5 h-3.5" />
              <span>个人收藏</span>
            </div>
            <h1 class="font-song font-black text-3xl md:text-5xl text-ink-400 tracking-wider mb-2">
              收藏集
            </h1>
            <p class="font-kai text-ink-200 text-base md:text-lg">
              佳句珍藏于心，随时品读回味
            </p>
          </div>
          <div class="flex items-center gap-2">
            <button
              v-if="collection.total.value > 0"
              type="button"
              @click="handleClearAll"
              class="px-4 py-2 rounded-lg border border-vermilion-200/70 bg-vermilion-50/60 text-vermilion-500 font-song text-sm
                     transition-all duration-200 hover:bg-vermilion-50 hover:-translate-y-0.5 flex items-center gap-2"
            >
              <Trash2 class="w-4 h-4" />
              <span>清空收藏</span>
            </button>
          </div>
        </div>

        <div v-if="collection.total.value > 0" class="card-paper p-4 md:p-5 inline-flex items-center gap-3 animate-fade-in">
          <div class="w-10 h-10 rounded-full bg-vermilion-400/10 flex items-center justify-center">
            <BookmarkCheck class="w-5 h-5 text-vermilion-500" />
          </div>
          <div>
            <div class="font-song text-xs text-ink-100">已收藏</div>
            <div class="font-song font-bold text-2xl text-ink-400 tabular-nums">
              {{ collection.total.value }}
              <span class="text-sm font-normal text-ink-100 ml-1">首诗词</span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="collection.total.value === 0" class="text-center py-20 animate-fade-in">
        <div class="w-24 h-24 mx-auto mb-6 rounded-full bg-paper-200/50 flex items-center justify-center">
          <Inbox class="w-12 h-12 text-paper-400" />
        </div>
        <h3 class="font-song text-xl text-ink-200 mb-3">暂无收藏</h3>
        <p class="font-kai text-ink-100 mb-8">答题匹配成功后可点击「收藏」将诗词加入此处</p>
        <button type="button" @click="router.push('/game')" class="btn-primary px-8 py-3.5 inline-flex items-center gap-2">
          <Sparkles class="w-5 h-5" />
          <span>开始飞花令</span>
        </button>
      </div>

      <div v-else class="space-y-8">
        <div
          v-for="dynasty in sortedDynasties"
          :key="dynasty"
          class="animate-fade-in-up"
        >
          <div class="flex items-center gap-3 mb-4">
            <div class="w-1 h-6 rounded-full bg-vermilion-400"></div>
            <h2 class="font-song text-lg font-bold text-ink-400">{{ dynasty }}</h2>
            <span class="font-song text-xs text-ink-100 bg-paper-200/60 px-2 py-0.5 rounded">
              {{ collection.groupedByDynasty.value[dynasty].length }} 首
            </span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              v-for="poem in collection.groupedByDynasty.value[dynasty]"
              :key="poem.id"
              class="card-paper overflow-hidden transition-all duration-300"
              :class="expandedPoemId === poem.id ? 'ring-2 ring-vermilion-300/50' : ''"
            >
              <div
                class="p-5 cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
                @click="toggleExpand(poem.id)"
              >
                <div class="flex items-start justify-between gap-3">
                  <div class="flex-1 min-w-0">
                    <div class="font-song text-base font-bold text-ink-400 mb-1.5 truncate">
                      《{{ poem.title }}》
                    </div>
                    <div class="flex items-center gap-2 text-xs text-ink-200">
                      <span class="font-kai">{{ poem.author }}</span>
                      <span class="text-paper-300">·</span>
                      <span class="font-kai">{{ poem.dynasty }}</span>
                    </div>
                    <div class="font-kai text-sm text-ink-200 mt-2 line-clamp-2 leading-relaxed">
                      {{ poem.content[0] }}
                    </div>
                  </div>
                  <button
                    type="button"
                    @click.stop="handleRemove(poem.id)"
                    class="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-vermilion-400
                           transition-all duration-200 hover:bg-vermilion-50 hover:text-vermilion-500"
                    title="取消收藏"
                  >
                    <BookmarkCheck class="w-4.5 h-4.5" />
                  </button>
                </div>

                <div class="flex items-center gap-1 mt-3 font-song text-xs text-ink-100">
                  <span>{{ formatTime(poem.collectedAt) }}收藏</span>
                  <ArrowRight class="w-3 h-3 transition-transform duration-200" :class="expandedPoemId === poem.id ? 'rotate-90' : ''" />
                  <span>查看全文</span>
                </div>
              </div>

              <Transition
                enter-active-class="transition-all duration-300 ease-out"
                enter-from-class="max-h-0 opacity-0"
                enter-to-class="max-h-[600px] opacity-100"
                leave-active-class="transition-all duration-200 ease-in"
                leave-from-class="max-h-[600px] opacity-100"
                leave-to-class="max-h-0 opacity-0"
              >
                <div v-if="expandedPoemId === poem.id" class="border-t border-paper-200/50 overflow-hidden">
                  <div class="p-5 paper-deluxe">
                    <div class="relative z-10">
                      <div class="flex items-center justify-between mb-4">
                        <div>
                          <div class="font-song font-bold text-lg text-ink-400">《{{ poem.title }}》</div>
                          <div class="font-kai text-sm text-ink-200 mt-0.5">
                            〔{{ poem.dynasty }}〕{{ poem.author }}
                          </div>
                        </div>
                        <button
                          type="button"
                          @click.stop="expandedPoemId = null"
                          class="w-8 h-8 rounded-lg flex items-center justify-center text-ink-200
                                 hover:bg-paper-100 hover:text-ink-400 transition-all duration-200"
                        >
                          <X class="w-4 h-4" />
                        </button>
                      </div>
                      <div class="space-y-1.5 font-kai text-base text-ink-400 leading-loose">
                        <p v-for="(line, idx) in poem.content" :key="idx">{{ line }}</p>
                      </div>
                      <div v-if="poem.tags && poem.tags.length > 0" class="flex items-center gap-2 mt-4 flex-wrap">
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
                </div>
              </Transition>
            </div>
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
