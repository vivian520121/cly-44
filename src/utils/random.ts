export function randomInt(min: number, max: number): number {
  if (min > max) [min, max] = [max, min];
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomPick<T>(arr: T[]): T | null {
  if (!arr || arr.length === 0) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}

export function randomWeightedPick<T>(items: T[], weights: number[]): T | null {
  if (!items || items.length === 0) return null;
  if (weights.length !== items.length) return randomPick(items);
  const total = weights.reduce((a, b) => a + b, 0);
  if (total <= 0) return randomPick(items);
  let r = Math.random() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

export function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function randomExcluding<T>(pool: T[], exclude: T[]): T | null {
  if (!pool || pool.length === 0) return null;
  const excludeSet = new Set(exclude);
  const candidates = pool.filter(x => !excludeSet.has(x));
  if (candidates.length === 0) return randomPick(pool);
  return randomPick(candidates);
}

export function uid(prefix = ''): string {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}
