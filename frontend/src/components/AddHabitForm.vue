<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  submit: [name: string, description: string, goalDays: number | undefined]
  cancel: []
}>()

const name = ref('')
const description = ref('')
const goalDays = ref<number | undefined>(undefined)
const error = ref('')

function handleSubmit() {
  if (!name.value.trim()) {
    error.value = 'Habit name is required'
    return
  }
  emit('submit', name.value, description.value, goalDays.value || undefined)
  name.value = ''
  description.value = ''
  goalDays.value = undefined
  error.value = ''
}
</script>

<template>
  <form
    @submit.prevent="handleSubmit"
    class="bg-white rounded-2xl border border-emerald-200 p-5 space-y-4 shadow-sm"
    data-qa="add-habit-form"
  >
    <h3 class="font-semibold text-slate-800 text-base" data-qa="add-habit-form-title">New habit</h3>

    <div>
      <label class="block text-xs font-medium text-slate-600 mb-1.5" data-qa="habit-name-label">Name <span class="text-red-400">*</span></label>
      <input
        v-model="name"
        type="text"
        placeholder="e.g. Morning run"
        autofocus
        class="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent text-sm transition"
        data-qa="habit-name-input"
      />
      <p v-if="error" class="text-red-400 text-xs mt-1" data-qa="habit-name-error">{{ error }}</p>
    </div>

    <div>
      <label class="block text-xs font-medium text-slate-600 mb-1.5" data-qa="habit-description-label">
        Description <span class="text-slate-400 font-normal">(optional)</span>
      </label>
      <textarea
        v-model="description"
        placeholder="Why is this habit important to you?"
        rows="2"
        class="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent text-sm resize-none transition"
        data-qa="habit-description-input"
      />
    </div>

    <div>
      <label class="block text-xs font-medium text-slate-600 mb-1.5" data-qa="habit-goal-label">
        Goal <span class="text-slate-400 font-normal">(days, optional)</span>
      </label>
      <input
        v-model.number="goalDays"
        type="number"
        placeholder="e.g. 30"
        min="1"
        max="365"
        class="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent text-sm transition"
        data-qa="habit-goal-input"
      />
    </div>

    <div class="flex gap-2 pt-1">
      <button
        type="submit"
        class="flex-1 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors"
        data-qa="habit-submit-btn"
      >
        Add habit
      </button>
      <button
        type="button"
        @click="$emit('cancel')"
        class="px-4 py-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 font-medium text-sm transition-colors"
        data-qa="habit-cancel-btn"
      >
        Cancel
      </button>
    </div>
  </form>
</template>
