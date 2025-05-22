<template>
  <div class="min-h-[80vh]">
    <div class="space-y-4 sm:space-y-6 p-4 sm:p-6">
      <!-- Active Session -->
      <div 
        v-if="sessionStore.activeSession" 
        class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg p-4 sm:p-8"
      >
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-0 mb-6">
          <h2 class="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-200">
            {{ sessionStore.activeSession.title || 'Focus Session' }}
          </h2>
          
          <div class="flex flex-wrap gap-2 text-sm sm:text-base">
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
        
        <!-- Session Content -->
        <div v-if="!editMode && !isFinished" class="mb-12 space-y-8">
          <!-- Session Goals -->
          <div class="prose dark:prose-invert max-w-none markdown-preview bg-white/50 dark:bg-gray-900/50 p-3 sm:p-6 rounded-lg border border-gray-200/50 dark:border-gray-700/50 text-left">
            <vue-markdown-render v-if="sessionStore.activeSession.goals" :source="sessionStore.activeSession.goals"></vue-markdown-render>
            <span v-else class="text-gray-500 dark:text-gray-400">No goals set</span>
          </div>

          <!-- Timer -->
          <div class="bg-white/80 dark:bg-gray-800/80 rounded-lg p-4 sm:p-6 shadow-sm">
            <div class="flex justify-between items-end mb-3">
              <span class="text-sm font-medium text-gray-500 dark:text-gray-400">
                {{ isOvertime ? 'Overtime' : 'Remaining' }}
              </span>
              <span class="text-sm font-medium text-gray-500 dark:text-gray-400">
                Started at {{ formattedStartTime }}
              </span>
            </div>
            
            <div class="w-full bg-gray-100 dark:bg-gray-700/50 rounded-full h-3 mb-3 overflow-hidden">
              <div
                class="h-full transition-all duration-1000"
                :class="{
                  'bg-gradient-to-r from-primary-400 to-primary-500': !isOvertime,
                  'bg-gradient-to-r from-amber-400 to-amber-500': isOvertime
                }"
                :style="{ width: `${Math.min(progress, 100)}%` }"
              ></div>
            </div>
            
            <div class="flex justify-between items-baseline">
              <div class="text-3xl sm:text-4xl font-bold tracking-tight" :class="{ 'text-amber-500': isOvertime }">
                {{ isOvertime ? formattedElapsedTime : formattedTimeRemaining }}
              </div>
              
              <div v-if="plannedDuration > 0" class="text-sm font-medium text-gray-500 dark:text-gray-400">
                {{ formattedElapsedTime }} / {{ formatDuration(plannedDuration) }}
              </div>
            </div>
          </div>

          <!-- Quote -->
          <Transition
            enter-active-class="transition-opacity duration-1000"
            leave-active-class="transition-opacity duration-1000"
            enter-from-class="opacity-0"
            leave-to-class="opacity-0"
          >
            <div 
              class="relative bg-gradient-to-br from-white/80 to-white/40 dark:from-gray-900/80 dark:to-gray-900/40 
                     p-4 sm:p-8 rounded-xl border border-gray-200/50 dark:border-gray-700/50 
                     shadow-lg backdrop-blur-sm"
              :key="randomQuote"
            >
              <div class="absolute inset-0 bg-primary-500/5 dark:bg-primary-400/5 rounded-xl"></div>
              <p class="relative text-lg sm:text-2xl italic text-gray-700 dark:text-gray-200 font-light leading-relaxed">
                {{ randomQuote }}
              </p>
            </div>
          </Transition>
        </div>

        <!-- Review Form -->
        <div v-if="isFinished && !editMode" class="mt-12 space-y-8">
          <div class="text-center">
            <h3 class="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
              Rate your focus for this session
            </h3>
            <p class="text-gray-500 dark:text-gray-400">How well were you able to concentrate?</p>
          </div>
          
          <div class="flex flex-wrap gap-2 sm:gap-4 justify-center">
            <button
              v-for="option in ratingOptions"
              :key="option.value"
              @click="selectedRating = option.value as SessionQuality"
              class="group flex flex-col items-center px-4 sm:px-8 py-3 sm:py-4 rounded-xl transition-all duration-200 flex-1 sm:flex-none"
              :class="{
                'bg-white/50 dark:bg-gray-900/50 hover:bg-white/80 dark:hover:bg-gray-900/80': selectedRating !== option.value,
                'bg-primary-50 dark:bg-primary-900/50 ring-2 ring-primary-500 shadow-lg shadow-primary-500/10': selectedRating === option.value
              }"
            >
              <span class="text-2xl sm:text-3xl transform transition-transform duration-200 group-hover:scale-110">{{ option.emoji }}</span>
              <span class="mt-2 font-medium text-base sm:text-lg">{{ option.label }}</span>
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
              <div class="markdown-preview prose dark:prose-invert prose-sm max-w-none">
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
      </div>

      <div v-else class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg p-8 text-center">
        <p class="text-gray-700 dark:text-gray-300 mb-4">
          There is no active focus session.
        </p>
        <RouterLink to="/" class="btn btn-primary">Start a new session</RouterLink>
      </div>
    </div>

    <!-- Edit Session Modal -->
    <div v-if="editMode" class="fixed inset-0 bg-gray-900/20 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-4 sm:p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto space-y-4 sm:space-y-6">
        <h3 class="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-200">Edit Session</h3>
        
        <div>
          <label for="editTitle" class="block text-base font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Session Title
          </label>
          <input
            id="editTitle"
            v-model="editableSession.title"
            type="text"
            class="mt-1 block w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-lg"
          />
        </div>
        
        <div>
          <label for="editGoals" class="block text-base font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Goals
            <span class="text-sm font-normal">
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
          <div v-if="editableSession.goals" class="mt-3 p-4 bg-gray-50/50 dark:bg-gray-900/50 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
            <p class="text-xs text-gray-500 dark:text-gray-400 mb-2">Preview:</p>
            <div class="markdown-preview prose dark:prose-invert prose-sm max-w-none text-[0.95em]">
              <vue-markdown-render :source="editableSession.goals"></vue-markdown-render>
            </div>
          </div>
        </div>
        
        <div>
          <label for="editDuration" class="block text-base font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Planned Duration (minutes)
          </label>
          <input
            id="editDuration"
            v-model.number="editableSession.plannedDuration"
            type="number"
            min="0"
            max="480"
            class="mt-1 block w-48 px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-lg"
          />
        </div>
        
        <div class="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            @click="editMode = false"
            class="px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
          >
            Cancel
          </button>
          
          <button
            @click="saveSessionEdits"
            class="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-400 hover:to-primary-500
                   text-white font-medium rounded-lg transition-all duration-200
                   transform hover:scale-[1.02] active:scale-[0.98] 
                   disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
            :disabled="isUpdating"
          >
            <span class="flex items-center space-x-2">
              <span>{{ isUpdating ? 'Saving...' : 'Save Changes' }}</span>
              <svg v-if="!isUpdating" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Vue core
import { ref, computed, reactive, onMounted, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

// Stores and composables
import { useSessionStore } from '../stores/sessionStore'
import { useSessionTimer } from '../composables/useSessionTimer'
import { useNotifications } from '../composables/useNotifications'

// Utils and types
import { formatDuration } from '../utils/sessionUtils'
import type { SessionQuality } from '../types'

// Third party
import dayjs from 'dayjs'
import VueMarkdownRender from 'vue-markdown-render'
import 'marked'

// Quotes
const quotesList = {
  meditation: "🌊 Like waves on the shore, let thoughts come and go. Stay with your breath.",
  growth: "🌱 Each focused moment is a seed of growth. You're planting success.",
  attention: "🎯 Your attention is like a gentle spotlight. Shine it on one thing at a time.",
  mindfulness: "🍃 Be kind to your wandering mind. Gently guide it back when it drifts.",
  present: "💫 Your energy flows where attention goes. Stay present.",
  progress: "🌸 Progress blooms in small moments. This is one of them.",
  perfection: "🌈 Let go of 'perfect.' Embrace 'present.'",
  focus: "🎈 Hold your focus lightly, like a balloon string. Don't grip too tight.",
  victory: "⭐ Each minute of focus is a victory. Celebrate the small wins.",
  goals: "🌙 Like the moon pulls tides, let your goal gently draw you forward.",
  peace: "🕊️ Peace lives in this moment. Not in past or future thoughts.",
  persistence: "🌺 Your mind may wander. That's okay. Just keep coming back.",
  growth2: "🌿 Growth happens in gentle moments like these.",
  future: "🎨 You're painting your future with each focused breath.",
  darkness: "✨ Just like stars need darkness to shine, focus emerges from chaos."
}

const quotes = Object.values(quotesList)

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
  { value: 'poor' as SessionQuality, label: 'Poor', emoji: '💩' },
  { value: 'normal' as SessionQuality, label: 'Normal', emoji: '⚖️' },
  { value: 'great' as SessionQuality, label: 'Great', emoji: '🔥' },
  { value: 'deep' as SessionQuality, label: 'Deep Focus', emoji: '💠' },
]


let currentQuoteIndex = Math.floor(Math.random() * quotes.length)
const randomQuote = computed(() => quotes[currentQuoteIndex])

// Quote rotation
if (typeof window !== 'undefined') {
  setInterval(() => {
    let newIndex
    do {
      newIndex = Math.floor(Math.random() * quotes.length)
    } while (newIndex === currentQuoteIndex)
    currentQuoteIndex = newIndex
  }, 180000)
}

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
  if (!selectedRating.value) return
  
  isSubmitting.value = true
  
  try {
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

// Watchers
watch(() => sessionStore.activeSession?.endTime, (newEndTime) => {
  if (newEndTime) {
    isFinished.value = true
  }
})

// Initialization
onMounted(async () => {
  await initNotifications()
  loadSessionEdits()
  
  if (sessionStore.activeSession?.endTime) {
    isFinished.value = true
  }
  
  if (sessionStore.activeSession?.status === 'active') {
    startTimer()
  }
  
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
