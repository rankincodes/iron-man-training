import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrainingWeek, StravaWeeklyStats } from "@/types/training"
import { formatDuration } from "@/lib/utils"
import { Waves, Bike, FootprintsIcon, ExternalLink } from "lucide-react"
import { CircularProgress } from "./CircularProgress"

interface ProgressTrackerProps {
  week: TrainingWeek
  startDate: string
  stravaData: StravaWeeklyStats | null
  stravaError: string | null
  onProgressUpdate?: () => void
}

export function ProgressTracker({ week, stravaData, stravaError }: ProgressTrackerProps) {
  const values = stravaData || { swim: 0, bike: 0, run: 0, total: 0, activities: [] }
  // Filter out walks from activities
  const activities = (stravaData?.activities || []).filter(activity => activity.type !== 'Walk')

  const total = values.swim + values.bike + values.run

  const getColorClass = (color: string) => {
    const colors = {
      blue: 'text-blue-600 bg-blue-50',
      green: 'text-green-600 bg-green-50',
      orange: 'text-orange-600 bg-orange-50'
    }
    return colors[color as keyof typeof colors]
  }

  const formatDistance = (meters: number) => {
    if (meters === 0) return ''
    const miles = meters * 0.000621371 // Convert meters to miles
    return miles >= 0.1 ? `${miles.toFixed(1)}mi` : ''
  }

  const getDisciplineColor = (activityType: string, sportType?: string) => {
    if (activityType === 'Swim') return 'blue'
    if (activityType === 'Ride' || activityType === 'VirtualRide') return 'green'
    if (activityType === 'Run' || (activityType === 'Workout' && sportType === 'Tennis')) return 'orange'
    return 'gray'
  }

  const getDisciplineIcon = (activityType: string, sportType?: string) => {
    if (activityType === 'Swim') return Waves
    if (activityType === 'Ride' || activityType === 'VirtualRide') return Bike
    if (activityType === 'Run' || (activityType === 'Workout' && sportType === 'Tennis')) return FootprintsIcon
    return FootprintsIcon
  }

  // Group activities by day of week (Sunday-Saturday)
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const activitiesByDay = dayNames.map(dayName => {
    const dayIndex = dayNames.indexOf(dayName) // Matches JS Date.getDay() (Sunday = 0)
    
    const dayActivities = activities.filter(activity => {
      const activityDate = new Date(activity.start_date)
      return activityDate.getDay() === dayIndex
    })

    return {
      day: dayName,
      activities: dayActivities
    }
  })

  // Calculate totals by discipline
  const disciplineTotals = {
    swim: activities.filter(a => a.type === 'Swim').reduce((sum, a) => sum + (a.moving_time / 3600), 0),
    bike: activities.filter(a => a.type === 'Ride' || a.type == 'VirtualRide').reduce((sum, a) => sum + (a.moving_time / 3600), 0),
    run: activities.filter(a => a.type === 'Run' || (a.type === 'Workout' && a.sport_type === 'Tennis')).reduce((sum, a) => sum + (a.moving_time / 3600), 0)
  }


  return (
    <Card className="p-6 space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold">Weekly Activities</h3>
        <p className="text-sm text-muted-foreground">
          Week {week.week} by day
        </p>
        {stravaError ? (
          <p className="text-xs text-red-600">
            ⚠ {stravaError}
          </p>
        ) : (
          <p className="text-xs text-green-600">
            ✓ Synced from Strava
          </p>
        )}
      </div>

      {/* Total Display */}
      <div>
        <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg">
          <span className="font-medium">Total Hours</span>
          <span className="text-xl font-bold">
            {formatDuration(total)}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm text-muted-foreground mt-2">
          <span>Planned: {formatDuration(week.total)}</span>
          <span className={total > week.total ? 'text-orange-600' : 'text-muted-foreground'}>
            {total > week.total ? '+' : ''}{formatDuration(Math.abs(total - week.total))} vs planned
          </span>
        </div>
      </div>

      {/* Activities by Day */}
      <div className="space-y-4">
        {activitiesByDay.map((dayData) => (
          <div key={dayData.day} className="space-y-2">
            {/* Day Header */}
            <div className="font-medium text-sm border-b pb-1">
              {dayData.day}
            </div>

            {/* Activities for this day */}
            {dayData.activities.length > 0 ? (
              <div className="space-y-2">
                {dayData.activities.map((activity) => {
                  const color = getDisciplineColor(activity.type, activity.sport_type)
                  const Icon = getDisciplineIcon(activity.type, activity.sport_type)
                  const distance = formatDistance(activity.distance)
                  const showDistance = (activity.type === 'Run' || activity.type === 'Ride') && distance
                  
                  return (
                    <div key={activity.id} className="flex items-center gap-3 p-2 bg-muted/50 rounded text-sm">
                      <div className={`p-1.5 rounded ${getColorClass(color)}`}>
                        <Icon className="h-3 w-3" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium truncate">{activity.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatDuration(activity.moving_time / 3600)}
                          {showDistance && (
                            <span className="ml-2">• {distance}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-xs text-muted-foreground italic ml-2">
                No activity
              </div>
            )}
          </div>
        ))}
      </div>

    </Card>
  )
}
