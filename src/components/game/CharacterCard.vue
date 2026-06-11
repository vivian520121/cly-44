<script setup lang="ts">
import { computed, ref, watch } from 'vue';

const props = defineProps<{
  char: string;
  loading?: boolean;
  highlight?: boolean;
}>();

const displayChar = computed(() => props.char || '？');
const charKey = ref(0);

watch(
  () => props.char,
  () => {
    charKey.value++;
  }
);
</script>

<template>
  <div
    class="relative w-full aspect-[4/3] max-w-md mx-auto select-none"
    :class="{ 'animate-pulse': loading }"
  >
    <div class="paper-deluxe absolute inset-0 rounded-2xl border-2 border-paper-200 shadow-paper-lg overflow-hidden">
      <div class="absolute inset-3 border border-paper-300/40 rounded-xl pointer-events-none"></div>

      <div class="absolute top-3 right-3 w-11 h-11 stamp-animated">
        <div class="stamp-outer"></div>
        <div class="stamp-inner"></div>
        <div class="absolute inset-0 flex items-center justify-center">
          <span class="font-song text-[10px] text-vermilion-500/80 font-bold tracking-tighter leading-none select-none">令</span>
        </div>
      </div>

      <div class="absolute bottom-3 left-3 w-11 h-11 stamp-animated" style="animation-delay: 0.2s">
        <div class="stamp-outer"></div>
        <div class="stamp-inner"></div>
        <div class="absolute inset-0 flex items-center justify-center">
          <span class="font-song text-[10px] text-vermilion-500/80 font-bold tracking-tighter leading-none select-none">花</span>
        </div>
      </div>

      <div class="absolute inset-0 flex items-center justify-center">
        <div
          :key="charKey"
          class="ink-char-appear font-song text-ink-400 tracking-wider transition-all duration-500 ease-out"
          :class="[
            highlight ? 'text-vermilion-500 scale-110 animate-pulse-glow combo-score-text' : '',
            'text-[10rem] md:text-[12rem] leading-none text-shadow-paper font-black'
          ]"
        >
          {{ displayChar }}
        </div>
      </div>

      <div class="absolute bottom-4 right-6 font-song text-paper-400 text-xs md:text-sm tracking-widest">
        请对含此字之诗句
      </div>
      <div class="absolute top-4 left-6 font-kai text-paper-400 text-xs md:text-sm tracking-widest opacity-70">
        飞花令
      </div>
    </div>
  </div>
</template>
