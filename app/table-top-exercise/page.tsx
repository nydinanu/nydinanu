'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Shield, ChevronRight, AlertTriangle, CheckCircle2, Clock, Users, Zap, Target, BookOpen, Play, Home, TrendingUp, Award } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ExercisePhase {
  phase: string
  description: string
  options: {
    text: string
    correct: boolean
    feedback: string
    impact: string
  }[]
}

interface TableTopExercise {
  id: string
  title: string
  description: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'
  duration: string
  participants: number
  scenario: string
  objectives: string[]
  phases: ExercisePhase[]
  nist: string[]
  iso: string[]
}

const exercises: TableTopExercise[] = [
  {
    id: 'breach-discovery',
    title: 'Breach Discovery & Initial Response',
    description: 'Your organization discovers suspicious activity. Walk through the critical first steps of incident response during a security breach discovery.',
    difficulty: 'Beginner',
    duration: '20-30 min',
    participants: 5,
    scenario: 'A security analyst reports unusual database access patterns at 9 AM. Your incident response team assembles within 15 minutes.',
    objectives: [
      'Establish incident command structure',
      'Declare incident severity level',
      'Activate incident response team',
      'Initiate forensic evidence preservation',
      'Begin stakeholder notifications'
    ],
    nist: ['RS.RP-1', 'RS.CO-1', 'RS.CO-2'],
    iso: ['A.16.1.1', 'A.16.1.4', 'A.16.1.5'],
    phases: [
      {
        phase: 'SITUATION ASSESSMENT',
        description: 'Your SOC team detected unusual activity. What is your first action?',
        options: [
          {
            text: 'Immediately shut down all systems to preserve evidence',
            correct: false,
            feedback: 'While preservation is important, emergency shutdown could damage evidence and impact business. A controlled approach is better.',
            impact: 'High risk - potential business continuity impact and evidence loss'
          },
          {
            text: 'Assemble incident response team and gather initial information about the detection',
            correct: true,
            feedback: 'Correct! Understanding the detection details helps you assess severity and determine appropriate response level.',
            impact: 'Optimal - enables informed decision-making and appropriate resource allocation'
          },
          {
            text: 'Wait for more alerts to confirm this is a real incident',
            correct: false,
            feedback: 'Early action is critical in incident response. Time is an attacker advantage. Waiting delays critical response steps.',
            impact: 'Medium risk - gives attackers more time to spread and cause damage'
          }
        ]
      },
      {
        phase: 'SEVERITY DETERMINATION',
        description: 'After initial assessment, unusual access to customer database detected. Classify the incident severity:',
        options: [
          {
            text: 'Low - Monitor and investigate during normal business hours',
            correct: false,
            feedback: 'Customer data access is a high-impact event requiring immediate response, not delayed monitoring.',
            impact: 'High risk - regulatory compliance violation, customer notification delays'
          },
          {
            text: 'Critical - Activate full incident response, notify executives and legal immediately',
            correct: true,
            feedback: 'Correct! Unauthorized database access is critical - customer data exposure requires immediate executive and legal notification.',
            impact: 'Optimal - ensures proper escalation and compliance with breach notification requirements'
          },
          {
            text: 'Medium - Assign to on-call analyst to review',
            correct: false,
            feedback: 'Customer data access requires immediate high-level attention and resource allocation, not routine investigation.',
            impact: 'Medium-High risk - delayed notification and potential compliance violations'
          }
        ]
      },
      {
        phase: 'EVIDENCE PRESERVATION',
        description: 'Before conducting detailed investigation, what critical step must you take?',
        options: [
          {
            text: 'Immediately stop the suspicious activity by changing user password',
            correct: false,
            feedback: 'While containment is important, changing passwords without capturing evidence could destroy critical forensic data.',
            impact: 'High risk - evidence destruction, limited investigation scope'
          },
          {
            text: 'Capture network traffic, logs, and create forensic snapshots before any containment actions',
            correct: true,
            feedback: 'Correct! Evidence preservation must happen first. Logs and network captures are perishable and needed for investigation.',
            impact: 'Optimal - enables thorough forensic investigation and legal compliance'
          },
          {
            text: 'Begin notifying customers immediately while team investigates',
            correct: false,
            feedback: 'Customer notification should follow evidence preservation and initial investigation. Premature notification without facts is problematic.',
            impact: 'Medium risk - incomplete incident understanding, potential customer panic'
          }
        ]
      },
      {
        phase: 'CONTAINMENT STRATEGY',
        description: 'After evidence capture, the attacker is still actively accessing the database. What is your containment approach?',
        options: [
          {
            text: 'Immediately take database offline, disrupting all operations',
            correct: false,
            feedback: 'Too aggressive. Uncontrolled shutdown impacts business and may destroy forensic evidence. A measured approach is better.',
            impact: 'High business impact - complete service outage'
          },
          {
            text: 'Disable compromised account, monitor for lateral movement, prepare for controlled shutdown',
            correct: true,
            feedback: 'Correct! Targeted containment stops active access while maintaining business operations and gathering additional forensic data.',
            impact: 'Optimal - controlled response balancing investigation and business continuity'
          },
          {
            text: 'Ignore the access and focus only on investigation',
            correct: false,
            feedback: 'Containment cannot be delayed. Active attacker access must be stopped to prevent additional damage.',
            impact: 'Critical risk - ongoing data exfiltration and compromise'
          }
        ]
      },
      {
        phase: 'COMMUNICATION PLAN',
        description: 'How should you handle stakeholder communication about this incident?',
        options: [
          {
            text: 'Post to company social media to be transparent with the public immediately',
            correct: false,
            feedback: 'Public communication should be coordinated, factual, and through official channels. Uncontrolled messaging creates panic.',
            impact: 'High risk - reputation damage, stock impact, customer trust'
          },
          {
            text: 'Notify legal, executives, and PR immediately; prepare for customer notification once facts are established',
            correct: true,
            feedback: 'Correct! Internal stakeholder notification happens first, followed by fact-based customer communication through proper channels.',
            impact: 'Optimal - controlled messaging, compliance with regulations, stakeholder alignment'
          },
          {
            text: 'Keep the incident internal; only tell affected customers after full investigation concludes',
            correct: false,
            feedback: 'Many jurisdictions require breach notification within 72 hours. Delayed notification violates regulations.',
            impact: 'Critical risk - regulatory violations, legal liability'
          }
        ]
      }
    ]
  },
  {
    id: 'ransomware-response',
    title: 'Ransomware Attack Containment',
    description: 'Lead your organization through rapid response decisions when ransomware begins encrypting critical systems. Test your knowledge of containment strategy.',
    difficulty: 'Intermediate',
    duration: '30-40 min',
    participants: 8,
    scenario: 'At 11:30 AM, users report they cannot access files and see ransom notes. Initial investigation shows the malware is actively spreading.',
    objectives: [
      'Immediately isolate infected systems',
      'Preserve evidence without destroying forensic data',
      'Prevent backup corruption',
      'Coordinate with law enforcement',
      'Develop recovery timeline'
    ],
    nist: ['RS.MI-1', 'RS.MI-2', 'RC.RP-1'],
    iso: ['A.12.3.1', 'A.17.1.1', 'A.17.1.2'],
    phases: [
      {
        phase: 'CRITICAL FIRST ACTIONS',
        description: 'Ransomware is actively spreading. What is your immediate priority?',
        options: [
          {
            text: 'Pay the ransom immediately to restore operations',
            correct: false,
            feedback: 'Ransom payment does not guarantee recovery, enables criminal activity, and may violate sanctions laws. Containment first.',
            impact: 'Critical risk - funding criminals, no guarantee of decryption, legal/sanction issues'
          },
          {
            text: 'Isolate all infected systems from network and backups to prevent spread',
            correct: true,
            feedback: 'Correct! Isolation prevents lateral movement and backup corruption. This is the critical first action in ransomware response.',
            impact: 'Optimal - prevents damage spread, protects recovery capability'
          },
          {
            text: 'Try to manually decrypt files while systems are still connected',
            correct: false,
            feedback: 'Attempting decryption while malware is active wastes time and allows continued spread. Isolation comes first.',
            impact: 'High risk - continued encryption and spread'
          }
        ]
      },
      {
        phase: 'BACKUP PROTECTION',
        description: 'Which backup strategy minimizes ransomware impact?',
        options: [
          {
            text: 'Keep all backups connected to the network for easy access',
            correct: false,
            feedback: 'Network-connected backups are vulnerable to ransomware encryption. Air-gapped or isolated backups are essential.',
            impact: 'Critical risk - loss of all recovery capability'
          },
          {
            text: 'Immediately disconnect all backup systems from the network and verify their integrity',
            correct: true,
            feedback: 'Correct! Air-gapped backups are your recovery lifeline. Immediate disconnection prevents backup encryption.',
            impact: 'Optimal - preserves recovery capability and business continuity option'
          },
          {
            text: 'Wipe all backups to prevent the attacker from finding customer data',
            correct: false,
            feedback: 'Destroying backups eliminates your recovery option and may destroy evidence needed for investigation.',
            impact: 'Critical risk - eliminates recovery and complicates forensics'
          }
        ]
      },
      {
        phase: 'LAW ENFORCEMENT COORDINATION',
        description: 'Should you contact law enforcement during a ransomware attack?',
        options: [
          {
            text: 'No - law enforcement involvement will slow down recovery efforts',
            correct: false,
            feedback: 'FBI/police involvement is critical for ransomware. They have threat intelligence and may assist with decryption keys.',
            impact: 'Medium risk - loss of law enforcement resources and threat intelligence'
          },
          {
            text: 'Yes - notify FBI and law enforcement immediately. They have decryption keys for some variants and threat intelligence',
            correct: true,
            feedback: 'Correct! Law enforcement notification is essential. FBI often has decryption tools and can provide critical intelligence.',
            impact: 'Optimal - enables decryption assistance and coordinated response'
          },
          {
            text: 'Wait until after recovery is complete to involve law enforcement',
            correct: false,
            feedback: 'Early law enforcement involvement provides immediate assistance and critical intelligence during the attack.',
            impact: 'Medium risk - delayed access to decryption tools and intelligence'
          }
        ]
      }
    ]
  },
  {
    id: 'data-breach-investigation',
    title: 'Data Breach Investigation & Attribution',
    description: 'Investigate a data breach, determine what was stolen, and attribute the attack to threat actors while managing complex incident response.',
    difficulty: 'Advanced',
    duration: '40-50 min',
    participants: 10,
    scenario: 'Threat intelligence reports your organization\'s data on a darknet market. Investigation shows a 2-month intrusion occurred undetected.',
    objectives: [
      'Determine scope of data exposure',
      'Attribute attack to threat actor group',
      'Identify all compromised accounts',
      'Trace attack timeline and vector',
      'Develop comprehensive remediation plan'
    ],
    nist: ['RS.AN-1', 'RS.AN-2', 'RS.AN-3', 'RC.CO-3'],
    iso: ['A.16.1.5', 'A.16.1.7', 'A.12.4.1'],
    phases: [
      {
        phase: 'SCOPE DETERMINATION',
        description: 'You need to determine exactly what data was exposed. What is your approach?',
        options: [
          {
            text: 'Assume all customer data was stolen and notify everyone immediately',
            correct: false,
            feedback: 'Over-notification damages trust and credibility. Investigation must determine actual exposure scope first.',
            impact: 'High - unnecessary customer concern and potential stock impact'
          },
          {
            text: 'Conduct forensic analysis to identify accessed databases and determine actual data exposure scope',
            correct: true,
            feedback: 'Correct! Forensic analysis determines actual exposure. Then notifications are accurate and targeted.',
            impact: 'Optimal - precise notifications, accurate regulatory reporting'
          },
          {
            text: 'Trust the attacker\'s claims about what data was stolen',
            correct: false,
            feedback: 'Attacker claims are often inflated or false. Independent forensic verification is essential.',
            impact: 'Medium-High - inaccurate scope, potential notification errors'
          }
        ]
      },
      {
        phase: 'THREAT ACTOR ATTRIBUTION',
        description: 'How should you approach threat actor attribution?',
        options: [
          {
            text: 'Use only publicly available threat intelligence to make attribution',
            correct: false,
            feedback: 'Public intel alone may be incomplete. Combine with internal forensics, law enforcement, and private threat intel.',
            impact: 'Medium - incomplete or inaccurate attribution'
          },
          {
            text: 'Analyze tactics, malware, infrastructure, and correlate with law enforcement and private threat intelligence',
            correct: true,
            feedback: 'Correct! Multi-source attribution using MITRE ATT&CK, forensics, and threat intelligence enables confident attribution.',
            impact: 'Optimal - accurate attribution for coordinated response'
          },
          {
            text: 'Assume it was a known nation-state group without detailed investigation',
            correct: false,
            feedback: 'Attribution requires evidence. Assumptions can lead to incorrect response strategies.',
            impact: 'High - misdirected response efforts and inaccurate public statements'
          }
        ]
      }
    ]
  }
]

interface ExerciseState {
  currentPhaseIndex: number
  selectedAnswers: (boolean | null)[]
  score: number
  completed: boolean
}

export default function TableTopExercisePage() {
  const router = useRouter()
  const [selectedExercise, setSelectedExercise] = useState<TableTopExercise | null>(null)
  const [exerciseState, setExerciseState] = useState<ExerciseState>({
    currentPhaseIndex: 0,
    selectedAnswers: [],
    score: 0,
    completed: false
  })
  const [showResults, setShowResults] = useState(false)

  const startExercise = (exercise: TableTopExercise) => {
    setSelectedExercise(exercise)
    setExerciseState({
      currentPhaseIndex: 0,
      selectedAnswers: new Array(exercise.phases.length).fill(null),
      score: 0,
      completed: false
    })
    setShowResults(false)
  }

  const handleAnswer = (isCorrect: boolean) => {
    const newAnswers = [...exerciseState.selectedAnswers]
    newAnswers[exerciseState.currentPhaseIndex] = isCorrect
    
    const newScore = newAnswers.filter(a => a === true).length
    setExerciseState({
      ...exerciseState,
      selectedAnswers: newAnswers,
      score: newScore
    })

    if (exerciseState.currentPhaseIndex < selectedExercise!.phases.length - 1) {
      setExerciseState(prev => ({
        ...prev,
        currentPhaseIndex: prev.currentPhaseIndex + 1
      }))
    } else {
      setExerciseState(prev => ({
        ...prev,
        completed: true
      }))
      setShowResults(true)
    }
  }

  if (selectedExercise && !showResults) {
    const phase = selectedExercise.phases[exerciseState.currentPhaseIndex]
    const answered = exerciseState.selectedAnswers[exerciseState.currentPhaseIndex] !== null

    return (
      <div className="min-h-screen bg-background pt-32 pb-16">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <Link href="/table-top-exercise" className="text-primary/60 hover:text-primary text-sm font-bold mb-4 inline-flex items-center gap-1">
              <ChevronRight className="w-4 h-4 rotate-180" />
              Back to Exercises
            </Link>
            <h1 className="text-3xl font-bold text-primary mb-2 tracking-wide">{selectedExercise.title}</h1>
            <p className="text-primary/70">{selectedExercise.scenario}</p>
          </div>

          {/* Progress */}
          <div className="mb-8 p-4 bg-primary/10 rounded-lg border border-primary/30">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-bold text-primary">Phase {exerciseState.currentPhaseIndex + 1} of {selectedExercise.phases.length}</p>
              <p className="text-sm font-bold text-primary">Score: {exerciseState.score}/{selectedExercise.phases.length}</p>
            </div>
            <div className="w-full bg-primary/20 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${((exerciseState.currentPhaseIndex + 1) / selectedExercise.phases.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Phase Question */}
          <div className="cyber-card p-8 rounded-lg border border-primary/40 mb-8">
            <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              {phase.phase}
            </h2>
            <p className="text-primary/80 mb-6">{phase.description}</p>

            {/* Options */}
            <div className="space-y-3">
              {phase.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(option.correct)}
                  disabled={answered}
                  className="w-full text-left p-4 border border-primary/30 rounded-lg bg-primary/5 hover:bg-primary/15 hover:border-primary/60 transition-all disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <p className="font-bold text-primary mb-1">{option.text}</p>
                </button>
              ))}
            </div>

            {answered && (
              <div className="mt-8 p-4 rounded-lg bg-primary/10 border border-primary/30">
                <div className="mb-3">
                  {exerciseState.selectedAnswers[exerciseState.currentPhaseIndex] ? (
                    <p className="text-sm font-bold text-green-400 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Correct Answer
                    </p>
                  ) : (
                    <p className="text-sm font-bold text-orange-400 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Incorrect Answer
                    </p>
                  )}
                </div>
                <p className="text-sm text-primary/80 mb-3">{phase.options.find(o => o.correct)?.feedback}</p>
                <div className="p-3 bg-primary/20 rounded border border-primary/40">
                  <p className="text-xs font-bold text-primary/70 uppercase mb-1">Impact Assessment</p>
                  <p className="text-sm text-primary/80">{phase.options.find(o => o.correct)?.impact}</p>
                </div>
                {exerciseState.currentPhaseIndex < selectedExercise.phases.length - 1 && (
                  <Button
                    onClick={() => setExerciseState(prev => ({
                      ...prev,
                      currentPhaseIndex: prev.currentPhaseIndex + 1
                    }))}
                    className="w-full mt-4 bg-primary/20 hover:bg-primary/40 text-primary font-bold border border-primary/40"
                  >
                    Next Phase
                  </Button>
                )}
                {exerciseState.currentPhaseIndex === selectedExercise.phases.length - 1 && (
                  <Button
                    onClick={() => setShowResults(true)}
                    className="w-full mt-4 bg-primary/20 hover:bg-primary/40 text-primary font-bold border border-primary/40"
                  >
                    View Results
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (selectedExercise && showResults) {
    const scorePercentage = Math.round((exerciseState.score / selectedExercise.phases.length) * 100)
    const scoreBadge = scorePercentage >= 80 ? '🏆 Expert' : scorePercentage >= 60 ? '⭐ Proficient' : '📚 Learning'

    return (
      <div className="min-h-screen bg-background pt-32 pb-16">
        <div className="max-w-4xl mx-auto px-4">
          {/* Results Header */}
          <div className="text-center mb-12">
            <div className="mb-6 inline-block p-6 bg-primary/10 rounded-lg border border-primary/30">
              <p className="text-6xl font-bold text-primary mb-2">{scorePercentage}%</p>
              <p className="text-xl font-bold text-primary">{selectedExercise.title}</p>
            </div>
            <p className="text-2xl font-bold text-primary mb-4">{scoreBadge}</p>
            <p className="text-primary/70">You answered {exerciseState.score} out of {selectedExercise.phases.length} phases correctly</p>
          </div>

          {/* Phase Review */}
          <div className="space-y-4 mb-8">
            <h2 className="text-xl font-bold text-primary flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5" />
              Phase-by-Phase Review
            </h2>
            {selectedExercise.phases.map((phase, idx) => (
              <div key={idx} className="p-4 border border-primary/30 rounded-lg bg-primary/5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-bold text-primary">{phase.phase}</p>
                    <p className="text-sm text-primary/70 mt-1">{phase.description}</p>
                  </div>
                  <div className="ml-4">
                    {exerciseState.selectedAnswers[idx] ? (
                      <CheckCircle2 className="w-6 h-6 text-green-400" />
                    ) : (
                      <AlertTriangle className="w-6 h-6 text-orange-400" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Framework Mapping */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-sm font-bold text-blue-400 mb-2">NIST Framework</p>
              <div className="flex flex-wrap gap-2">
                {selectedExercise.nist.map((control, i) => (
                  <span key={i} className="text-xs px-2 py-1 bg-blue-500/20 text-blue-300 rounded font-bold">
                    {control}
                  </span>
                ))}
              </div>
            </div>
            <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
              <p className="text-sm font-bold text-purple-400 mb-2">ISO 27001</p>
              <div className="flex flex-wrap gap-2">
                {selectedExercise.iso.map((control, i) => (
                  <span key={i} className="text-xs px-2 py-1 bg-purple-500/20 text-purple-300 rounded font-bold">
                    {control}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              onClick={() => {
                setSelectedExercise(null)
                setShowResults(false)
              }}
              className="flex-1 bg-primary/20 hover:bg-primary/40 text-primary font-bold border border-primary/40"
            >
              Back to Exercises
            </Button>
            <Button
              onClick={() => startExercise(selectedExercise)}
              className="flex-1 bg-primary/20 hover:bg-primary/40 text-primary font-bold border border-primary/40"
            >
              Retry Exercise
            </Button>
            <Button
              onClick={() => router.push('/soc-simulator')}
              className="flex-1 bg-primary/20 hover:bg-primary/40 text-primary font-bold border border-primary/40"
            >
              Launch SOC Simulator
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pt-32 pb-16">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <Link href="/" className="text-primary/60 hover:text-primary text-sm font-bold mb-4 inline-flex items-center gap-1">
            <Home className="w-4 h-4" />
            Home
          </Link>
          <h1 className="text-4xl font-bold text-primary mb-4 tracking-wide">Table Top Exercise</h1>
          <p className="text-primary/70 max-w-3xl">
            Prepare your incident response team with structured decision-making exercises. Walk through realistic scenarios and learn from expert guidance. 
            Each exercise maps to NIST CSF and ISO 27001 standards for compliance-aligned training.
          </p>
        </div>

        {/* Exercise Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exercises.map((exercise) => (
            <div
              key={exercise.id}
              className="cyber-card p-6 rounded-lg border border-primary/30 hover:border-primary/60 hover:shadow-2xl hover:shadow-primary/20 transition-all duration-300 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-primary/20 rounded-lg group-hover:bg-primary/30 transition-colors">
                  <AlertTriangle className="w-5 h-5 text-primary" />
                </div>
                <span className="text-[10px] px-2 py-1 bg-primary/30 text-primary rounded font-bold uppercase">
                  {exercise.difficulty}
                </span>
              </div>

              <h3 className="text-lg font-bold text-primary mb-2">{exercise.title}</h3>
              <p className="text-xs text-primary/70 mb-4">{exercise.description}</p>

              {/* Details */}
              <div className="space-y-2 mb-4 pb-4 border-b border-primary/20">
                <div className="flex items-center gap-2 text-xs text-primary/70">
                  <Clock className="w-3 h-3" />
                  <span>{exercise.duration}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-primary/70">
                  <Users className="w-3 h-3" />
                  <span>{exercise.participants} participants recommended</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-primary/70">
                  <Zap className="w-3 h-3" />
                  <span>{exercise.phases.length} decision phases</span>
                </div>
              </div>

              {/* Frameworks */}
              <div className="mb-4">
                <p className="text-[10px] font-bold text-primary/60 uppercase mb-2">Frameworks</p>
                <div className="flex flex-wrap gap-1">
                  {exercise.nist.slice(0, 2).map((control, i) => (
                    <span key={i} className="text-[9px] px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded">
                      {control}
                    </span>
                  ))}
                  {exercise.iso.slice(0, 1).map((control, i) => (
                    <span key={i} className="text-[9px] px-1.5 py-0.5 bg-purple-500/20 text-purple-400 rounded">
                      {control}
                    </span>
                  ))}
                </div>
              </div>

              <Button
                onClick={() => startExercise(exercise)}
                className="w-full bg-primary/20 hover:bg-primary/40 text-primary font-bold text-xs py-2 border border-primary/40 flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4" />
                START EXERCISE
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
