<script setup lang="ts">
import { computed } from 'vue';
import { useInsight } from '@/composables/useInsight';
import type { WrongCharItem, DynastyItem, SpeedTrendPoint, CoverageData } from '@/composables/useInsight';
import { AlertTriangle, PieChart, TrendingDown, BookOpen, Inbox } from 'lucide-vue-next';

const insight = useInsight();

const RADAR_SIZE = 220;
const RADAR_CENTER = RADAR_SIZE / 2;
const RADAR_MAX_R = 85;

function radarPoints(items: WrongCharItem[]): string {
  if (items.length === 0) return '';
  const n = items.length;
  const maxWrong = Math.max(...items.map(i => i.wrongCount), 1);
  return items.map((item, i) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const r = (item.wrongCount / maxWrong) * RADAR_MAX_R;
    const x = RADAR_CENTER + r * Math.cos(angle);
    const y = RADAR_CENTER + r * Math.sin(angle);
    return `${x},${y}`;
  }).join(' ');
}

function radarGridLines(items: WrongCharItem[], levels: number): string[] {
  const n = items.length || 10;
  const lines: string[] = [];
  for (let level = 1; level <= levels; level++) {
    const r = (level / levels) * RADAR_MAX_R;
    const points: string[] = [];
    for (let i = 0; i < n; i++) {
      const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
      const x = RADAR_CENTER + r * Math.cos(angle);
      const y = RADAR_CENTER + r * Math.sin(angle);
      points.push(`${x},${y}`);
    }
    lines.push(points.join(' '));
  }
  return lines;
}

function radarAxisEndpoints(items: WrongCharItem[]): { x: number; y: number }[] {
  const n = items.length || 10;
  return items.map((_, i) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    return {
      x: RADAR_CENTER + RADAR_MAX_R * Math.cos(angle),
      y: RADAR_CENTER + RADAR_MAX_R * Math.sin(angle),
    };
  });
}

function radarLabelPos(items: WrongCharItem[], i: number): { x: number; y: number } {
  const n = items.length;
  const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
  const labelR = RADAR_MAX_R + 20;
  return {
    x: RADAR_CENTER + labelR * Math.cos(angle),
    y: RADAR_CENTER + labelR * Math.sin(angle),
  };
}

const DYNASTY_COLORS: Record<string, string> = {
  '先秦': '#C84B31',
  '唐': '#6B8E23',
  '宋': '#B09768',
  '元': '#DB7A62',
  '魏晋': '#8A8A8A',
  '五代': '#95BA5A',
};

function dynastyColor(name: string): string {
  return DYNASTY_COLORS[name] || '#C9B48C';
}

function pieConicGradient(items: DynastyItem[]): string {
  if (items.length === 0) return 'conic-gradient(#EAE0CC 0% 100%)';
  const total = items.reduce((s, i) => s + i.correctCount, 0);
  if (total === 0) return 'conic-gradient(#EAE0CC 0% 100%)';
  let cumulative = 0;
  const stops: string[] = [];
  for (const item of items) {
    const pct = (item.correctCount / total) * 100;
    const startPct = cumulative;
    cumulative += pct;
    const color = dynastyColor(item.name);
    stops.push(`${color} ${startPct}% ${cumulative}%`);
  }
  return `conic-gradient(${stops.join(', ')})`;
}

function pieLegendPct(items: DynastyItem[], item: DynastyItem): string {
  const total = items.reduce((s, i) => s + i.correctCount, 0);
  if (total === 0) return '0%';
  return Math.round((item.correctCount / total) * 100) + '%';
}

const CHART_W = 500;
const CHART_H = 160;
const CHART_PAD_L = 40;
const CHART_PAD_R = 20;
const CHART_PAD_T = 15;
const CHART_PAD_B = 30;
const CHART_INNER_W = CHART_W - CHART_PAD_L - CHART_PAD_R;
const CHART_INNER_H = CHART_H - CHART_PAD_T - CHART_PAD_B;

function lineChartPoints(data: SpeedTrendPoint[]): string {
  if (data.length === 0) return '';
  const maxTime = Math.max(...data.map(d => d.avgTime), 5);
  return data.map((d, i) => {
    const x = CHART_PAD_L + (data.length === 1 ? CHART_INNER_W / 2 : (i / (data.length - 1)) * CHART_INNER_W);
    const y = CHART_PAD_T + CHART_INNER_H - (d.avgTime / maxTime) * CHART_INNER_H;
    return `${x},${y}`;
  }).join(' ');
}

function lineChartDots(data: SpeedTrendPoint[]): { x: number; y: number; label: string }[] {
  if (data.length === 0) return [];
  const maxTime = Math.max(...data.map(d => d.avgTime), 5);
  return data.map((d, i) => {
    const x = CHART_PAD_L + (data.length === 1 ? CHART_INNER_W / 2 : (i / (data.length - 1)) * CHART_INNER_W);
    const y = CHART_PAD_T + CHART_INNER_H - (d.avgTime / maxTime) * CHART_INNER_H;
    return { x, y, label: d.avgTime + 's' };
  });
}

function lineChartYLabels(data: SpeedTrendPoint[]): { y: number; label: string }[] {
  if (data.length === 0) return [];
  const maxTime = Math.max(...data.map(d => d.avgTime), 5);
  const steps = 4;
  const labels: { y: number; label: string }[] = [];
  for (let i = 0; i <= steps; i++) {
    const val = (maxTime / steps) * (steps - i);
    const y = CHART_PAD_T + (i / steps) * CHART_INNER_H;
    labels.push({ y, label: Math.round(val * 10) / 10 + 's' });
  }
  return labels;
}

function lineChartXLabels(data: SpeedTrendPoint[]): { x: number; label: string }[] {
  if (data.length === 0) return [];
  return data.map((d, i) => ({
    x: CHART_PAD_L + (data.length === 1 ? CHART_INNER_W / 2 : (i / (data.length - 1)) * CHART_INNER_W),
    label: d.date,
  }));
}

function lineChartGridLines(data: SpeedTrendPoint[]): string[] {
  if (data.length === 0) return [];
  const maxTime = Math.max(...data.map(d => d.avgTime), 5);
  const steps = 4;
  const lines: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const y = CHART_PAD_T + (i / steps) * CHART_INNER_H;
    lines.push(`M${CHART_PAD_L},${y} L${CHART_W - CHART_PAD_R},${y}`);
  }
  return lines;
}

const coveragePct = computed(() => Math.round(insight.coverage.value.poemRate * 100));
const charCoveragePct = computed(() => Math.round(insight.coverage.value.charRate * 100));
</script>

<template>
  <div v-if="!insight.hasData.value" class="text-center py-16 animate-fade-in">
    <div class="w-20 h-20 mx-auto mb-5 rounded-full bg-paper-200/50 flex items-center justify-center">
      <Inbox class="w-10 h-10 text-paper-400" />
    </div>
    <h3 class="font-song text-lg text-ink-200 mb-2">暂无学情数据</h3>
    <p class="font-kai text-ink-100">完成至少一局游戏后即可查看学情洞察</p>
  </div>

  <div v-else class="space-y-6 animate-fade-in-up">
    <div class="card-paper p-5 md:p-6">
      <div class="flex items-center gap-2 mb-5">
        <AlertTriangle class="w-5 h-5 text-vermilion-400" />
        <span class="font-song text-base font-semibold text-ink-300">常错字 Top10</span>
        <span class="font-kai text-xs text-ink-100 ml-1">雷达图 · 答错频次</span>
      </div>

      <div v-if="insight.wrongCharTop10.value.length === 0" class="text-center py-10">
        <div class="font-kai text-ink-100">暂无答错记录，继续保持！</div>
      </div>

      <div v-else class="flex flex-col items-center">
        <svg
          :width="RADAR_SIZE + 60"
          :height="RADAR_SIZE + 50"
          :viewBox="`0 0 ${RADAR_SIZE + 60} ${RADAR_SIZE + 50}`"
          class="max-w-full"
        >
          <g :transform="`translate(30, 20)`">
            <polygon
              v-for="(line, idx) in radarGridLines(insight.wrongCharTop10.value, 4)"
              :key="'grid-' + idx"
              :points="line"
              fill="none"
              :stroke="'rgba(44,44,44,' + (0.06 + idx * 0.03) + ')'"
              stroke-width="1"
            />

            <line
              v-for="(ep, idx) in radarAxisEndpoints(insight.wrongCharTop10.value)"
              :key="'axis-' + idx"
              :x1="RADAR_CENTER"
              :y1="RADAR_CENTER"
              :x2="ep.x"
              :y2="ep.y"
              stroke="rgba(44,44,44,0.08)"
              stroke-width="1"
            />

            <polygon
              :points="radarPoints(insight.wrongCharTop10.value)"
              fill="rgba(200,75,49,0.15)"
              stroke="#C84B31"
              stroke-width="2"
              stroke-linejoin="round"
            />

            <circle
              v-for="(pt, idx) in radarPoints(insight.wrongCharTop10.value).split(' ')"
              :key="'dot-' + idx"
              :cx="pt.split(',')[0]"
              :cy="pt.split(',')[1]"
              r="3.5"
              fill="#C84B31"
              stroke="#FBF8F1"
              stroke-width="1.5"
            />

            <text
              v-for="(_, idx) in insight.wrongCharTop10.value"
              :key="'label-' + idx"
              :x="radarLabelPos(insight.wrongCharTop10.value, idx).x"
              :y="radarLabelPos(insight.wrongCharTop10.value, idx).y"
              text-anchor="middle"
              dominant-baseline="central"
              class="font-song"
              :font-size="idx < 3 ? '15' : '13'"
              :font-weight="idx < 3 ? 'bold' : 'normal'"
              :fill="idx < 3 ? '#C84B31' : '#5C5C5C'"
            >{{ insight.wrongCharTop10.value[idx].char }}</text>
          </g>
        </svg>

        <div class="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-2 w-full max-w-md">
          <div
            v-for="(item, idx) in insight.wrongCharTop10.value"
            :key="idx"
            class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
            :class="idx < 3 ? 'bg-vermilion-50 border border-vermilion-200/50' : 'bg-paper-100 border border-paper-200/40'"
          >
            <span
              class="font-song font-bold text-base"
              :class="idx < 3 ? 'text-vermilion-500' : 'text-ink-300'"
            >{{ item.char }}</span>
            <span class="font-song text-[11px] text-ink-100">{{ item.wrongCount }}次</span>
            <span class="font-song text-[10px] text-ink-100/70">{{ Math.round(item.wrongRate * 100) }}%</span>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="card-paper p-5 md:p-6">
        <div class="flex items-center gap-2 mb-5">
          <PieChart class="w-5 h-5 text-bamboo-400" />
          <span class="font-song text-base font-semibold text-ink-300">擅长朝代</span>
          <span class="font-kai text-xs text-ink-100 ml-1">答对分布</span>
        </div>

        <div v-if="insight.dynastyDistribution.value.length === 0" class="text-center py-8">
          <div class="font-kai text-ink-100">暂无答对记录</div>
        </div>

        <div v-else class="flex flex-col items-center gap-4">
          <div
            class="w-36 h-36 rounded-full relative shadow-inner"
            :style="{ background: pieConicGradient(insight.dynastyDistribution.value) }"
          >
            <div class="absolute inset-5 rounded-full bg-paper-50 flex items-center justify-center">
              <div class="text-center">
                <div class="font-song font-black text-lg text-ink-400">
                  {{ insight.dynastyDistribution.value.reduce((s, i) => s + i.correctCount, 0) }}
                </div>
                <div class="font-kai text-[10px] text-ink-100">答对总数</div>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-x-6 gap-y-2 w-full">
            <div
              v-for="item in insight.dynastyDistribution.value"
              :key="item.name"
              class="flex items-center gap-2"
            >
              <span
                class="w-3 h-3 rounded-sm shrink-0"
                :style="{ backgroundColor: dynastyColor(item.name) }"
              ></span>
              <span class="font-song text-sm text-ink-300">{{ item.name }}</span>
              <span class="font-song text-xs text-ink-100 ml-auto tabular-nums">{{ pieLegendPct(insight.dynastyDistribution.value, item) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="card-paper p-5 md:p-6">
        <div class="flex items-center gap-2 mb-5">
          <TrendingDown class="w-5 h-5 text-paper-500" />
          <span class="font-song text-base font-semibold text-ink-300">答对速度</span>
          <span class="font-kai text-xs text-ink-100 ml-1">趋势折线图</span>
        </div>

        <div v-if="insight.speedTrend.value.length === 0" class="text-center py-8">
          <div class="font-kai text-ink-100">暂无速度数据</div>
        </div>

        <div v-else class="overflow-x-auto">
          <svg
            :width="CHART_W"
            :height="CHART_H"
            :viewBox="`0 0 ${CHART_W} ${CHART_H}`"
            class="min-w-[320px]"
          >
            <path
              v-for="(line, idx) in lineChartGridLines(insight.speedTrend.value)"
              :key="'grid-' + idx"
              :d="line"
              fill="none"
              stroke="rgba(44,44,44,0.06)"
              stroke-width="1"
            />

            <text
              v-for="(lbl, idx) in lineChartYLabels(insight.speedTrend.value)"
              :key="'ylbl-' + idx"
              :x="CHART_PAD_L - 6"
              :y="lbl.y + 4"
              text-anchor="end"
              class="font-song"
              font-size="10"
              fill="#8A8A8A"
            >{{ lbl.label }}</text>

            <text
              v-for="(lbl, idx) in lineChartXLabels(insight.speedTrend.value)"
              :key="'xlbl-' + idx"
              :x="lbl.x"
              :y="CHART_H - 6"
              text-anchor="middle"
              class="font-song"
              font-size="10"
              fill="#8A8A8A"
            >{{ lbl.label }}</text>

            <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#C84B31" stop-opacity="0.2" />
              <stop offset="100%" stop-color="#C84B31" stop-opacity="0" />
            </linearGradient>

            <polygon
              v-if="lineChartPoints(insight.speedTrend.value)"
              :points="`${CHART_PAD_L},${CHART_PAD_T + CHART_INNER_H} ${lineChartPoints(insight.speedTrend.value)} ${CHART_PAD_L + CHART_INNER_W},${CHART_PAD_T + CHART_INNER_H}`"
              fill="url(#lineGrad)"
            />

            <polyline
              :points="lineChartPoints(insight.speedTrend.value)"
              fill="none"
              stroke="#C84B31"
              stroke-width="2.5"
              stroke-linejoin="round"
              stroke-linecap="round"
            />

            <circle
              v-for="(dot, idx) in lineChartDots(insight.speedTrend.value)"
              :key="'dot-' + idx"
              :cx="dot.x"
              :cy="dot.y"
              r="4"
              fill="#C84B31"
              stroke="#FBF8F1"
              stroke-width="2"
            />

            <text
              v-for="(dot, idx) in lineChartDots(insight.speedTrend.value)"
              :key="'dlbl-' + idx"
              :x="dot.x"
              :y="dot.y - 10"
              text-anchor="middle"
              class="font-song"
              font-size="10"
              fill="#5C5C5C"
            >{{ dot.label }}</text>
          </svg>
        </div>

        <div v-if="insight.speedTrend.value.length > 1" class="mt-3 flex items-center gap-4 font-kai text-xs text-ink-100">
          <span>最快: {{ Math.min(...insight.speedTrend.value.map(d => d.avgTime)).toFixed(1) }}s</span>
          <span>最慢: {{ Math.max(...insight.speedTrend.value.map(d => d.avgTime)).toFixed(1) }}s</span>
          <span>平均: {{ (insight.speedTrend.value.reduce((s, d) => s + d.avgTime, 0) / insight.speedTrend.value.length).toFixed(1) }}s</span>
        </div>
      </div>
    </div>

    <div class="card-paper p-5 md:p-6">
      <div class="flex items-center gap-2 mb-5">
        <BookOpen class="w-5 h-5 text-ink-200" />
        <span class="font-song text-base font-semibold text-ink-300">词汇覆盖率</span>
        <span class="font-kai text-xs text-ink-100 ml-1">已覆盖题库比例</span>
      </div>

      <div class="space-y-5">
        <div>
          <div class="flex items-baseline justify-between mb-2">
            <span class="font-song text-sm text-ink-300">诗词覆盖</span>
            <span class="font-song text-sm tabular-nums">
              <span class="font-bold text-ink-400">{{ insight.coverage.value.coveredPoems }}</span>
              <span class="text-ink-100"> / {{ insight.coverage.value.totalPoems }} 首</span>
              <span class="ml-2 font-bold" :class="coveragePct >= 30 ? 'text-bamboo-500' : coveragePct >= 10 ? 'text-paper-500' : 'text-vermilion-400'">{{ coveragePct }}%</span>
            </span>
          </div>
          <div class="h-3 rounded-full bg-paper-200/60 overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-700 ease-out"
              :class="coveragePct >= 30 ? 'bg-bamboo-400' : coveragePct >= 10 ? 'bg-paper-400' : 'bg-vermilion-300'"
              :style="{ width: coveragePct + '%' }"
            ></div>
          </div>
        </div>

        <div>
          <div class="flex items-baseline justify-between mb-2">
            <span class="font-song text-sm text-ink-300">汉字覆盖</span>
            <span class="font-song text-sm tabular-nums">
              <span class="font-bold text-ink-400">{{ insight.coverage.value.coveredChars }}</span>
              <span class="text-ink-100"> / {{ insight.coverage.value.totalChars }} 字</span>
              <span class="ml-2 font-bold" :class="charCoveragePct >= 30 ? 'text-bamboo-500' : charCoveragePct >= 10 ? 'text-paper-500' : 'text-vermilion-400'">{{ charCoveragePct }}%</span>
            </span>
          </div>
          <div class="h-3 rounded-full bg-paper-200/60 overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-700 ease-out"
              :class="charCoveragePct >= 30 ? 'bg-bamboo-400' : charCoveragePct >= 10 ? 'bg-paper-400' : 'bg-vermilion-300'"
              :style="{ width: charCoveragePct + '%' }"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
