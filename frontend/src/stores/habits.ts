import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Habit } from '../types'

const BASE_URL = ''

function dateStr(d: Date = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}

function today(): string {
  return dateStr()
}

export const useHabitsStore = defineStore('habits', () => {
  const habits = ref<Habit[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const activityData = computed<Record<string, number>>(() => {
    const data: Record<string, number> = {}
    for (const habit of habits.value) {
      for (const date of habit.completedDates) {
        data[date] = (data[date] ?? 0) + 1
      }
    }
    return data
  })

  async function fetchHabits(): Promise<void> {
    loading.value = true
    error.value = null
    try {
      const res = await fetch(`${BASE_URL}/habits/`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      habits.value = await res.json()
    } catch (e) {
      error.value = String(e)
    } finally {
      loading.value = false
    }
  }

  async function addHabit(name: string, description?: string, goalDays?: number): Promise<void> {
    const res = await fetch(`${BASE_URL}/habits/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.trim(),
        description: description?.trim() || null,
        goal_days: goalDays || null,
      }),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const created: Habit = await res.json()
    habits.value.push(created)
  }

  async function removeHabit(id: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/habits/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    habits.value = habits.value.filter(h => h.id !== id)
  }

  async function toggleCompletion(id: string, date: string = today()): Promise<void> {
    const res = await fetch(`${BASE_URL}/habits/${id}/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date }),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const updated: Habit = await res.json()
    const idx = habits.value.findIndex(h => h.id === id)
    if (idx !== -1) habits.value[idx] = updated
  }

  function isCompleted(id: string, date: string = today()): boolean {
    return habits.value.find(h => h.id === id)?.completedDates.includes(date) ?? false
  }

  function getStreak(id: string): number {
    const habit = habits.value.find(h => h.id === id)
    if (!habit) return 0
    let streak = 0
    const check = new Date()
    check.setHours(0, 0, 0, 0)
    if (!habit.completedDates.includes(today())) {
      check.setDate(check.getDate() - 1)
    }
    while (true) {
      if (habit.completedDates.includes(dateStr(check))) {
        streak++
        check.setDate(check.getDate() - 1)
      } else {
        break
      }
    }
    return streak
  }

  fetchHabits()

  return {
    habits,
    loading,
    error,
    activityData,
    fetchHabits,
    addHabit,
    removeHabit,
    toggleCompletion,
    isCompleted,
    getStreak,
  }
})
