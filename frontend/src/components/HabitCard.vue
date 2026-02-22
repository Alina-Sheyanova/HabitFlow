<script setup lang="ts">
import { computed } from 'vue'
import { useHabitsStore } from '../stores/habits'
import type { Habit } from '../types'

const props = defineProps<{ habit: Habit; date: string }>()
const store = useHabitsStore()

const isCompletedToday = computed(() => store.isCompleted(props.habit.id, props.date))
const streak = computed(() => store.getStreak(props.habit.id))
const total = computed(() => props.habit.completedDates.length)
const goalRatio = computed(() =>
  props.habit.goalDays ? Math.min(total.value / props.habit.goalDays, 1) : null
)
const goalReached = computed(() =>
  props.habit.goalDays ? total.value >= props.habit.goalDays : false
)
</script>

<template>
  <div
    class="bg-white rounded-2xl border p-4 transition-all duration-200"
    :class="isCompletedToday
      ? 'border-emerald-200 bg-emerald-50/40'
      : 'border-slate-200 hover:border-slate-300'"
    data-qa="habit-card"
    :data-qa-habit-id="habit.id"
  >
    <div class="flex items-start gap-3">
      <!-- Toggle button -->
      <button
        @click="store.toggleCompletion(habit.id, props.date)"
        class="mt-0.5 w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all duration-200"
        :class="isCompletedToday
          ? 'bg-emerald-500 border-emerald-500'
          : 'border-slate-300 hover:border-emerald-400'"
        :title="isCompletedToday ? 'Mark as not done' : 'Mark as done'"
        data-qa="habit-toggle-btn"
      >
        <svg
          v-if="isCompletedToday"
          class="w-3 h-3 text-white"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M2 6l3 3 5-5" />
        </svg>
      </button>

      <!-- Content -->
      <div class="flex-1 min-w-0">
        <div class="flex items-start justify-between gap-2">
          <h3
            class="font-semibold text-sm leading-5 transition-colors"
            :class="isCompletedToday ? 'text-slate-400 line-through' : 'text-slate-800'"
            data-qa="habit-name"
          >
            {{ habit.name }}
          </h3>

          <!-- Delete -->
          <button
            @click="store.removeHabit(habit.id)"
            class="text-slate-300 hover:text-red-400 transition-colors flex-shrink-0 p-0.5 -mt-0.5 -mr-0.5"
            title="Delete habit"
            data-qa="habit-delete-btn"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>

        <p v-if="habit.description" class="text-xs text-slate-400 mt-0.5 leading-4" data-qa="habit-description">
          {{ habit.description }}
        </p>

        <!-- Stats row -->
        <div class="flex items-center gap-3 mt-2 flex-wrap" data-qa="habit-stats">
          <span v-if="streak > 0" class="text-xs text-amber-600 font-medium" data-qa="habit-streak">
            🔥 {{ streak }}d streak
          </span>
          <span v-if="goalReached" class="text-xs text-emerald-600 font-medium" data-qa="habit-goal-reached">
            🎉 Goal reached!
          </span>
          <span class="text-xs text-slate-400" data-qa="habit-completions">
            {{ total }} completion{{ total !== 1 ? 's' : '' }}
          </span>
        </div>

        <!-- Goal progress bar -->
        <div v-if="habit.goalDays" class="mt-3" data-qa="habit-goal-progress">
          <div class="flex justify-between text-xs mb-1">
            <span class="text-slate-500" data-qa="habit-goal-label">Goal: {{ habit.goalDays }} days</span>
            <span :class="goalReached ? 'text-emerald-600 font-medium' : 'text-slate-400'" data-qa="habit-goal-count">
              {{ Math.min(total, habit.goalDays) }}/{{ habit.goalDays }}
            </span>
          </div>
          <div class="h-1.5 bg-slate-100 rounded-full overflow-hidden" data-qa="habit-goal-bar-track">
            <div
              class="h-full rounded-full transition-all duration-300"
              :class="goalReached ? 'bg-emerald-500' : 'bg-emerald-400'"
              :style="{ width: `${(goalRatio ?? 0) * 100}%` }"
              data-qa="habit-goal-bar-fill"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
