<template>
  <div class="space-y-6">
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
      <h2 class="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-200 text-left">Start a Focus Session</h2>
      
      <form @submit.prevent="startSession" class="space-y-6">
        <div>
          <label for="goals" class="block text-base font-semibold text-gray-700 dark:text-gray-300 mb-2 text-left">
            Goals 
            <span class="text-sm font-normal">
              (<a href="https://www.markdownguide.org/basic-syntax/" target="_blank" class="text-primary-600 dark:text-primary-400 hover:underline">Markdown</a> supported)
            </span>
          </label>
          <textarea
            id="goals"
            v-model="goals"
            rows="3"
            placeholder="What do you want to accomplish?"
            class="mt-1 block w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-lg font-mono"
          ></textarea>
          
          <!-- Markdown Preview -->
          <div v-if="goals" class="mt-2 p-4 bg-gray-50/50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
            <p class="text-xs text-gray-500 dark:text-gray-400 mb-2">Preview:</p>
            <div class="markdown-preview prose dark:prose-invert prose-sm max-w-none text-left text-[0.95em]">
              <vue-markdown-render :source="goals"></vue-markdown-render>
            </div>
          </div>
        </div>
        
        <div>
          <label for="duration" class="block text-base font-semibold text-gray-700 dark:text-gray-300 mb-2 text-left">
            Planned Duration (minutes)
          </label>
          <input
            id="duration"
            v-model.number="duration"
            type="number"
            min="0"
            max="480"
            step="5"
            class="mt-1 block w-48 px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-lg"
          />
        </div>
        
        <div class="flex pt-4">
          <button
            type="submit"
            class="w-full sm:w-auto btn btn-primary px-8 py-4 text-lg font-semibold rounded-xl 
                   bg-gradient-to-br from-primary-500 to-primary-600 hover:from-primary-400 hover:to-primary-500
                   transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] active:duration-75
                   shadow-lg hover:shadow-primary-500/25 active:shadow
                   disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
            :disabled="isStarting"
          >
            <span class="flex items-center justify-center space-x-2">
              <span>{{ isStarting ? 'Starting...' : 'Start Focus Session' }}</span>
              <svg v-if="!isStarting" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
          </button>
        </div>
      </form>
    </div>
    
    <div v-if="sessionStore.hasActiveSession">
      <div class="bg-green-50 dark:bg-green-900 border-l-4 border-green-500 p-4 rounded">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm leading-5 text-green-800 dark:text-green-200">
              You have an active focus session! 
              <RouterLink to="/session" class="font-bold underline hover:text-green-600">
                Go to session
              </RouterLink>
            </p>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="todayStats.totalSessions > 0" class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
      <h2 class="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-200 text-left">Today's Progress</h2>
      
      <div class="grid md:grid-cols-3 gap-4">
        <div class="bg-gradient-to-br from-gray-50/80 to-gray-50/50 dark:from-gray-700/80 dark:to-gray-700/50 p-6 rounded-lg text-center backdrop-blur-sm shadow-sm">
          <p class="text-gray-500 dark:text-gray-400 text-sm">Total Focus Time</p>
          <p class="text-2xl font-bold text-gray-800 dark:text-gray-200">{{ formatDuration(todayStats.totalFocusTime) }}</p>
        </div>
        
        <div class="bg-gradient-to-br from-gray-50/80 to-gray-50/50 dark:from-gray-700/80 dark:to-gray-700/50 p-6 rounded-lg text-center backdrop-blur-sm shadow-sm">
          <p class="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">Sessions Completed</p>
          <p class="text-2xl font-bold text-gray-800 dark:text-gray-200">{{ todayStats.totalSessions }}</p>
        </div>
        
        <div class="bg-gradient-to-br from-gray-50/80 to-gray-50/50 dark:from-gray-700/80 dark:to-gray-700/50 p-6 rounded-lg text-center backdrop-blur-sm shadow-sm">
          <p class="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">Points Earned</p>
          <p class="text-2xl font-bold text-primary-600 dark:text-primary-400">{{ todayStats.totalPoints }}</p>
        </div>
      </div>
      
      <div class="mt-6 flex justify-end">
        <button
          @click="exportToday"
          class="inline-flex items-center space-x-2 px-4 py-2 text-sm font-medium text-primary-600 dark:text-primary-400 
                 hover:text-primary-700 dark:hover:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 
                 rounded-lg transition-colors duration-200"
          :disabled="isExporting"
        >
          <span>{{ isExporting ? 'Exporting...' : 'Copy today\'s report to clipboard' }}</span>
          <svg v-if="!isExporting" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useSessionStore } from '../stores/sessionStore'
import { useSessionExport } from '../composables/useSessionExport'
import { useStatsStore } from '../stores/statsStore'
import { formatDuration } from '../utils/sessionUtils'
import VueMarkdownRender from 'vue-markdown-render'
import 'marked'

// Router
const router = useRouter()

// Store
const sessionStore = useSessionStore()
const statsStore = useStatsStore()

// Form data
const goals = ref('')
const duration = ref(25) // Default to 25 minutes (pomodoro)

// UI state
const isStarting = ref(false)

// Stats display
const todayStats = computed(() => {
  return statsStore.dailyStats?.current || {
    totalSessions: 0,
    totalFocusTime: 0,
    totalPoints: 0,
    qualityDistribution: { poor: 0, normal: 0, great: 0 },
    averageSessionLength: 0,
  }
})

// Export functionality
const { isExporting, exportDayToClipboard } = useSessionExport()

// Start a new focus session
const startSession = async () => {
  isStarting.value = true
  
  try {
    await sessionStore.startSession(
      goals.value,
      duration.value,
    )
    
    // Clear form
    goals.value = ''
    
    // Navigate to session view
    router.push('/session')
  } catch (error) {
    console.error('Failed to start session:', error)
    // Handle error (could add a toast notification here)
  } finally {
    isStarting.value = false
  }
}

// Export today's sessions
const exportToday = async () => {
  const success = await exportDayToClipboard()
  if (success) {
    // Could show a success toast here
    alert('Today\'s report copied to clipboard!')
  }
}
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
  width: auto;
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
