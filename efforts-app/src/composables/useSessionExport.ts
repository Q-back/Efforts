import { ref } from 'vue'
import { FocusSession } from '../types'
import { generateDailyReport } from '../utils/sessionUtils'
import { storageService } from '../services/StorageService'

export function useSessionExport() {
  const isExporting = ref(false)
  const exportError = ref<string | null>(null)
  
  /**
   * Export today's sessions to markdown and copy to clipboard
   */
  const exportDayToClipboard = async (date: Date = new Date()): Promise<boolean> => {
    try {
      isExporting.value = true
      exportError.value = null
      
      // Get sessions for the day
      const sessions = await storageService.getSessionsForDay(date)
      
      // Generate markdown report
      const markdown = generateDailyReport(sessions, date)
      
      // Copy to clipboard
      await navigator.clipboard.writeText(markdown)
      
      return true
    } catch (error) {
      exportError.value = error instanceof Error 
        ? error.message 
        : 'Failed to export sessions'
      return false
    } finally {
      isExporting.value = false
    }
  }
  
  /**
   * Export a single session to markdown and copy to clipboard
   */
  const exportSessionToClipboard = async (session: FocusSession): Promise<boolean> => {
    try {
      isExporting.value = true
      exportError.value = null
      
      // Generate markdown for the session
      const markdown = generateDailyReport([session], session.startTime)
      
      // Copy to clipboard
      await navigator.clipboard.writeText(markdown)
      
      return true
    } catch (error) {
      exportError.value = error instanceof Error 
        ? error.message 
        : 'Failed to export session'
      return false
    } finally {
      isExporting.value = false
    }
  }
  
  return {
    isExporting,
    exportError,
    exportDayToClipboard,
    exportSessionToClipboard,
  }
}
