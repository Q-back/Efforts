<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">Session History</h1>
    
    <!-- Date selector -->
    <div class="flex justify-between items-center mb-4">
      <button 
        @click="previousDay" 
        class="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      <div class="text-lg font-medium">{{ formattedDate }}</div>
      
      <button 
        @click="nextDay" 
        class="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
        :disabled="isToday"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
    
    <!-- Loading state -->
    <div v-if="isLoading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      <p class="mt-2 text-gray-600 dark:text-gray-400">Loading sessions...</p>
    </div>
    
    <!-- No sessions state -->
    <div v-else-if="sessions.length === 0" class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
      <p class="text-gray-600 dark:text-gray-400">
        No focus sessions found for {{ formattedDate }}.
      </p>
    </div>
    
    <!-- Sessions list -->
    <div v-else class="space-y-4">
      <div v-for="session in sessions" :key="session.id" class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div class="flex justify-between items-start mb-4">
          <div>
            <h3 class="text-xl font-medium text-gray-800 dark:text-gray-200">
              {{ session.title || 'Untitled Session' }}
            </h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{ formatSessionTime(session) }}
            </p>
          </div>
          
          <div class="flex items-center space-x-2">
            <span 
              class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
              :class="getQualityClass(session.quality)"
            >
              {{ getQualityEmoji(session.quality) }} 
              {{ session.quality ? capitalize(session.quality) : 'Unrated' }}
            </span>
            
            <span class="text-primary-600 dark:text-primary-400 font-bold">
              {{ session.points }} pts
            </span>
          </div>
        </div>
        
        <div class="prose dark:prose-invert max-w-none mb-4">
          <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Goals:</h4>
          <div class="text-sm">
            {{ session.goals || 'No goals set' }}
          </div>
        </div>
        
        <div v-if="session.notes" class="prose dark:prose-invert max-w-none mb-4">
          <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes:</h4>
          <div class="text-sm">{{ session.notes }}</div>
        </div>
        
        <div class="flex items-center justify-between mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div class="text-sm">
            <span class="text-gray-500 dark:text-gray-400">Duration: </span>
            <span class="font-medium">{{ formatDuration(session.actualDuration) }}</span>
            
            <span v-if="session.overtime > 0" class="ml-2">
              <span class="text-gray-500 dark:text-gray-400">(Overtime: </span>
              <span class="font-medium">{{ formatDuration(session.overtime) }}</span>
              <span class="text-gray-500 dark:text-gray-400">)</span>
            </span>
          </div>
          
          <button 
            @click="exportSession(session)" 
            class="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
          >
            Copy to clipboard
          </button>
        </div>
      </div>
      
      <!-- Export all button -->
      <div class="flex justify-end mt-4">
        <button 
          @click="exportAll" 
          class="btn btn-primary"
          :disabled="isExporting"
        >
          {{ isExporting ? 'Exporting...' : 'Copy all sessions to clipboard' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { FocusSession, SessionQuality } from '../types'
import { useStatsStore } from '../stores/statsStore'
import { formatDuration, getQualityEmoji } from '../utils/sessionUtils'
import { useSessionExport } from '../composables/useSessionExport'
import dayjs from 'dayjs'

// Store
const statsStore = useStatsStore()

// State
const selectedDate = ref(new Date())
const sessions = ref<FocusSession[]>([])
const isLoading = ref(false)

// Export functionality
const { isExporting, exportDayToClipboard, exportSessionToClipboard } = useSessionExport()

// Computed properties
const formattedDate = computed(() => {
  return dayjs(selectedDate.value).format('MMMM D, YYYY')
})

const isToday = computed(() => {
  const today = new Date()
  const selected = selectedDate.value
  
  return (
    today.getDate() === selected.getDate() &&
    today.getMonth() === selected.getMonth() &&
    today.getFullYear() === selected.getFullYear()
  )
})

// Methods
const loadSessions = async () => {
  isLoading.value = true
  
  try {
    // Create start and end of the selected date
    const startOfDay = new Date(selectedDate.value)
    startOfDay.setHours(0, 0, 0, 0)
    
    const endOfDay = new Date(selectedDate.value)
    endOfDay.setHours(23, 59, 59, 999)
    
    // Get sessions
    const result = await statsStore.getSessionsInRange(startOfDay, endOfDay)
    
    // Sort by start time
    sessions.value = [...result].sort((a, b) => {
      return new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    })
  } catch (error) {
    console.error('Error loading sessions:', error)
  } finally {
    isLoading.value = false
  }
}

const previousDay = () => {
  const prev = new Date(selectedDate.value)
  prev.setDate(prev.getDate() - 1)
  selectedDate.value = prev
  loadSessions()
}

const nextDay = () => {
  if (isToday.value) return
  
  const next = new Date(selectedDate.value)
  next.setDate(next.getDate() + 1)
  selectedDate.value = next
  loadSessions()
}

const formatSessionTime = (session: FocusSession) => {
  const start = dayjs(session.startTime).format('HH:mm')
  let end = '?'
  
  if (session.endTime) {
    end = dayjs(session.endTime).format('HH:mm')
  }
  
  return `${start} - ${end}`
}

const getQualityClass = (quality: SessionQuality | null) => {
  if (!quality) return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  
  switch (quality) {
    case 'poor':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    case 'normal':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    case 'great':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    case 'deep':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
  }
}

const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

const exportSession = async (session: FocusSession) => {
  const success = await exportSessionToClipboard(session)
  
  if (success) {
    alert('Session copied to clipboard!')
  }
}

const exportAll = async () => {
  const success = await exportDayToClipboard(selectedDate.value)
  
  if (success) {
    alert('All sessions copied to clipboard!')
  }
}

// Initialize
onMounted(async () => {
  await loadSessions()
})
</script>
