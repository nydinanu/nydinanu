'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home, ArrowLeft, Plus, Search, AlertTriangle, CheckCircle, Clock, FileText, Trash2, MapPin } from 'lucide-react'

interface IOC {
  type: 'ip' | 'domain' | 'hash'
  value: string
  threatLevel: string
  scanDate: string
}

interface IncidentCase {
  id: string
  title: string
  description: string
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  status: 'OPEN' | 'IN_PROGRESS' | 'CLOSED'
  iocs: IOC[]
  createdDate: string
  lastUpdated: string
  assignee?: string
  tags: string[]
}

interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

export default function IncidentsPage() {
  const router = useRouter()
  const [cases, setCases] = useState<IncidentCase[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedCase, setSelectedCase] = useState<IncidentCase | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [showAddIOCForm, setShowAddIOCForm] = useState(false)
  const [newIOCInput, setNewIOCInput] = useState('')
  const [scanSummary, setScanSummary] = useState<any>(null)
  const [showScanSummary, setShowScanSummary] = useState(false)
  const [loadingScanSummary, setLoadingScanSummary] = useState(false)
  const [editingCase, setEditingCase] = useState<IncidentCase | null>(null)

  // Form state for new case
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    severity: 'MEDIUM' as const,
    iocInput: '',
    tags: '',
  })

  // Toast notification helper
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 4000)
  }

  // Load cases from API on mount
  useEffect(() => {
    const loadCases = async () => {
      try {
        console.log('[v0] Loading incident cases from API...')
        const response = await fetch('/api/incidents')
        console.log('[v0] Incidents API response status:', response.status)
        
        if (!response.ok) {
          console.log('[v0] Failed to fetch incidents, status:', response.status)
          setCases([])
          return
        }
        
        const data = await response.json()
        setCases(data.cases || [])
        console.log('[v0] Loaded', data.cases?.length || 0, 'incident cases from API')
      } catch (error) {
        console.log('[v0] Error loading cases:', error)
        setCases([])
      } finally {
        setLoading(false)
      }
    }
    loadCases()
  }, [])

  // Parse IOC from input (IP, domain, or hash)
  const parseIOC = (input: string): IOC | null => {
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/
    const domainRegex = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i
    const hashRegex = /^[a-f0-9]{32}$|^[a-f0-9]{40}$|^[a-f0-9]{64}$/i

    const trimmed = input.trim()
    
    if (ipRegex.test(trimmed)) {
      return { type: 'ip', value: trimmed, threatLevel: 'UNKNOWN', scanDate: new Date().toISOString() }
    }
    if (domainRegex.test(trimmed)) {
      return { type: 'domain', value: trimmed, threatLevel: 'UNKNOWN', scanDate: new Date().toISOString() }
    }
    if (hashRegex.test(trimmed)) {
      return { type: 'hash', value: trimmed, threatLevel: 'UNKNOWN', scanDate: new Date().toISOString() }
    }
    return null
  }

  const handleCreateCase = async () => {
    if (!formData.title.trim() || !formData.iocInput.trim()) {
      alert('Please fill in title and at least one IOC')
      return
    }

    // Parse IOCs from input
    const iocLines = formData.iocInput.split('\n').filter(line => line.trim())
    const iocs: IOC[] = []
    
    for (const line of iocLines) {
      const ioc = parseIOC(line)
      if (ioc) {
        iocs.push(ioc)
      }
    }

    if (iocs.length === 0) {
      alert('No valid IOCs found. Please enter valid IPs, domains, or hashes.')
      return
    }

    const newCase: IncidentCase = {
      id: Date.now().toString(),
      title: formData.title,
      description: formData.description,
      severity: formData.severity,
      status: 'OPEN',
      iocs,
      createdDate: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
    }

    try {
      console.log('[v0] Creating incident case:', { title: newCase.title, iocs: newCase.iocs.length })
      
      // Save to API
      const response = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCase),
      })

      console.log('[v0] Incident API response status:', response.status)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.log('[v0] API error response:', errorData)
        throw new Error(errorData.error || 'Failed to save case')
      }
      
      const result = await response.json()
      const updatedCases = [result.case, ...cases]
      setCases(updatedCases)
      
      console.log('[v0] Incident case saved successfully:', result.case.id)

      // Reset form
      setFormData({ title: '', description: '', severity: 'MEDIUM', iocInput: '', tags: '' })
      setShowCreateForm(false)
      showToast('Incident case created successfully!', 'success')
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error)
      console.log('[v0] Error saving case:', errorMsg)
      showToast(`Failed to save incident case: ${errorMsg}`, 'error')
    }
  }

  const deleteIOC = (caseId: string, iocIndex: number) => {
    setCases(cases.map(c => {
      if (c.id === caseId) {
        const updatedIOCs = c.iocs.filter((_, idx) => idx !== iocIndex)
        const updated = { ...c, iocs: updatedIOCs, lastUpdated: new Date().toISOString() }
        if (selectedCase?.id === caseId) {
          setSelectedCase(updated)
        }
        return updated
      }
      return c
    }))
    showToast('IOC deleted', 'success')
  }

  const updateCaseDetails = (caseId: string, updates: Partial<IncidentCase>) => {
    setCases(cases.map(c => {
      if (c.id === caseId) {
        const updated = { ...c, ...updates, lastUpdated: new Date().toISOString() }
        if (selectedCase?.id === caseId) {
          setSelectedCase(updated)
        }
        return updated
      }
      return c
    }))
    setEditingCase(null)
    showToast('Case updated', 'success')
  }

  const deleteCase = async (id: string) => {
    try {
      const response = await fetch('/api/incidents', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })

      if (!response.ok) throw new Error('Failed to delete case')

      const updatedCases = cases.filter(c => c.id !== id)
      setCases(updatedCases)
      setSelectedCase(null)
      console.log('[v0] Incident case deleted:', id)
      showToast('Incident case deleted successfully', 'success')
    } catch (error) {
      console.log('[v0] Error deleting case:', error)
      showToast('Failed to delete incident case. Please try again.', 'error')
    }
  }

  const addIOCToCase = async (caseId: string) => {
    if (!newIOCInput.trim()) {
      showToast('Please enter at least one IOC', 'error')
      return
    }

    if (!selectedCase) return

    try {
      // Parse new IOCs
      const iocLines = newIOCInput.split('\n').filter(line => line.trim())
      const newIOCs: IOC[] = []

      for (const line of iocLines) {
        const ioc = parseIOC(line)
        if (ioc) {
          newIOCs.push(ioc)
        }
      }

      if (newIOCs.length === 0) {
        showToast('No valid IOCs found in input', 'error')
        return
      }

      // Add new IOCs to existing ones
      const updatedIOCs = [...selectedCase.iocs, ...newIOCs]

      // Update case
      const response = await fetch('/api/incidents', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: caseId, iocs: updatedIOCs }),
      })

      if (!response.ok) throw new Error('Failed to update case')

      const result = await response.json()
      const updatedCases = cases.map(c => c.id === caseId ? result.case : c)
      setCases(updatedCases)
      setSelectedCase(result.case)

      setNewIOCInput('')
      setShowAddIOCForm(false)
      showToast(`Added ${newIOCs.length} new IOC(s) to case`, 'success')
    } catch (error) {
      console.log('[v0] Error adding IOC to case:', error)
      showToast('Failed to add IOC to case', 'error')
    }
  }

  const updateCaseStatus = async (id: string, newStatus: IncidentCase['status']) => {
    try {
      const response = await fetch('/api/incidents', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      })

      if (!response.ok) throw new Error('Failed to update case')

      const result = await response.json()
      const updatedCases = cases.map(c =>
        c.id === id ? result.case : c
      )
      setCases(updatedCases)
      
      if (selectedCase?.id === id) {
        setSelectedCase(result.case)
      }
      
      console.log('[v0] Incident case status updated:', id, 'to', newStatus)
      showToast(`Case status updated to ${newStatus}`, 'success')
    } catch (error) {
      console.log('[v0] Error updating case status:', error)
      showToast('Failed to update case status. Please try again.', 'error')
    }
  }

  const scanIOC = async (ioc: IOC) => {
    setLoadingScanSummary(true)
    setShowScanSummary(true)
    
    try {
      const response = await fetch(`/api/scan?type=${ioc.type}&query=${encodeURIComponent(ioc.value)}`)
      const result = await response.json()
      setScanSummary(result)
    } catch (error) {
      showToast('Failed to load scan summary', 'error')
      setShowScanSummary(false)
    } finally {
      setLoadingScanSummary(false)
    }
  }

  const filteredCases = cases.filter(c =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.iocs.some(ioc => ioc.value.includes(searchTerm))
  )

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return '#ff0000'
      case 'HIGH': return '#ff9800'
      case 'MEDIUM': return '#ffc107'
      default: return '#4caf50'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return { bg: '#0891b2', border: '#06b6d4', text: '#06b6d4' } // cyan
      case 'IN_PROGRESS': return { bg: '#f59e0b', border: '#fbbf24', text: '#fbbf24' } // amber
      case 'CLOSED': return { bg: '#8b5cf6', border: '#c4b5fd', text: '#c4b5fd' } // violet
      default: return { bg: '#6366f1', border: '#818cf8', text: '#818cf8' } // indigo
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <AlertTriangle className="w-4 h-4" style={{ color: '#06b6d4' }} />
      case 'IN_PROGRESS':
        return <Clock className="w-4 h-4" style={{ color: '#fbbf24' }} />
      case 'CLOSED':
        return <CheckCircle className="w-4 h-4" style={{ color: '#c4b5fd' }} />
      default:
        return <AlertTriangle className="w-4 h-4" style={{ color: '#818cf8' }} />
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-mono">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-background/98 backdrop-blur-md border-b border-primary/40 px-6 py-4 z-50 shadow-lg shadow-primary/20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-sm border-2 border-primary flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/50">
              <AlertTriangle className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-primary tracking-[0.15em]">INCIDENT CASE MANAGEMENT</h1>
              <p className="text-xs text-primary/60 tracking-wider">▸ SOC INVESTIGATION TOOLKIT ▸</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link href="/">
              <Button variant="outline" size="sm" className="border border-primary/70 text-primary bg-transparent hover:bg-primary/10 hover:text-white hover:shadow-lg hover:shadow-primary/30 whitespace-nowrap transition-all duration-300 text-xs font-bold">
                <Home className="w-4 h-4 mr-1" />
                HOME
              </Button>
            </Link>
            <Link href="/scanner">
              <Button variant="outline" size="sm" className="border border-primary/70 text-primary bg-transparent hover:bg-primary/10 hover:text-white hover:shadow-lg hover:shadow-primary/30 whitespace-nowrap transition-all duration-300 text-xs font-bold">
                <Search className="w-4 h-4 mr-1" />
                SCANNER
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-16 mt-28 relative z-10">
        {/* Create Case Button */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-primary tracking-wider">INCIDENT CASES</h2>
          <Button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="border border-primary bg-transparent hover:bg-primary/10 text-primary font-bold px-6 py-2 transition-all"
          >
            <Plus className="w-4 h-4 mr-2" />
            NEW CASE
          </Button>
        </div>

        {/* Create Case Form */}
        {showCreateForm && (
          <div className="cyber-card p-8 rounded-lg mb-8 border border-primary/40">
            <h3 className="text-lg font-bold text-primary mb-6 tracking-wide">CREATE NEW INCIDENT CASE</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-primary font-bold mb-2 block">CASE TITLE</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Suspicious Malware Campaign"
                  className="w-full px-4 py-2 bg-secondary/30 border border-primary/30 text-foreground placeholder-primary/40 rounded text-sm focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs text-primary font-bold mb-2 block">DESCRIPTION</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Provide context and details about this incident"
                  className="w-full px-4 py-2 bg-secondary/30 border border-primary/30 text-foreground placeholder-primary/40 rounded text-sm focus:outline-none focus:border-primary h-24"
                />
              </div>

              <div>
                <label className="text-xs text-primary font-bold mb-2 block">SEVERITY</label>
                <select
                  value={formData.severity}
                  onChange={(e) => setFormData({ ...formData, severity: e.target.value as any })}
                  className="w-full px-4 py-2 bg-secondary/30 border border-primary/30 text-foreground rounded text-sm focus:outline-none focus:border-primary"
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="CRITICAL">CRITICAL</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-primary font-bold mb-2 block">IOC EVIDENCE (IP, DOMAIN, or HASH)</label>
                <p className="text-xs text-primary/60 mb-2">Enter one IOC per line (e.g., 192.168.1.1, malware.com, 5d41402abc4b2a76b9719d911017c592)</p>
                <textarea
                  value={formData.iocInput}
                  onChange={(e) => setFormData({ ...formData, iocInput: e.target.value })}
                  placeholder="192.168.1.1&#10;malware.com&#10;5d41402abc4b2a76b9719d911017c592"
                  className="w-full px-4 py-2 bg-secondary/30 border border-primary/30 text-foreground placeholder-primary/40 rounded text-sm focus:outline-none focus:border-primary h-32 font-mono"
                />
              </div>

              <div>
                <label className="text-xs text-primary font-bold mb-2 block">TAGS (comma-separated)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="e.g., malware, phishing, ransomware"
                  className="w-full px-4 py-2 bg-secondary/30 border border-primary/30 text-foreground placeholder-primary/40 rounded text-sm focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleCreateCase}
                  className="border border-primary bg-transparent hover:bg-primary/20 text-primary font-bold px-6 py-2 transition-all"
                >
                  CREATE CASE
                </Button>
                <Button
                  onClick={() => setShowCreateForm(false)}
                  className="border border-primary/50 bg-transparent hover:bg-secondary/30 text-primary/70 font-bold px-6 py-2 transition-all"
                >
                  CANCEL
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-8">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search cases by title or IOC value..."
            className="w-full px-4 py-3 bg-secondary/30 border border-primary/30 text-foreground placeholder-primary/40 rounded text-sm focus:outline-none focus:border-primary"
          />
        </div>

        {/* Cases Grid */}
        {loading ? (
          <div className="text-center text-primary/60">Loading cases...</div>
        ) : filteredCases.length === 0 ? (
          <div className="cyber-card p-8 rounded-lg text-center border border-primary/20">
            <p className="text-primary/60">No incident cases found. Create your first case to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCases.map((incidentCase) => (
              <button
                key={incidentCase.id}
                onClick={() => setSelectedCase(incidentCase)}
                className="cyber-card p-6 rounded-lg border transition-all text-left"
                style={{
                  borderColor: getSeverityColor(incidentCase.severity) + '40',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = getSeverityColor(incidentCase.severity) + '80'
                  e.currentTarget.style.boxShadow = `0 0 15px ${getSeverityColor(incidentCase.severity)}40`
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = getSeverityColor(incidentCase.severity) + '40'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-sm font-bold text-primary flex-1">{incidentCase.title}</h3>
                  {getStatusIcon(incidentCase.status)}
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className="px-2 py-1 text-xs font-bold rounded"
                    style={{ backgroundColor: getSeverityColor(incidentCase.severity) + '20', color: getSeverityColor(incidentCase.severity) }}
                  >
                    {incidentCase.severity}
                  </span>
                  <span
                    className="px-2 py-1 text-xs font-bold rounded"
                    style={{
                      backgroundColor: getStatusColor(incidentCase.status).bg + '20',
                      color: getStatusColor(incidentCase.status).text,
                      border: `1px solid ${getStatusColor(incidentCase.status).border}40`
                    }}
                  >
                    {incidentCase.status}
                  </span>
                </div>
                <p className="text-xs text-primary/60 mb-3 line-clamp-2">{incidentCase.description}</p>
                <p className="text-xs font-bold text-primary mb-2">{incidentCase.iocs.length} IOCs</p>
                <div className="flex flex-wrap gap-1">
                  {incidentCase.iocs.slice(0, 3).map((ioc, idx) => (
                    <span key={idx} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded border border-primary/20">
                      {ioc.type.toUpperCase()}
                    </span>
                  ))}
                  {incidentCase.iocs.length > 3 && <span className="text-xs text-primary/60">+{incidentCase.iocs.length - 3}</span>}
                </div>
              </button>
            ))}
          </div>
        )}
      </main>

      {/* Case Detail Modal */}
      {selectedCase && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="cyber-card p-8 rounded-lg border border-primary/40 max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-6">
              {editingCase?.id === selectedCase?.id ? (
                <div className="flex-1 space-y-4">
                  <input
                    type="text"
                    value={editingCase.title}
                    onChange={(e) => setEditingCase({ ...editingCase, title: e.target.value })}
                    className="w-full text-xl font-bold text-primary bg-secondary/30 border border-primary/30 rounded px-3 py-2 focus:outline-none focus:border-primary"
                    placeholder="Case title..."
                  />
                  <textarea
                    value={editingCase.description}
                    onChange={(e) => setEditingCase({ ...editingCase, description: e.target.value })}
                    className="w-full text-sm text-primary/80 bg-secondary/30 border border-primary/30 rounded px-3 py-2 focus:outline-none focus:border-primary h-16"
                    placeholder="Case description..."
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateCaseDetails(selectedCase.id, {
                        title: editingCase.title,
                        description: editingCase.description,
                        severity: editingCase.severity
                      })}
                      className="px-4 py-2 bg-primary/20 text-primary hover:bg-primary/40 rounded text-xs font-bold transition-all"
                    >
                      SAVE
                    </button>
                    <button
                      onClick={() => setEditingCase(null)}
                      className="px-4 py-2 bg-secondary/30 text-primary/60 hover:text-primary rounded text-xs font-bold transition-all"
                    >
                      CANCEL
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <h2 className="text-xl font-bold text-primary mb-2">{selectedCase.title}</h2>
                  <p className="text-xs text-primary/60">ID: {selectedCase.id}</p>
                </div>
              )}
              <button
                onClick={() => setSelectedCase(null)}
                className="text-primary/60 hover:text-primary text-xl ml-4 flex-shrink-0"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Description */}
              <div>
                <p className="text-xs text-primary font-bold mb-2">DESCRIPTION</p>
                <p className="text-sm text-primary/80">{selectedCase.description}</p>
              </div>

              {/* Status & Severity & Edit */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-primary font-bold mb-2">SEVERITY</p>
                  {editingCase?.id === selectedCase?.id ? (
                    <select
                      value={editingCase.severity}
                      onChange={(e) => setEditingCase({ ...editingCase, severity: e.target.value as any })}
                      className="px-3 py-1 text-xs font-bold rounded bg-secondary/30 border border-primary/30 text-primary focus:outline-none focus:border-primary w-full"
                    >
                      <option value="LOW">LOW</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="HIGH">HIGH</option>
                      <option value="CRITICAL">CRITICAL</option>
                    </select>
                  ) : (
                    <span
                      className="px-3 py-1 text-xs font-bold rounded inline-block"
                      style={{ backgroundColor: getSeverityColor(selectedCase.severity) + '20', color: getSeverityColor(selectedCase.severity) }}
                    >
                      {selectedCase.severity}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-xs text-primary font-bold mb-2">STATUS</p>
                  <div className="flex gap-1">
                    {(['OPEN', 'IN_PROGRESS', 'CLOSED'] as const).map((status) => {
                      const colors = getStatusColor(status)
                      const isActive = selectedCase.status === status
                      
                      return (
                        <button
                          key={status}
                          onClick={() => updateCaseStatus(selectedCase.id, status)}
                          className="text-xs px-2 py-1 rounded transition-all font-bold border text-center"
                          style={{
                            backgroundColor: isActive ? colors.bg + '30' : 'transparent',
                            color: colors.text,
                            borderColor: isActive ? colors.border : colors.border + '40',
                            boxShadow: isActive ? `0 0 8px ${colors.border}40` : 'none',
                          }}
                        >
                          {status === 'IN_PROGRESS' ? 'IN_PROG' : status}
                        </button>
                      )
                    })}
                  </div>
                </div>
                <div className="flex items-end">
                  {editingCase?.id === selectedCase?.id ? (
                    <button
                      onClick={() => updateCaseDetails(selectedCase.id, {
                        title: editingCase.title,
                        description: editingCase.description,
                        severity: editingCase.severity
                      })}
                      className="w-full px-3 py-1 bg-green-500/20 text-green-400 hover:bg-green-500/40 rounded text-xs font-bold transition-all"
                    >
                      SAVE
                    </button>
                  ) : (
                    <button
                      onClick={() => setEditingCase(selectedCase)}
                      className="w-full px-3 py-1 bg-primary/20 text-primary hover:bg-primary/40 rounded text-xs font-bold transition-all"
                    >
                      EDIT CASE
                    </button>
                  )}
                </div>
              </div>

              {/* IOCs */}
              <div>
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-xs text-primary font-bold">IOC EVIDENCE ({selectedCase.iocs.length})</p>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {(() => {
                          const typeCount: { [key: string]: number } = {}
                          selectedCase.iocs.forEach(ioc => {
                            typeCount[ioc.type] = (typeCount[ioc.type] || 0) + 1
                          })
                          return Object.entries(typeCount).map(([type, count]) => (
                            <span key={type} className="text-xs px-2 py-1 bg-primary/20 text-primary rounded font-bold">
                              {type.toUpperCase()} ({count})
                            </span>
                          ))
                        })()}
                      </div>
                    </div>
                    <button
                      onClick={() => setShowAddIOCForm(!showAddIOCForm)}
                      className="text-xs px-2 py-1 bg-primary/20 text-primary hover:bg-primary/40 rounded transition-all whitespace-nowrap"
                    >
                      {showAddIOCForm ? 'CANCEL' : '+ ADD IOC'}
                    </button>
                  </div>
                </div>

                {/* Add IOC Form */}
                {showAddIOCForm && (
                  <div className="p-4 bg-secondary/20 border border-primary/20 rounded mb-4 space-y-3">
                    <div>
                      <p className="text-xs text-primary/60 mb-2">Enter one IOC per line (IP, domain, or hash)</p>
                      <textarea
                        value={newIOCInput}
                        onChange={(e) => setNewIOCInput(e.target.value)}
                        placeholder="192.168.1.1&#10;malware.com&#10;5d41402abc4b2a76b9719d911017c592"
                        className="w-full px-3 py-2 bg-secondary/30 border border-primary/30 text-foreground placeholder-primary/40 rounded text-xs focus:outline-none focus:border-primary font-mono h-20"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => addIOCToCase(selectedCase.id)}
                        className="flex-1 px-3 py-1 text-xs bg-primary/20 text-primary hover:bg-primary/40 rounded transition-all font-bold"
                      >
                        ADD IOC(S)
                      </button>
                      <button
                        onClick={() => {
                          setShowAddIOCForm(false)
                          setNewIOCInput('')
                        }}
                        className="px-3 py-1 text-xs bg-secondary/30 text-primary/60 hover:text-primary rounded transition-all"
                      >
                        CANCEL
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {selectedCase.iocs.map((ioc, idx) => (
                    <div key={idx} className="p-3 bg-secondary/30 border border-primary/20 rounded flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-xs font-bold text-primary">{ioc.type.toUpperCase()}</p>
                        <p className="text-sm font-mono text-foreground truncate">{ioc.value}</p>
                        <p className="text-xs text-primary/60">Scan: {new Date(ioc.scanDate).toLocaleDateString()}</p>
                      </div>
                      <div className="flex gap-2 ml-2">
                        <button
                          onClick={() => scanIOC(ioc)}
                          className="px-3 py-1 text-xs bg-primary/20 text-primary hover:bg-primary/40 rounded whitespace-nowrap"
                        >
                          SCAN
                        </button>
                        <button
                          onClick={() => deleteIOC(selectedCase.id, idx)}
                          className="px-2 py-1 text-xs bg-red-500/20 text-red-400 hover:bg-red-500/40 rounded whitespace-nowrap"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tags */}
              {selectedCase.tags.length > 0 && (
                <div>
                  <p className="text-xs text-primary font-bold mb-2">TAGS</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedCase.tags.map((tag, idx) => (
                      <span key={idx} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded border border-primary/20">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-primary font-bold mb-1">CREATED</p>
                  <p className="text-primary/60">{new Date(selectedCase.createdDate).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-primary font-bold mb-1">LAST UPDATED</p>
                  <p className="text-primary/60">{new Date(selectedCase.lastUpdated).toLocaleString()}</p>
                </div>
              </div>

              {/* Delete Button */}
              <div className="flex gap-3 pt-4 border-t border-primary/20">
                <button
                  onClick={() => deleteCase(selectedCase.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-destructive/20 text-destructive hover:bg-destructive/40 rounded text-xs font-bold transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                  DELETE CASE
                </button>
                <button
                  onClick={() => setSelectedCase(null)}
                  className="flex-1 px-4 py-2 border border-primary/40 text-primary hover:bg-primary/10 rounded text-xs font-bold transition-all"
                >
                  CLOSE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* IOC Scan Summary Modal */}
      {showScanSummary && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-secondary/40 border border-primary/50 rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl shadow-primary/20">
            {/* Close Button */}
            <div className="sticky top-0 right-0 p-4 flex justify-end z-10 bg-secondary/40 backdrop-blur-sm">
              <button
                onClick={() => setShowScanSummary(false)}
                className="text-primary/60 hover:text-primary text-2xl font-bold transition-colors"
              >
                ✕
              </button>
            </div>

            {loadingScanSummary ? (
              <div className="text-center py-16">
                <div className="inline-block w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mb-3" />
                <p className="text-primary/60 text-sm">Analyzing IOC...</p>
              </div>
            ) : scanSummary ? (
              <div className="p-6 space-y-4">
                {/* Header Section with Target and Risk */}
                <div className="border-b border-primary/30 pb-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <p className="text-xs text-primary font-bold">TARGET</p>
                        <span className={`text-xs font-bold px-2 py-1 rounded ${
                          scanSummary.scanType === 'domain' ? 'bg-blue-500/20 text-blue-400' :
                          scanSummary.scanType === 'email' ? 'bg-purple-500/20 text-purple-400' :
                          'bg-cyan-500/20 text-cyan-400'
                        }`}>
                          {scanSummary.scanType?.toUpperCase() || 'IP'}
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-foreground font-mono break-all mb-1">{scanSummary.query}</p>
                      <div className="h-1 w-32 bg-gradient-to-r from-primary to-primary/40 rounded-full"></div>
                    </div>
                    <div
                      className="px-4 py-2 rounded border"
                      style={{
                        backgroundColor:
                          scanSummary.threatLevel === 'critical'
                            ? 'rgba(255, 0, 0, 0.1)'
                            : scanSummary.threatLevel === 'high'
                            ? 'rgba(255, 152, 0, 0.1)'
                            : scanSummary.threatLevel === 'medium'
                            ? 'rgba(255, 193, 7, 0.1)'
                            : 'rgba(76, 175, 80, 0.1)',
                        borderColor:
                          scanSummary.threatLevel === 'critical'
                            ? '#ff0000'
                            : scanSummary.threatLevel === 'high'
                            ? '#ff9800'
                            : scanSummary.threatLevel === 'medium'
                            ? '#ffc107'
                            : '#4caf50',
                        color:
                          scanSummary.threatLevel === 'critical'
                            ? '#ff0000'
                            : scanSummary.threatLevel === 'high'
                            ? '#ff9800'
                            : scanSummary.threatLevel === 'medium'
                            ? '#ffc107'
                            : '#4caf50',
                      }}
                    >
                      <p className="text-xs font-bold">
                        {scanSummary.threatLevel === 'critical' || scanSummary.threatLevel === 'high'
                          ? 'HIGH RISK'
                          : scanSummary.threatLevel === 'medium'
                          ? 'MEDIUM RISK'
                          : 'LOW RISK'}
                      </p>
                    </div>
                  </div>

                  {/* Scan Metadata */}
                  <div className="grid grid-cols-4 gap-4 text-xs">
                    <div>
                      <p className="text-primary/60 font-bold mb-1">SCAN TYPE</p>
                      <p className="text-foreground font-bold">{scanSummary.type?.toUpperCase() || 'IP'}</p>
                    </div>
                    <div>
                      <p className="text-primary/60 font-bold mb-1">TIMESTAMP</p>
                      <p className="text-foreground font-bold">
                        {new Date().toLocaleDateString()}, {new Date().toLocaleTimeString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-primary/60 font-bold mb-1">DATABASES CHECKED</p>
                      <p className="text-foreground font-bold">{scanSummary.threats?.length || 0}</p>
                    </div>
                    <div>
                      <p className="text-primary/60 font-bold mb-1">SCAN DURATION</p>
                      <p className="text-foreground font-bold">0.6s</p>
                    </div>
                  </div>
                </div>

                {/* Two Column Layout */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Left: Threat Intelligence */}
                  {(() => {
                    const hasThreats = scanSummary.threats && scanSummary.threats.some((t: any) => t.detected)
                    return (
                      <div
                        className={`rounded-lg p-4 space-y-2 border ${
                          hasThreats
                            ? 'border-red-500/50 bg-red-500/5'
                            : 'border-primary/30 bg-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-4">
                          <AlertTriangle className={`w-4 h-4 ${hasThreats ? 'text-red-500' : 'text-primary'}`} />
                          <h3 className={`text-sm font-bold ${hasThreats ? 'text-red-500' : 'text-primary'}`}>
                            THREAT INTELLIGENCE
                          </h3>
                        </div>

                        {scanSummary.threats && scanSummary.threats.length > 0 ? (
                          <div className="space-y-3">
                            {scanSummary.threats.map((threat: any, idx: number) => (
                              <div key={idx} className="pb-3 border-b border-primary/20 last:border-b-0">
                                <div className="flex items-start gap-2">
                                  <div
                                    className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 ${
                                      threat.detected
                                        ? 'bg-red-500/20'
                                        : 'bg-green-500/20'
                                    }`}
                                  >
                                    <span
                                      className={`text-xs font-bold ${
                                        threat.detected
                                          ? 'text-red-400'
                                          : 'text-green-400'
                                      }`}
                                    >
                                      {threat.detected ? '✕' : '✓'}
                                    </span>
                                  </div>
                                  <div className="flex-1">
                                    <p className={`text-xs font-bold ${threat.detected ? 'text-red-400' : 'text-foreground'}`}>
                                      {threat.name}
                                    </p>
                                    <p className={`text-xs mt-0.5 ${threat.detected ? 'text-red-500/60' : 'text-primary/60'}`}>
                                      {threat.description || 'No threats detected'}
                                    </p>
                                    {threat.name === 'VirusTotal Detection' && threat.details && (
                                      <div className="mt-2 grid grid-cols-4 gap-2 text-xs">
                                        <div className="bg-red-500/10 rounded px-2 py-1 border border-red-500/20">
                                          <p className="text-red-400 font-bold">{threat.details.maliciousEngines}</p>
                                          <p className="text-red-500/60">Malicious</p>
                                        </div>
                                        <div className="bg-yellow-500/10 rounded px-2 py-1 border border-yellow-500/20">
                                          <p className="text-yellow-400 font-bold">{threat.details.suspiciousEngines}</p>
                                          <p className="text-yellow-500/60">Suspicious</p>
                                        </div>
                                        <div className="bg-green-500/10 rounded px-2 py-1 border border-green-500/20">
                                          <p className="text-green-400 font-bold">{threat.details.undetectedEngines}</p>
                                          <p className="text-green-500/60">Undetected</p>
                                        </div>
                                        <div className="bg-primary/10 rounded px-2 py-1 border border-primary/20">
                                          <p className="text-primary font-bold">{threat.details.totalEngines}</p>
                                          <p className="text-primary/60">Total</p>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-primary/60">No threat intelligence data available</p>
                        )}
                      </div>
                    )
                  })()}
                

                  {/* Right: Geolocation Data */}
                  <div className="border border-primary/30 rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-2 mb-4">
                      <MapPin className="w-4 h-4 text-primary" />
                      <h3 className="text-sm font-bold text-primary">GEOLOCATION DATA</h3>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-primary/60">Country</span>
                        <span className="text-foreground font-bold">{scanSummary.geolocation?.country || '-'}</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-primary/60">City</span>
                        <span className="text-foreground font-bold">{scanSummary.geolocation?.city || '-'}</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-primary/60">Region</span>
                        <span className="text-foreground font-bold">{scanSummary.geolocation?.region || '-'}</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-primary/60">ISP</span>
                        <span className="text-foreground font-bold">{scanSummary.geolocation?.isp || '-'}</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-primary/60">ASN</span>
                        <span className="text-foreground font-bold">{scanSummary.geolocation?.asn || '-'}</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-primary/60">Organization</span>
                        <span className="text-foreground font-bold">{scanSummary.geolocation?.organization || '-'}</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-primary/60">Timezone</span>
                        <span className="text-foreground font-bold">{scanSummary.geolocation?.timezone || '-'}</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-primary/60">HOSTNAMES</span>
                        <span className="text-foreground font-bold text-right">{scanSummary.geolocation?.hostnames?.[0] || '-'}</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-primary/60">Coordinates</span>
                        <span className="text-foreground font-bold">
                          {scanSummary.geolocation?.latitude && scanSummary.geolocation?.longitude
                            ? `${scanSummary.geolocation.latitude}, ${scanSummary.geolocation.longitude}`
                            : '-'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Open Ports & Services Card */}
                {(scanSummary.network?.openPorts?.length > 0 || scanSummary.network?.services?.length > 0) && (
                  <div className="border border-primary/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-orange-400 text-lg">⚡</span>
                      <h3 className="text-sm font-bold text-primary">OPEN PORTS & SERVICES</h3>
                    </div>
                    <div className="space-y-2">
                      {scanSummary.network.services && scanSummary.network.services.length > 0 ? (
                        scanSummary.network.services.map((service: string, idx: number) => (
                          <div key={idx} className="text-xs py-1">
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 rounded bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                                <span className="text-orange-400 text-xs font-bold">⚡</span>
                              </div>
                              <span className="text-foreground font-mono text-xs">{service}</span>
                            </div>
                          </div>
                        ))
                      ) : scanSummary.network.openPorts && scanSummary.network.openPorts.length > 0 ? (
                        scanSummary.network.openPorts.map((port: number, idx: number) => (
                          <div key={idx} className="text-xs py-1">
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 rounded bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                                <span className="text-orange-400 text-xs font-bold">⚡</span>
                              </div>
                              <span className="text-foreground font-mono text-xs">Port {port}</span>
                            </div>
                          </div>
                        ))
                      ) : null}
                    </div>
                  </div>
                )}

                {/* Vulnerabilities Card */}
                {scanSummary.network?.vulnerabilities && scanSummary.network.vulnerabilities.length > 0 && (
                  <div className="border border-primary/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-red-400 text-lg">⚠</span>
                      <h3 className="text-sm font-bold text-primary">VULNERABILITIES</h3>
                    </div>
                    <div className="space-y-2">
                      {scanSummary.network.vulnerabilities.map((vuln: string, idx: number) => (
                        <div key={idx} className="text-xs py-1">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-red-500/20 flex items-center justify-center flex-shrink-0">
                              <span className="text-red-400 text-xs font-bold">⚠</span>
                            </div>
                            <span className="text-foreground">{vuln}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <div className="border-t border-primary/30 pt-4 flex gap-3">
                  <button
                    onClick={() => {
                      setShowScanSummary(false)
                      router.push(
                        `/results?type=${scanSummary.type || 'ip'}&query=${encodeURIComponent(scanSummary.query || '')}`
                      )
                    }}
                    className="flex-1 px-4 py-2 bg-primary/20 text-primary hover:bg-primary/40 rounded-lg text-xs font-bold transition-all border border-primary/50"
                  >
                    VIEW FULL REPORT
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6">
                <p className="text-primary/60 text-sm text-center">Failed to load scan summary</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      <div className="fixed bottom-6 right-6 z-40 space-y-3 max-w-sm">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`p-4 rounded-lg border shadow-lg animate-in slide-in-from-right fade-in transition-all ${
              toast.type === 'success'
                ? 'bg-green-900/30 border-green-500/50 text-green-200'
                : toast.type === 'error'
                ? 'bg-red-900/30 border-red-500/50 text-red-200'
                : 'bg-blue-900/30 border-blue-500/50 text-blue-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {toast.type === 'success' && (
                <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                  <span className="text-green-400 text-sm font-bold">✓</span>
                </div>
              )}
              {toast.type === 'error' && (
                <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center">
                  <span className="text-red-400 text-sm font-bold">✕</span>
                </div>
              )}
              {toast.type === 'info' && (
                <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <span className="text-blue-400 text-sm font-bold">ℹ</span>
                </div>
              )}
              <span className="text-sm font-medium">{toast.message}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
