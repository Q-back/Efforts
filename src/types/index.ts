export type SessionQuality = 'poor' | 'normal' | 'great' | 'deep'

export interface FocusSession {
  id: string
  goals: string // Markdown formatted text, first line can be used as title
  plannedDuration: number // in minutes
  actualDuration: number // in minutes
  startTime: Date
  endTime: Date | null
  overtime: number // in minutes
  quality: SessionQuality | null // null means not yet rated
  notes: string
  status: 'active' | 'completed' | 'cancelled'
}

export interface SessionStats {
  totalSessions: number
  totalFocusTime: number // in minutes
  totalPoints: number
  qualityDistribution: Record<SessionQuality, number>
  averageSessionLength: number // in minutes
}

export interface ComparableStats {
  current: SessionStats
  previous: SessionStats
  percentageChange: {
    totalSessions: number
    totalFocusTime: number
    totalPoints: number
    averageSessionLength: number
  }
}

export interface DateRange {
  start: Date
  end: Date
}
