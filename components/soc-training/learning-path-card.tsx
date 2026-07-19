'use client'

import { LearningPath } from '@/lib/soc-training-data'
import { Progress } from '@/components/ui/progress'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

interface LearningPathCardProps {
  path: LearningPath
}

export function LearningPathCard({ path }: LearningPathCardProps) {
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'L1':
        return 'border-blue-500/50 bg-blue-500/5'
      case 'L2':
        return 'border-orange-500/50 bg-orange-500/5'
      case 'L3':
        return 'border-red-500/50 bg-red-500/5'
      default:
        return 'border-primary/50 bg-primary/5'
    }
  }

  const getLevelBadgeColor = (level: string) => {
    switch (level) {
      case 'L1':
        return 'bg-blue-600 text-white'
      case 'L2':
        return 'bg-orange-600 text-white'
      case 'L3':
        return 'bg-red-600 text-white'
      default:
        return 'bg-primary text-white'
    }
  }

  return (
    <Link href={`/soc-training/paths/${path.id}`}>
      <div className={`border rounded-lg p-6 cursor-pointer transition-all hover:shadow-lg hover:shadow-primary/20 ${getLevelColor(path.level)}`}>
        <div className="flex items-start justify-between mb-4">
          <div className="text-4xl">{path.icon}</div>
          <span className={`px-3 py-1 rounded text-xs font-bold uppercase ${getLevelBadgeColor(path.level)}`}>
            {path.level}
          </span>
        </div>

        <h3 className="text-lg font-bold text-foreground mb-2">{path.title}</h3>
        <p className="text-sm text-muted-foreground mb-4">{path.description}</p>

        <div className="space-y-3">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-primary">Progress</span>
              <span className="text-xs font-bold text-primary">{path.progress}%</span>
            </div>
            <Progress value={path.progress} className="h-2" />
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-muted-foreground">Modules</span>
              <p className="font-bold text-foreground">{path.modules.length}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Duration</span>
              <p className="font-bold text-foreground">{Math.round(path.totalDuration / 60)}h</p>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-primary font-semibold">
            {path.completed ? '✓ Completed' : `${path.modules.filter(m => m.status === 'completed').length}/${path.modules.length} modules`}
          </span>
          <ArrowRight className="w-4 h-4 text-primary" />
        </div>
      </div>
    </Link>
  )
}
