'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ModuleCard } from '@/components/soc-training/module-card'
import { ALL_LEARNING_PATHS } from '@/lib/soc-training-data'

interface LearningPathPageProps {
  params: {
    pathId: string
  }
}

export default function LearningPathPage({ params }: LearningPathPageProps) {
  const path = ALL_LEARNING_PATHS.find(p => p.id === params.pathId)

  if (!path) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-foreground">Learning path not found</h1>
          <Link href="/soc-training">
            <Button className="border border-primary/70 text-primary bg-transparent hover:bg-primary/10">
              Return to Training
            </Button>
          </Link>
        </div>
      </main>
    )
  }

  const completedModules = path.modules.filter(m => m.status === 'completed').length
  const totalDurationHours = Math.round(path.totalDuration / 60)

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header Navigation */}
        <div className="flex items-center gap-2 mb-8">
          <Link href="/soc-training">
            <Button variant="outline" size="sm" className="border border-primary/70 text-primary bg-transparent hover:bg-primary/10 hover:text-white hover:shadow-lg hover:shadow-primary/30 whitespace-nowrap transition-all duration-300 text-xs font-bold">
              <ArrowLeft className="w-4 h-4 mr-1" />
              BACK
            </Button>
          </Link>
        </div>

        {/* Path Header */}
        <div className="mb-8 space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-5xl">{path.icon}</span>
                <div>
                  <span className="inline-block bg-primary/30 text-primary px-3 py-1 rounded text-xs font-bold uppercase mb-2">
                    {path.level}
                  </span>
                  <h1 className="text-3xl font-bold text-foreground">{path.title}</h1>
                </div>
              </div>
              <p className="text-muted-foreground text-lg max-w-2xl">{path.description}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border border-primary/40 rounded-lg p-4 bg-secondary/20">
              <p className="text-sm text-muted-foreground mb-1">Total Duration</p>
              <p className="text-2xl font-bold text-foreground">{totalDurationHours} Hours</p>
            </div>
            <div className="border border-primary/40 rounded-lg p-4 bg-secondary/20">
              <p className="text-sm text-muted-foreground mb-1">Modules</p>
              <p className="text-2xl font-bold text-foreground">{completedModules}/{path.modules.length}</p>
            </div>
            <div className="border border-primary/40 rounded-lg p-4 bg-secondary/20">
              <p className="text-sm text-muted-foreground mb-1">Overall Progress</p>
              <p className="text-2xl font-bold text-foreground">{path.progress}%</p>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-primary">Progress</span>
              <span className="text-sm font-bold text-primary">{path.progress}%</span>
            </div>
            <Progress value={path.progress} className="h-3" />
          </div>
        </div>

        {/* Modules Section */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-primary tracking-wide">COURSE MODULES</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {path.modules.map((module) => (
              <ModuleCard key={module.id} module={module} pathId={path.id} />
            ))}
          </div>
        </div>

        {/* Learning Objectives */}
        <div className="mt-12 border border-primary/40 rounded-lg p-8 bg-secondary/20">
          <h2 className="text-xl font-bold text-primary mb-6 tracking-wide">LEARNING OBJECTIVES</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground">Foundational Skills</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Understand incident classification and severity levels</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Master SOC workflows and escalation procedures</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Learn alert triage and context analysis techniques</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Identify and reduce false positives effectively</span>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground">Advanced Techniques</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Threat actor profiling and TTP analysis</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Indicator of compromise (IoC) investigation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Implement containment and eradication strategies</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Conduct post-incident reviews and reporting</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
