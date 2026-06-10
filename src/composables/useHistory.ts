import { ref, computed } from 'vue';
import { storageGet, storageSet, HISTORY_KEY, storageRemove } from '@/utils/storage';
import { uid } from '@/utils/random';
import type { GameRecord, AnswerRecord } from '@/types';

const MAX_HISTORY = 50;

export function useHistory() {
  const records = ref<GameRecord[]>(storageGet<GameRecord[]>(HISTORY_KEY, []));

  const sortedRecords = computed(() =>
    [...records.value].sort((a, b) => b.endTime - a.endTime)
  );

  const totalGames = computed(() => records.value.length);

  const totalScore = computed(() =>
    records.value.reduce((sum, r) => sum + r.finalScore, 0)
  );

  const bestScore = computed(() => {
    if (records.value.length === 0) return 0;
    return Math.max(...records.value.map(r => r.finalScore));
  });

  const averageAccuracy = computed(() => {
    if (records.value.length === 0) return 0;
    const total = records.value.reduce((sum, r) => sum + r.accuracy, 0);
    return total / records.value.length;
  });

  const averageMaxCombo = computed(() => {
    if (records.value.length === 0) return 0;
    const total = records.value.reduce((sum, r) => sum + r.maxCombo, 0);
    return Math.round(total / records.value.length);
  });

  const allAnswers = computed(() => {
    const result: (AnswerRecord & { gameId: string; gameTime: number })[] = [];
    for (const r of records.value) {
      for (const a of r.answers) {
        result.push({ ...a, gameId: r.id, gameTime: r.endTime });
      }
    }
    return result.sort((a, b) => b.timestamp - a.timestamp);
  });

  const correctAnswers = computed(() =>
    allAnswers.value.filter(a => a.isCorrect)
  );

  function saveRecord(answers: AnswerRecord[], finalScore: number,
                      maxCombo: number, startTime: number): GameRecord {
    const endTime = Date.now();
    const totalQuestions = answers.length;
    const correctCount = answers.filter(a => a.isCorrect).length;
    const accuracy = totalQuestions > 0 ? correctCount / totalQuestions : 0;
    const record: GameRecord = {
      id: uid('game_'),
      startTime,
      endTime,
      finalScore,
      totalQuestions,
      correctCount,
      accuracy,
      maxCombo,
      answers,
    };
    records.value.push(record);
    if (records.value.length > MAX_HISTORY) {
      records.value.sort((a, b) => b.endTime - a.endTime);
      records.value = records.value.slice(0, MAX_HISTORY);
    }
    storageSet(HISTORY_KEY, records.value);
    return record;
  }

  function getRecord(id: string): GameRecord | undefined {
    return records.value.find(r => r.id === id);
  }

  function deleteRecord(id: string): boolean {
    const idx = records.value.findIndex(r => r.id === id);
    if (idx < 0) return false;
    records.value.splice(idx, 1);
    storageSet(HISTORY_KEY, records.value);
    return true;
  }

  function clearAll(): void {
    records.value = [];
    storageRemove(HISTORY_KEY);
  }

  return {
    records,
    sortedRecords,
    totalGames,
    totalScore,
    bestScore,
    averageAccuracy,
    averageMaxCombo,
    allAnswers,
    correctAnswers,
    saveRecord,
    getRecord,
    deleteRecord,
    clearAll,
  };
}
