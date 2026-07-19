'use client'

import { Module } from '@/lib/soc-training-data'
import { Progress } from '@/components/ui/progress'
import Link from 'next/link'
import { BookOpen, Lock, CheckCircle2, Clock } from 'lucide-react'

interface ModuleCardProps {
  module: Module
  pathId: string
}

export function ModuleCard({ module, pathId }: ModuleCardProps) {
  const isLocked = module.status === 'locked'
  const isCompleted = module.status === 'completed'
  const isInProgress = module.status === 'in-progress'

  const getStatusIcon = () => {
    if (isCompleted) return <CheckCircle2 className="w-5 h-5 text-green-500" />
    if (isLocked) return <Lock className="w-5 h-5 text-muted-foreground" />
    return <BookOpen className="w-5 h-5 text-primary" />
  }

  const getStatusBadge = () => {
    if (isCompleted) return 'bg-green-600 text-white'
    if (isLocked) return 'bg-muted text-muted-foreground'
    if (isInProgress) return 'bg-blue-600 text-white'
    return 'bg-primary/30 text-primary'
  }

  return (
    <Link href={isLocked ? '#' : `/soc-training/paths/${pathId}/modules/${module.id}`}>
      <div className={`border rounded-lg p-4 transition-all cursor-pointer ${
        isLocked 
          ? 'opacity-60 cursor-not-allowed border-muted' 
          : 'border-primary/40 hover:border-primary/70 hover:shadow-lg hover:shadow-primary/10'
      } bg-secondary/20`}>
        
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <div>
              <h4 className="font-semibold text-foreground text-sm">{module.title}</h4>
              <p className="text-xs text-muted-foreground mt-0.5">{module.lessons.length} lessons</p>
            </div>
          </div>
          <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${getStatusBadge()}`}>
            {module.status}
          </span>
        </div>

        <p className="text-xs text-muted-foreground mb-3">{module.description}</p>

        <div className="space-y-3">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-semibold text-primary">Progress</span>
              <span className="text-xs font-bold text-primary">{module.progress}%</span>
            </div>
            <Progress value={module.progress} className="h-1.5" />
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>~{Math.round(module.lessons.reduce((acc, l) => acc + l.duration, 0) / 60)}min</span>
            </div>
            {module.quiz && (
              <div>
                <span>Quiz: {module.quiz.questions} questions</span>
              </div>
            )}
            {module.labEnvironment && (
              <div>
                <span>Lab: {module.labEnvironment.difficulty}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
