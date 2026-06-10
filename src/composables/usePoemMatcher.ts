import { ref, computed } from 'vue';
import poems from '@/data/poems';
import commonChars from '@/data/common-chars';
import { normalizeForCompare, containsChar, levenshteinDistance, stripPunctuation } from '@/utils/char';
import { randomExcluding } from '@/utils/random';
import type { Poem, MatchResult } from '@/types';

interface SentenceIndex {
  sentence: string;
  normalized: string;
  poemId: number;
  poemIndex: number;
}

const sentenceIndex: SentenceIndex[] = [];
const charToSentences: Map<string, number[]> = new Map();
let indexBuilt = false;

function buildIndex() {
  if (indexBuilt) return;
  for (let i = 0; i < poems.length; i++) {
    const poem = poems[i];
    for (const sentence of poem.content) {
      const normalized = normalizeForCompare(sentence);
      if (normalized.length < 3) continue;
      const idx = sentenceIndex.length;
      sentenceIndex.push({
        sentence,
        normalized,
        poemId: poem.id,
        poemIndex: i,
      });
      const chars = new Set(normalized);
      for (const ch of chars) {
        if (!charToSentences.has(ch)) {
          charToSentences.set(ch, []);
        }
        charToSentences.get(ch)!.push(idx);
      }
    }
  }
  indexBuilt = true;
}

buildIndex();

export function usePoemMatcher() {
  const lastMatch = ref<MatchResult | null>(null);

  function getSentencesContainingChar(ch: string): string[] {
    const indices = charToSentences.get(ch) || [];
    return indices.map(i => sentenceIndex[i].sentence);
  }

  function getPoemById(id: number): Poem | null {
    const found = poems.find(p => p.id === id);
    return found || null;
  }

  function getRandomChar(exclude: string[] = [], minSentences = 20): string {
    const eligible: string[] = [];
    const weights: number[] = [];
    for (const ch of commonChars) {
      if (exclude.includes(ch)) continue;
      const count = charToSentences.get(ch)?.length || 0;
      if (count >= minSentences) {
        eligible.push(ch);
        weights.push(Math.sqrt(count));
      }
    }
    if (eligible.length === 0) {
      return randomExcluding(commonChars, exclude) || '月';
    }
    const total = weights.reduce((a, b) => a + b, 0);
    let r = Math.random() * total;
    for (let i = 0; i < eligible.length; i++) {
      r -= weights[i];
      if (r <= 0) return eligible[i];
    }
    return eligible[eligible.length - 1];
  }

  function getHintSentence(ch: string, excludeSentences: string[] = []): string {
    const candidates = getSentencesContainingChar(ch).filter(
      s => !excludeSentences.includes(s)
    );
    if (candidates.length === 0) return '';
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  function getCharHint(ch: string): string {
    const sentence = getHintSentence(ch);
    if (!sentence) return '';
    const clean = stripPunctuation(sentence);
    const pos = clean.indexOf(ch);
    if (pos < 0) return '';
    const start = Math.max(0, pos - 2);
    const end = Math.min(clean.length, pos + 3);
    return clean.slice(start, end).split('').map((c, i) => {
      const actualPos = start + i;
      return actualPos === pos ? c : '○';
    }).join('');
  }

  function matchInput(input: string, targetChar: string): MatchResult {
    const normalized = normalizeForCompare(input);
    if (normalized.length < 3) {
      lastMatch.value = { isMatch: false };
      return lastMatch.value;
    }
    if (!normalized.includes(targetChar)) {
      lastMatch.value = { isMatch: false };
      return lastMatch.value;
    }
    const candidates = charToSentences.get(targetChar) || [];

    for (const idx of candidates) {
      const entry = sentenceIndex[idx];
      if (entry.normalized === normalized ||
          entry.normalized.includes(normalized) ||
          normalized.includes(entry.normalized)) {
        const poem = poems[entry.poemIndex];
        lastMatch.value = {
          isMatch: true,
          poemId: poem.id,
          sentence: entry.sentence,
          poemTitle: poem.title,
          poemAuthor: poem.author,
          poemDynasty: poem.dynasty,
          isFuzzy: false,
          fuzzyDistance: 0,
        };
        return lastMatch.value;
      }
    }

    let bestMatch: { idx: number; distance: number } | null = null;
    for (const idx of candidates) {
      const entry = sentenceIndex[idx];
      if (Math.abs(entry.normalized.length - normalized.length) > 3) continue;
      const dist = levenshteinDistance(normalized, entry.normalized);
      if (dist <= 2 && (!bestMatch || dist < bestMatch.distance)) {
        bestMatch = { idx, distance: dist };
      }
    }

    if (bestMatch) {
      const entry = sentenceIndex[bestMatch.idx];
      const poem = poems[entry.poemIndex];
      lastMatch.value = {
        isMatch: true,
        poemId: poem.id,
        sentence: entry.sentence,
        poemTitle: poem.title,
        poemAuthor: poem.author,
        poemDynasty: poem.dynasty,
        isFuzzy: true,
        fuzzyDistance: bestMatch.distance,
      };
      return lastMatch.value;
    }

    lastMatch.value = { isMatch: false };
    return lastMatch.value;
  }

  const totalPoems = computed(() => poems.length);
  const totalSentences = computed(() => sentenceIndex.length);
  const totalChars = computed(() => charToSentences.size);

  return {
    lastMatch,
    totalPoems,
    totalSentences,
    totalChars,
    getSentencesContainingChar,
    getPoemById,
    getRandomChar,
    getHintSentence,
    getCharHint,
    matchInput,
  };
}
