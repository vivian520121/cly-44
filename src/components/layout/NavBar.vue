<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Feather, Scroll } from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();

const navItems = [
  { path: '/game', name: '飞花令', icon: Feather },
  { path: '/history', name: '对局录', icon: Scroll },
];

const currentPath = computed(() => route.path);

function navigate(path: string) {
  if (currentPath.value !== path) {
    router.push(path);
  }
}
</script>

<template>
  <header class="sticky top-0 z-50 backdrop-blur-md bg-paper-100/70 border-b border-paper-200/50">
    <div class="container mx-auto px-4 py-3">
      <div class="flex items-center justify-between max-w-5xl mx-auto">
        <button
          type="button"
          @click="navigate('/game')"
          class="flex items-center gap-2.5 group transition-all duration-200"
        >
          <div class="relative w-10 h-10 shrink-0">
            <div class="absolute inset-0 rounded-lg bg-vermilion-400/90 rotate-3 group-hover:rotate-6 transition-transform duration-300"></div>
            <div class="absolute inset-0 rounded-lg bg-ink-400/90 -rotate-3 group-hover:-rotate-6 transition-transform duration-300"></div>
            <div class="relative w-full h-full rounded-lg bg-paper-50 border-2 border-vermilion-400 flex items-center justify-center">
              <span class="font-song font-black text-vermilion-500 text-lg">诗</span>
            </div>
          </div>
          <div class="hidden sm:block">
            <div class="font-song font-bold text-xl text-ink-400 tracking-wider leading-none">
              诗词飞花
            </div>
            <div class="font-kai text-xs text-ink-100 tracking-[0.3em] mt-1">
              FLOWERING · VERSE
            </div>
          </div>
        </button>

        <nav class="flex items-center gap-1">
          <button
            v-for="item in navItems"
            :key="item.path"
            type="button"
            @click="navigate(item.path)"
            class="nav-link flex items-center gap-1.5 px-3 md:px-5 py-2 rounded-lg transition-all duration-200"
            :class="[
              (currentPath === item.path || (item.path === '/game' && currentPath === '/'))
                ? 'nav-link-active bg-vermilion-50'
                : 'hover:bg-paper-50'
            ]"
          >
            <component :is="item.icon" class="w-4 h-4" />
            <span class="font-song text-sm md:text-base">{{ item.name }}</span>
          </button>
        </nav>
      </div>
    </div>
  </header>
</template>
