export type { Poem } from '../data/types';

export type GameStatus = 'idle' | 'playing' | 'paused' | 'ended';

export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'diamond';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  tier: AchievementTier;
  icon: string;
  unlockedAt?: number;
}

export interface AchievementState {
  unlocked: Record<string, Achievement>;
  stats: AchievementStats;
}

export interface AchievementStats {
  totalCorrect: number;
  totalGames: number;
  totalCombo: number;
  maxComboEver: number;
  totalHintsUsed: number;
  gamesNoHints: number;
  perfectGames: number;
  currentStreak: number;
  longestStreak: number;
  uniquePoems: number;
  uniqueDynasties: string[];
  uniqueAuthors: string[];
}

export type HintLevel = 'none' | 'char' | 'sentence';

export interface AnswerRecord {
  targetChar: string;
  userInput: string;
  correctedInput: string;
  isCorrect: boolean;
  matchedPoemId?: number;
  matchedSentence?: string;
  matchedPoemTitle?: string;
  matchedPoemAuthor?: string;
  matchedPoemDynasty?: string;
  hintUsed: HintLevel;
  timeSpent: number;
  scoreChange: number;
  timestamp: number;
}

export interface GameState {
  status: GameStatus;
  currentChar: string;
  score: number;
  combo: number;
  maxCombo: number;
  answeredCount: number;
  correctCount: number;
  timeLeft: number;
  totalTime: number;
  hintsUsed: number;
  currentHintLevel: HintLevel;
  charHint: string;
  sentenceHint: string;
  answers: AnswerRecord[];
  recentChars: string[];
  questionStartTime: number;
}

export interface GameRecord {
  id: string;
  startTime: number;
  endTime: number;
  finalScore: number;
  totalQuestions: number;
  correctCount: number;
  accuracy: number;
  maxCombo: number;
  answers: AnswerRecord[];
}

export interface TypoSuggestion {
  original: string;
  suggested: string;
  distance: number;
  autoCorrect: boolean;
}

export interface MatchResult {
  isMatch: boolean;
  poemId?: number;
  sentence?: string;
  poemTitle?: string;
  poemAuthor?: string;
  poemDynasty?: string;
  isFuzzy?: boolean;
  fuzzyDistance?: number;
}
