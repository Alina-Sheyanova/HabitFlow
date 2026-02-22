<script setup lang="ts">
import { ref, computed } from 'vue'
import { useHabitsStore } from './stores/habits'
import AddHabitForm from './components/AddHabitForm.vue'
import HabitCard from './components/HabitCard.vue'
import ActivityGrid from './components/ActivityGrid.vue'

const store = useHabitsStore()
const showForm = ref(false)

async function handleAdd(name: string, description: string, goalDays: number | undefined) {
  await store.addHabit(name, description, goalDays)
  showForm.value = false
}

function todayStr(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}

const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
const selectedDate = ref(todayStr())
const isToday = computed(() => selectedDate.value === todayStr())

function formatSelectedDate(ds: string): string {
  return new Date(ds + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}
</script>

<template>
  <div class="min-h-screen bg-slate-50" data-qa="app">
    <div class="max-w-2xl mx-auto px-4 py-8 space-y-5">

      <!-- Header -->
      <header class="flex items-center justify-between" data-qa="header">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-xl">
            🌱
          </div>
          <div>
            <h1 class="text-xl font-bold text-slate-800 leading-tight" data-qa="app-title">HabitFlow</h1>
            <p class="text-xs text-slate-400" data-qa="header-date">{{ today }}</p>
          </div>
        </div>

        <!-- Completion summary -->
        <div v-if="store.habits.length > 0" class="text-right" data-qa="completion-summary">
          <p class="text-2xl font-bold text-emerald-600 leading-none" data-qa="completion-count">
            {{ store.habits.filter(h => store.isCompleted(h.id, selectedDate)).length }}/{{ store.habits.length }}
          </p>
          <p class="text-xs text-slate-400 mt-0.5">{{ isToday ? 'done today' : 'done that day' }}</p>
        </div>
      </header>

      <!-- Activity grid -->
      <ActivityGrid :selected-date="selectedDate" @select-date="selectedDate = $event" />

      <!-- Past date banner -->
      <div
        v-if="!isToday"
        class="flex items-center justify-between bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl px-4 py-2.5 text-sm"
        data-qa="past-date-banner"
      >
        <span data-qa="past-date-label">Viewing <span class="font-semibold">{{ formatSelectedDate(selectedDate) }}</span></span>
        <button
          @click="selectedDate = todayStr()"
          class="text-emerald-600 hover:text-emerald-800 font-medium transition-colors"
          data-qa="back-to-today-btn"
        >
          Back to today
        </button>
      </div>

      <!-- Habits section -->
      <section class="space-y-3" data-qa="habits-section">
        <div class="flex items-center justify-between">
          <h2 class="text-base font-semibold text-slate-800" data-qa="habits-heading">
            My habits
            <span v-if="store.habits.length > 0" class="text-slate-400 font-normal text-sm ml-1">
              ({{ store.habits.length }})
            </span>
          </h2>

          <button
            v-if="!showForm"
            @click="showForm = true"
            class="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-medium py-1.5 px-3 rounded-lg text-sm transition-colors"
            data-qa="add-habit-btn"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
            </svg>
            Add habit
          </button>
        </div>

        <!-- Add form -->
        <AddHabitForm
          v-if="showForm"
          @submit="handleAdd"
          @cancel="showForm = false"
        />

        <!-- Habit cards -->
        <TransitionGroup name="list" tag="div" class="space-y-3" data-qa="habit-list">
          <HabitCard
            v-for="habit in store.habits"
            :key="habit.id"
            :habit="habit"
            :date="selectedDate"
          />
        </TransitionGroup>

        <!-- Empty state -->
        <div
          v-if="store.habits.length === 0 && !showForm"
          class="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-dashed border-slate-200"
          data-qa="empty-state"
        >
          <span class="text-5xl mb-4">✨</span>
          <p class="text-slate-600 font-semibold">No habits yet</p>
          <p class="text-sm text-slate-400 mt-1 mb-5">Start building a routine that sticks</p>
          <button
            @click="showForm = true"
            class="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-5 rounded-lg text-sm transition-colors"
            data-qa="add-first-habit-btn"
          >
            Add your first habit
          </button>
        </div>
      </section>

    </div>
  </div>
</template>

<style>
body { margin: 0; }

.list-enter-active,
.list-leave-active {
  transition: all 0.25s ease;
}
.list-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}
.list-leave-to {
  opacity: 0;
  transform: translateX(16px);
}
</style>
