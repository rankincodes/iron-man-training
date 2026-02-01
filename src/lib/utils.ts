import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { 
  TrainingPlan, 
  TrainingWeek, 
  TrainingPhase, 
  WeekProgress, 
  ProgressData, 
  WeekDateRange, 
  PhaseInfo 
} from "@/types/training"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getCurrentWeek(startDate: string): number {
  const start = new Date(startDate)
  const today = new Date()
  
  const diffTime = today.getTime() - start.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  const currentWeek = Math.floor(diffDays / 7) + 1
  
  return Math.max(1, Math.min(currentWeek, 49))
}

export function getWeekDateRange(weekNumber: number, startDate: string): WeekDateRange {
  // Parse the start date and ensure it's treated as local time
  const start = new Date(startDate + 'T00:00:00')
  
  // Calculate the start of the training week (should start exactly on the training start date for week 1)
  const weekStart = new Date(start)
  weekStart.setDate(start.getDate() + (weekNumber - 1) * 7)
  
  // Week runs Sunday to Saturday (6 days after start)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)
  
  return {
    start: weekStart,
    end: weekEnd,
    weekNumber
  }
}

export function getCurrentPhase(weekNumber: number, phases: TrainingPhase[]): PhaseInfo {
  const currentPhase = phases.find(phase => 
    weekNumber >= phase.weeks[0] && weekNumber <= phase.weeks[1]
  )
  
  if (!currentPhase) {
    return {
      phase: phases[0],
      isActive: false,
      weeksRemaining: 0,
      progress: 0
    }
  }
  
  const weeksInPhase = currentPhase.weeks[1] - currentPhase.weeks[0] + 1
  const weeksCompleted = weekNumber - currentPhase.weeks[0] + 1
  const progress = (weeksCompleted / weeksInPhase) * 100
  const weeksRemaining = currentPhase.weeks[1] - weekNumber
  
  return {
    phase: currentPhase,
    isActive: true,
    weeksRemaining: Math.max(0, weeksRemaining),
    progress: Math.min(100, Math.max(0, progress))
  }
}

export function calculateWeekProgress(
  planned: TrainingWeek,
  completed: { swim: number; bike: number; run: number; total: number }
): WeekProgress {
  const percentage = planned.total > 0 ? (completed.total / planned.total) * 100 : 0
  
  return {
    week: planned.week,
    completed,
    planned: {
      swim: planned.swim,
      bike: planned.bike,
      run: planned.run,
      total: planned.total
    },
    percentage: Math.min(100, Math.max(0, percentage)),
    lastUpdated: new Date().toISOString()
  }
}

export function formatDuration(hours: number): string {
  if (hours === 0) return "0h"
  
  // For values less than 1 hour, show minutes
  if (hours < 1) {
    const minutes = Math.round(hours * 60)
    return `${minutes}m`
  }
  
  // For 1 hour or more, show hours with 1 decimal place
  return `${hours.toFixed(1)}h`
}

export function formatDateRange(start: Date, end: Date): string {
  const startStr = start.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  })
  const endStr = end.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  })
  
  return `${startStr} - ${endStr}`
}

// Deprecated - kept for backward compatibility, returns null since we removed caching
export function getWeekProgress(_weekNumber: number): { swim: number; bike: number; run: number; total: number } | null {
  return null
}

// Deprecated localStorage functions - kept for reference but will not be used
export const STORAGE_KEYS = {
  PROGRESS: 'ironman-training-progress',
  CURRENT_WEEK: 'ironman-current-week'
} as const

export function saveProgress(_weekNumber: number, _progress: { swim: number; bike: number; run: number; total: number }): void {
  // Deprecated - Strava data is read-only from the API
  console.warn('saveProgress is deprecated when using Strava integration')
}

export function getProgressData(): ProgressData {
  // Deprecated - use Strava data instead
  return {}
}

export function getDisciplineColor(discipline: 'swim' | 'bike' | 'run'): string {
  const colors = {
    swim: 'text-blue-600 bg-blue-50',
    bike: 'text-green-600 bg-green-50', 
    run: 'text-orange-600 bg-orange-50' // Run or Tennis
  }
  
  return colors[discipline]
}
