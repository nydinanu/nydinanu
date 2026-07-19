'use client'

import { SkillLevel } from '@/lib/soc-training-data'

interface SkillMatrixProps {
  skills: {
    name: string
    category: 'investigation' | 'analysis' | 'response' | 'technical' | 'compliance'
    level: number // 0-100
  }[]
}

export function SkillMatrix({ skills }: SkillMatrixProps) {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'investigation':
        return 'bg-blue-500/10 border-blue-500/30 text-blue-400'
      case 'analysis':
        return 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
      case 'response':
        return 'bg-red-500/10 border-red-500/30 text-red-400'
      case 'technical':
        return 'bg-green-500/10 border-green-500/30 text-green-400'
      case 'compliance':
        return 'bg-purple-500/10 border-purple-500/30 text-purple-400'
      default:
        return 'bg-primary/10 border-primary/30 text-primary'
    }
  }

  const getCategoryLabel = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1)
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-primary mb-4 tracking-wide">SKILL MATRIX</h3>
        
        <div className="space-y-4">
          {skills.map((skill, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">{skill.name}</p>
                  <span className={`inline-block text-xs font-bold px-2 py-1 rounded border mt-1 ${getCategoryColor(skill.category)}`}>
                    {getCategoryLabel(skill.category)}
                  </span>
                </div>
                <span className="text-sm font-bold text-primary">{skill.level}%</span>
              </div>
              
              <div className="w-full bg-secondary/30 rounded-full h-2 overflow-hidden border border-primary/20">
                <div
                  className="h-full bg-gradient-to-r from-primary to-primary/50 transition-all duration-300"
                  style={{ width: `${skill.level}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
