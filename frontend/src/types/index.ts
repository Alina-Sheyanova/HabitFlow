export interface Habit {
  id: string
  name: string
  description?: string
  goalDays?: number
  createdAt: string        // YYYY-MM-DD
  completedDates: string[] // YYYY-MM-DD[]
}
