'use client'

import { Badge } from '@/lib/soc-training-data'

interface BadgeDisplayProps {
  badge: Badge
  unlocked: boolean
}

export function BadgeDisplay({ badge, unlocked }: BadgeDisplayProps) {
  return (
    <div
      className={`border rounded-lg p-4 text-center transition-all ${
        unlocked
          ? 'border-primary/60 bg-primary/5 hover:bg-primary/10 cursor-pointer group'
          : 'border-muted/40 bg-muted/5 opacity-50'
      }`}
    >
      <div className={`text-4xl mb-2 ${unlocked ? 'group-hover:scale-110 transition-transform' : ''}`}>
        {badge.icon}
      </div>
      <p className="text-sm font-bold text-foreground mb-1">{badge.title}</p>
      <p className="text-xs text-muted-foreground">{badge.description}</p>
      {!unlocked && (
        <p className="text-xs text-muted-foreground mt-2 italic">Locked</p>
      )}
    </div>
  )
}
