<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { Trophy, Sparkles } from 'lucide-vue-next';
import type { Achievement } from '@/types';
import { getTierColor, getTierLabel, getTierBg, getTierText } from '@/composables/useAchievements';

const props = defineProps<{
  achievement: Achievement | null;
  visible: boolean;
}>();

const emit = defineEmits<{
  (e: 'dismiss'): void;
}>();

const showInner = ref(false);

watch(
  () => props.visible,
  (v) => {
    if (v) {
      showInner.value = false;
      requestAnimationFrame(() => {
        showInner.value = true;
      });
      setTimeout(() => {
        emit('dismiss');
      }, 4000);
    } else {
      showInner.value = false;
    }
  },
  { immediate: true }
);

const tierColor = computed(() =>
  props.achievement ? getTierColor(props.achievement.tier) : ''
);
const tierLabel = computed(() =>
  props.achievement ? getTierLabel(props.achievement.tier) : ''
);
const tierBg = computed(() =>
  props.achievement ? getTierBg(props.achievement.tier) : ''
);
const tierTextCls = computed(() =>
  props.achievement ? getTierText(props.achievement.tier) : ''
);

const sparkles = computed(() =>
  Array.from({ length: 12 }, (_, i) => ({
    id: i,
    angle: (i * 30) + Math.random() * 15,
    distance: 50 + Math.random() * 30,
    delay: Math.random() * 0.5,
    duration: 1 + Math.random() * 0.8,
    size: 6 + Math.random() * 8,
  }))
);

function handleDismiss() {
  showInner.value = false;
  setTimeout(() => emit('dismiss'), 300);
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-300"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="visible && achievement"
        class="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-ink-500/50 backdrop-blur-sm"
        @click.self="handleDismiss"
      >
        <Transition
          enter-active-class="transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1)"
          enter-from-class="opacity-0 scale-50 -rotate-12"
          enter-to-class="opacity-100 scale-100 rotate-0"
          leave-active-class="transition-all duration-300 ease-in"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-75 translate-y-4"
        >
          <div
            v-if="showInner"
            class="relative w-full max-w-sm"
          >
            <div
              v-for="s in sparkles"
              :key="s.id"
              class="absolute pointer-events-none"
              :style="{
                left: '50%',
                top: '50%',
                animation: `sparkle-burst ${s.duration}s ${s.delay}s ease-out forwards`,
                '--sparkle-angle': `${s.angle}deg`,
                '--sparkle-distance': `${s.distance}px`,
              }"
            >
              <Sparkles
                class="text-yellow-400"
                :style="{ width: `${s.size}px`, height: `${s.size}px` }"
              />
            </div>

            <div
              class="relative paper-deluxe rounded-3xl shadow-2xl overflow-hidden seal-corner"
              @click.stop
            >
              <div
                class="absolute inset-0 opacity-30"
                :class="`bg-gradient-to-br ${tierColor}`"
              ></div>

              <div class="relative p-6 md:p-8 text-center">
                <div class="font-song text-ink-100 text-xs tracking-[0.4em] mb-4">
                  — 成就解锁 —
                </div>

                <div class="relative mx-auto w-28 h-28 mb-5">
                  <div
                    class="absolute inset-0 rounded-full bg-gradient-to-br opacity-90 animate-pulse-slow"
                    :class="tierColor"
                  ></div>
                  <div
                    class="absolute inset-1 rounded-full bg-paper-50/90 flex items-center justify-center"
                  >
                    <div class="text-5xl animate-bounce-in">{{ achievement.icon }}</div>
                  </div>
                  <div
                    class="absolute -top-1 -right-1 px-2 py-0.5 rounded-full text-xs font-song font-bold text-paper-50 shadow-md"
                    :class="`bg-gradient-to-r ${tierColor}`"
                  >
                    {{ tierLabel }}
                  </div>
                </div>

                <h2
                  class="font-song font-black text-3xl md:text-4xl mb-2 tracking-wider"
                  :class="tierTextCls"
                >
                  {{ achievement.name }}
                </h2>

                <p class="font-kai text-base text-ink-300 leading-relaxed mb-6">
                  {{ achievement.description }}
                </p>

                <div class="flex items-center justify-center gap-2 text-ink-200 mb-5">
                  <Trophy class="w-4 h-4" />
                  <span class="font-song text-sm">恭喜获得新成就徽章</span>
                </div>

                <button
                  type="button"
                  @click="handleDismiss"
                  class="btn-primary px-8 py-3 w-full"
                >
                  收下徽章
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
@keyframes sparkle-burst {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) rotate(var(--sparkle-angle)) translateY(0) scale(0);
  }
  20% {
    opacity: 1;
    transform: translate(-50%, -50%) rotate(var(--sparkle-angle)) translateY(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) rotate(var(--sparkle-angle)) translateY(calc(var(--sparkle-distance) * -1)) scale(0.3);
  }
}

.animate-pulse-slow {
  animation: pulse-slow 2s ease-in-out infinite;
}

@keyframes pulse-slow {
  0%, 100% {
    opacity: 0.9;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.05);
  }
}

.animate-bounce-in {
  animation: bounce-in 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes bounce-in {
  0% {
    transform: scale(0) rotate(-20deg);
    opacity: 0;
  }
  60% {
    transform: scale(1.2) rotate(5deg);
    opacity: 1;
  }
  100% {
    transform: scale(1) rotate(0);
    opacity: 1;
  }
}
</style>
