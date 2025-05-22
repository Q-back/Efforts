import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import type { FocusSession } from '../types'
import { useNotifications } from './useNotifications'
import { extractSessionTitle } from '../utils/sessionUtils'

export function useSessionTimer(session: FocusSession | null) {
  const { showSessionCompleteNotification } = useNotifications()
  const elapsedTime = ref(0) // in seconds
  const isOvertime = ref(false)
  const timerInterval = ref<number | null>(null)
  const syncInterval = ref<number | null>(null)

  /**
   * Sync timer with real elapsed time from session start
   */
  const syncWithRealTime = () => {
    if (!session?.startTime) return
    const now = new Date()
    const startTime = new Date(session.startTime)
    const actualElapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000)
    elapsedTime.value = actualElapsed

    // Check for overtime
    if (session.plannedDuration > 0) {
      isOvertime.value = actualElapsed > session.plannedDuration * 60
    }
  }

  // Sync timer when window regains focus
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      syncWithRealTime()
    }
  }
  
  /**
   * Calculate time remaining in the session (in seconds)
   */
  const timeRemaining = computed(() => {
    if (!session || session.plannedDuration === 0) return null
    
    const plannedSeconds = session.plannedDuration * 60
    const remaining = plannedSeconds - elapsedTime.value
    
    return remaining > 0 ? remaining : 0
  })
  
  /**
   * Format seconds into a readable time string (MM:SS)
   */
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  
  /**
   * Format the time remaining as a string
   */
  const formattedTimeRemaining = computed(() => {
    if (timeRemaining.value === null) return '--:--'
    return formatTime(timeRemaining.value)
  })
  
  /**
   * Format the elapsed time as a string
   */
  const formattedElapsedTime = computed(() => {
    return formatTime(elapsedTime.value)
  })
  
  /**
   * Calculate the progress percentage (0-100)
   */
  const progress = computed(() => {
    if (!session || session.plannedDuration === 0) return 100
    
    const plannedSeconds = session.plannedDuration * 60
    const percentage = (elapsedTime.value / plannedSeconds) * 100
    
    return Math.min(percentage, 100)
  })
  
  /**
   * Start the timer
   */
  const startTimer = () => {
    if (timerInterval.value) return
    
    // Initial sync with real time
    syncWithRealTime()
    
    // Start the intervals
    timerInterval.value = window.setInterval(() => {
      elapsedTime.value++
      
      // Check for overtime and notify when first entering overtime
      if (!isOvertime.value && timeRemaining.value === 0) {
        isOvertime.value = true
        showSessionCompleteNotification(session ? extractSessionTitle(session.goals) : undefined)
      }
    }, 1000) as unknown as number
    
    // Start periodic sync (every minute)
    syncInterval.value = window.setInterval(syncWithRealTime, 60000) as unknown as number
  }
  
  /**
   * Stop the timer
   */
  const stopTimer = () => {
    if (timerInterval.value) {
      clearInterval(timerInterval.value)
      timerInterval.value = null
    }
    if (syncInterval.value) {
      clearInterval(syncInterval.value)
      syncInterval.value = null
    }
  }
  
  /**
   * Reset the timer
   */
  const resetTimer = () => {
    stopTimer()
    elapsedTime.value = 0
    isOvertime.value = false
  }
  
  // Setup and cleanup
  onMounted(() => {
    if (session?.status === 'active') {
      startTimer()
      document.addEventListener('visibilitychange', handleVisibilityChange)
    }
  })
  
  onUnmounted(() => {
    stopTimer()
    document.removeEventListener('visibilitychange', handleVisibilityChange)
  })

  // Watch for session status changes
  watch(() => session?.status, (newStatus) => {
    if (newStatus !== 'active') {
      stopTimer()
    }
  })
  
  return {
    elapsedTime,
    isOvertime,
    timeRemaining,
    progress,
    formattedTimeRemaining,
    formattedElapsedTime,
    startTimer,
    stopTimer,
    resetTimer,
  }
}
