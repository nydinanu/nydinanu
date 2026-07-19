'use client'

import { User, Award, Flame, Target } from 'lucide-react'

interface ProgressTrackerProps {
  completedLessons: number
  totalPoints: number
  currentStreak: number
  badgesEarned: number
}

export function ProgressTracker({
  completedLessons,
  totalPoints,
  currentStreak,
  badgesEarned
}: ProgressTrackerProps) {
  const stats = [
    {
      icon: Target,
      label: 'Lessons Completed',
      value: completedLessons.toString(),
      color: 'text-blue-500'
    },
    {
      icon: Award,
      label: 'Points Earned',
      value: totalPoints.toString(),
      color: 'text-yellow-500'
    },
    {
      icon: Flame,
      label: 'Current Streak',
      value: currentStreak.toString(),
      color: 'text-orange-500'
    },
    {
      icon: User,
      label: 'Badges',
      value: badgesEarned.toString(),
      color: 'text-purple-500'
    }
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <div
            key={index}
            className="border border-primary/40 rounded-lg p-4 bg-secondary/20 hover:bg-secondary/40 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <Icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className="text-2xl font-bold text-foreground mb-1">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        )
      })}
    </div>
  )
}
