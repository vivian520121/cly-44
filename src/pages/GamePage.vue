<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Play, RotateCcw, ArrowRight, Flag, Info, Sparkles, AlertCircle } from 'lucide-vue-next';
import { useGame } from '@/composables/useGame';
import NavBar from '@/components/layout/NavBar.vue';
import InkBorder from '@/components/layout/InkBorder.vue';
import CharacterCard from '@/components/game/CharacterCard.vue';
import PoemInput from '@/components/game/PoemInput.vue';
import TimerBar from '@/components/game/TimerBar.vue';
import ScorePanel from '@/components/game/ScorePanel.vue';
import HintButton from '@/components/game/HintButton.vue';
import FeedbackToast from '@/components/game/FeedbackToast.vue';
import AchievementBadge from '@/components/game/AchievementBadge.vue';
import type { Achievement } from '@/types';

const props = defineProps<{
  practiceChar?: string;
}>();

const game = useGame();
const router = useRouter();
const route = useRoute();
const currentBadge = ref<Achievement | null>(null);
const showBadge = ref(false);
const inputValue = ref('');
const showEndModal = ref(false);
const lastAnsweredChar = ref('');
const transitionKey = ref(0);
const showInkTransition = ref(false);
const practiceModeChar = ref<string | null>(null);

onMounted(() => {
  if (props.practiceChar) {
    practiceModeChar.value = props.practiceChar;
  } else if (route.query.practiceChar && typeof route.query.practiceChar === 'string') {
    practiceModeChar.value = route.query.practiceChar;
  }
});

const isIdle = computed(() => game.state.status === 'idle');
const isPlaying = computed(() => game.state.status === 'playing');
const isEnded = computed(() => game.state.status === 'ended');

watch(
  () => game.state.status,
  (newStatus, oldStatus) => {
    if (newStatus !== oldStatus) {
      showInkTransition.value = true;
      transitionKey.value++;
      setTimeout(() => {
        showInkTransition.value = false;
      }, 750);
    }
    if (newStatus === 'ended') {
      setTimeout(() => {
        showEndModal.value = true;
      }, 300);
    }
  }
);

watch(
  () => game.state.currentChar,
  (ch) => {
    if (ch) {
      inputValue.value = '';
      lastAnsweredChar.value = '';
      nextTick(() => {
        const el = document.querySelector('input') as HTMLInputElement | null;
        el?.focus();
      });
    }
  }
);

watch(
  () => game.timer.isComplete.value,
  (v) => {
    if (v && isPlaying.value) {
      setTimeout(() => {
        game.nextQuestion();
      }, 1500);
    }
  }
);

function handleStart() {
  if (practiceModeChar.value) {
    game.startGame({ practiceChar: practiceModeChar.value });
  } else {
    game.startGame();
  }
}

function handleSubmit(val: string) {
  lastAnsweredChar.value = game.state.currentChar;
  const result = game.submitAnswer(val);
  if (result.corrected) {
    inputValue.value = result.corrected;
  }
  setTimeout(() => {
    game.nextQuestion();
  }, result.success ? 1500 : 1800);
}

function handleEndGame() {
  game.endGame();
}

function handleRestart() {
  showEndModal.value = false;
  game.resetGame();
  practiceModeChar.value = null;
}

function handleContinue() {
  showEndModal.value = false;
  game.resetGame();
  practiceModeChar.value = null;
}

function handleExitPractice() {
  practiceModeChar.value = null;
  game.resetGame();
}

function handleSkip() {
  lastAnsweredChar.value = game.state.currentChar;
  game.skipQuestion();
  setTimeout(() => {
    game.nextQuestion();
  }, 1500);
}

function processBadgeQueue() {
  if (showBadge.value) return;
  const next = game.achievements.getNextBadge();
  if (next) {
    currentBadge.value = next;
    showBadge.value = true;
  }
}

watch(
  () => game.achievements.unlockedQueue.value.length,
  () => {
    processBadgeQueue();
  }
);

watch(
  () => game.achievements.isShowingBadge.value,
  (showing) => {
    if (!showing && !showBadge.value) {
      setTimeout(processBadgeQueue, 300);
    }
  }
);

function handleBadgeDismiss() {
  showBadge.value = false;
  currentBadge.value = null;
  game.achievements.dismissBadge();
  setTimeout(processBadgeQueue, 500);
}
</script>

<template>
  <div class="min-h-screen relative">
    <NavBar />

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
        :key="transitionKey"
        class="ink-transition-sweep"
      ></div>
    </Transition>

    <main class="container mx-auto px-4 py-6 md:py-10 max-w-5xl relative z-10">
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-2"
      >
        <div
          v-if="practiceModeChar && isIdle"
          class="mb-6 p-4 rounded-xl bg-amber-50 border-2 border-amber-300/60 flex items-start gap-3 animate-fade-in"
        >
          <div class="shrink-0 w-10 h-10 rounded-full bg-amber-400/20 flex items-center justify-center">
            <AlertCircle class="w-5 h-5 text-amber-600" />
          </div>
          <div class="flex-1 min-w-0">
            <div class="font-song font-bold text-amber-700 text-base mb-1">
              错字专项练习模式
            </div>
            <div class="font-kai text-amber-600 text-sm leading-relaxed">
              当前针对令字
              <span class="font-song font-black text-vermilion-500 text-xl mx-1 px-2 py-0.5 rounded bg-white/70 border border-amber-200/70">
                {{ practiceModeChar }}
              </span>
              进行专项复习，所有题目均使用此字。
            </div>
          </div>
          <button
            type="button"
            @click="handleExitPractice"
            class="shrink-0 px-3 py-1.5 rounded-lg bg-white/80 border border-amber-300/60 text-amber-600 font-song text-xs
                   hover:bg-white hover:border-amber-400 transition-all duration-200"
          >
            退出练习
          </button>
        </div>
      </Transition>

      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-2"
      >
        <div
          v-if="game.isPracticeMode.value && isPlaying"
          class="mb-6 p-3 rounded-xl bg-amber-50/90 backdrop-blur border border-amber-200/70 flex items-center justify-between gap-3 animate-fade-in"
        >
          <div class="flex items-center gap-2">
            <AlertCircle class="w-4 h-4 text-amber-500 shrink-0" />
            <span class="font-song text-sm text-amber-700">
              专项练习模式 · 令字：
              <span class="font-black text-vermilion-500 text-lg ml-1">{{ game.practiceChar.value }}</span>
            </span>
          </div>
          <button
            type="button"
            @click="handleExitPractice"
            class="px-3 py-1 rounded-lg bg-white/80 border border-amber-300/60 text-amber-600 font-song text-xs
                   hover:bg-white hover:border-amber-400 transition-all duration-200"
          >
            退出练习
          </button>
        </div>
      </Transition>

      <div v-if="isIdle" :key="'idle-' + transitionKey" class="max-w-3xl mx-auto animate-ink-wash-reveal">
        <InkBorder>
          <div class="bg-paper-50 bg-paper-texture rounded-2xl p-8 md:p-12 text-center relative overflow-hidden">
            <div class="absolute top-6 right-6 opacity-20 font-song text-9xl font-black text-vermilion-400 select-none">
              詩
            </div>
            <div class="relative z-10">
              <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-vermilion-50 border border-vermilion-200/60 text-vermilion-500 font-song text-xs mb-6">
                <Sparkles class="w-3.5 h-3.5" />
                <span>古诗词 · 飞花令</span>
              </div>

              <h1 class="font-song font-black text-4xl md:text-6xl text-ink-400 tracking-wider mb-4">
                诗词飞花令
              </h1>
              <p class="font-kai text-lg md:text-xl text-ink-200 leading-relaxed mb-10 max-w-xl mx-auto">
                以字为令，对句成诗。<br />
                根据给出的汉字，在限定时间内<br />
                吟诵一句包含此字的千古名句。
              </p>

              <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 max-w-2xl mx-auto text-left">
                <div class="p-4 rounded-xl bg-white/60 border border-paper-200/50">
                  <div class="font-song text-xs text-ink-100 mb-1.5">题库规模</div>
                  <div class="font-song font-bold text-2xl text-ink-400 tabular-nums">
                    {{ game.matcher.totalPoems.value.toLocaleString() }}
                  </div>
                  <div class="font-kai text-xs text-ink-100 mt-0.5">首古诗词</div>
                </div>
                <div class="p-4 rounded-xl bg-white/60 border border-paper-200/50">
                  <div class="font-song text-xs text-ink-100 mb-1.5">涵盖朝代</div>
                  <div class="font-song font-bold text-2xl text-ink-400">6+</div>
                  <div class="font-kai text-xs text-ink-100 mt-0.5">从先秦到元</div>
                </div>
                <div class="p-4 rounded-xl bg-white/60 border border-paper-200/50">
                  <div class="font-song text-xs text-ink-100 mb-1.5">答题时限</div>
                  <div class="font-song font-bold text-2xl text-ink-400 tabular-nums">30</div>
                  <div class="font-kai text-xs text-ink-100 mt-0.5">秒/题</div>
                </div>
                <div class="p-4 rounded-xl bg-white/60 border border-paper-200/50">
                  <div class="font-song text-xs text-ink-100 mb-1.5">历史最高分</div>
                  <div class="font-song font-bold text-2xl text-vermilion-500 tabular-nums">
                    {{ game.history.bestScore.value }}
                  </div>
                  <div class="font-kai text-xs text-ink-100 mt-0.5">已对局 {{ game.history.totalGames.value }} 次</div>
                </div>
              </div>

              <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  type="button"
                  @click="handleStart"
                  class="btn-primary px-10 py-4 text-lg flex items-center gap-3 min-w-[200px] justify-center"
                >
                  <Play class="w-5 h-5 fill-current" />
                  <span>开始飞花令</span>
                </button>
                <button
                  type="button"
                  @click="router.push('/history')"
                  class="btn-secondary px-8 py-4 flex items-center gap-3"
                >
                  <Info class="w-5 h-5" />
                  <span>我的对局</span>
                </button>
              </div>

              <div class="mt-10 text-left max-w-xl mx-auto">
                <div class="font-song text-sm text-ink-200 mb-3 flex items-center gap-2">
                  <span class="w-5 h-5 rounded-full bg-bamboo-400/10 flex items-center justify-center text-bamboo-500 font-bold text-xs">✓</span>
                  玩法说明
                </div>
                <ul class="font-kai text-sm text-ink-200 space-y-2 leading-relaxed">
                  <li>① 系统随机抽取一个汉字作为令字</li>
                  <li>② 玩家需在 30 秒内输入包含此字的完整诗句</li>
                  <li>③ 答对得分并触发连击加成，答错或超时扣分</li>
                  <li>④ 可用「字提示」或「句提示」辅助作答（消耗分数）</li>
                  <li>⑤ 系统自动检测常见错字并提供修正建议</li>
                </ul>
              </div>
            </div>
          </div>
        </InkBorder>
      </div>

      <div v-else-if="isPlaying" :key="'playing-' + transitionKey" class="space-y-6 animate-ink-wash-reveal">
        <ScorePanel
          :score="game.state.score"
          :combo="game.state.combo"
          :answered="game.state.answeredCount"
          :correct="game.state.correctCount"
          :hints-used="game.state.hintsUsed"
        />

        <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div class="lg:col-span-3 space-y-6">
            <InkBorder>
              <div class="bg-white/40 backdrop-blur rounded-2xl p-6 md:p-8 border border-paper-200/40">
                <CharacterCard
                  :char="game.state.currentChar"
                  :highlight="game.timer.isCritical.value"
                />
                <div class="mt-6">
                  <TimerBar
                    :progress="game.timer.progress.value"
                    :remaining="game.timer.remaining.value"
                    :total="game.timer.totalSeconds.value"
                    :urgent="game.timer.isUrgent.value"
                    :critical="game.timer.isCritical.value"
                  />
                </div>
              </div>
            </InkBorder>

            <div class="space-y-4">
              <FeedbackToast
                :type="game.feedback.value.type"
                :message="game.feedback.value.message"
                :score-delta="game.feedback.value.scoreDelta"
                :combo="game.state.combo"
                :details="game.feedback.value.details"
              />

              <PoemInput
                v-model="inputValue"
                :disabled="!game.timer.isRunning.value"
                :suggestion="game.typoSuggestion.value?.suggested"
                :target-char="game.state.currentChar"
                placeholder="在此输入一句含该字的诗句，回车或点击提交…"
                @submit="handleSubmit"
              />

              <div class="flex items-center justify-between gap-3 flex-wrap">
                <div class="font-kai text-xs text-ink-100 flex items-center gap-2">
                  <span class="w-1.5 h-1.5 rounded-full bg-paper-400"></span>
                  提示：至少输入 3 个汉字，无需标点符号
                </div>
                <div class="flex items-center gap-2">
                  <button
                    type="button"
                    @click="handleSkip"
                    :disabled="!game.timer.isRunning.value"
                    class="px-4 py-2 rounded-lg border border-paper-300/70 bg-paper-50 text-ink-200 font-song text-sm
                           transition-all duration-200 hover:border-vermilion-300/70 hover:text-vermilion-500 hover:-translate-y-0.5
                           disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                  >
                    跳过此题
                  </button>
                  <button
                    type="button"
                    @click="handleEndGame"
                    class="px-4 py-2 rounded-lg bg-ink-400/90 text-paper-50 font-song text-sm
                           transition-all duration-200 hover:bg-ink-400 hover:-translate-y-0.5 flex items-center gap-2"
                  >
                    <Flag class="w-4 h-4" />
                    结束本局
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="lg:col-span-2 space-y-6">
            <HintButton
              :current-level="game.state.currentHintLevel"
              :char-hint="game.state.charHint"
              :sentence-hint="game.state.sentenceHint"
              :score="game.state.score"
              :disabled="!game.timer.isRunning.value"
              @char-hint="game.useCharHint()"
              @sentence-hint="game.useSentenceHint()"
            />

            <div class="card-paper p-5">
              <div class="flex items-center gap-2 mb-4">
                <ArrowRight class="w-4 h-4 text-vermilion-400" />
                <span class="font-song text-sm font-semibold text-ink-300">今日寄语</span>
              </div>
              <div class="font-kai text-base text-ink-200 leading-loose">
                <p class="mb-2">「读书破万卷，下笔如有神。」</p>
                <p class="text-right text-xs text-ink-100 font-song">—— 杜甫《奉赠韦左丞丈》</p>
              </div>
            </div>

            <div v-if="game.state.answers.length > 0" class="card-paper p-5">
              <div class="flex items-center justify-between mb-4">
                <span class="font-song text-sm font-semibold text-ink-300">本局作答</span>
                <span class="font-song text-xs text-ink-100">{{ game.state.answers.length }} 题</span>
              </div>
              <div class="space-y-2 max-h-64 overflow-y-auto scrollbar-thin pr-1">
                <div
                  v-for="(ans, idx) in game.state.answers.slice().reverse().slice(0, 10)"
                  :key="idx"
                  class="flex items-center gap-2 p-2 rounded-lg"
                  :class="ans.isCorrect ? 'bg-bamboo-50/50' : 'bg-vermilion-50/50'"
                >
                  <span
                    class="w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0"
                    :class="ans.isCorrect ? 'bg-bamboo-400 text-white' : 'bg-vermilion-400 text-white'"
                  >
                    {{ ans.isCorrect ? '✓' : '✗' }}
                  </span>
                  <div class="min-w-0 flex-1">
                    <div class="font-kai text-sm text-ink-400 truncate">
                      「{{ ans.targetChar }}」{{ ans.correctedInput || ans.userInput || '（未答）' }}
                    </div>
                  </div>
                  <span
                    class="shrink-0 font-song text-xs font-bold tabular-nums"
                    :class="ans.scoreChange >= 0 ? 'text-bamboo-500' : 'text-vermilion-500'"
                  >
                    {{ ans.scoreChange > 0 ? '+' : '' }}{{ ans.scoreChange }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="isEnded" :key="'ended-' + transitionKey" class="max-w-2xl mx-auto animate-ink-wash-reveal">
        <div class="text-center">
          <div class="font-kai text-ink-100 text-sm tracking-[0.3em] mb-4">— 本局终了 —</div>
          <div class="font-song font-black text-6xl md:text-8xl text-vermilion-500 mb-2 tabular-nums">
            {{ game.state.score }}
          </div>
          <div class="font-kai text-ink-200 text-lg mb-10">
            共答题 {{ game.state.answeredCount }} 道，正确 {{ game.state.correctCount }} 道
          </div>
          <div class="flex items-center justify-center gap-4">
            <button type="button" @click="handleRestart" class="btn-primary px-8 py-3.5 flex items-center gap-2">
              <RotateCcw class="w-5 h-5" />
              <span>再来一局</span>
            </button>
            <button type="button" @click="router.push('/history')" class="btn-secondary px-8 py-3.5 flex items-center gap-2">
              <Info class="w-5 h-5" />
              <span>查看记录</span>
            </button>
          </div>
        </div>
      </div>
    </main>

    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="showEndModal && isPlaying"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-500/40 backdrop-blur-sm"
        @click.self="showEndModal = false"
      >
        <div class="w-full max-w-md bg-paper-50 bg-paper-texture rounded-2xl shadow-paper-lg border border-paper-200/80 p-8 animate-scale-in text-center">
          <div class="w-16 h-16 mx-auto mb-6 rounded-full bg-vermilion-400/10 flex items-center justify-center">
            <Flag class="w-8 h-8 text-vermilion-500" />
          </div>
          <h3 class="font-song font-bold text-2xl text-ink-400 mb-3">结束本局？</h3>
          <p class="font-kai text-ink-200 mb-8 leading-relaxed">
            当前得分 <span class="font-song font-bold text-vermilion-500 text-xl">{{ game.state.score }}</span> 分<br />
            结束后将自动保存对局记录
          </p>
          <div class="flex items-center justify-center gap-3">
            <button
              type="button"
              @click="showEndModal = false"
              class="btn-secondary px-6 py-3"
            >
              继续作答
            </button>
            <button
              type="button"
              @click="handleContinue"
              class="btn-primary px-6 py-3"
            >
              确认结束
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <footer class="mt-16 pb-8 text-center">
      <p class="font-kai text-xs text-ink-100/80 tracking-wider">
        诗词飞花令 · 传承千古文脉 · 共赏雅韵流芳
      </p>
    </footer>

    <AchievementBadge
      :achievement="currentBadge"
      :visible="showBadge"
      @dismiss="handleBadgeDismiss"
    />
  </div>
</template>
