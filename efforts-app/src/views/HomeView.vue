<template>
  <div class="space-y-6">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 class="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">Start a Focus Session</h2>
      
      <form @submit.prevent="startSession" class="space-y-4">
        <div>
          <label for="title" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Session Title
          </label>
          <input
            id="title"
            v-model="title"
            type="text"
            placeholder="What are you working on?"
            class="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-gray-100"
          />
        </div>
        
        <div>
          <label for="goals" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Goals (Markdown supported)
          </label>
          <textarea
            id="goals"
            v-model="goals"
            rows="3"
            placeholder="What do you want to accomplish?"
            class="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-gray-100"
          ></textarea>
        </div>
        
        <div>
          <label for="duration" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Planned Duration (minutes)
          </label>
          <input
            id="duration"
            v-model.number="duration"
            type="number"
            min="0"
            max="480"
            step="5"
            class="mt-1 block w-48 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-gray-100"
          />
        </div>
        
        <div class="flex space-x-3 pt-2">
          <button
            type="submit"
            class="btn btn-primary px-8 py-3 text-base"
            :disabled="isStarting"
          >
            {{ isStarting ? 'Starting...' : 'Start Focus Session' }}
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
    
    <div v-if="todayStats.totalSessions > 0" class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 class="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">Today's Progress</h2>
      
      <div class="grid md:grid-cols-3 gap-4">
        <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
          <p class="text-gray-500 dark:text-gray-400 text-sm">Total Focus Time</p>
          <p class="text-2xl font-bold text-gray-800 dark:text-gray-200">{{ formatDuration(todayStats.totalFocusTime) }}</p>
        </div>
        
        <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
          <p class="text-gray-500 dark:text-gray-400 text-sm">Sessions Completed</p>
          <p class="text-2xl font-bold text-gray-800 dark:text-gray-200">{{ todayStats.totalSessions }}</p>
        </div>
        
        <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
          <p class="text-gray-500 dark:text-gray-400 text-sm">Points Earned</p>
          <p class="text-2xl font-bold text-primary-600 dark:text-primary-400">{{ todayStats.totalPoints }}</p>
        </div>
      </div>
      
      <div class="mt-4 text-right">
        <button
          @click="exportToday"
          class="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
          :disabled="isExporting"
        >
          {{ isExporting ? 'Exporting...' : 'Copy today\'s report to clipboard' }}
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

// Router
const router = useRouter()

// Store
const sessionStore = useSessionStore()
const statsStore = useStatsStore()

// Form data
const title = ref('')
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
    qualityDistribution: { poor: 0, normal: 0, great: 0, deep: 0 },
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
      title.value,
      goals.value,
      duration.value,
    )
    
    // Clear form
    title.value = ''
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
