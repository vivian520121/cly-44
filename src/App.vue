<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router';
import { ref, watch } from 'vue';

const route = useRoute();
const transitionKey = ref(0);
const showInkTransition = ref(false);

watch(
  () => route.path,
  (newPath, oldPath) => {
    if (newPath !== oldPath) {
      showInkTransition.value = true;
      transitionKey.value++;
      setTimeout(() => {
        showInkTransition.value = false;
      }, 750);
    }
  }
);
</script>

<template>
  <div class="min-h-screen relative">
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-500"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="showInkTransition"
        :key="'route-' + transitionKey"
        class="ink-transition-sweep"
      ></div>
    </Transition>

    <RouterView v-slot="{ Component, route: currentRoute }">
      <Transition
        enter-active-class="transition-all duration-500 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-all duration-300 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
        mode="out-in"
      >
        <component :is="Component" :key="currentRoute.path" class="relative z-10" />
      </Transition>
    </RouterView>
  </div>
</template>
