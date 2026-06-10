<script setup lang="ts">
import { CheckCircle, XCircle, AlertTriangle, Lightbulb, Clock, ArrowRight } from 'lucide-vue-next';
import { watch, ref } from 'vue';

const props = defineProps<{
  type: 'correct' | 'wrong' | 'hint' | 'timeout' | null;
  message: string;
  scoreDelta?: number;
  details?: {
    title?: string;
    author?: string;
    dynasty?: string;
    sentence?: string;
  };
}>();

const visible = ref(false);
const key = ref(0);

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
      class="w-full rounded-xl border-2 shadow-paper-lg overflow-hidden animate-fade-in-up"
      :class="[styleMap[type].border, styleMap[type].bg]"
    >
      <div class="flex h-full">
        <div class="w-1 shrink-0" :class="styleMap[type].bar"></div>
        <div class="flex-1 p-4 flex gap-3">
          <div
            class="shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-paper-50 shadow-sm"
            :class="[
              styleMap[type].iconBg,
              type === 'wrong' ? 'animate-shake' : '',
              type === 'correct' ? 'animate-scale-in' : ''
            ]"
          >
            <component :is="iconMap[type]" class="w-5 h-5" />
          </div>
          <div class="flex-1 min-w-0 space-y-2">
            <div class="flex items-start justify-between gap-2">
              <div
                class="font-song text-base font-semibold leading-relaxed"
                :class="styleMap[type].text"
              >
                {{ message }}
              </div>
              <div
                v-if="scoreDelta !== undefined && scoreDelta !== 0"
                class="shrink-0 font-song font-bold text-lg tabular-nums animate-scale-in"
                :class="styleMap[type].score"
              >
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
            </div>
          </div>
        </div>
      </div>
    </div>
    </Transition>
  </div>
  <div v-else class="h-0 overflow-hidden"></div>
</template>
