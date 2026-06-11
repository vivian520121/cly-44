import { ref, computed } from 'vue';
import { storageGet, storageSet, COLLECTION_KEY } from '@/utils/storage';
import type { Poem } from '@/types';
import poems from '@/data/poems';

export interface CollectionItem {
  poemId: number;
  collectedAt: number;
}

const items = ref<CollectionItem[]>(storageGet<CollectionItem[]>(COLLECTION_KEY, []));

function save() {
  storageSet(COLLECTION_KEY, items.value);
}

export function useCollection() {
  const collectedIds = computed(() => new Set(items.value.map(i => i.poemId)));

  const collectedPoems = computed(() => {
    return items.value
      .map(item => {
        const poem = poems.find(p => p.id === item.poemId);
        return poem ? { ...poem, collectedAt: item.collectedAt } : null;
      })
      .filter((p): p is Poem & { collectedAt: number } => p !== null);
  });

  const groupedByDynasty = computed(() => {
    const groups: Record<string, (Poem & { collectedAt: number })[]> = {};
    for (const poem of collectedPoems.value) {
      if (!groups[poem.dynasty]) {
        groups[poem.dynasty] = [];
      }
      groups[poem.dynasty].push(poem);
    }
    return groups;
  });

  const total = computed(() => items.value.length);

  function isCollected(poemId: number): boolean {
    return collectedIds.value.has(poemId);
  }

  function add(poemId: number) {
    if (collectedIds.value.has(poemId)) return;
    items.value.push({ poemId, collectedAt: Date.now() });
    save();
  }

  function remove(poemId: number) {
    items.value = items.value.filter(i => i.poemId !== poemId);
    save();
  }

  function toggle(poemId: number) {
    if (isCollected(poemId)) {
      remove(poemId);
    } else {
      add(poemId);
    }
  }

  function clearAll() {
    items.value = [];
    save();
  }

  return {
    items,
    collectedIds,
    collectedPoems,
    groupedByDynasty,
    total,
    isCollected,
    add,
    remove,
    toggle,
    clearAll,
  };
}
