import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { FocusSession } from '../types'

export function useSessionTimer(session: FocusSession | null) {
  const elapsedTime = ref(0) // in seconds
  const isOvertime = ref(false)
  const timerInterval = ref<number | null>(null)
  
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
    
    // Calculate initial elapsed time if session already started
    if (session?.startTime) {
      const now = new Date()
      const startTime = new Date(session.startTime)
      const initialElapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000)
      elapsedTime.value = initialElapsed
      
      // Check if we're already in overtime
      if (session.plannedDuration > 0) {
        isOvertime.value = initialElapsed > session.plannedDuration * 60
      }
    }
    
    // Start the interval
    timerInterval.value = window.setInterval(() => {
      elapsedTime.value++
      
      // Check for overtime
      if (!isOvertime.value && timeRemaining.value === 0) {
        isOvertime.value = true
      }
    }, 1000) as unknown as number
  }
  
  /**
   * Stop the timer
   */
  const stopTimer = () => {
    if (timerInterval.value) {
      clearInterval(timerInterval.value)
      timerInterval.value = null
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
    }
  })
  
  onUnmounted(() => {
    stopTimer()
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
