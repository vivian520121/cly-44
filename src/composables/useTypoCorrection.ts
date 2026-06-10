import { pinyin } from 'pinyin-pro';
import { normalizeForCompare, levenshteinDistance, stripPunctuation } from '@/utils/char';
import poems from '@/data/poems';
import type { TypoSuggestion } from '@/types';

interface PinyinIndexEntry {
  sentence: string;
  normalized: string;
  pinyin: string;
}

let pinyinIndex: PinyinIndexEntry[] | null = null;
const COMMON_TYPOS: Map<string, string[]> = new Map([
  ['的', ['地', '得']],
  ['地', ['的', '得']],
  ['得', ['的', '地']],
  ['那', ['哪']],
  ['哪', ['那']],
  ['做', ['作', '坐']],
  ['作', ['做', '坐']],
  ['坐', ['做', '作']],
  ['在', ['再']],
  ['再', ['在']],
  ['以', ['已']],
  ['已', ['以']],
  ['象', ['像']],
  ['像', ['象']],
  ['才', ['材', '财']],
  ['又', ['有', '右']],
  ['是', ['事', '世', '市', '式', '室', '试', '士']],
  ['事', ['是', '世', '市', '式']],
  ['无', ['吾', '吴', '五', '午']],
  ['山', ['衫', '扇']],
  ['风', ['丰', '封', '峰', '锋', '枫']],
  ['月', ['越', '乐', '岳']],
  ['花', ['华', '画', '化']],
  ['人', ['仁', '认', '忍']],
  ['天', ['田', '甜', '填']],
  ['一', ['衣', '依', '医', '壹']],
  ['不', ['步', '部', '布', '卜']],
  ['来', ['莱', '赖']],
  ['时', ['十', '石', '实', '识', '食', '史']],
]);

function buildPinyinIndex() {
  if (pinyinIndex) return;
  const result: PinyinIndexEntry[] = [];
  for (let i = 0; i < Math.min(poems.length, 3000); i++) {
    for (const sentence of poems[i].content) {
      const normalized = normalizeForCompare(sentence);
      if (normalized.length < 4 || normalized.length > 15) continue;
      const py = pinyin(normalized, { toneType: 'none', type: 'array' }).join('');
      result.push({ sentence, normalized, pinyin: py });
    }
  }
  pinyinIndex = result;
}

export function useTypoCorrection() {
  buildPinyinIndex();

  function getPinyin(text: string): string {
    return pinyin(stripPunctuation(text), { toneType: 'none', type: 'array' }).join('');
  }

  function applyCommonTypos(input: string): string[] {
    const results: string[] = [input];
    for (let i = 0; i < input.length; i++) {
      const ch = input[i];
      const alts = COMMON_TYPOS.get(ch);
      if (!alts) continue;
      for (const alt of alts) {
        const variant = input.slice(0, i) + alt + input.slice(i + 1);
        if (!results.includes(variant)) results.push(variant);
      }
    }
    return results;
  }

  function findByPinyin(input: string): string | null {
    if (!pinyinIndex || input.length < 4) return null;
    const inputPy = getPinyin(input);
    if (!inputPy) return null;
    let best: { candidate: string; pyDist: number; strDist: number } | null = null;
    for (const entry of pinyinIndex) {
      if (Math.abs(entry.normalized.length - input.length) > 2) continue;
      const pyDist = levenshteinDistance(inputPy, entry.pinyin);
      if (pyDist > input.length * 0.4) continue;
      const strDist = levenshteinDistance(input, entry.normalized);
      if (strDist > 3) continue;
      const score = pyDist * 1.5 + strDist;
      if (!best || score < (best.pyDist * 1.5 + best.strDist)) {
        best = { candidate: entry.sentence, pyDist, strDist };
      }
    }
    return best ? best.candidate : null;
  }

  function correct(input: string, targetChar: string): TypoSuggestion {
    const normalized = normalizeForCompare(input);
    const result: TypoSuggestion = {
      original: input,
      suggested: input,
      distance: 0,
      autoCorrect: false,
    };
    if (normalized.length < 3 || !targetChar) return result;

    const variants = applyCommonTypos(normalized);
    for (const v of variants) {
      if (v !== normalized) {
        const dist = levenshteinDistance(normalized, v);
        if (dist === 1) {
          result.suggested = v;
          result.distance = 1;
          result.autoCorrect = true;
          return result;
        }
      }
    }

    const pyMatch = findByPinyin(normalized);
    if (pyMatch) {
      const cleanPy = stripPunctuation(pyMatch);
      const dist = levenshteinDistance(normalized, cleanPy);
      if (dist > 0 && dist <= 2 && cleanPy.includes(targetChar)) {
        result.suggested = pyMatch;
        result.distance = dist;
        result.autoCorrect = dist <= 1;
        return result;
      }
    }

    return result;
  }

  function suggest(input: string, targetChar: string, limit = 5): string[] {
    if (!pinyinIndex) return [];
    const normalized = normalizeForCompare(input);
    if (normalized.length < 3) return [];
    const inputPy = getPinyin(input);
    const scored: { sentence: string; score: number }[] = [];
    for (const entry of pinyinIndex) {
      if (!entry.normalized.includes(targetChar)) continue;
      if (Math.abs(entry.normalized.length - normalized.length) > 3) continue;
      const pyDist = levenshteinDistance(inputPy, entry.pinyin);
      const strDist = levenshteinDistance(normalized, entry.normalized);
      const score = pyDist * 2 + strDist * 3;
      if (score <= 12) {
        scored.push({ sentence: entry.sentence, score });
      }
    }
    return scored
      .sort((a, b) => a.score - b.score)
      .slice(0, limit)
      .map(s => s.sentence);
  }

  return {
    correct,
    suggest,
    getPinyin,
  };
}
