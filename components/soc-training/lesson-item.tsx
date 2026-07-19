'use client'

import Link from 'next/link'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { Module } from '@/lib/soc-training-data'

interface LessonItemProps {
  lesson: any
  moduleId: string
  pathId: string
  index: number
}

export function LessonItem({ lesson, moduleId, pathId, index }: LessonItemProps) {
  return (
    <Link href={`/soc-training/paths/${pathId}/modules/${moduleId}/lessons/${lesson.id}`}>
      <div className="border border-primary/40 rounded-lg p-4 bg-secondary/20 hover:bg-secondary/40 cursor-pointer transition-all group">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-1">
            {lesson.completed ? (
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            ) : (
              <div className="w-5 h-5 rounded-full border-2 border-primary/50 flex items-center justify-center text-xs font-bold text-primary">
                {index + 1}
              </div>
            )}
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
              {lesson.title}
            </h4>
            <p className="text-sm text-muted-foreground mt-1">{lesson.description}</p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
              <span>⏱️ {lesson.duration} min</span>
              {lesson.resources && lesson.resources.length > 0 && (
                <span>📎 {lesson.resources.length} resources</span>
              )}
            </div>
          </div>
          <div className="flex-shrink-0">
            <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </div>
    </Link>
  )
}
