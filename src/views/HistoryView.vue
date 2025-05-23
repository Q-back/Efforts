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
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
          <div>
            <h3 class="text-lg sm:text-xl font-medium text-gray-800 dark:text-gray-200">
              {{ extractSessionTitle(session.goals) }}
            </h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{ formatSessionTime(session) }}
            </p>
          </div>
          
          <div class="flex flex-wrap items-center gap-2">
            <span 
              class="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium"
              :class="getQualityClass(session.quality)"
            >
              {{ getQualityEmoji(session.quality) }} 
              {{ session.quality ? capitalize(session.quality) : 'Unrated' }}
            </span>
            
            <span class="text-primary-600 dark:text-primary-400 font-bold text-sm sm:text-base">
              {{ calculateSessionPoints(session) }} pts
            </span>
            
            <div class="flex items-center gap-1">
              <button 
                @click="openEditSessionModal(session)" 
                class="p-1.5 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Edit session"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
              <button 
                @click="confirmDeleteSession(session)" 
                class="p-1.5 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Delete session"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        <div class="mb-6">
          <h4 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2 text-left">Goals</h4>
          <div class="bg-gray-50/50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
            <div class="prose dark:prose-invert text-sm sm:text-base markdown-preview text-left">
              <vue-markdown-render v-if="session.goals" :source="session.goals"></vue-markdown-render>
              <span v-else class="text-gray-500 dark:text-gray-400">No goals set</span>
            </div>
          </div>
        </div>
        
        <div v-if="session.notes" class="mb-6">
          <h4 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2 text-left">Notes</h4>
          <div class="bg-gray-50/50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
            <div class="prose dark:prose-invert text-sm sm:text-base markdown-preview text-left">
              <vue-markdown-render :source="session.notes"></vue-markdown-render>
            </div>
          </div>
        </div>
        
        <div class="flex items-center justify-between mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div class="text-xs sm:text-sm">
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
            class="text-xs sm:text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
          >
            Copy to clipboard
          </button>
        </div>
      </div>
      
      <!-- Export all button -->
      <div class="flex justify-end mt-4">
        <button 
          @click="exportAll" 
          class="btn btn-primary text-sm sm:text-base"
          :disabled="isExporting"
        >
          {{ isExporting ? 'Exporting...' : 'Copy all sessions to clipboard' }}
        </button>
      </div>
    </div>
    
    <!-- Edit Session Modal -->
    <div v-if="isEditModalOpen" class="fixed inset-0 bg-gray-900/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <h2 class="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">Edit Session</h2>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Goals <span class="text-xs">(<a href="https://www.markdownguide.org/basic-syntax/" target="_blank" class="text-primary-600 dark:text-primary-400 hover:underline">Markdown</a> supported)</span>
            </label>
            <textarea 
              v-model="editForm.goals" 
              rows="3" 
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono"
            ></textarea>
            
            <!-- Markdown Preview -->
            <div v-if="editForm.goals" class="mt-2 p-3 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">
              <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Preview:</p>
              <div class="markdown-preview prose dark:prose-invert prose-sm max-w-none text-left">
                <vue-markdown-render :source="editForm.goals"></vue-markdown-render>
              </div>
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes <span class="text-xs">(<a href="https://www.markdownguide.org/basic-syntax/" target="_blank" class="text-primary-600 dark:text-primary-400 hover:underline">Markdown</a> supported)</span>
            </label>
            <textarea 
              v-model="editForm.notes" 
              rows="3" 
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono"
            ></textarea>
            
            <!-- Markdown Preview -->
            <div v-if="editForm.notes" class="mt-2 p-3 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">
              <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Preview:</p>
              <div class="markdown-preview prose dark:prose-invert prose-sm max-w-none text-left">
                <vue-markdown-render :source="editForm.notes"></vue-markdown-render>
              </div>
            </div>
            
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Session Quality
            </label>
            <div class="flex flex-wrap gap-2">
              <button 
                @click="editForm.quality = 'poor'" 
                :class="[
                  'px-3 py-1 rounded-full text-sm font-medium',
                  editForm.quality === 'poor' 
                    ? 'bg-red-600 text-white' 
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                ]"
              >
                💩 Poor
              </button>
              <button 
                @click="editForm.quality = 'normal'" 
                :class="[
                  'px-3 py-1 rounded-full text-sm font-medium',
                  editForm.quality === 'normal' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                ]"
              >
                ⚖️ Normal
              </button>
              <button 
                @click="editForm.quality = 'great'" 
                :class="[
                  'px-3 py-1 rounded-full text-sm font-medium',
                  editForm.quality === 'great' 
                    ? 'bg-yellow-600 text-white' 
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                ]"
              >
                🔥 Great
              </button>
              <button 
                @click="editForm.quality = 'deep'" 
                :class="[
                  'px-3 py-1 rounded-full text-sm font-medium',
                  editForm.quality === 'deep' 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                ]"
              >
                💠 Deep focus
              </button>
            </div>
          </div>
        </div>
        
        <div class="mt-6 flex justify-end space-x-3">
          <button 
            @click="cancelEdit" 
            class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button 
            @click="saveEditedSession" 
            class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
    
    <!-- Delete Confirmation Modal -->
    <div v-if="isDeleteModalOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 class="text-xl font-bold mb-2 text-gray-800 dark:text-gray-200">Delete Session</h2>
        <p class="text-gray-600 dark:text-gray-400 mb-6">
          Are you sure you want to delete this session? This action cannot be undone.
        </p>
        
        <div class="flex justify-end space-x-3">
          <button 
            @click="cancelDelete" 
            class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button 
            @click="deleteSession" 
            class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { FocusSession, SessionQuality } from '../types'
import { useStatsStore } from '../stores/statsStore'
import { formatDuration, getQualityEmoji, calculateSessionPoints, extractSessionTitle } from '../utils/sessionUtils'
import { useSessionExport } from '../composables/useSessionExport'
import dayjs from 'dayjs'
import VueMarkdownRender from 'vue-markdown-render'
import 'marked'

// Store
const statsStore = useStatsStore()

// State
const selectedDate = ref(new Date())
const sessions = ref<FocusSession[]>([])
const isLoading = ref(false)
const isEditModalOpen = ref(false)
const sessionToEdit = ref<FocusSession | null>(null)
const isDeleteModalOpen = ref(false)
const sessionToDelete = ref<FocusSession | null>(null)

// Form state
const editForm = ref({
  goals: '',
  notes: '',
  quality: null as SessionQuality | null
})

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

// Session editing
const openEditSessionModal = (session: FocusSession) => {
  sessionToEdit.value = session
  editForm.value = {
    goals: session.goals,
    notes: session.notes,
    quality: session.quality
  }
  isEditModalOpen.value = true
}

const saveEditedSession = async () => {
  try {
    if (!sessionToEdit.value) return
    
    // Create updated session object
    const updatedSession: FocusSession = {
      ...sessionToEdit.value,
      goals: editForm.value.goals,
      notes: editForm.value.notes,
      quality: editForm.value.quality
    }
    
    
    // Save using stats store
    await statsStore.updateSession(updatedSession)
    
    // Close modal and refresh sessions
    isEditModalOpen.value = false
    sessionToEdit.value = null
    await loadSessions()
  } catch (error) {
    console.error('Error saving session:', error)
    alert('Failed to save session changes')
  }
}

const cancelEdit = () => {
  isEditModalOpen.value = false
  sessionToEdit.value = null
}

// Session deletion
const confirmDeleteSession = (session: FocusSession) => {
  sessionToDelete.value = session
  isDeleteModalOpen.value = true
}

const deleteSession = async () => {
  try {
    if (!sessionToDelete.value) return
    
    await statsStore.deleteSession(sessionToDelete.value.id)
    isDeleteModalOpen.value = false
    sessionToDelete.value = null
    await loadSessions()
  } catch (error) {
    console.error('Error deleting session:', error)
    alert('Failed to delete session')
  }
}

const cancelDelete = () => {
  isDeleteModalOpen.value = false
  sessionToDelete.value = null
}

// Initialize
onMounted(async () => {
  await loadSessions()
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
