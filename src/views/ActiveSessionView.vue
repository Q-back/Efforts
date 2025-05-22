<template>
  <div class="space-y-6">
    <div v-if="sessionStore.activeSession" class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div class="flex justify-between items-start mb-6">
        <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-200">
          {{ sessionStore.activeSession.title || 'Focus Session' }}
        </h2>
        
        <div class="flex space-x-2">
          <button
            @click="toggleEditMode"
            class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            v-if="!isFinished"
          >
            <span v-if="editMode">Cancel Edit</span>
            <span v-else>Edit Session</span>
          </button>
          
          <button
            @click="endSession"
            class="text-red-500 hover:text-red-700"
            v-if="!isFinished && !editMode"
          >
            End Session
          </button>
        </div>
      </div>
      
      <!-- Session Timer and Progress -->
      <div v-if="!editMode" class="mb-8">
        <div class="flex justify-between items-end mb-1">
          <span class="text-sm text-gray-500 dark:text-gray-400">
            {{ isOvertime ? 'Overtime' : 'Remaining' }}
          </span>
          <span class="text-sm text-gray-500 dark:text-gray-400">
            Started at {{ formattedStartTime }}
          </span>
        </div>
        
        <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-1 overflow-hidden">
          <div
            class="h-full transition-all duration-1000"
            :class="{
              'bg-primary-500': !isOvertime,
              'bg-amber-500': isOvertime
            }"
            :style="{ width: `${Math.min(progress, 100)}%` }"
          ></div>
        </div>
        
        <div class="flex justify-between items-center">
          <div class="text-3xl font-bold" :class="{ 'text-amber-500': isOvertime }">
            {{ isOvertime ? formattedElapsedTime : formattedTimeRemaining }}
          </div>
          
          <div v-if="plannedDuration > 0" class="text-sm text-gray-500 dark:text-gray-400">
            {{ formattedElapsedTime }} / {{ formatDuration(plannedDuration) }}
          </div>
        </div>
      </div>
      
      <!-- Calm Content (shown during active session) -->
      <div v-if="!editMode && !isFinished" class="py-8">
        <div class="text-center space-y-6">
          <div class="bg-gray-50 dark:bg-gray-700 p-8 rounded-lg">
            <p class="text-xl italic text-gray-600 dark:text-gray-300">
              {{ randomQuote }}
            </p>
          </div>
        </div>
      </div>
      
      <!-- Session Goals -->
      <div v-if="!editMode" class="mt-6">
        <h3 class="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Goals</h3>
        <div class="prose dark:prose-invert max-w-none markdown-preview text-left">
          <vue-markdown-render v-if="sessionStore.activeSession.goals" :source="sessionStore.activeSession.goals"></vue-markdown-render>
          <span v-else>No goals set</span>
        </div>
      </div>
      
      <!-- Session Review (shown after session is finished) -->
      <div v-if="isFinished && !editMode" class="mt-8 space-y-6">
        <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-200">
          Rate your focus for this session
        </h3>
        
        <div class="flex flex-wrap gap-4">
          <button
            v-for="option in ratingOptions"
            :key="option.value"
            @click="selectedRating = option.value as SessionQuality"
            class="flex flex-col items-center px-6 py-3 rounded-lg transition-all"
            :class="{
              'bg-gray-100 dark:bg-gray-700': selectedRating !== option.value,
              'bg-primary-100 dark:bg-primary-900 ring-2 ring-primary-500': selectedRating === option.value
            }"
          >
            <span class="text-2xl">{{ option.emoji }}</span>
            <span class="mt-1 font-medium">{{ option.label }}</span>
          </button>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Notes (optional)
          </label>
          <textarea
            v-model="sessionNotes"
            rows="3"
            class="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm font-mono"
            placeholder="How did this session go? Any insights or challenges?"
          ></textarea>

          <!-- Notes Preview -->
          <div v-if="sessionNotes" class="mt-2 p-3 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">
            <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Preview:</p>
            <div class="markdown-preview prose dark:prose-invert prose-sm max-w-none text-left">
              <vue-markdown-render :source="sessionNotes"></vue-markdown-render>
            </div>
          </div>
        </div>
        
        <div class="flex justify-end space-x-3">
          <button
            @click="cancelSession"
            class="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
          >
            Cancel Session
          </button>
          
          <button
            @click="submitRating"
            class="btn btn-primary"
            :disabled="!selectedRating || isSubmitting"
          >
            {{ isSubmitting ? 'Submitting...' : 'Submit Rating' }}
          </button>
        </div>
      </div>
      
      <!-- Edit Session Form -->
      <div v-if="editMode" class="mt-6 space-y-4">
        <h3 class="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Edit Session</h3>
        
        <div>
          <label for="editTitle" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Session Title
          </label>
          <input
            id="editTitle"
            v-model="editableSession.title"
            type="text"
            class="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm"
          />
        </div>
        
        <div>
          <label for="editGoals" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Goals
            <span class="text-xs">
              (<a href="https://www.markdownguide.org/basic-syntax/" target="_blank" class="text-primary-600 dark:text-primary-400 hover:underline">Markdown</a> supported)
            </span>
          </label>
          <textarea
            id="editGoals"
            v-model="editableSession.goals"
            rows="3"
            class="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm font-mono"
          ></textarea>
          
          <!-- Markdown Preview -->
          <div v-if="editableSession.goals" class="mt-2 p-3 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">
            <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Preview:</p>
            <div class="markdown-preview prose dark:prose-invert prose-sm max-w-none text-left">
              <vue-markdown-render :source="editableSession.goals"></vue-markdown-render>
            </div>
          </div>
        </div>
        
        <div>
          <label for="editDuration" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Planned Duration (minutes)
          </label>
          <input
            id="editDuration"
            v-model.number="editableSession.plannedDuration"
            type="number"
            min="0"
            max="480"
            class="mt-1 block w-48 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm"
          />
        </div>
        
        <div class="flex justify-end space-x-3 pt-2">
          <button
            @click="editMode = false"
            class="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
          >
            Cancel
          </button>
          
          <button
            @click="saveSessionEdits"
            class="btn btn-primary"
            :disabled="isUpdating"
          >
            {{ isUpdating ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
      </div>
    </div>
    
    <!-- No active session message -->
    <div v-else class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
      <p class="text-gray-700 dark:text-gray-300 mb-4">
        There is no active focus session.
      </p>
      <RouterLink to="/" class="btn btn-primary">Start a new session</RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useSessionStore } from '../stores/sessionStore'
import { useSessionTimer } from '../composables/useSessionTimer'
import { useNotifications } from '../composables/useNotifications'
import { formatDuration } from '../utils/sessionUtils'
import type { SessionQuality } from '../types'
import dayjs from 'dayjs'
import VueMarkdownRender from 'vue-markdown-render'
import 'marked'

// Router
const router = useRouter()

// Store
const sessionStore = useSessionStore()

// Timer composable
const {
  isOvertime,
  progress,
  formattedTimeRemaining,
  formattedElapsedTime,
  startTimer,
  stopTimer
} = useSessionTimer(sessionStore.activeSession)

// Notifications
const { initNotifications } = useNotifications()

// Session state
const isFinished = ref(false)
const editMode = ref(false)
const isSubmitting = ref(false)
const isUpdating = ref(false)
const selectedRating = ref<SessionQuality | null>(null)
const sessionNotes = ref('')

// Editable session data
const editableSession = reactive({
  title: '',
  goals: '',
  plannedDuration: 0,
})

// Computed properties
const plannedDuration = computed(() => {
  return sessionStore.activeSession?.plannedDuration || 0
})

const formattedStartTime = computed(() => {
  if (!sessionStore.activeSession) return ''
  return dayjs(sessionStore.activeSession.startTime).format('HH:mm')
})

// Rating options
const ratingOptions = [
  { value: 'poor', label: 'Poor', emoji: '💩' },
  { value: 'normal', label: 'Normal', emoji: '⚖️' },
  { value: 'great', label: 'Great', emoji: '🔥' },
  { value: 'deep', label: 'Deep Focus', emoji: '💠' },
]

// Calming quotes
const quotes = [
  "Focus on the present moment.",
  "Small steps lead to big results.",
  "Take a deep breath and continue.",
  "You're making progress, one minute at a time.",
  "Don't worry about perfection. Just keep moving forward.",
  "The work you do now will pay off later.",
  "Stay calm and focused. You've got this.",
  "Every moment of focus builds your ability to concentrate.",
  "This is your time to create and accomplish.",
  "Remember why you started.",
]

const randomQuote = computed(() => {
  const randomIndex = Math.floor(Math.random() * quotes.length)
  return quotes[randomIndex]
})

// Methods
const endSession = async () => {
  try {
    stopTimer()
    await sessionStore.endSession()
    isFinished.value = true
  } catch (error) {
    console.error('Error ending session:', error)
  }
}

const submitRating = async () => {
  if (!selectedRating) return
  
  isSubmitting.value = true
  
  try {
    if (selectedRating.value === null) {
      throw new Error('Please select a rating before submitting')
    }
    await sessionStore.rateSession(selectedRating.value, sessionNotes.value)
    router.push('/')
  } catch (error) {
    console.error('Error submitting rating:', error)
  } finally {
    isSubmitting.value = false
  }
}

const cancelSession = async () => {
  try {
    await sessionStore.cancelSession()
    router.push('/')
  } catch (error) {
    console.error('Error canceling session:', error)
  }
}

const loadSessionEdits = () => {
  if (!sessionStore.activeSession) return
  
  editableSession.title = sessionStore.activeSession.title
  editableSession.goals = sessionStore.activeSession.goals
  editableSession.plannedDuration = sessionStore.activeSession.plannedDuration
}

const toggleEditMode = () => {
  if (!editMode.value) {
    loadSessionEdits()
  }
  editMode.value = !editMode.value
}

const saveSessionEdits = async () => {
  isUpdating.value = true
  
  try {
    await sessionStore.updateActiveSession({
      title: editableSession.title,
      goals: editableSession.goals,
      plannedDuration: editableSession.plannedDuration,
    })
    
    editMode.value = false
  } catch (error) {
    console.error('Error updating session:', error)
  } finally {
    isUpdating.value = false
  }
}

// Watch for session completion to show rating UI
watch(() => sessionStore.activeSession?.endTime, (newEndTime) => {
  if (newEndTime) {
    isFinished.value = true
  }
})

// Initialization
onMounted(async () => {
  await initNotifications()
  loadSessionEdits()
  
  // If session is already ended, show rating UI
  if (sessionStore.activeSession?.endTime) {
    isFinished.value = true
  }
  
  // Start timer if session is active
  if (sessionStore.activeSession?.status === 'active') {
    startTimer()
  }
  
  // If no active session, redirect to home
  if (!sessionStore.activeSession) {
    router.push('/')
  }
})
</script>

<style>
/* Markdown styling */
.markdown-preview .prose h1 { font-size: 1.25rem; font-weight: bold; margin-bottom: 0.5rem; }
.markdown-preview .prose h2 { font-size: 1.125rem; font-weight: bold; margin-bottom: 0.5rem; }
.markdown-preview .prose h3 { font-size: 1rem; font-weight: bold; margin-bottom: 0.5rem; }

.markdown-preview .prose ul { list-style-type: disc; margin-left: 1.25rem; }
.markdown-preview .prose ol { list-style-type: decimal; margin-left: 1.25rem; }
.markdown-preview .prose p { margin: 0.5rem 0; }

.markdown-preview .prose code { 
  font-family: monospace; 
  font-size: 0.875rem; 
  background-color: rgba(0, 0, 0, 0.05); 
  padding: 0 0.25rem; 
  border-radius: 0.25rem; 
}
.dark .markdown-preview .prose code {
  background-color: rgba(255, 255, 255, 0.1);
}

.markdown-preview .prose pre {
  background-color: rgba(0, 0, 0, 0.05);
  padding: 0.5rem;
  border-radius: 0.25rem;
  overflow-x: auto;
  margin: 0.5rem 0;
}
.dark .markdown-preview .prose pre {
  background-color: rgba(255, 255, 255, 0.1);
}

.markdown-preview .prose blockquote {
  border-left: 4px solid rgba(0, 0, 0, 0.1);
  padding-left: 1rem;
  font-style: italic;
  margin: 0.5rem 0;
}
.dark .markdown-preview .prose blockquote {
  border-color: rgba(255, 255, 255, 0.1);
}
</style>
