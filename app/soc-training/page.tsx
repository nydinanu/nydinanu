'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LearningPathCard } from '@/components/soc-training/learning-path-card'
import { ProgressTracker } from '@/components/soc-training/progress-tracker'
import { SkillMatrix } from '@/components/soc-training/skill-matrix'
import { SOC_L1_PATHS, SOC_L2_PATHS, SOC_L3_PATHS, BADGES } from '@/lib/soc-training-data'

export default function SOCTrainingPage() {
  const [selectedLevel, setSelectedLevel] = useState<'L1' | 'L2' | 'L3'>('L1')

  // Mock user progress - in production, this would come from a database
  const userProgress = {
    completedLessons: 12,
    totalPoints: 2450,
    currentStreak: 5,
    badgesEarned: 3
  }

  const userSkills = [
    { name: 'Alert Triage', category: 'investigation' as const, level: 75 },
    { name: 'Log Analysis', category: 'analysis' as const, level: 62 },
    { name: 'Incident Response', category: 'response' as const, level: 58 },
    { name: 'SIEM Configuration', category: 'technical' as const, level: 45 },
    { name: 'GDPR Compliance', category: 'compliance' as const, level: 82 },
    { name: 'Threat Hunting', category: 'analysis' as const, level: 68 },
    { name: 'Malware Analysis', category: 'technical' as const, level: 55 },
    { name: 'Network Forensics', category: 'investigation' as const, level: 71 }
  ]

  const getPaths = () => {
    switch (selectedLevel) {
      case 'L1':
        return SOC_L1_PATHS
      case 'L2':
        return SOC_L2_PATHS
      case 'L3':
        return SOC_L3_PATHS
      default:
        return SOC_L1_PATHS
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-primary tracking-wide mb-2">SOC TRAINING ACADEMY</h1>
            <p className="text-muted-foreground">Professional security analyst development platform</p>
          </div>
          <div className="flex gap-2">
            <Link href="/soc-notes">
              <Button variant="outline" size="sm" className="border border-primary/70 text-primary bg-transparent hover:bg-primary/10 hover:text-white hover:shadow-lg hover:shadow-primary/30 whitespace-nowrap transition-all duration-300 text-xs font-bold">
                SOC NOTES
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" size="sm" className="border border-primary/70 text-primary bg-transparent hover:bg-primary/10 hover:text-white hover:shadow-lg hover:shadow-primary/30 whitespace-nowrap transition-all duration-300 text-xs font-bold">
                <Home className="w-4 h-4 mr-1" />
                HOME
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mb-12">
          <h2 className="text-lg font-bold text-primary mb-4 tracking-wide">YOUR PROGRESS</h2>
          <ProgressTracker {...userProgress} />
        </div>

        {/* Learning Paths */}
        <div className="space-y-8">
          <div>
            <h2 className="text-lg font-bold text-primary mb-6 tracking-wide">LEARNING PATHS</h2>
            
            <Tabs value={selectedLevel} onValueChange={(v) => setSelectedLevel(v as 'L1' | 'L2' | 'L3')} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8 bg-secondary/40 border-b border-primary/30 p-0">
                <TabsTrigger
                  value="L1"
                  className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary transition-colors duration-200 text-muted-foreground hover:text-foreground rounded-none"
                >
                  L1 Analyst
                </TabsTrigger>
                <TabsTrigger
                  value="L2"
                  className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary transition-colors duration-200 text-muted-foreground hover:text-foreground rounded-none"
                >
                  L2 Analyst
                </TabsTrigger>
                <TabsTrigger
                  value="L3"
                  className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary transition-colors duration-200 text-muted-foreground hover:text-foreground rounded-none"
                >
                  L3 Lead
                </TabsTrigger>
              </TabsList>

              <TabsContent value={selectedLevel} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {getPaths().map((path) => (
                    <LearningPathCard key={path.id} path={path} />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Skill Matrix */}
          <div className="border border-primary/40 rounded-lg p-8 bg-secondary/20">
            <SkillMatrix skills={userSkills} />
          </div>

          {/* Badges Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-primary tracking-wide">BADGES & ACHIEVEMENTS</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {BADGES.map((badge) => (
                <div
                  key={badge.id}
                  className="border border-primary/40 rounded-lg p-4 bg-secondary/20 text-center hover:bg-secondary/40 transition-colors cursor-pointer group"
                >
                  <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{badge.icon}</div>
                  <p className="text-xs font-bold text-foreground mb-1">{badge.title}</p>
                  <p className="text-xs text-muted-foreground">{badge.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Featured Resources */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-primary tracking-wide">FEATURED RESOURCES</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border border-primary/40 rounded-lg p-6 bg-secondary/20 hover:bg-secondary/40 transition-colors">
                <div className="text-4xl mb-3">📚</div>
                <h3 className="font-bold text-foreground mb-2">Incident Response Guide</h3>
                <p className="text-sm text-muted-foreground mb-4">Comprehensive guide to handling security incidents from detection to closure</p>
                <a href="#" className="text-primary hover:text-primary/80 text-sm font-semibold">Learn More →</a>
              </div>
              <div className="border border-primary/40 rounded-lg p-6 bg-secondary/20 hover:bg-secondary/40 transition-colors">
                <div className="text-4xl mb-3">🧪</div>
                <h3 className="font-bold text-foreground mb-2">Sandbox Labs</h3>
                <p className="text-sm text-muted-foreground mb-4">Hands-on practice environments with real-world incident scenarios</p>
                <a href="#" className="text-primary hover:text-primary/80 text-sm font-semibold">Access Labs →</a>
              </div>
              <div className="border border-primary/40 rounded-lg p-6 bg-secondary/20 hover:bg-secondary/40 transition-colors">
                <div className="text-4xl mb-3">🎯</div>
                <h3 className="font-bold text-foreground mb-2">TTP Database</h3>
                <p className="text-sm text-muted-foreground mb-4">Tactics, techniques, and procedures indexed by threat actor and industry</p>
                <a href="#" className="text-primary hover:text-primary/80 text-sm font-semibold">Explore TTPs →</a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="mt-12 p-6 border border-primary/40 rounded-lg bg-primary/5 text-center">
          <h3 className="text-lg font-bold text-foreground mb-2">Ready to advance your SOC skills?</h3>
          <p className="text-muted-foreground mb-4">Start with L1 foundational courses and progress through advanced incident response and threat analysis modules</p>
          <Link href="/soc-training/paths/l1-incident-basics">
            <Button className="border border-primary/70 text-primary bg-transparent hover:bg-primary/10 hover:text-white hover:shadow-lg hover:shadow-primary/30 whitespace-nowrap transition-all duration-300 text-xs font-bold">
              BEGIN L1 TRAINING
            </Button>
          </Link>
        </div>
      </div>
    </main>
  )
}
