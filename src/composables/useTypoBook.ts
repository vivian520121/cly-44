import { ref, computed } from 'vue';
import { storageGet, storageSet, TYPO_BOOK_KEY, storageRemove } from '@/utils/storage';
import { uid } from '@/utils/random';
import poems from '@/data/poems';
import { usePoemMatcher } from './usePoemMatcher';
import type { TypoEntry, TypoCharStats, AnswerRecord, HintLevel, Poem } from '@/types';

const MAX_ENTRIES_PER_CHAR = 50;

const entries = ref<TypoEntry[]>(storageGet<TypoEntry[]>(TYPO_BOOK_KEY, []));

function save() {
  storageSet(TYPO_BOOK_KEY, entries.value);
}

export function useTypoBook() {
  const matcher = usePoemMatcher();

  const totalEntries = computed(() => entries.value.length);

  const uniqueChars = computed(() => {
    const set = new Set(entries.value.map(e => e.targetChar));
    return set.size;
  });

  const charStats = computed<TypoCharStats[]>(() => {
    const map = new Map<string, TypoCharStats>();
    for (const e of entries.value) {
      if (!map.has(e.targetChar)) {
        map.set(e.targetChar, {
          char: e.targetChar,
          totalErrors: 0,
          lastErrorAt: 0,
          entries: [],
        });
      }
      const stats = map.get(e.targetChar)!;
      stats.totalErrors++;
      if (e.timestamp > stats.lastErrorAt) {
        stats.lastErrorAt = e.timestamp;
      }
      stats.entries.push(e);
    }
    const result: TypoCharStats[] = [];
    for (const stats of map.values()) {
      stats.entries.sort((a, b) => b.timestamp - a.timestamp);
      result.push(stats);
    }
    result.sort((a, b) => b.totalErrors - a.totalErrors);
    return result;
  });

  const sortedByRecent = computed<TypoCharStats[]>(() => {
    return [...charStats.value].sort((a, b) => b.lastErrorAt - a.lastErrorAt);
  });

  function recordFromAnswer(answer: AnswerRecord, wasAutoCorrected: boolean): void {
    if (answer.isCorrect && !wasAutoCorrected) return;

    const entry: TypoEntry = {
      id: uid('typo_'),
      targetChar: answer.targetChar,
      userInput: answer.userInput,
      correctedInput: wasAutoCorrected ? answer.correctedInput : undefined,
      wasAutoCorrected,
      matchedSentence: answer.matchedSentence,
      matchedPoemId: answer.matchedPoemId,
      matchedPoemTitle: answer.matchedPoemTitle,
      matchedPoemAuthor: answer.matchedPoemAuthor,
      matchedPoemDynasty: answer.matchedPoemDynasty,
      hintUsed: answer.hintUsed,
      scoreChange: answer.scoreChange,
      timestamp: answer.timestamp,
    };

    entries.value.push(entry);
    trimEntriesForChar(answer.targetChar);
    save();
  }

  function trimEntriesForChar(char: string): void {
    const charEntries = entries.value.filter(e => e.targetChar === char);
    if (charEntries.length <= MAX_ENTRIES_PER_CHAR) return;
    charEntries.sort((a, b) => b.timestamp - a.timestamp);
    const toRemove = new Set(charEntries.slice(MAX_ENTRIES_PER_CHAR).map(e => e.id));
    entries.value = entries.value.filter(e => !toRemove.has(e.id));
  }

  function getStatsForChar(char: string): TypoCharStats | undefined {
    return charStats.value.find(s => s.char === char);
  }

  function getPoemsForChar(char: string): (Poem & { sentences: string[] })[] {
    const sentences = matcher.getSentencesContainingChar(char);
    const poemMap = new Map<number, { poem: Poem; sentences: string[] }>();
    for (const poem of poems) {
      for (const sentence of poem.content) {
        if (sentences.includes(sentence)) {
          if (!poemMap.has(poem.id)) {
            poemMap.set(poem.id, { poem, sentences: [] });
          }
          poemMap.get(poem.id)!.sentences.push(sentence);
        }
      }
    }
    return Array.from(poemMap.values()).map(({ poem, sentences }) => ({
      ...poem,
      sentences,
    }));
  }

  function removeEntry(id: string): boolean {
    const idx = entries.value.findIndex(e => e.id === id);
    if (idx < 0) return false;
    entries.value.splice(idx, 1);
    save();
    return true;
  }

  function removeChar(char: string): boolean {
    const before = entries.value.length;
    entries.value = entries.value.filter(e => e.targetChar !== char);
    const removed = entries.value.length < before;
    if (removed) save();
    return removed;
  }

  function clearAll(): void {
    entries.value = [];
    storageRemove(TYPO_BOOK_KEY);
  }

  function startPracticeForChar(char: string, router: { push: (to: { path: string; query?: Record<string, string> }) => void }): void {
    router.push({ path: '/game', query: { practiceChar: char } });
  }

  return {
    entries,
    totalEntries,
    uniqueChars,
    charStats,
    sortedByRecent,
    recordFromAnswer,
    getStatsForChar,
    getPoemsForChar,
    removeEntry,
    removeChar,
    clearAll,
    startPracticeForChar,
  };
}
