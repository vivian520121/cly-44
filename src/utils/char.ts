const PUNCTUATION_REGEX = /[\s，。！？、；：""''《》「」（）【】\[\]()…—·,.!?;:'"<>\-_/\\`~@#\$%\^&\*\+=|\\]/g;

export function stripPunctuation(text: string): string {
  return (text || '').replace(PUNCTUATION_REGEX, '');
}

export function isChineseChar(ch: string): boolean {
  if (!ch || ch.length !== 1) return false;
  const code = ch.charCodeAt(0);
  return code >= 0x4e00 && code <= 0x9fff;
}

export function extractChineseChars(text: string): string[] {
  const result: string[] = [];
  const clean = stripPunctuation(text);
  for (const ch of clean) {
    if (isChineseChar(ch)) {
      result.push(ch);
    }
  }
  return result;
}

export function containsChar(sentence: string, target: string): boolean {
  if (!sentence || !target) return false;
  return stripPunctuation(sentence).includes(target);
}

export function countCharOccurrences(text: string, target: string): number {
  if (!text || !target) return 0;
  let count = 0;
  for (const ch of stripPunctuation(text)) {
    if (ch === target) count++;
  }
  return count;
}

export function highlightChar(sentence: string, target: string): string {
  if (!sentence || !target) return sentence || '';
  return sentence.split('').map(ch => {
    if (ch === target) return `{{${ch}}}`;
    return ch;
  }).join('');
}

export function normalizeForCompare(text: string): string {
  return stripPunctuation(text).trim();
}

export function levenshteinDistance(a: string, b: string): number {
  if (!a) return b?.length || 0;
  if (!b) return a.length;
  const m = a.length;
  const n = b.length;
  if (Math.abs(m - n) > 5) return 999;
  const dp: number[][] = [];
  for (let i = 0; i <= m; i++) {
    dp[i] = new Array(n + 1);
    dp[i][0] = i;
  }
  for (let j = 0; j <= n; j++) {
    dp[0][j] = j;
  }
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[m][n];
}
