'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Shield, Home, AlertTriangle, Activity, TrendingUp, Clock, Users, CheckCircle2, AlertCircle, BarChart3, Eye, Zap, Lock, MapPin, Cpu } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Alert {
  id: string
  timestamp: string
  severity: 'Critical' | 'High' | 'Medium' | 'Low'
  type: string
  source: string
  destination: string
  description: string
  status: 'Open' | 'Acknowledged' | 'Resolved'
  riskScore: number
}

interface SocMetrics {
  totalAlerts: number
  criticalAlerts: number
  highAlerts: number
  mediumAlerts: number
  lowAlerts: number
  averageResponseTime: string
  alertsResolved: number
  ongoingIncidents: number
}

export default function SOCDashboard() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [metrics, setMetrics] = useState<SocMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)
  const [filter, setFilter] = useState<'All' | 'Critical' | 'High' | 'Medium' | 'Low'>('All')

  useEffect(() => {
    // Simulate loading threat feed data
    const loadDashboardData = async () => {
      setLoading(true)
      try {
        // Generate realistic SOC dashboard data
        const mockAlerts: Alert[] = [
          {
            id: '2024-001-PHISH',
            timestamp: new Date(Date.now() - 2 * 60000).toISOString(),
            severity: 'Critical',
            type: 'Phishing Detection',
            source: '192.168.1.105',
            destination: 'mail.suspicious-domain.com',
            description: 'User clicked malicious phishing link containing credential harvester',
            status: 'Open',
            riskScore: 95
          },
          {
            id: '2024-002-MALWARE',
            timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
            severity: 'Critical',
            type: 'Malware Execution',
            source: '10.0.2.45',
            destination: 'C2-Server: 203.45.123.78',
            description: 'Suspicious executable detected with known malware hash on endpoint',
            status: 'Open',
            riskScore: 98
          },
          {
            id: '2024-003-LATERAL',
            timestamp: new Date(Date.now() - 8 * 60000).toISOString(),
            severity: 'High',
            type: 'Lateral Movement',
            source: '10.0.1.200',
            destination: 'Multiple internal systems',
            description: 'Unusual Kerberos service ticket requests detected for privilege escalation',
            status: 'Acknowledged',
            riskScore: 87
          },
          {
            id: '2024-004-DATA-EXFIL',
            timestamp: new Date(Date.now() - 12 * 60000).toISOString(),
            severity: 'High',
            type: 'Data Exfiltration',
            source: '172.16.0.50',
            destination: '45.33.192.145:443',
            description: 'Large data transfer to external IP detected outside business hours',
            status: 'Acknowledged',
            riskScore: 85
          },
          {
            id: '2024-005-DDOS',
            timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
            severity: 'High',
            type: 'DDoS Attack',
            source: 'Multiple botnet IPs',
            destination: 'Production Web Server: 203.0.113.42',
            description: 'Volumetric DDoS attack detected - 450 Gbps inbound traffic',
            status: 'Open',
            riskScore: 92
          },
          {
            id: '2024-006-BRUTE',
            timestamp: new Date(Date.now() - 20 * 60000).toISOString(),
            severity: 'Medium',
            type: 'Brute Force Attack',
            source: '89.45.234.12',
            destination: 'SSH Server: 192.168.1.1',
            description: '2,500 failed login attempts detected in 10 minutes',
            status: 'Resolved',
            riskScore: 65
          },
          {
            id: '2024-007-ANOMALY',
            timestamp: new Date(Date.now() - 25 * 60000).toISOString(),
            severity: 'Medium',
            type: 'Behavioral Anomaly',
            source: '10.0.3.78',
            destination: 'Database Server',
            description: 'Unusual database queries from non-admin user account detected',
            status: 'Acknowledged',
            riskScore: 72
          },
          {
            id: '2024-008-POLICY',
            timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
            severity: 'Low',
            type: 'Policy Violation',
            source: '192.168.1.220',
            destination: 'File Server',
            description: 'User accessed restricted file share outside approved hours',
            status: 'Resolved',
            riskScore: 35
          },
        ]

        const criticalCount = mockAlerts.filter(a => a.severity === 'Critical').length
        const highCount = mockAlerts.filter(a => a.severity === 'High').length
        const mediumCount = mockAlerts.filter(a => a.severity === 'Medium').length
        const lowCount = mockAlerts.filter(a => a.severity === 'Low').length
        const resolvedCount = mockAlerts.filter(a => a.status === 'Resolved').length

        setAlerts(mockAlerts)
        setMetrics({
          totalAlerts: mockAlerts.length,
          criticalAlerts: criticalCount,
          highAlerts: highCount,
          mediumAlerts: mediumCount,
          lowAlerts: lowCount,
          averageResponseTime: '14 minutes',
          alertsResolved: resolvedCount,
          ongoingIncidents: criticalCount + highCount
        })
      } catch (error) {
        console.error('Error loading SOC dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  const filteredAlerts = filter === 'All' 
    ? alerts 
    : alerts.filter(a => a.severity === filter)

  const getSeverityColor = (severity: string) => {
    switch(severity) {
      case 'Critical': return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'High': return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      case 'Medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'Low': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      default: return 'bg-primary/20 text-primary border-primary/30'
    }
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Open': return 'bg-red-500/10 text-red-400'
      case 'Acknowledged': return 'bg-yellow-500/10 text-yellow-400'
      case 'Resolved': return 'bg-green-500/10 text-green-400'
      default: return 'bg-primary/10 text-primary'
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-gradient-to-b from-background/95 to-background/80 backdrop-blur-xl border-b border-primary/30 px-6 py-4 z-50 shadow-2xl shadow-primary/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-lg border-2 border-primary flex items-center justify-center shadow-lg shadow-primary/40">
              <Cpu className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-primary tracking-[0.15em] cyber-glow">SOC SIMULATOR DASHBOARD</h1>
              <p className="text-xs text-primary/60">Real-Time Threat Monitoring & Incident Response</p>
            </div>
          </div>
          <Link href="/soc-simulator">
            <Button variant="outline" size="sm" className="nav-btn text-xs font-bold">
              <Home className="w-4 h-4 mr-2" />
              Back to Simulator
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 mt-24">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-primary/80 text-lg">Loading SOC Dashboard...</p>
            <div className="mt-4 flex justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary/40 animate-pulse"></div>
              <div className="w-2 h-2 rounded-full bg-primary/40 animate-pulse delay-100"></div>
              <div className="w-2 h-2 rounded-full bg-primary/40 animate-pulse delay-200"></div>
            </div>
          </div>
        ) : (
          <>
            {/* Metrics Row */}
            {metrics && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="cyber-card p-6 rounded-lg border border-primary/40">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-primary/60 uppercase font-bold mb-1">Total Alerts</p>
                      <p className="text-3xl font-bold text-primary">{metrics.totalAlerts}</p>
                    </div>
                    <AlertTriangle className="w-8 h-8 text-primary/30" />
                  </div>
                </div>

                <div className="cyber-card p-6 rounded-lg border border-red-500/40 bg-red-500/5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-red-400/80 uppercase font-bold mb-1">Critical</p>
                      <p className="text-3xl font-bold text-red-400">{metrics.criticalAlerts}</p>
                    </div>
                    <Zap className="w-8 h-8 text-red-400/30" />
                  </div>
                </div>

                <div className="cyber-card p-6 rounded-lg border border-primary/40">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-primary/60 uppercase font-bold mb-1">Resolved</p>
                      <p className="text-3xl font-bold text-primary">{metrics.alertsResolved}</p>
                    </div>
                    <CheckCircle2 className="w-8 h-8 text-primary/30" />
                  </div>
                </div>

                <div className="cyber-card p-6 rounded-lg border border-primary/40">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-primary/60 uppercase font-bold mb-1">Avg Response</p>
                      <p className="text-2xl font-bold text-primary">{metrics.averageResponseTime}</p>
                    </div>
                    <Clock className="w-8 h-8 text-primary/30" />
                  </div>
                </div>
              </div>
            )}

            {/* Alert Queue */}
            <div className="cyber-card p-8 rounded-lg border border-primary/40">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-primary flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  ALERT QUEUE
                </h2>
                <div className="flex gap-2">
                  {(['All', 'Critical', 'High', 'Medium', 'Low'] as const).map(severity => (
                    <Button
                      key={severity}
                      onClick={() => setFilter(severity)}
                      size="sm"
                      variant="outline"
                      className={`text-xs ${
                        filter === severity
                          ? 'bg-primary/30 border-primary/60 text-primary'
                          : 'border-primary/20 text-primary/60 hover:bg-primary/10'
                      }`}
                    >
                      {severity}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredAlerts.map((alert, idx) => (
                  <div
                    key={alert.id}
                    onClick={() => setSelectedAlert(selectedAlert?.id === alert.id ? null : alert)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedAlert?.id === alert.id
                        ? 'bg-primary/20 border-primary/60'
                        : 'bg-secondary/30 border-primary/20 hover:bg-secondary/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-xs font-bold px-2 py-1 rounded border ${getSeverityColor(alert.severity)}`}>
                            {alert.severity}
                          </span>
                          <span className={`text-xs font-bold px-2 py-1 rounded ${getStatusColor(alert.status)}`}>
                            {alert.status}
                          </span>
                          <span className="text-xs text-primary/50">{alert.timestamp.split('T')[1].substring(0, 5)}</span>
                        </div>
                        <p className="text-sm font-bold text-primary mb-1">{alert.type}</p>
                        <p className="text-xs text-primary/70 mb-2">{alert.description}</p>
                        <div className="text-xs text-primary/50 grid grid-cols-2 gap-2">
                          <p>Source: {alert.source}</p>
                          <p>Dest: {alert.destination}</p>
                        </div>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <p className="text-lg font-bold text-primary">{alert.riskScore}</p>
                        <p className="text-xs text-primary/60">Risk Score</p>
                      </div>
                    </div>

                    {selectedAlert?.id === alert.id && (
                      <div className="mt-4 pt-4 border-t border-primary/20 space-y-3">
                        <div>
                          <p className="text-xs font-bold text-primary/70 mb-1">RECOMMENDED ACTIONS</p>
                          <ul className="text-xs text-primary/60 space-y-1">
                            <li>• Investigate user activity during alert window</li>
                            <li>• Check for lateral movement indicators</li>
                            <li>• Review system logs for related events</li>
                            <li>• Consider isolation of affected systems</li>
                          </ul>
                        </div>
                        <Button
                          size="sm"
                          className="w-full bg-primary/20 hover:bg-primary/40 text-primary font-bold text-xs border border-primary/40"
                        >
                          Take Action
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
