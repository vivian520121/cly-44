import { ref, computed, reactive } from 'vue';
import { storageGet, storageSet, ACHIEVEMENTS_KEY } from '@/utils/storage';
import type { Achievement, AchievementState, AchievementStats, AnswerRecord, AchievementTier } from '@/types';

const ACHIEVEMENT_DEFINITIONS: Omit<Achievement, 'unlockedAt'>[] = [
  {
    id: 'first_blood',
    name: '初露锋芒',
    description: '首次答对一题',
    tier: 'bronze',
    icon: '🌱',
  },
  {
    id: 'combo_3',
    name: '出口成章',
    description: '单次连击达到 3 次',
    tier: 'bronze',
    icon: '📜',
  },
  {
    id: 'combo_7',
    name: '七步成诗',
    description: '单次连击达到 7 次',
    tier: 'silver',
    icon: '⚡',
  },
  {
    id: 'combo_15',
    name: '妙语连珠',
    description: '单次连击达到 15 次',
    tier: 'gold',
    icon: '🔥',
  },
  {
    id: 'correct_10',
    name: '小有所成',
    description: '累计答对 10 题',
    tier: 'bronze',
    icon: '✨',
  },
  {
    id: 'correct_50',
    name: '才高八斗',
    description: '累计答对 50 题',
    tier: 'silver',
    icon: '📚',
  },
  {
    id: 'correct_100',
    name: '博古通今',
    description: '累计答对 100 题',
    tier: 'gold',
    icon: '🏆',
  },
  {
    id: 'correct_300',
    name: '学富五车',
    description: '累计答对 300 题',
    tier: 'diamond',
    icon: '👑',
  },
  {
    id: 'first_game',
    name: '小试牛刀',
    description: '完成第一局游戏',
    tier: 'bronze',
    icon: '🎯',
  },
  {
    id: 'games_10',
    name: '百战不殆',
    description: '累计完成 10 局游戏',
    tier: 'silver',
    icon: '⚔️',
  },
  {
    id: 'games_50',
    name: '身经百战',
    description: '累计完成 50 局游戏',
    tier: 'gold',
    icon: '🛡️',
  },
  {
    id: 'no_hint_5',
    name: '惜字如金',
    description: '不使用提示完成 5 局游戏',
    tier: 'gold',
    icon: '💎',
  },
  {
    id: 'perfect_game',
    name: '精益求精',
    description: '单局全部答对（至少 5 题）',
    tier: 'gold',
    icon: '🌟',
  },
  {
    id: 'unique_poems_20',
    name: '诗词达人',
    description: '解锁 20 首不同的诗词',
    tier: 'silver',
    icon: '🎭',
  },
];

const DEFAULT_STATS: AchievementStats = {
  totalCorrect: 0,
  totalGames: 0,
  totalCombo: 0,
  maxComboEver: 0,
  totalHintsUsed: 0,
  gamesNoHints: 0,
  perfectGames: 0,
  currentStreak: 0,
  longestStreak: 0,
  uniquePoems: 0,
  uniqueDynasties: [],
  uniqueAuthors: [],
};

const DEFAULT_STATE: AchievementState = {
  unlocked: {},
  stats: { ...DEFAULT_STATS },
};

const unlockedQueue = ref<Achievement[]>([]);
const isShowingBadge = ref(false);

let instance: ReturnType<typeof createAchievements> | null = null;

function createAchievements() {
  const savedState = storageGet<AchievementState>(ACHIEVEMENTS_KEY, DEFAULT_STATE);

  const state = reactive<AchievementState>({
    unlocked: savedState.unlocked || {},
    stats: { ...DEFAULT_STATS, ...(savedState.stats || {}) },
  });

  const knownPoemIds = ref<Set<number>>(new Set());
  const knownDynasties = ref<Set<string>>(new Set(state.stats.uniqueDynasties || []));
  const knownAuthors = ref<Set<string>>(new Set(state.stats.uniqueAuthors || []));

  const allAchievements = computed(() =>
    ACHIEVEMENT_DEFINITIONS.map(def => ({
      ...def,
      unlockedAt: state.unlocked[def.id]?.unlockedAt,
    }))
  );

  const unlockedCount = computed(() => Object.keys(state.unlocked).length);
  const totalCount = computed(() => ACHIEVEMENT_DEFINITIONS.length);

  function save() {
    state.stats.uniqueDynasties = Array.from(knownDynasties.value);
    state.stats.uniqueAuthors = Array.from(knownAuthors.value);
    storageSet(ACHIEVEMENTS_KEY, {
      unlocked: state.unlocked,
      stats: state.stats,
    });
  }

  function unlock(id: string): Achievement | null {
    const def = ACHIEVEMENT_DEFINITIONS.find(d => d.id === id);
    if (!def || state.unlocked[id]) return null;

    const achievement: Achievement = {
      ...def,
      unlockedAt: Date.now(),
    };
    state.unlocked[id] = achievement;
    unlockedQueue.value.push(achievement);
    save();
    return achievement;
  }

  function checkAndUnlock(): Achievement[] {
    const newlyUnlocked: Achievement[] = [];
    const s = state.stats;

    const checks: [string, boolean][] = [
      ['first_blood', s.totalCorrect >= 1],
      ['combo_3', s.maxComboEver >= 3],
      ['combo_7', s.maxComboEver >= 7],
      ['combo_15', s.maxComboEver >= 15],
      ['correct_10', s.totalCorrect >= 10],
      ['correct_50', s.totalCorrect >= 50],
      ['correct_100', s.totalCorrect >= 100],
      ['correct_300', s.totalCorrect >= 300],
      ['first_game', s.totalGames >= 1],
      ['games_10', s.totalGames >= 10],
      ['games_50', s.totalGames >= 50],
      ['no_hint_5', s.gamesNoHints >= 5],
      ['perfect_game', s.perfectGames >= 1],
      ['unique_poems_20', s.uniquePoems >= 20],
    ];

    for (const [id, condition] of checks) {
      if (condition && !state.unlocked[id]) {
        const unlocked = unlock(id);
        if (unlocked) newlyUnlocked.push(unlocked);
      }
    }

    return newlyUnlocked;
  }

  function recordAnswer(answer: AnswerRecord) {
    if (answer.isCorrect) {
      state.stats.totalCorrect += 1;
      if (answer.matchedPoemId) {
        if (!knownPoemIds.value.has(answer.matchedPoemId)) {
          knownPoemIds.value.add(answer.matchedPoemId);
          state.stats.uniquePoems = knownPoemIds.value.size;
        }
      }
      if (answer.matchedPoemDynasty) {
        knownDynasties.value.add(answer.matchedPoemDynasty);
      }
      if (answer.matchedPoemAuthor) {
        knownAuthors.value.add(answer.matchedPoemAuthor);
      }
    }
    if (answer.hintUsed !== 'none') {
      state.stats.totalHintsUsed += 1;
    }
  }

  function recordCombo(combo: number) {
    if (combo > state.stats.maxComboEver) {
      state.stats.maxComboEver = combo;
    }
    state.stats.totalCombo += combo;
  }

  function recordGameEnd(answers: AnswerRecord[], maxCombo: number) {
    state.stats.totalGames += 1;

    const hintsUsed = answers.some(a => a.hintUsed !== 'none');
    if (!hintsUsed && answers.length > 0) {
      state.stats.gamesNoHints += 1;
    }

    const totalQuestions = answers.length;
    const correctCount = answers.filter(a => a.isCorrect).length;
    if (totalQuestions >= 5 && correctCount === totalQuestions) {
      state.stats.perfectGames += 1;
    }

    if (maxCombo > state.stats.maxComboEver) {
      state.stats.maxComboEver = maxCombo;
    }

    save();
    return checkAndUnlock();
  }

  function getNextBadge(): Achievement | null {
    if (isShowingBadge.value) return null;
    const next = unlockedQueue.value.shift();
    if (next) {
      isShowingBadge.value = true;
    }
    return next || null;
  }

  function dismissBadge() {
    isShowingBadge.value = false;
  }

  function reset() {
    state.unlocked = {};
    state.stats = { ...DEFAULT_STATS };
    knownPoemIds.value.clear();
    knownDynasties.value.clear();
    knownAuthors.value.clear();
    unlockedQueue.value = [];
    isShowingBadge.value = false;
    save();
  }

  return {
    state,
    allAchievements,
    unlockedCount,
    totalCount,
    unlockedQueue,
    isShowingBadge,
    recordAnswer,
    recordCombo,
    recordGameEnd,
    getNextBadge,
    dismissBadge,
    reset,
  };
}

export function useAchievements() {
  if (!instance) {
    instance = createAchievements();
  }
  return instance;
}

export function getTierColor(tier: AchievementTier): string {
  const map: Record<AchievementTier, string> = {
    bronze: 'from-amber-600 to-amber-400',
    silver: 'from-slate-400 to-slate-200',
    gold: 'from-yellow-500 to-amber-300',
    diamond: 'from-cyan-400 to-blue-400',
  };
  return map[tier];
}

export function getTierBg(tier: AchievementTier): string {
  const map: Record<AchievementTier, string> = {
    bronze: 'bg-amber-50 border-amber-200',
    silver: 'bg-slate-50 border-slate-200',
    gold: 'bg-yellow-50 border-yellow-200',
    diamond: 'bg-cyan-50 border-cyan-200',
  };
  return map[tier];
}

export function getTierText(tier: AchievementTier): string {
  const map: Record<AchievementTier, string> = {
    bronze: 'text-amber-700',
    silver: 'text-slate-600',
    gold: 'text-yellow-700',
    diamond: 'text-cyan-700',
  };
  return map[tier];
}

export function getTierLabel(tier: AchievementTier): string {
  const map: Record<AchievementTier, string> = {
    bronze: '铜章',
    silver: '银章',
    gold: '金章',
    diamond: '钻章',
  };
  return map[tier];
}
