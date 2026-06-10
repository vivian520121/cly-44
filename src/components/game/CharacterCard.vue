<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  char: string;
  loading?: boolean;
  highlight?: boolean;
}>();

const displayChar = computed(() => props.char || '？');
</script>

<template>
  <div
    class="relative w-full aspect-[4/3] max-w-md mx-auto select-none"
    :class="{ 'animate-pulse': loading }"
  >
    <div class="absolute inset-0 rounded-2xl bg-paper-50 bg-paper-texture border-2 border-paper-200 shadow-paper-lg overflow-hidden">
      <div class="absolute inset-3 border border-paper-300/50 rounded-xl pointer-events-none"></div>
      <div class="absolute top-3 right-3 w-10 h-10 border-2 border-vermilion-400/70 rounded opacity-70">
        <div class="absolute inset-1.5 border border-vermilion-400/50 rounded-sm"></div>
      </div>
      <div class="absolute bottom-3 left-3 w-10 h-10 border-2 border-vermilion-400/70 rounded opacity-70">
        <div class="absolute inset-1.5 border border-vermilion-400/50 rounded-sm"></div>
      </div>
      <div class="absolute inset-0 flex items-center justify-center">
        <div
          class="font-song text-ink-400 tracking-wider transition-all duration-500 ease-out"
          :class="[
            char ? 'animate-ink-spread' : '',
            highlight ? 'text-vermilion-500 scale-110 animate-pulse-glow' : '',
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
