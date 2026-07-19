'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowLeft, Copy, Check, ChevronDown, ChevronUp, FileText, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CommandBlock {
  title: string
  description: string
  commands: Array<{
    label: string
    command: string
  }>
}

interface SkillSection {
  id: string
  title: string
  icon: string
  description: string
  topics: CommandBlock[]
}

const skillSections: SkillSection[] = [
  {
    id: 'windows-forensics',
    title: 'Windows Forensics & Analysis',
    icon: '🪟',
    description: 'Advanced techniques for analyzing compromised Windows systems',
    topics: [
      {
        title: 'Compromised Windows System Analysis',
        description: 'Identify signs of compromise and gather forensic evidence from Windows systems',
        commands: [
          {
            label: 'Check recent login activity (last 20 logins)',
            command: 'Get-WinEvent -FilterHashtable @{LogName="Security"; ID=4624} -MaxEvents 20 | Select-Object TimeCreated, Properties'
          },
          {
            label: 'Find modified files in last 7 days',
            command: 'Get-ChildItem -Recurse -Path C:\\ -File | Where-Object {$_.LastWriteTime -gt (Get-Date).AddDays(-7)}'
          },
          {
            label: 'Check running processes with network connections',
            command: 'Get-NetTCPConnection -State Established | ForEach-Object {Get-Process -Id $_.OwningProcess}'
          },
          {
            label: 'Check Windows Defender logs',
            command: 'Get-WinEvent -FilterHashtable @{LogName="Microsoft-Windows-Windows Defender/Operational"; ID=1116,1117}'
          },
          {
            label: 'List scheduled tasks (potential persistence)',
            command: 'schtasks /query /fo list /v | findstr /I suspicious'
          },
          {
            label: 'Show network connections listening on ports',
            command: 'netstat -anob | findstr LISTENING'
          },
          {
            label: 'View established connections',
            command: 'Get-NetTCPConnection -State Established | Select LocalAddress, LocalPort, RemoteAddress, RemotePort'
          }
        ]
      },
      {
        title: 'Registry Analysis',
        description: 'Analyze Windows registry for malware artifacts and system configuration',
        commands: [
          {
            label: 'Query startup programs (Run registry key)',
            command: 'reg query "HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" /s'
          },
          {
            label: 'Check browser homepage hijacking',
            command: 'reg query "HKCU\\Software\\Microsoft\\Internet Explorer\\Main" /v Start Page'
          },
          {
            label: 'List installed services',
            command: 'reg query "HKLM\\System\\CurrentControlSet\\Services" /s | findstr ImagePath'
          },
          {
            label: 'USB device history',
            command: 'reg query "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\MountPoints2"'
          }
        ]
      }
    ]
  },
  {
    id: 'linux-forensics',
    title: 'Linux Forensics & Analysis',
    icon: '🐧',
    description: 'Comprehensive forensic analysis techniques for Linux systems',
    topics: [
      {
        title: 'System Log Analysis',
        description: 'Examine Linux system logs for security events and anomalies',
        commands: [
          {
            label: 'View authentication attempts (failed logins)',
            command: 'grep "Failed password" /var/log/auth.log | tail -50'
          },
          {
            label: 'Check successful logins',
            command: 'grep "Accepted" /var/log/auth.log | grep -E "(password|publickey)" | tail -20'
          },
          {
            label: 'Find sudo usage',
            command: 'grep "sudo" /var/log/auth.log | grep -E "\\(\\w+\\)" | tail -30'
          },
          {
            label: 'Check SSH brute force attempts',
            command: 'grep "sshd" /var/log/auth.log | grep "Invalid user" | wc -l'
          }
        ]
      },
      {
        title: 'Process and Connection Analysis',
        description: 'Identify suspicious processes and network connections',
        commands: [
          {
            label: 'List all running processes with details',
            command: 'ps auxww | head -20'
          },
          {
            label: 'Find processes listening on network ports',
            command: 'netstat -tulpn | grep LISTEN'
          },
          {
            label: 'Check established connections',
            command: 'ss -tupnea | grep ESTAB'
          },
          {
            label: 'Find processes with open files',
            command: 'lsof -i -n -P | grep TCP'
          }
        ]
      },
      {
        title: 'File System Analysis',
        description: 'Analyze file system for malware and unauthorized modifications',
        commands: [
          {
            label: 'Find recently modified files (last 24 hours)',
            command: 'find / -type f -mtime -1 -ls 2>/dev/null | head -50'
          },
          {
            label: 'Find SUID binaries (potential privilege escalation)',
            command: 'find / -perm -4000 -type f -ls 2>/dev/null'
          },
          {
            label: 'Search for web shells',
            command: 'find /var/www -name "*.php" -o -name "*.jsp" | xargs ls -la'
          }
        ]
      }
    ]
  },
  {
    id: 'network-analysis',
    title: 'Network & Traffic Analysis',
    icon: '🌐',
    description: 'Analyze network traffic and identify suspicious communications',
    topics: [
      {
        title: 'Network Connection Analysis',
        description: 'Identify suspicious network activity and connections',
        commands: [
          {
            label: 'Capture network traffic to file',
            command: 'tcpdump -i eth0 -w capture.pcap -v'
          },
          {
            label: 'Filter DNS queries in PCAP',
            command: 'tshark -r capture.pcap -Y "dns" -T fields -e dns.qry.name | sort | uniq -c'
          },
          {
            label: 'Find HTTP requests with suspicious User-Agents',
            command: 'tshark -r capture.pcap -Y "http" -T fields -e http.user_agent | sort | uniq -c'
          }
        ]
      }
    ]
  },
  {
    id: 'malware-analysis',
    title: 'Malware Detection & Analysis',
    icon: '🦠',
    description: 'Techniques for identifying and analyzing malicious software',
    topics: [
      {
        title: 'File Analysis',
        description: 'Analyze suspicious files for malware indicators',
        commands: [
          {
            label: 'Calculate file hash (SHA256)',
            command: 'sha256sum suspicious_file.exe'
          },
          {
            label: 'Extract strings from binary',
            command: 'strings suspicious_file.exe | grep -E "(http|cmd|powershell)" | head -50'
          },
          {
            label: 'Check file type with file command',
            command: 'file suspicious_file.exe'
          }
        ]
      }
    ]
  },
  {
    id: 'incident-response',
    title: 'Incident Response Procedures',
    icon: '🚨',
    description: 'Standard procedures for responding to security incidents',
    topics: [
      {
        title: 'Incident Containment',
        description: 'Steps to contain and isolate affected systems',
        commands: [
          {
            label: 'Isolate network interface',
            command: 'ip link set eth0 down'
          },
          {
            label: 'Kill suspicious process',
            command: 'kill -9 [PID]'
          },
          {
            label: 'Block IP address at firewall',
            command: 'iptables -A INPUT -s [ATTACKER_IP] -j DROP'
          },
          {
            label: 'Disable user account',
            command: 'usermod -L [username]'
          },
          {
            label: 'Reset user password',
            command: 'passwd username'
          }
        ]
      }
    ]
  }
]

export default function SOCSkillsPage() {
  const [expandedSection, setExpandedSection] = useState<string | null>('windows-forensics')
  const [expandedTopic, setExpandedTopic] = useState<Record<string, string>>({
    'windows-forensics': 'Compromised Windows System Analysis'
  })
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null)

  const copyToClipboard = (command: string) => {
    navigator.clipboard.writeText(command)
    setCopiedCommand(command)
    setTimeout(() => setCopiedCommand(null), 2000)
  }

  const toggleTopic = (sectionId: string, topicTitle: string) => {
    setExpandedTopic(prev => ({
      ...prev,
      [sectionId]: prev[sectionId] === topicTitle ? '' : topicTitle
    }))
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-primary/20 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-primary tracking-wider">SOC SKILLS</h1>
              <p className="text-primary/60 text-sm mt-1">Professional Technical Reference & Command Guide</p>
            </div>
            <Link href="/">
              <Button className="border border-primary/70 text-primary bg-transparent hover:bg-primary/10 hover:text-white hover:shadow-lg hover:shadow-primary/30 whitespace-nowrap transition-all duration-300 text-xs font-bold">
                <ArrowLeft className="w-4 h-4 mr-2" />
                BACK TO HOME
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Info Banner */}
        <div className="mb-12 p-6 rounded-lg border border-primary/30 bg-primary/5">
          <div className="flex gap-3">
            <BookOpen className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="text-primary font-bold mb-2">How to Use This Guide</h2>
              <p className="text-primary/70 text-sm">
                Each section contains <span className="text-primary font-semibold">descriptions</span> in regular text explaining what to do, followed by specific <span className="text-primary font-semibold">command blocks</span> in code format to execute. 
                Commands are highlighted and can be copied with a single click. Use Ctrl+F to search for specific commands quickly.
              </p>
            </div>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {skillSections.map(section => (
            <div key={section.id} className="border border-primary/20 rounded-lg overflow-hidden hover:border-primary/40 transition-colors">
              {/* Section Header */}
              <button
                onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
                className="w-full p-6 bg-gradient-to-r from-primary/10 to-transparent hover:from-primary/20 hover:to-transparent transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-4 text-left">
                  <span className="text-3xl">{section.icon}</span>
                  <div>
                    <h2 className="text-xl font-bold text-primary tracking-wide">{section.title}</h2>
                    <p className="text-primary/60 text-sm mt-1">{section.description}</p>
                  </div>
                </div>
                {expandedSection === section.id ? (
                  <ChevronUp className="w-5 h-5 text-primary flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-primary flex-shrink-0" />
                )}
              </button>

              {/* Section Content */}
              {expandedSection === section.id && (
                <div className="border-t border-primary/20 p-6 space-y-8 bg-black/20">
                  {section.topics.map((topic, idx) => (
                    <div key={idx} className="space-y-4">
                      {/* Topic Header */}
                      <button
                        onClick={() => toggleTopic(section.id, topic.title)}
                        className="w-full text-left p-4 bg-primary/5 hover:bg-primary/10 rounded border border-primary/20 transition-all flex items-center justify-between"
                      >
                        <div>
                          <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            {topic.title}
                          </h3>
                          <p className="text-primary/60 text-sm mt-1">{topic.description}</p>
                        </div>
                        {expandedTopic[section.id] === topic.title ? (
                          <ChevronUp className="w-5 h-5 text-primary flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-primary flex-shrink-0" />
                        )}
                      </button>

                      {/* Commands */}
                      {expandedTopic[section.id] === topic.title && (
                        <div className="space-y-6 ml-4">
                          {topic.commands.map((cmd, cmdIdx) => (
                            <div key={cmdIdx} className="space-y-2">
                              {/* Description Label and Text */}
                              <div className="flex items-start gap-3">
                                <span className="text-primary/50 text-xs font-bold uppercase tracking-wider mt-1 whitespace-nowrap">📝 Description:</span>
                                <p className="text-primary/80 text-sm leading-relaxed">{cmd.label}</p>
                              </div>

                              {/* Command Block */}
                              <div className="relative group ml-12">
                                <span className="text-primary/50 text-xs font-bold uppercase tracking-wider block mb-2">⌘ Command:</span>
                                <pre className="bg-black/50 border border-primary/30 rounded p-4 overflow-x-auto">
                                  <code className="text-primary font-mono text-sm leading-relaxed break-words whitespace-pre-wrap">
                                    {cmd.command}
                                  </code>
                                </pre>
                                <button
                                  onClick={() => copyToClipboard(cmd.command)}
                                  className="absolute top-8 right-2 p-2 bg-primary/20 hover:bg-primary/40 rounded opacity-0 group-hover:opacity-100 transition-all"
                                  title="Copy command to clipboard"
                                >
                                  {copiedCommand === cmd.command ? (
                                    <Check className="w-4 h-4 text-green-400" />
                                  ) : (
                                    <Copy className="w-4 h-4 text-primary" />
                                  )}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-primary/20 text-center text-primary/60 text-sm">
          <p>SOC Skills Reference Guide • Last Updated: {new Date().toLocaleDateString()}</p>
          <p className="mt-2">For questions or updates, contact your SOC leadership team</p>
        </div>
      </main>
    </div>
  )
}
