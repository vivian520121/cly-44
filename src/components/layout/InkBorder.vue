<script setup lang="ts">
defineProps<{
  children?: unknown;
}>();
</script>

<template>
  <div class="relative rounded-2xl overflow-hidden">
    <div class="absolute top-0 left-0 w-12 h-12 pointer-events-none z-10">
      <div class="absolute top-2 left-2 w-8 h-0.5 bg-vermilion-400/60 rounded-full"></div>
      <div class="absolute top-2 left-2 h-8 w-0.5 bg-vermilion-400/60 rounded-full"></div>
      <div class="absolute top-5 left-5 w-3 h-0.5 bg-vermilion-400/40 rounded-full"></div>
      <div class="absolute top-5 left-5 h-3 w-0.5 bg-vermilion-400/40 rounded-full"></div>
    </div>
    <div class="absolute top-0 right-0 w-12 h-12 pointer-events-none z-10">
      <div class="absolute top-2 right-2 w-8 h-0.5 bg-vermilion-400/60 rounded-full"></div>
      <div class="absolute top-2 right-2 h-8 w-0.5 bg-vermilion-400/60 rounded-full"></div>
      <div class="absolute top-5 right-5 w-3 h-0.5 bg-vermilion-400/40 rounded-full"></div>
      <div class="absolute top-5 right-5 h-3 w-0.5 bg-vermilion-400/40 rounded-full"></div>
    </div>
    <div class="absolute bottom-0 left-0 w-12 h-12 pointer-events-none z-10">
      <div class="absolute bottom-2 left-2 w-8 h-0.5 bg-vermilion-400/60 rounded-full"></div>
      <div class="absolute bottom-2 left-2 h-8 w-0.5 bg-vermilion-400/60 rounded-full"></div>
    </div>
    <div class="absolute bottom-0 right-0 w-12 h-12 pointer-events-none z-10">
      <div class="absolute bottom-2 right-2 w-8 h-0.5 bg-vermilion-400/60 rounded-full"></div>
      <div class="absolute bottom-2 right-2 h-8 w-0.5 bg-vermilion-400/60 rounded-full"></div>
    </div>
    <slot></slot>
  </div>
</template>
