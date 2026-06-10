const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'src', 'data');

console.log('开始验证和清理诗词数据...\n');

// 读取 poems.ts 并使用 eval 方式解析
let poemsContent = fs.readFileSync(path.join(DATA_DIR, 'poems.ts'), 'utf8');

// 移除 import 语句
poemsContent = poemsContent.replace(/^import.*\n/gm, '');
// 移除 const poems: Poem[] = 
poemsContent = poemsContent.replace(/const\s+poems.*?=\s*/s, '');
// 移除 export default poems;
poemsContent = poemsContent.replace(/export\s+default\s+poems\s*;?\s*$/s, '');
// 移除类型注解 Poem[]
poemsContent = poemsContent.replace(/:\s*Poem\[\]\s*=\s*/, '=');

let poems;
try {
  poems = JSON.parse(poemsContent.trim());
} catch (e) {
  console.error('JSON 解析失败:', e.message);
  // 尝试另一种方式：去掉开头直到 [
  const idx = poemsContent.indexOf('[');
  if (idx >= 0) {
    try {
      poems = JSON.parse(poemsContent.substring(idx).trim());
      console.log('通过备用方式解析成功');
    } catch (e2) {
      console.error('备用方式也失败:', e2.message);
      process.exit(1);
    }
  } else {
    process.exit(1);
  }
}

console.log(`原始诗词总数: ${poems.length}`);

// 1. 检查重复 ID
const idSet = new Set();
const dupIds = [];
for (const p of poems) {
  if (idSet.has(p.id)) {
    dupIds.push(p.id);
  }
  idSet.add(p.id);
}
console.log(`\n1. ID 检查:`);
console.log(`   重复 ID 数: ${dupIds.length}`);

// 2. 清理 content 中的舞台指示和其他杂质
const STAGE_DIR_REGEX = /[（(][^）)]*[）)]/g;
const BRACKETS_REGEX = /\[[^\]]*\]/g;
const EXTRA_SPACE_REGEX = /\s+/g;
const CLEAN_PUNCT_REGEX = /^[，。！？、；：""''（）【】《》…—·,\.!\?;:\(\)\[\]<>·・]+|[，。！？、；：""''（）【】《》…—·,\.!\?;:\(\)\[\]<>·・]+$/g;

function cleanLine(line) {
  let s = line;
  s = s.replace(STAGE_DIR_REGEX, '');
  s = s.replace(BRACKETS_REGEX, '');
  s = s.replace(CLEAN_PUNCT_REGEX, '');
  s = s.replace(EXTRA_SPACE_REGEX, '');
  s = s.trim();
  return s;
}

let cleanedCount = 0;
for (const p of poems) {
  const original = [...p.content];
  p.content = p.content
    .map(cleanLine)
    .filter(s => s.length > 0);
  if (original.join('|') !== p.content.join('|')) {
    cleanedCount++;
  }
}
console.log(`\n2. 清理诗句杂质:`);
console.log(`   清理了 ${cleanedCount} 首诗的内容`);

// 3. 检查空内容
const emptyPoems = poems.filter(p => !p.content || p.content.length === 0);
console.log(`\n3. 空内容检查:`);
console.log(`   空内容诗词数: ${emptyPoems.length}`);
if (emptyPoems.length > 0) {
  poems = poems.filter(p => p.content && p.content.length > 0);
  console.log(`   已移除 ${emptyPoems.length} 首空内容诗`);
}

// 4. 去重（基于 title+author+content）
const seenKeys = new Set();
const uniquePoems = [];
let duplicateCount = 0;
for (const p of poems) {
  const key = `${p.title}|${p.author}|${p.content.join('')}`;
  if (seenKeys.has(key)) {
    duplicateCount++;
    continue;
  }
  seenKeys.add(key);
  uniquePoems.push(p);
}
console.log(`\n4. 内容去重:`);
console.log(`   重复内容数: ${duplicateCount}`);
poems = uniquePoems;

// 5. 重新分配连续 ID
poems.forEach((p, i) => {
  p.id = i + 1;
});
console.log(`\n5. 重新分配 ID: 1 到 ${poems.length}`);

// 6. 统计朝代分布
const dynastyCount = {};
for (const p of poems) {
  dynastyCount[p.dynasty] = (dynastyCount[p.dynasty] || 0) + 1;
}
console.log(`\n6. 朝代分布:`);
for (const [d, c] of Object.entries(dynastyCount).sort((a, b) => b[1] - a[1])) {
  console.log(`   ${d}: ${c} 首`);
}

// 7. 提取并更新高频汉字
console.log(`\n7. 重新提取高频汉字...`);
const charFreq = new Map();
for (const p of poems) {
  for (const line of p.content) {
    for (const ch of line) {
      if (/[\u4e00-\u9fa5]/.test(ch)) {
        charFreq.set(ch, (charFreq.get(ch) || 0) + 1);
      }
    }
  }
}
const sortedChars = Array.from(charFreq.entries())
  .sort((a, b) => b[1] - a[1])
  .map(e => e[0]);

const minCount = Math.min(sortedChars.length, 2000);
const topChars = sortedChars.slice(0, minCount);

console.log(`   汉字总数: ${sortedChars.length}`);
console.log(`   取前 ${topChars.length} 个常用字`);
console.log(`   前 30 高频字: ${topChars.slice(0, 30).join(' ')}`);

// 8. 写回 poems.ts
const newPoemsContent = `import type { Poem } from './types';\n\nconst poems: Poem[] = ${JSON.stringify(poems, null, 2)};\n\nexport default poems;\n`;
fs.writeFileSync(path.join(DATA_DIR, 'poems.ts'), newPoemsContent, 'utf8');
console.log(`\n8. 写回 poems.ts: ${(fs.statSync(path.join(DATA_DIR, 'poems.ts')).size / 1024 / 1024).toFixed(2)} MB`);

// 9. 写回 common-chars.ts
const newCharsContent = `const chars: string[] = ${JSON.stringify(topChars, null, 2)};\n\nexport default chars;\n`;
fs.writeFileSync(path.join(DATA_DIR, 'common-chars.ts'), newCharsContent, 'utf8');
console.log(`9. 写回 common-chars.ts`);

// 10. 抽样检查经典诗词
console.log(`\n10. 经典诗词抽样检查:`);
const samples = [
  { title: '关雎', dynasty: '先秦' },
  { title: '静夜思', author: '李白' },
  { title: '水调歌头', author: '苏轼' },
  { title: '天净沙', author: '马致远' },
  { title: '登鹳雀楼' },
  { title: '春晓', author: '孟浩然' },
  { title: '虞美人', author: '李煜' },
  { title: '将进酒', author: '李白' },
  { title: '念奴娇', author: '苏轼' },
  { title: '声声慢', author: '李清照' },
];
for (const s of samples) {
  const found = poems.find(p => 
    (s.title && p.title.includes(s.title)) && 
    (!s.author || p.author.includes(s.author)) &&
    (!s.dynasty || p.dynasty === s.dynasty)
  );
  if (found) {
    console.log(`   ✓ ${found.title} - ${found.author} (${found.dynasty}): ${found.content.length}句`);
    if (found.content.length > 0) {
      console.log(`     首句: "${found.content[0]}"`);
    }
  } else {
    console.log(`   ✗ 未找到: ${s.title} - ${s.author || ''}`);
  }
}

console.log(`\n========== 最终统计报告 ==========`);
console.log(`生成文件数: 4`);
console.log(`  - src/data/types.ts (Poem 接口定义)`);
console.log(`  - src/types/index.ts (类型导出)`);
console.log(`  - src/data/poems.ts (诗词数据)`);
console.log(`  - src/data/common-chars.ts (常用汉字)`);
console.log(`\n诗词总数: ${poems.length}`);
console.log(`常用字数: ${topChars.length}`);
console.log(`==================================\n`);
