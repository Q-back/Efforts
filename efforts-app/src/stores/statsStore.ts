import { defineStore } from 'pinia'
import type { FocusSession, ComparableStats } from '../types'
import { storageService } from '../services/StorageService'
import { compareStats } from '../utils/sessionUtils'
import dayjs from 'dayjs'

type TimeRange = 'day' | 'week' | 'month'

export const useStatsStore = defineStore('stats', {
  state: () => ({
    dailyStats: null as ComparableStats | null,
    weeklyStats: null as ComparableStats | null,
    monthlyStats: null as ComparableStats | null,
    isLoading: false,
    error: null as string | null,
  }),
  
  actions: {
    /**
     * Load statistics for a specific time range
     */
    async loadStats(range: TimeRange) {
      try {
        this.isLoading = true
        
        // Set date ranges based on the selected time range
        const now = dayjs()
        let currentStart: Date, currentEnd: Date
        let previousStart: Date, previousEnd: Date
        
        switch (range) {
          case 'day':
            currentStart = now.startOf('day').toDate()
            currentEnd = now.endOf('day').toDate()
            previousStart = now.subtract(1, 'day').startOf('day').toDate()
            previousEnd = now.subtract(1, 'day').endOf('day').toDate()
            break
            
          case 'week':
            currentStart = now.startOf('week').toDate()
            currentEnd = now.endOf('week').toDate()
            previousStart = now.subtract(1, 'week').startOf('week').toDate()
            previousEnd = now.subtract(1, 'week').endOf('week').toDate()
            break
            
          case 'month':
            currentStart = now.startOf('month').toDate()
            currentEnd = now.endOf('month').toDate()
            previousStart = now.subtract(1, 'month').startOf('month').toDate()
            previousEnd = now.subtract(1, 'month').endOf('month').toDate()
            break
            
          default:
            throw new Error(`Invalid time range: ${range}`)
        }
        
        // Fetch sessions for both periods
        const currentSessions = await storageService.getSessionsInRange(currentStart, currentEnd)
        const previousSessions = await storageService.getSessionsInRange(previousStart, previousEnd)
        
        // Calculate comparative stats
        const comparedStats = compareStats(currentSessions, previousSessions)
        
        // Update the appropriate state property
        switch (range) {
          case 'day':
            this.dailyStats = comparedStats
            break
          case 'week':
            this.weeklyStats = comparedStats
            break
          case 'month':
            this.monthlyStats = comparedStats
            break
        }
        
        return comparedStats
      } catch (error) {
        this.error = error instanceof Error ? error.message : `Failed to load ${range} stats`
        throw error
      } finally {
        this.isLoading = false
      }
    },
    
    /**
     * Initialize the stats store
     */
    async init() {
      // Load all stats in parallel
      await Promise.all([
        this.loadStats('day'),
        this.loadStats('week'),
        this.loadStats('month'),
      ])
    },
    
    /**
     * Get completed sessions for a specific date range
     */
    async getSessionsInRange(startDate: Date, endDate: Date): Promise<FocusSession[]> {
      try {
        this.isLoading = true
        return await storageService.getSessionsInRange(startDate, endDate)
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to get sessions for date range'
        throw error
      } finally {
        this.isLoading = false
      }
    },
  },
})
