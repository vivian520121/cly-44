import { ref, reactive, computed, watch } from 'vue';
import { useTimer } from './useTimer';
import { usePoemMatcher } from './usePoemMatcher';
import { useTypoCorrection } from './useTypoCorrection';
import { useHistory } from './useHistory';
import { useAchievements } from './useAchievements';
import { useTypoBook } from './useTypoBook';
import type { GameState, AnswerRecord, HintLevel, MatchResult, TypoSuggestion } from '@/types';
import { storageGet, storageSet, RECENT_CHARS_KEY } from '@/utils/storage';

const QUESTION_TIME = 30;
const MAX_RECENT_CHARS = 20;
const SCORE_CORRECT_BASE = 10;
const SCORE_COMBO_BONUS = 2;
const SCORE_CORRECT_CHAR_HINT = 5;
const SCORE_CORRECT_SENTENCE_HINT = 2;
const SCORE_WRONG = -5;
const SCORE_CHAR_HINT_PENALTY = -3;
const SCORE_SENTENCE_HINT_PENALTY = -8;

export function useGame() {
  const matcher = usePoemMatcher();
  const corrector = useTypoCorrection();
  const historyStore = useHistory();
  const achievements = useAchievements();
  const typoBook = useTypoBook();
  const timer = useTimer({
    initialSeconds: QUESTION_TIME,
    autoStart: false,
    onComplete: () => handleTimeout(),
  });

  const feedback = ref<{
    type: 'correct' | 'wrong' | 'hint' | 'timeout' | null;
    message: string;
    scoreDelta: number;
    details?: { title?: string; author?: string; dynasty?: string; sentence?: string; poemId?: number };
  }>({ type: null, message: '', scoreDelta: 0 });

  const typoSuggestion = ref<TypoSuggestion | null>(null);
  const matchDebug = ref<MatchResult | null>(null);

  const state = reactive<GameState>({
    status: 'idle',
    currentChar: '',
    score: 0,
    combo: 0,
    maxCombo: 0,
    answeredCount: 0,
    correctCount: 0,
    timeLeft: QUESTION_TIME,
    totalTime: 0,
    hintsUsed: 0,
    currentHintLevel: 'none',
    charHint: '',
    sentenceHint: '',
    answers: [],
    recentChars: storageGet<string[]>(RECENT_CHARS_KEY, []),
    questionStartTime: 0,
  });

  const startTime = ref<number>(0);
  const practiceChar = ref<string | null>(null);

  const accuracy = computed(() => {
    if (state.answeredCount === 0) return 0;
    return state.correctCount / state.answeredCount;
  });

  const isPracticeMode = computed(() => practiceChar.value !== null);

  watch(timer.remaining, (v) => {
    state.timeLeft = v;
  });

  function startGame(options?: { practiceChar?: string }) {
    state.status = 'playing';
    state.score = 0;
    state.combo = 0;
    state.maxCombo = 0;
    state.answeredCount = 0;
    state.correctCount = 0;
    state.totalTime = 0;
    state.hintsUsed = 0;
    state.answers = [];
    practiceChar.value = options?.practiceChar || null;
    startTime.value = Date.now();
    nextQuestion();
  }

  function nextQuestion() {
    if (practiceChar.value) {
      state.currentChar = practiceChar.value;
    } else {
      state.currentChar = matcher.getRandomChar(state.recentChars);
    }
    state.currentHintLevel = 'none';
    state.charHint = '';
    state.sentenceHint = '';
    state.questionStartTime = Date.now();
    if (!practiceChar.value) {
      state.recentChars.push(state.currentChar);
      if (state.recentChars.length > MAX_RECENT_CHARS) {
        state.recentChars.shift();
      }
      storageSet(RECENT_CHARS_KEY, state.recentChars);
    }
    typoSuggestion.value = null;
    feedback.value = { type: null, message: '', scoreDelta: 0 };
    timer.start(QUESTION_TIME);
  }

  function useCharHint() {
    if (state.status !== 'playing') return;
    if (state.currentHintLevel === 'sentence') return;
    if (state.currentHintLevel === 'none') {
      state.currentHintLevel = 'char';
      state.charHint = matcher.getCharHint(state.currentChar);
      state.score += SCORE_CHAR_HINT_PENALTY;
      state.hintsUsed++;
      feedback.value = {
        type: 'hint',
        message: `字提示已解锁（${SCORE_CHAR_HINT_PENALTY}分）`,
        scoreDelta: SCORE_CHAR_HINT_PENALTY,
      };
    }
  }

  function useSentenceHint() {
    if (state.status !== 'playing') return;
    if (state.currentHintLevel === 'none') {
      state.charHint = matcher.getCharHint(state.currentChar);
    }
    if (state.currentHintLevel !== 'sentence') {
      const prevLevel = state.currentHintLevel;
      state.currentHintLevel = 'sentence';
      const answeredSentences = state.answers
        .filter(a => a.matchedSentence)
        .map(a => a.matchedSentence!);
      state.sentenceHint = matcher.getHintSentence(state.currentChar, answeredSentences);
      const penalty = prevLevel === 'char'
        ? SCORE_SENTENCE_HINT_PENALTY - SCORE_CHAR_HINT_PENALTY
        : SCORE_SENTENCE_HINT_PENALTY;
      state.score += penalty;
      state.hintsUsed++;
      feedback.value = {
        type: 'hint',
        message: `句提示已解锁（${penalty}分）`,
        scoreDelta: penalty,
      };
    }
  }

  function submitAnswer(rawInput: string): { success: boolean; corrected?: string } {
    if (state.status !== 'playing') return { success: false };
    const timeSpent = (Date.now() - state.questionStartTime) / 1000;
    timer.stop();

    let correctedInput = rawInput.trim();
    let suggestion: TypoSuggestion | null = null;

    if (correctedInput.length >= 4) {
      suggestion = corrector.correct(correctedInput, state.currentChar);
      if (suggestion.autoCorrect && suggestion.distance > 0) {
        correctedInput = suggestion.suggested;
        typoSuggestion.value = suggestion;
      }
    }

    const match = matcher.matchInput(correctedInput, state.currentChar);
    matchDebug.value = match;

    const answer: AnswerRecord = {
      targetChar: state.currentChar,
      userInput: rawInput.trim(),
      correctedInput,
      isCorrect: match.isMatch,
      hintUsed: state.currentHintLevel,
      timeSpent,
      scoreChange: 0,
      timestamp: Date.now(),
    };

    if (match.isMatch && match.poemId) {
      answer.matchedPoemId = match.poemId;
      answer.matchedSentence = match.sentence;
      answer.matchedPoemTitle = match.poemTitle;
      answer.matchedPoemAuthor = match.poemAuthor;
      answer.matchedPoemDynasty = match.poemDynasty;

      let delta = SCORE_CORRECT_BASE + state.combo * SCORE_COMBO_BONUS;
      if (state.currentHintLevel === 'char') delta = SCORE_CORRECT_CHAR_HINT;
      else if (state.currentHintLevel === 'sentence') delta = SCORE_CORRECT_SENTENCE_HINT;
      if (match.isFuzzy) delta = Math.max(2, delta - 2);

      state.score += delta;
      state.combo += 1;
      if (state.combo > state.maxCombo) state.maxCombo = state.combo;
      state.correctCount += 1;
      answer.scoreChange = delta;

      feedback.value = {
        type: 'correct',
        message: state.combo > 1 ? `妙哉！连击 ×${state.combo}` : '善！答对了',
        scoreDelta: delta,
        details: {
          title: match.poemTitle,
          author: match.poemAuthor,
          dynasty: match.poemDynasty,
          sentence: match.sentence,
          poemId: match.poemId,
        },
      };
    } else {
      state.score += SCORE_WRONG;
      state.combo = 0;
      answer.scoreChange = SCORE_WRONG;

      const suggestions = corrector.suggest(rawInput.trim(), state.currentChar, 3);
      feedback.value = {
        type: 'wrong',
        message: suggestions.length > 0
          ? `未收录此句。相似诗句：${suggestions[0]}`
          : '惜哉，未匹配到收录诗句',
        scoreDelta: SCORE_WRONG,
      };
    }

    state.answeredCount += 1;
    state.totalTime += timeSpent;
    state.answers.push(answer);

    achievements.recordAnswer(answer);
    if (state.combo > 0) {
      achievements.recordCombo(state.combo);
    }

    const wasCorrected = suggestion !== null && suggestion.autoCorrect && suggestion.distance > 0;
    typoBook.recordFromAnswer(answer, wasCorrected);

    return { success: match.isMatch, corrected: correctedInput };
  }

  function handleTimeout() {
    if (state.status !== 'playing') return;
    const timeSpent = QUESTION_TIME;
    state.score += SCORE_WRONG;
    state.combo = 0;
    const answer: AnswerRecord = {
      targetChar: state.currentChar,
      userInput: '',
      correctedInput: '',
      isCorrect: false,
      hintUsed: state.currentHintLevel,
      timeSpent,
      scoreChange: SCORE_WRONG,
      timestamp: Date.now(),
    };
    state.answeredCount += 1;
    state.totalTime += timeSpent;
    state.answers.push(answer);

    achievements.recordAnswer(answer);
    typoBook.recordFromAnswer(answer, false);

    const hintSentence = matcher.getHintSentence(state.currentChar);
    feedback.value = {
      type: 'timeout',
      message: hintSentence ? `时尽！参考：${hintSentence}` : '时尽！再接再厉',
      scoreDelta: SCORE_WRONG,
    };
  }

  function skipQuestion() {
    if (state.status !== 'playing') return;
    handleTimeout();
  }

  function endGame() {
    if (state.status === 'idle' || state.status === 'ended') return;
    timer.stop();
    state.status = 'ended';
    historyStore.saveRecord(
      state.answers,
      state.score,
      state.maxCombo,
      startTime.value
    );
    achievements.recordGameEnd(state.answers, state.maxCombo);
  }

  function resetGame() {
    timer.reset();
    state.status = 'idle';
    state.currentChar = '';
    state.score = 0;
    state.combo = 0;
    state.maxCombo = 0;
    state.answeredCount = 0;
    state.correctCount = 0;
    state.timeLeft = QUESTION_TIME;
    state.totalTime = 0;
    state.hintsUsed = 0;
    state.currentHintLevel = 'none';
    state.charHint = '';
    state.sentenceHint = '';
    state.answers = [];
    feedback.value = { type: null, message: '', scoreDelta: 0 };
    typoSuggestion.value = null;
  }

  return {
    state,
    timer,
    feedback,
    typoSuggestion,
    matchDebug,
    accuracy,
    history: historyStore,
    achievements,
    matcher,
    typoBook,
    isPracticeMode,
    practiceChar,
    startGame,
    nextQuestion,
    submitAnswer,
    skipQuestion,
    useCharHint,
    useSentenceHint,
    endGame,
    resetGame,
  };
}
