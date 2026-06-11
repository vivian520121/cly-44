<script setup lang="ts">
import { CheckCircle, XCircle, AlertTriangle, Lightbulb, Clock, ArrowRight, Flame, Bookmark, BookmarkCheck } from 'lucide-vue-next';
import { watch, ref, computed } from 'vue';
import { useCollection } from '@/composables/useCollection';

const props = defineProps<{
  type: 'correct' | 'wrong' | 'hint' | 'timeout' | null;
  message: string;
  scoreDelta?: number;
  combo?: number;
  details?: {
    title?: string;
    author?: string;
    dynasty?: string;
    sentence?: string;
    poemId?: number;
  };
}>();

const collection = useCollection();

const canCollect = computed(() =>
  props.type === 'correct' && props.details?.poemId != null
);

const isCollected = computed(() =>
  props.details?.poemId != null && collection.isCollected(props.details.poemId)
);

const visible = ref(false);
const key = ref(0);

const fireParticles = computed(() => {
  const count = Math.min((props.combo || 0), 8);
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: 50 + (i - count / 2) * 8 + (Math.random() - 0.5) * 10,
    delay: Math.random() * 0.2,
    size: 4 + Math.random() * 4,
    duration: 0.7 + Math.random() * 0.5,
  }));
});

const fireWisps = computed(() => {
  const count = Math.min(Math.max((props.combo || 0) - 1, 0), 5);
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: 50 + (i - count / 2) * 14 + (Math.random() - 0.5) * 8,
    delay: 0.1 + Math.random() * 0.3,
    duration: 0.9 + Math.random() * 0.6,
  }));
});

watch(
  () => [props.type, props.message],
  ([t]) => {
    if (t) {
      visible.value = false;
      key.value++;
      requestAnimationFrame(() => {
        visible.value = true;
      });
      setTimeout(() => {
        visible.value = false;
      }, 4500);
    } else {
      visible.value = false;
    }
  },
  { immediate: true }
);

const iconMap = {
  correct: CheckCircle,
  wrong: XCircle,
  timeout: Clock,
  hint: Lightbulb,
};

const styleMap = {
  correct: {
    bar: 'bg-bamboo-400',
    border: 'border-bamboo-200/70',
    bg: 'bg-bamboo-50/80',
    text: 'text-bamboo-500',
    iconBg: 'bg-bamboo-400',
    score: 'text-bamboo-500',
  },
  wrong: {
    bar: 'bg-vermilion-400',
    border: 'border-vermilion-200/70',
    bg: 'bg-vermilion-50/60',
    text: 'text-vermilion-500',
    iconBg: 'bg-vermilion-400',
    score: 'text-vermilion-500',
  },
  timeout: {
    bar: 'bg-paper-500',
    border: 'border-paper-300/70',
    bg: 'bg-paper-100/80',
    text: 'text-ink-300',
    iconBg: 'bg-paper-500',
    score: 'text-vermilion-500',
  },
  hint: {
    bar: 'bg-paper-400',
    border: 'border-paper-300/70',
    bg: 'bg-paper-50/80',
    text: 'text-ink-300',
    iconBg: 'bg-paper-400',
    score: 'text-ink-200',
  },
};
</script>

<template>
  <div v-if="visible && type">
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 -translate-y-2 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition-all duration-300 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
    <div
      :key="key"
      class="w-full rounded-xl border-2 shadow-paper-lg overflow-hidden animate-fade-in-up relative"
      :class="[styleMap[type].border, styleMap[type].bg]"
    >
      <div
        v-if="type === 'wrong' || type === 'timeout'"
        class="absolute inset-0 pointer-events-none overflow-hidden"
      >
        <div
          class="ink-wrong-blob"
          style="width: 120px; height: 120px; top: -20px; left: 10%"
        ></div>
        <div
          class="ink-wrong-blob"
          style="width: 80px; height: 80px; bottom: -10px; right: 15%; animation-delay: 0.1s"
        ></div>
      </div>

      <div class="flex h-full">
        <div class="w-1 shrink-0" :class="styleMap[type].bar"></div>
        <div class="flex-1 p-4 flex gap-3 relative">
          <div class="combo-fire-wrap shrink-0">
            <div
              v-if="type === 'correct' && (combo || 0) >= 2"
              class="absolute -top-2 left-1/2 -translate-x-1/2 pointer-events-none"
              style="width: 60px; height: 60px"
            >
              <div
                v-for="p in fireParticles"
                :key="`p-${p.id}`"
                class="fire-particle"
                :style="{
                  left: `${p.left}%`,
                  bottom: '0',
                  width: `${p.size}px`,
                  height: `${p.size}px`,
                  animationDelay: `${p.delay}s`,
                  animationDuration: `${p.duration}s`,
                }"
              ></div>
              <div
                v-for="w in fireWisps"
                :key="`w-${w.id}`"
                class="fire-wisp"
                :style="{
                  left: `${w.left}%`,
                  bottom: '0',
                  animationDelay: `${w.delay}s`,
                  animationDuration: `${w.duration}s`,
                }"
              ></div>
            </div>

            <div
              class="w-10 h-10 rounded-full flex items-center justify-center text-paper-50 shadow-sm relative"
              :class="[
                styleMap[type].iconBg,
                type === 'wrong' || type === 'timeout' ? 'animate-wrong-shake-heavy' : '',
                type === 'correct' ? 'animate-scale-in' : ''
              ]"
            >
              <Flame
                v-if="type === 'correct' && (combo || 0) >= 3"
                class="w-5 h-5 absolute -top-1 -right-1 text-vermilion-400 animate-fire-wisp"
                style="animation-iteration-count: infinite"
              />
              <component :is="iconMap[type]" class="w-5 h-5" />
            </div>
          </div>

          <div class="flex-1 min-w-0 space-y-2">
            <div class="flex items-start justify-between gap-2">
              <div
                class="font-song text-base font-semibold leading-relaxed"
                :class="[
                  styleMap[type].text,
                  type === 'correct' && (combo || 0) >= 3 ? 'combo-score-text' : ''
                ]"
              >
                {{ message }}
              </div>
              <div
                v-if="scoreDelta !== undefined && scoreDelta !== 0"
                class="shrink-0 font-song font-bold text-lg tabular-nums animate-scale-in relative"
                :class="styleMap[type].score"
              >
                <span
                  v-if="type === 'correct' && scoreDelta > 0"
                  class="absolute -left-1 -top-2 text-xs opacity-70"
                >
                  ✦
                </span>
                {{ scoreDelta > 0 ? '+' : '' }}{{ scoreDelta }}
              </div>
            </div>
            <div
              v-if="details && (details.sentence || details.title)"
              class="rounded-lg bg-white/60 border border-paper-200/40 p-3 animate-fade-in"
            >
              <div v-if="details.sentence" class="font-kai text-lg text-ink-400 leading-relaxed mb-2">
                {{ details.sentence }}
              </div>
              <div
                v-if="details.title || details.author"
                class="flex items-center gap-2 flex-wrap font-song text-xs text-ink-100"
              >
                <template v-if="details.dynasty">
                  <span class="px-2 py-0.5 rounded bg-paper-200/60 text-ink-200">{{ details.dynasty }}</span>
                </template>
                <template v-if="details.title">
                  <span class="text-ink-300">《{{ details.title }}》</span>
                </template>
                <template v-if="details.author">
                  <ArrowRight class="w-3 h-3 text-paper-300" />
                  <span class="text-ink-200">{{ details.author }}</span>
                </template>
              </div>
              <button
                v-if="canCollect"
                type="button"
                @click.stop="details?.poemId != null && collection.toggle(details.poemId)"
                class="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-song transition-all duration-200 hover:-translate-y-0.5"
                :class="isCollected
                  ? 'bg-vermilion-50 border border-vermilion-200/60 text-vermilion-500'
                  : 'bg-paper-50 border border-paper-200/60 text-ink-200 hover:text-vermilion-500 hover:border-vermilion-200/60'"
              >
                <BookmarkCheck v-if="isCollected" class="w-3.5 h-3.5" />
                <Bookmark v-else class="w-3.5 h-3.5" />
                {{ isCollected ? '已收藏' : '收藏' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </Transition>
  </div>
  <div v-else class="h-0 overflow-hidden"></div>
</template>
