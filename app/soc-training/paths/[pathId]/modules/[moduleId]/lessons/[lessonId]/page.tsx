'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Clock, BookOpen, Download, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ALL_LEARNING_PATHS } from '@/lib/soc-training-data'

interface LessonViewerProps {
  params: {
    pathId: string
    moduleId: string
    lessonId: string
  }
}

export default function LessonViewer({ params }: LessonViewerProps) {
  const [completed, setCompleted] = useState(false)
  const path = ALL_LEARNING_PATHS.find(p => p.id === params.pathId)
  const module = path?.modules.find(m => m.id === params.moduleId)
  const lesson = module?.lessons.find(l => l.id === params.lessonId)

  if (!path || !module || !lesson) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-foreground">Lesson not found</h1>
          <Link href={`/soc-training/paths/${params.pathId}/modules/${params.moduleId}`}>
            <Button>Return to Module</Button>
          </Link>
        </div>
      </main>
    )
  }

  const handleMarkComplete = () => {
    setCompleted(true)
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header Navigation */}
        <div className="flex items-center justify-between mb-8">
          <Link href={`/soc-training/paths/${params.pathId}/modules/${params.moduleId}`}>
            <Button variant="outline" size="sm" className="border border-primary/70 text-primary bg-transparent hover:bg-primary/10 hover:text-white hover:shadow-lg hover:shadow-primary/30 whitespace-nowrap transition-all duration-300 text-xs font-bold">
              <ArrowLeft className="w-4 h-4 mr-1" />
              BACK TO MODULE
            </Button>
          </Link>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="border border-primary/40 text-primary bg-transparent hover:bg-primary/5">
              <Share2 className="w-4 h-4 mr-1" />
              SHARE
            </Button>
            <Button variant="outline" size="sm" className="border border-primary/40 text-primary bg-transparent hover:bg-primary/5">
              <Download className="w-4 h-4 mr-1" />
              EXPORT
            </Button>
          </div>
        </div>

        {/* Lesson Header */}
        <div className="mb-8 space-y-6 border-b border-primary/20 pb-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-primary uppercase">{path.title}</span>
              <span className="text-primary/50">/</span>
              <span className="text-sm font-semibold text-primary uppercase">{module.title}</span>
            </div>
            <h1 className="text-4xl font-bold text-foreground">{lesson.title}</h1>
            <p className="text-lg text-muted-foreground">{lesson.description}</p>
          </div>

          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4 text-primary" />
              <span>{lesson.duration} minutes</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <BookOpen className="w-4 h-4 text-primary" />
              <span>Skill Level: {path.level}</span>
            </div>
            {lesson.completed && (
              <div className="flex items-center gap-2 text-sm text-green-500">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Completed</span>
              </div>
            )}
            {completed && !lesson.completed && (
              <div className="flex items-center gap-2 text-sm text-green-500">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Just Completed!</span>
              </div>
            )}
          </div>
        </div>

        {/* Lesson Content */}
        <div className="space-y-8">
          <div className="bg-secondary/20 border border-primary/20 rounded-lg p-8">
            <div className="prose prose-invert max-w-none">
              <div className="text-foreground whitespace-pre-wrap leading-relaxed text-base">
                {lesson.content}
              </div>
            </div>
          </div>

          {/* Resources Section */}
          {lesson.resources && lesson.resources.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">Resources</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {lesson.resources.map((resource, idx) => (
                  <a
                    key={idx}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-4 border border-primary/40 rounded-lg bg-secondary/20 hover:bg-secondary/40 transition-colors group"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          {resource.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">External Resource</p>
                      </div>
                      <span className="text-primary group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Video Section (if available) */}
          {lesson.videoUrl && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">Video Tutorial</h2>
              <div className="relative w-full bg-black rounded-lg overflow-hidden" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  src={lesson.videoUrl}
                  className="absolute top-0 left-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          {/* Key Takeaways */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">Key Takeaways</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-green-500/40 rounded-lg bg-green-500/5">
                <h3 className="font-semibold text-green-400 mb-2">What You Learned</h3>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Core concepts and fundamentals</li>
                  <li>Practical applications</li>
                  <li>Best practices and procedures</li>
                  <li>Real-world scenarios</li>
                </ul>
              </div>
              <div className="p-4 border border-blue-500/40 rounded-lg bg-blue-500/5">
                <h3 className="font-semibold text-blue-400 mb-2">Next Steps</h3>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Review resources provided</li>
                  <li>Complete other lessons in this module</li>
                  <li>Take the module quiz</li>
                  <li>Try the hands-on lab</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-between border-t border-primary/20 pt-8">
          <Link href={`/soc-training/paths/${params.pathId}/modules/${params.moduleId}`}>
            <Button variant="outline" className="border border-primary/40">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Module
            </Button>
          </Link>
          {!completed && !lesson.completed && (
            <Button 
              onClick={handleMarkComplete}
              className="border border-green-500/70 text-green-400 bg-transparent hover:bg-green-500/10"
            >
              MARK LESSON COMPLETE
            </Button>
          )}
          <Link href={`/soc-training/paths/${params.pathId}`}>
            <Button className="border border-primary/70 text-primary bg-transparent hover:bg-primary/10 hover:text-white">
              Continue Path →
            </Button>
          </Link>
        </div>
      </div>
    </main>
  )
}
