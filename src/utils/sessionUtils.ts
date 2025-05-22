import type { FocusSession, SessionQuality, SessionStats, ComparableStats } from '../types'

/**
 * Extract a title from the first line of goals, removing any markdown headers
 */
export function extractSessionTitle(goals: string): string {
  if (!goals) return 'Untitled Session'
  const firstLine = goals.split('\n')[0]
  return firstLine.replace(/^#+\s*/, '').trim() || 'Untitled Session'
}

import dayjs from 'dayjs'

/**
 * Calculate points for a focus session based on quality and duration.
 * Points system:
 * 1. Base points by quality:
 *    - 💩 Poor (5): For sessions with difficulty maintaining focus
 *    - ⚖️ Normal (20): For standard focus sessions
 *    - 🔥 Great (40): For high-quality focus sessions
 *    - 💠 Deep focus (60): For exceptional focus sessions
 * 2. Additional points based on duration (scaled by quality):
 *    - Poor: 1 point per 10 minutes
 *    - Normal: 1 point per 5 minutes
 *    - Great: 1 point per ~3 minutes
 *    - Deep: 1 point per 2.5 minutes
 */
export function calculateSessionPoints(session: FocusSession): number {
  if (session.status !== 'completed' || !session.quality) {
    return 0
  }
  
  // Base points based on session quality - this is the main factor now
  const qualityPoints = {
    'poor': 5,     // Significantly reduced for poor focus
    'normal': 20,  // Standard points for normal focus
    'great': 40,   // Great focus gets double the normal points
    'deep': 60     // Deep focus gets triple the normal points
  }
  
  let points = qualityPoints[session.quality]
  
  // Additional points based on duration (scaled by quality)
  // Poor sessions get fewer points per minute to reflect reduced effectiveness
  const durationMultiplier = {
    'poor': 0.1,    // 1 point per 10 minutes
    'normal': 0.2,  // 1 point per 5 minutes
    'great': 0.3,   // ~1 point per 3 minutes
    'deep': 0.4     // 1 point per 2.5 minutes
  }
  
  const durationPoints = Math.floor(session.actualDuration * durationMultiplier[session.quality])
  points += durationPoints
  
  return points
}

/**
 * Get the emoji for a session quality
 */
export function getQualityEmoji(quality: SessionQuality | null): string {
  if (!quality) return '❓'
  
  const emojis: Record<SessionQuality, string> = {
    'poor': '💩',
    'normal': '⚖️',
    'great': '🔥',
    'deep': '💠',
  }
  
  return emojis[quality]
}

/**
 * Calculate statistics for a list of sessions
 */
export function calculateStats(sessions: FocusSession[]): SessionStats {
  // Filter only completed sessions
  const completedSessions = sessions.filter(s => s.status === 'completed')
  
  if (completedSessions.length === 0) {
    return {
      totalSessions: 0,
      totalFocusTime: 0,
      totalPoints: 0,
      qualityDistribution: { poor: 0, normal: 0, great: 0, deep: 0 },
      averageSessionLength: 0,
    }
  }
  
  // Calculate total focus time
  const totalFocusTime = completedSessions.reduce((sum, session) => sum + session.actualDuration, 0)
  
  // Calculate total points
  const totalPoints = completedSessions.reduce((sum, session) => sum + calculateSessionPoints(session), 0)
  
  // Calculate quality distribution
  const qualityDistribution = {
    poor: completedSessions.filter(s => s.quality === 'poor').length,
    normal: completedSessions.filter(s => s.quality === 'normal').length,
    great: completedSessions.filter(s => s.quality === 'great').length,
    deep: completedSessions.filter(s => s.quality === 'deep').length,
  }
  
  // Calculate average session length
  const averageSessionLength = totalFocusTime / completedSessions.length
  
  return {
    totalSessions: completedSessions.length,
    totalFocusTime,
    totalPoints,
    qualityDistribution,
    averageSessionLength,
  }
}

/**
 * Calculate comparable statistics between two periods
 */
export function compareStats(
  currentSessions: FocusSession[],
  previousSessions: FocusSession[]
): ComparableStats {
  const current = calculateStats(currentSessions)
  const previous = calculateStats(previousSessions)
  
  // Calculate percentage changes (handle division by zero)
  const calculateChange = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0
    return ((current - previous) / previous) * 100
  }
  
  const percentageChange = {
    totalSessions: calculateChange(current.totalSessions, previous.totalSessions),
    totalFocusTime: calculateChange(current.totalFocusTime, previous.totalFocusTime),
    totalPoints: calculateChange(current.totalPoints, previous.totalPoints),
    averageSessionLength: calculateChange(current.averageSessionLength, previous.averageSessionLength),
  }
  
  return {
    current,
    previous,
    percentageChange,
  }
}

/**
 * Format a duration in minutes to a readable string (e.g., "1h 30m")
 */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  
  if (hours === 0) {
    return `${mins}m`
  } else if (mins === 0) {
    return `${hours}h`
  } else {
    return `${hours}h ${mins}m`
  }
}

/**
 * Format a session to markdown for export
 */
export function sessionToMarkdown(session: FocusSession): string {
  // Format dates
  const startTime = dayjs(session.startTime).format('HH:mm')
  const endTime = session.endTime 
    ? dayjs(session.endTime).format('HH:mm') 
    : 'ongoing'
  
  // Build markdown
  let markdown = `# ${extractSessionTitle(session.goals)}\n`
  markdown += `_Session time: ${startTime} - ${endTime}_\n\n`
  
  // Goals
  markdown += `## Goal\n${session.goals}\n`
  
  // Session quality
  if (session.quality) {
    markdown += `## Session quality\n${getQualityEmoji(session.quality)} ${session.quality.charAt(0).toUpperCase() + session.quality.slice(1)}\n`
  }
  
  // Notes
  if (session.notes) {
    markdown += `### Notes\n${session.notes}\n`
  }
  
  // Overtime
  if (session.overtime > 0) {
    const overtimeHours = formatDuration(session.overtime)
    const overtimeStart = dayjs(session.startTime).add(session.plannedDuration, 'minute').format('HH:mm')
    const overtimeEnd = session.endTime ? dayjs(session.endTime).format('HH:mm') : 'ongoing'
    
    markdown += `## Overtime\n${overtimeHours} -> ${overtimeStart} - ${overtimeEnd}\n`
  }
  
  return markdown
}

/**
 * Generate a daily report in markdown format
 */
export function generateDailyReport(sessions: FocusSession[], date: Date): string {
  if (sessions.length === 0) {
    return `# No focus sessions on ${dayjs(date).format('YYYY-MM-DD')}`
  }
  
  // Sort sessions by start time
  const sortedSessions = [...sessions].sort(
    (a, b) => a.startTime.getTime() - b.startTime.getTime()
  )
  
  // Generate markdown for each session
  const sessionMarkdowns = sortedSessions.map(session => sessionToMarkdown(session))
  
  // Combine all sessions with a newline
  return sessionMarkdowns.join('\n\n')
}
