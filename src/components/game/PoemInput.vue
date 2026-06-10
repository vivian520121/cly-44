<script setup lang="ts">
import { ref, watch, computed, onMounted, nextTick } from 'vue';
import { Send, Sparkles } from 'lucide-vue-next';

const props = defineProps<{
  modelValue: string;
  disabled?: boolean;
  placeholder?: string;
  suggestion?: string | null;
  targetChar?: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'submit', value: string): void;
}>();

const inputRef = ref<HTMLInputElement | null>(null);
const isFocused = ref(false);
const localValue = ref(props.modelValue);

watch(() => props.modelValue, (v) => {
  localValue.value = v;
});

watch(localValue, (v) => {
  emit('update:modelValue', v);
});

onMounted(() => {
  nextTick(() => {
    inputRef.value?.focus();
  });
});

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
    e.preventDefault();
    if (localValue.value.trim()) {
      emit('submit', localValue.value);
    }
  }
}

function handleSubmit() {
  if (localValue.value.trim()) {
    emit('submit', localValue.value);
  }
}

function applySuggestion() {
  if (props.suggestion) {
    localValue.value = props.suggestion;
    emit('update:modelValue', props.suggestion);
  }
}

function renderHighlight(text: string) {
  if (!props.targetChar) return text;
  return text.split('').map((ch, i) =>
    ch === props.targetChar
      ? `<span class="text-vermilion-500 font-bold">${ch}</span>`
      : ch
  ).join('');
}

const highlightedValue = computed(() => renderHighlight(localValue.value));
</script>

<template>
  <div class="w-full">
    <div
      class="relative group rounded-xl transition-all duration-300"
      :class="[
        isFocused
          ? 'bg-white shadow-paper-lg border-vermilion-400/40'
          : 'bg-paper-50/60 border-paper-200/80 hover:bg-paper-50',
        'border-2'
      ]"
    >
      <div class="flex items-start gap-3 p-4">
        <div class="pt-3 pb-1 text-paper-400 font-song text-xl select-none shrink-0">
          「
        </div>
        <div class="flex-1 relative min-h-[3.5rem]">
          <input
            ref="inputRef"
            :value="localValue"
            @input="(e: Event) => localValue = (e.target as HTMLInputElement).value"
            @focus="isFocused = true"
            @blur="isFocused = false"
            @keydown="handleKeydown"
            :disabled="disabled"
            :placeholder="placeholder || '请输入包含目标汉字的诗句…'"
            class="w-full bg-transparent outline-none font-kai text-xl md:text-2xl text-ink-400 placeholder-ink-100/60 py-2 leading-relaxed caret-vermilion-400 disabled:opacity-50"
            autocomplete="off"
            spellcheck="false"
            enterkeyhint="send"
          />
          <div
            v-if="localValue && isFocused"
            class="absolute top-2 left-0 w-full pointer-events-none font-kai text-xl md:text-2xl leading-relaxed opacity-0 select-none"
            v-html="highlightedValue"
          ></div>
        </div>
        <div class="pt-3 pb-1 text-paper-400 font-song text-xl select-none shrink-0">
          」
        </div>
        <button
          type="button"
          @click="handleSubmit"
          :disabled="disabled || !localValue.trim()"
          class="shrink-0 mt-1.5 h-12 px-4 rounded-lg bg-vermilion-400 text-paper-50 font-song font-semibold
                 transition-all duration-200 flex items-center gap-2
                 hover:bg-vermilion-500 hover:-translate-y-0.5 hover:shadow-vermilion
                 active:translate-y-0
                 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
        >
          <Send class="w-5 h-5" />
          <span class="hidden sm:inline">提交</span>
        </button>
      </div>

      <div
        v-if="targetChar && localValue && !localValue.includes(targetChar)"
        class="px-4 pb-3 text-vermilion-500 font-kai text-sm animate-fade-in flex items-center gap-1.5"
      >
        <Sparkles class="w-4 h-4" />
        诗句中需包含「<span class="font-bold mx-0.5">{{ targetChar }}</span>」字
      </div>

      <div
        v-if="suggestion && suggestion !== localValue"
        class="px-4 pb-4 flex items-center gap-3 animate-fade-in-up"
      >
        <span class="font-song text-xs text-ink-100 shrink-0">修正建议：</span>
        <button
          type="button"
          @click="applySuggestion"
          class="flex-1 min-w-0 text-left px-3 py-2 rounded-lg bg-bamboo-50 border border-bamboo-200/60
                 text-bamboo-500 font-kai text-base hover:bg-bamboo-100 transition-colors truncate"
        >
          <span class="text-bamboo-300 text-xs mr-1">✎</span>
          {{ suggestion }}
        </button>
      </div>
    </div>
  </div>
</template>
