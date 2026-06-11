import { computed } from 'vue';
import { useHistory } from './useHistory';
import poems from '@/data/poems';
import type { AnswerRecord, GameRecord } from '@/types';

export interface WrongCharItem {
  char: string;
  count: number;
  wrongCount: number;
  wrongRate: number;
}

export interface DynastyItem {
  name: string;
  correctCount: number;
  totalInBank: number;
}

export interface SpeedTrendPoint {
  gameIndex: number;
  avgTime: number;
  date: string;
  correctCount: number;
}

export interface CoverageData {
  coveredPoems: number;
  totalPoems: number;
  coveredChars: number;
  totalChars: number;
  poemRate: number;
  charRate: number;
}

export function useInsight() {
  const history = useHistory();

  const wrongCharTop10 = computed<WrongCharItem[]>(() => {
    const charMap = new Map<string, { wrong: number; total: number }>();

    for (const record of history.records.value) {
      for (const ans of record.answers) {
        const ch = ans.targetChar;
        if (!charMap.has(ch)) {
          charMap.set(ch, { wrong: 0, total: 0 });
        }
        const entry = charMap.get(ch)!;
        entry.total++;
        if (!ans.isCorrect) {
          entry.wrong++;
        }
      }
    }

    const items: WrongCharItem[] = [];
    for (const [char, data] of charMap) {
      if (data.wrong > 0) {
        items.push({
          char,
          count: data.total,
          wrongCount: data.wrong,
          wrongRate: data.wrong / data.total,
        });
      }
    }

    items.sort((a, b) => b.wrongCount - a.wrongCount || b.wrongRate - a.wrongRate);
    return items.slice(0, 10);
  });

  const dynastyDistribution = computed<DynastyItem[]>(() => {
    const dynastyCorrect = new Map<string, number>();

    for (const record of history.records.value) {
      for (const ans of record.answers) {
        if (ans.isCorrect && ans.matchedPoemDynasty) {
          const d = ans.matchedPoemDynasty;
          dynastyCorrect.set(d, (dynastyCorrect.get(d) || 0) + 1);
        }
      }
    }

    const dynastyInBank = new Map<string, number>();
    for (const poem of poems) {
      dynastyInBank.set(poem.dynasty, (dynastyInBank.get(poem.dynasty) || 0) + 1);
    }

    const items: DynastyItem[] = [];
    for (const [name, correctCount] of dynastyCorrect) {
      items.push({
        name,
        correctCount,
        totalInBank: dynastyInBank.get(name) || 0,
      });
    }

    items.sort((a, b) => b.correctCount - a.correctCount);
    return items;
  });

  const speedTrend = computed<SpeedTrendPoint[]>(() => {
    const sorted = [...history.records.value].sort((a, b) => a.endTime - b.endTime);
    return sorted.map((record, idx) => {
      const correctAnswers = record.answers.filter((a: AnswerRecord) => a.isCorrect);
      const avgTime = correctAnswers.length > 0
        ? correctAnswers.reduce((s: number, a: AnswerRecord) => s + a.timeSpent, 0) / correctAnswers.length
        : 0;
      const d = new Date(record.endTime);
      const pad = (n: number) => String(n).padStart(2, '0');
      return {
        gameIndex: idx + 1,
        avgTime: Math.round(avgTime * 10) / 10,
        date: `${pad(d.getMonth() + 1)}/${pad(d.getDate())}`,
        correctCount: correctAnswers.length,
      };
    });
  });

  const coverage = computed<CoverageData>(() => {
    const coveredPoemIds = new Set<number>();
    const coveredChars = new Set<string>();

    for (const record of history.records.value) {
      for (const ans of record.answers) {
        if (ans.isCorrect && ans.matchedPoemId != null) {
          coveredPoemIds.add(ans.matchedPoemId);
        }
        coveredChars.add(ans.targetChar);
      }
    }

    const totalPoems = poems.length;
    const totalChars = new Set<string>();
    for (const poem of poems) {
      for (const sentence of poem.content) {
        for (const ch of sentence) {
          if (/[\u4e00-\u9fff]/.test(ch)) {
            totalChars.add(ch);
          }
        }
      }
    }

    return {
      coveredPoems: coveredPoemIds.size,
      totalPoems,
      coveredChars: coveredChars.size,
      totalChars: totalChars.size,
      poemRate: totalPoems > 0 ? coveredPoemIds.size / totalPoems : 0,
      charRate: totalChars.size > 0 ? coveredChars.size / totalChars.size : 0,
    };
  });

  const hasData = computed(() => history.records.value.length > 0);

  return {
    wrongCharTop10,
    dynastyDistribution,
    speedTrend,
    coverage,
    hasData,
  };
}
