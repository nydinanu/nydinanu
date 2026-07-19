'use client'

import Link from 'next/link'
import { ArrowLeft, CheckCircle2, Clock, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ALL_LEARNING_PATHS } from '@/lib/soc-training-data'

interface ModulePageProps {
  params: {
    pathId: string
    moduleId: string
  }
}

export default function ModulePage({ params }: ModulePageProps) {
  const path = ALL_LEARNING_PATHS.find(p => p.id === params.pathId)
  const module = path?.modules.find(m => m.id === params.moduleId)

  if (!path || !module) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-foreground">Module not found</h1>
          <Link href="/soc-training">
            <Button>Return to Training</Button>
          </Link>
        </div>
      </main>
    )
  }

  const completedLessons = module.lessons.filter(l => l.completed).length
  const totalMinutes = module.lessons.reduce((acc, l) => acc + l.duration, 0)

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header Navigation */}
        <div className="flex items-center gap-2 mb-8">
          <Link href={`/soc-training/paths/${path.id}`}>
            <Button variant="outline" size="sm" className="border border-primary/70 text-primary bg-transparent hover:bg-primary/10 hover:text-white hover:shadow-lg hover:shadow-primary/30 whitespace-nowrap transition-all duration-300 text-xs font-bold">
              <ArrowLeft className="w-4 h-4 mr-1" />
              BACK
            </Button>
          </Link>
        </div>

        {/* Module Header */}
        <div className="mb-8 space-y-4">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-4xl">{path.icon}</span>
            <div>
              <p className="text-sm text-muted-foreground">{path.title}</p>
              <h1 className="text-3xl font-bold text-foreground">{module.title}</h1>
            </div>
          </div>

          <p className="text-lg text-muted-foreground">{module.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="border border-primary/40 rounded-lg p-4 bg-secondary/20">
              <p className="text-sm text-muted-foreground mb-1">Lessons</p>
              <p className="text-2xl font-bold text-foreground">{completedLessons}/{module.lessons.length}</p>
            </div>
            <div className="border border-primary/40 rounded-lg p-4 bg-secondary/20">
              <p className="text-sm text-muted-foreground mb-1">Duration</p>
              <p className="text-2xl font-bold text-foreground">{totalMinutes}m</p>
            </div>
            <div className="border border-primary/40 rounded-lg p-4 bg-secondary/20">
              <p className="text-sm text-muted-foreground mb-1">Status</p>
              <p className="text-2xl font-bold text-primary capitalize">{module.status}</p>
            </div>
            <div className="border border-primary/40 rounded-lg p-4 bg-secondary/20">
              <p className="text-sm text-muted-foreground mb-1">Progress</p>
              <p className="text-2xl font-bold text-foreground">{module.progress}%</p>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-primary">Module Progress</span>
              <span className="text-sm font-bold text-primary">{module.progress}%</span>
            </div>
            <Progress value={module.progress} className="h-3" />
          </div>
        </div>

        {/* Lessons */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-primary tracking-wide">LESSONS</h2>
          
          <div className="space-y-4">
            {module.lessons.map((lesson, index) => (
              <div key={lesson.id} className="border border-primary/40 rounded-lg p-6 bg-secondary/20 hover:bg-secondary/40 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="flex-shrink-0 mt-1">
                      {lesson.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : (
                        <BookOpen className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-foreground text-lg">{index + 1}. {lesson.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{lesson.description}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded text-xs font-bold uppercase flex-shrink-0 ml-4 ${
                    lesson.completed ? 'bg-green-600 text-white' : 'bg-primary/30 text-primary'
                  }`}>
                    {lesson.completed ? 'Completed' : 'Start'}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{lesson.duration} minutes</span>
                  </div>
                </div>

                {/* Lesson Preview */}
                <div className="bg-background/50 rounded p-4 mb-4 max-h-48 overflow-hidden">
                  <div className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-4">
                    {lesson.content}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link href={`/soc-training/paths/${path.id}/modules/${module.id}/lessons/${lesson.id}`}>
                    <Button className="border border-primary/70 text-primary bg-transparent hover:bg-primary/10 hover:text-white hover:shadow-lg hover:shadow-primary/30 whitespace-nowrap transition-all duration-300 text-xs font-bold">
                      VIEW FULL LESSON
                    </Button>
                  </Link>
                  {lesson.resources && lesson.resources.length > 0 && (
                    <Button variant="outline" size="sm" className="border border-primary/40 text-primary bg-transparent hover:bg-primary/5">
                      {lesson.resources.length} Resources
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Quiz Section */}
          {module.quiz && (
            <div className="border border-blue-500/40 rounded-lg p-6 bg-blue-500/5">
              <h3 className="text-lg font-bold text-foreground mb-3">📝 Module Quiz</h3>
              <p className="text-muted-foreground mb-4">
                Test your knowledge with {module.quiz.questions} questions. Passing score: {module.quiz.passingScore}%
              </p>
              <Button className="border border-blue-500/70 text-blue-400 bg-transparent hover:bg-blue-500/10">
                START QUIZ
              </Button>
            </div>
          )}

          {/* Lab Environment */}
          {module.labEnvironment && (
            <div className="border border-green-500/40 rounded-lg p-6 bg-green-500/5">
              <h3 className="text-lg font-bold text-foreground mb-3">🧪 Hands-On Lab</h3>
              <p className="text-muted-foreground mb-2">
                <strong>{module.labEnvironment.title}</strong> - {module.labEnvironment.description}
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Difficulty: <span className="font-semibold text-foreground capitalize">{module.labEnvironment.difficulty}</span>
              </p>
              <Button className="border border-green-500/70 text-green-400 bg-transparent hover:bg-green-500/10">
                LAUNCH LAB ENVIRONMENT
              </Button>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="mt-12 flex justify-between">
          <Link href={`/soc-training/paths/${path.id}`}>
            <Button variant="outline" className="border border-primary/40">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Path
            </Button>
          </Link>
          <Button className="border border-primary/70 text-primary bg-transparent hover:bg-primary/10 hover:text-white">
            Continue Learning →
          </Button>
        </div>
      </div>
    </main>
  )
}
