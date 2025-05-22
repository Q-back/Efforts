import { defineStore } from 'pinia'
import type { FocusSession, SessionQuality } from '../types'
import { storageService } from '../services/StorageService'
import { calculateSessionPoints } from '../utils/sessionUtils'
import { v4 as uuidv4 } from 'uuid'

export const useSessionStore = defineStore('session', {
  state: () => ({
    activeSession: null as FocusSession | null,
    todaySessions: [] as FocusSession[],
    isLoading: false,
    error: null as string | null,
  }),
  
  getters: {
    hasActiveSession: (state) => state.activeSession !== null,
    
    totalPointsToday: (state) => {
      return state.todaySessions.reduce((sum, session) => sum + calculateSessionPoints(session), 0)
    },
    
    totalMinutesToday: (state) => {
      return state.todaySessions.reduce((sum, session) => sum + session.actualDuration, 0)
    },
  },
  
  actions: {
    /**
     * Start a new focus session
     */
    async startSession(goals: string = '', plannedDuration: number = 0) {
      try {
        // Check if there's already an active session
        if (this.activeSession) {
          throw new Error('There is already an active session')
        }
        
        // Create a new session
        const newSession: FocusSession = {
          id: uuidv4(),
          goals,
          plannedDuration,
          actualDuration: 0,
          startTime: new Date(),
          endTime: null,
          overtime: 0,
          quality: null,
          notes: '',
          status: 'active',
        }
        
        // Save to storage
        await storageService.saveSession(newSession)
        
        // Update state
        this.activeSession = newSession
        
        return newSession
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to start session'
        throw error
      }
    },
    
    /**
     * Update an active session
     */
    async updateActiveSession(updates: Partial<FocusSession>) {
      try {
        if (!this.activeSession) {
          throw new Error('No active session to update')
        }
        
        // Update session
        const updatedSession = {
          ...this.activeSession,
          ...updates,
        }
        
        // Save to storage
        await storageService.saveSession(updatedSession)
        
        // Update state
        this.activeSession = updatedSession
        
        return updatedSession
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to update session'
        throw error
      }
    },
    
    /**
     * End the active session
     */
    async endSession() {
      try {
        if (!this.activeSession) {
          throw new Error('No active session to end')
        }
        
        const now = new Date()
        const durationMs = now.getTime() - this.activeSession.startTime.getTime()
        const durationMinutes = Math.floor(durationMs / 60000)
        
        // Calculate overtime
        let overtime = 0
        if (this.activeSession.plannedDuration > 0) {
          overtime = Math.max(0, durationMinutes - this.activeSession.plannedDuration)
        }
        
        // Update session
        const updatedSession = {
          ...this.activeSession,
          endTime: now,
          actualDuration: durationMinutes,
          overtime,
          // Note: Status remains active until the user rates the session
        }
        
        // Save to storage
        await storageService.saveSession(updatedSession)
        
        // Update state
        this.activeSession = updatedSession
        
        return updatedSession
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to end session'
        throw error
      }
    },
    
    /**
     * Rate and complete a session
     */
    async rateSession(quality: SessionQuality, notes: string = '') {
      try {
        if (!this.activeSession) {
          throw new Error('No active session to rate')
        }
        
        // Update session with rating
        const updatedSession = {
          ...this.activeSession,
          quality,
          notes,
          status: 'completed' as const,
        }
        
        // Save to storage
        await storageService.saveSession(updatedSession)
        
        // Update state
        this.activeSession = null
        await this.loadTodaySessions() // Refresh today's sessions
        
        return updatedSession
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to rate session'
        throw error
      }
    },
    
    /**
     * Cancel the active session
     */
    async cancelSession() {
      try {
        if (!this.activeSession) {
          throw new Error('No active session to cancel')
        }
        
        // Update session
        const updatedSession = {
          ...this.activeSession,
          status: 'cancelled' as const,
          endTime: new Date(),
        }
        
        // Save to storage
        await storageService.saveSession(updatedSession)
        
        // Update state
        this.activeSession = null
        await this.loadTodaySessions() // Refresh today's sessions
        
        return updatedSession
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to cancel session'
        throw error
      }
    },
    
    /**
     * Load the active session (if any)
     */
    async loadActiveSession() {
      try {
        this.isLoading = true
        const session = await storageService.getActiveSession()
        this.activeSession = session || null
        return session
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to load active session'
        throw error
      } finally {
        this.isLoading = false
      }
    },
    
    /**
     * Load today's completed sessions
     */
    async loadTodaySessions() {
      try {
        this.isLoading = true
        const today = new Date()
        const sessions = await storageService.getSessionsForDay(today)
        this.todaySessions = sessions
        return sessions
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to load today\'s sessions'
        throw error
      } finally {
        this.isLoading = false
      }
    },
    
    /**
     * Initialize the store
     */
    async init() {
      await this.loadActiveSession()
      await this.loadTodaySessions()
    },
  },
})
