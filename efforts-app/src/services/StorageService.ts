import Dexie from 'dexie'
import type { Table } from 'dexie'
import type { FocusSession } from '../types'

/**
 * Storage service for the application using Dexie.js (IndexedDB wrapper)
 */
class EffortsDatabase extends Dexie {
  // Define tables
  focusSessions!: Table<FocusSession, string>

  constructor() {
    super('EffortsDB')
    
    // Define schema
    this.version(1).stores({
      focusSessions: 'id, startTime, status'
    })
  }
}

// Create database instance
const db = new EffortsDatabase()

/**
 * Storage Service Interface
 */
export class StorageService {
  /**
   * Save a focus session
   */
  async saveSession(session: FocusSession): Promise<string> {
    return await db.focusSessions.put(session)
  }

  /**
   * Get a focus session by ID
   */
  async getSession(id: string): Promise<FocusSession | undefined> {
    return await db.focusSessions.get(id)
  }

  /**
   * Get all focus sessions
   */
  async getAllSessions(): Promise<FocusSession[]> {
    return await db.focusSessions.toArray()
  }

  /**
   * Get active focus session (if any)
   */
  async getActiveSession(): Promise<FocusSession | undefined> {
    return await db.focusSessions
      .where('status')
      .equals('active')
      .first()
  }

  /**
   * Get completed sessions for a date range
   */
  async getSessionsInRange(startDate: Date, endDate: Date): Promise<FocusSession[]> {
    return await db.focusSessions
      .where('startTime')
      .between(startDate, endDate, true, true)
      .and(session => session.status === 'completed')
      .toArray()
  }

  /**
   * Get completed sessions for a specific day
   */
  async getSessionsForDay(date: Date): Promise<FocusSession[]> {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)
    
    return this.getSessionsInRange(startOfDay, endOfDay)
  }

  /**
   * Delete a focus session
   */
  async deleteSession(id: string): Promise<void> {
    await db.focusSessions.delete(id)
  }
}

// Export a singleton instance
export const storageService = new StorageService()
