<script setup lang="ts">
import { computed } from 'vue'
import { useHabitsStore } from '../stores/habits'

const props = defineProps<{ selectedDate: string }>()
const emit = defineEmits<{ (e: 'select-date', date: string): void }>()

const store = useHabitsStore()

const WEEKS = 16
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const CELL = 12
const GAP = 2
const WEEK_W = CELL + GAP
const DAY_COL_W = 28

function toDateStr(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}

interface GridDay {
  date: string
  isFuture: boolean
  isToday: boolean
  count: number
}

const todayDate = new Date()
todayDate.setHours(0, 0, 0, 0)
const todayStr = toDateStr(todayDate)

const gridData = computed<GridDay[][]>(() => {
  const now = new Date(todayDate)
  const dow = now.getDay()
  const daysToSat = (6 - dow + 7) % 7
  const endDate = new Date(now)
  endDate.setDate(now.getDate() + daysToSat)
  const startDate = new Date(endDate)
  startDate.setDate(endDate.getDate() - WEEKS * 7 + 1)

  const weeks: GridDay[][] = []
  const cur = new Date(startDate)

  for (let w = 0; w < WEEKS; w++) {
    const week: GridDay[] = []
    for (let d = 0; d < 7; d++) {
      const ds = toDateStr(cur)
      week.push({
        date: ds,
        isFuture: cur > todayDate,
        isToday: ds === todayStr,
        count: store.activityData[ds] ?? 0,
      })
      cur.setDate(cur.getDate() + 1)
    }
    weeks.push(week)
  }
  return weeks
})

const monthLabels = computed<{ text: string; col: number }[]>(() => {
  const labels: { text: string; col: number }[] = []
  let lastMonth = -1
  gridData.value.forEach((week, col) => {
    const firstPast = week.find(d => !d.isFuture)
    if (!firstPast) return
    const m = new Date(firstPast.date).getMonth()
    if (m !== lastMonth) {
      labels.push({
        text: new Date(firstPast.date).toLocaleDateString('en-US', { month: 'short' }),
        col,
      })
      lastMonth = m
    }
  })
  return labels
})

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

const MAX_COUNT = 15

// 15 handpicked colors: clearly distinct across green→lime→yellow→amber→orange→red
const PALETTE: string[] = [
  '#15803d', // 1  dark green
  '#22c55e', // 2  green
  '#4ade80', // 3  light green
  '#86efac', // 4  pale green
  '#bef264', // 5  lime
  '#facc15', // 6  yellow
  '#fbbf24', // 7  amber-yellow
  '#f59e0b', // 8  amber
  '#fb923c', // 9  light orange
  '#f97316', // 10 orange
  '#ea580c', // 11 dark orange
  '#ef4444', // 12 red
  '#dc2626', // 13 dark red
  '#b91c1c', // 14 deeper red
  '#7f1d1d', // 15 very dark red
]

function countColor(count: number): string {
  if (count <= 0) return '#ebedf0'
  return PALETTE[Math.min(count, MAX_COUNT) - 1]
}

function cellColor(day: GridDay): string {
  if (day.isFuture) return '#f8fafc'
  return countColor(day.count)
}

function cellTitle(day: GridDay): string {
  if (day.isFuture) return day.date
  const total = store.habits.length
  if (day.count === 0) return `${day.date}: no habits completed`
  return `${day.date}: ${day.count}/${total} habit${total !== 1 ? 's' : ''} completed`
}

function darkenColor(hex: string, factor = 0.55): string {
  const [r, g, b] = hexToRgb(hex)
  return '#' + [r, g, b]
    .map(v => Math.round(v * factor).toString(16).padStart(2, '0'))
    .join('')
}

// inset-тень только для "сегодня" — не вылезает за границы ячейки
function cellBoxShadow(day: GridDay): string {
  if (day.isToday) return `inset 0 0 0 2px ${darkenColor(cellColor(day))}`
  return 'none'
}

// outline для выбранной даты — не обрезается overflow-контейнером и рисуется поверх соседей
function cellOutline(day: GridDay): string {
  return day.date === props.selectedDate ? '2px solid #64748b' : 'none'
}

// Fixed legend: always 0–15
const legendItems = Array.from({ length: MAX_COUNT + 1 }, (_, i) => ({
  count: i,
  color: countColor(i),
}))
</script>

<template>
  <div class="bg-white rounded-2xl border border-slate-200 p-5" data-qa="activity-grid">
    <h2 class="font-semibold text-slate-800 text-base mb-4" data-qa="activity-grid-title">Activity</h2>

    <div v-if="store.habits.length === 0" class="text-sm text-slate-400 text-center py-6" data-qa="activity-grid-empty">
      Add habits to start tracking your activity
    </div>

    <div v-else class="flex gap-6 items-start">

      <!-- Grid -->
      <!-- p-[3px]: даёт 3px буфер, чтобы 2px outline выбранной ячейки не обрезался overflow -->
      <div class="overflow-x-auto p-[3px]">
        <div class="inline-block min-w-max select-none">

          <!-- Month labels -->
          <div class="relative h-4 mb-1.5">
            <span
              v-for="label in monthLabels"
              :key="label.col"
              class="absolute text-xs text-slate-400 whitespace-nowrap"
              :style="{ left: `${DAY_COL_W + GAP + label.col * WEEK_W}px` }"
            >{{ label.text }}</span>
          </div>

          <!-- Grid body -->
          <div class="flex gap-0.5">

            <!-- Day-of-week labels -->
            <div :style="{ width: `${DAY_COL_W}px` }" class="flex flex-col gap-0.5 flex-shrink-0">
              <div
                v-for="(label, i) in DAY_LABELS"
                :key="label"
                class="h-3 flex items-center justify-end pr-1.5 text-[10px] text-slate-400 leading-none"
              >
                {{ i % 2 === 1 ? label : '' }}
              </div>
            </div>

            <!-- Week columns -->
            <div
              v-for="(week, wi) in gridData"
              :key="wi"
              class="flex flex-col gap-0.5"
            >
              <div
                v-for="day in week"
                :key="day.date"
                class="w-3 h-3 rounded-[2px] transition-all duration-100"
                :class="day.isFuture ? 'cursor-default' : 'cursor-pointer hover:brightness-75'"
                :style="{
                  backgroundColor: cellColor(day),
                  boxShadow: cellBoxShadow(day),
                  outline: cellOutline(day),
                }"
                :title="cellTitle(day)"
                :data-qa="day.isFuture ? 'activity-cell-future' : 'activity-cell'"
                :data-qa-date="day.date"
                :data-qa-today="day.isToday || undefined"
                @click="!day.isFuture && emit('select-date', day.date)"
              />
            </div>
          </div>

        </div>
      </div>

      <!-- Legend: centered in remaining space -->
      <div class="flex-1 flex justify-center pt-6">
      <div class="flex gap-3">
        <div class="flex flex-col gap-1">
          <div
            v-for="item in legendItems.slice(0, 8)"
            :key="item.count"
            class="flex items-center gap-1.5"
          >
            <div class="w-3 h-3 rounded-[2px]" :style="{ backgroundColor: item.color }" />
            <span class="text-[10px]" :class="item.count === 0 ? 'text-slate-400' : 'text-slate-600'">
              {{ item.count }}
            </span>
          </div>
        </div>
        <div v-if="legendItems.length > 8" class="flex flex-col gap-1">
          <div
            v-for="item in legendItems.slice(8)"
            :key="item.count"
            class="flex items-center gap-1.5"
          >
            <div class="w-3 h-3 rounded-[2px]" :style="{ backgroundColor: item.color }" />
            <span class="text-[10px] text-slate-600">{{ item.count }}</span>
          </div>
        </div>
      </div>
      </div>

    </div>
  </div>
</template>
