"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams, useRouter } from 'next/navigation'
import { Shield, ArrowLeft, AlertTriangle, CheckCircle, XCircle, Globe, Server, MapPin, FileText, Activity, Database, Download, Home } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

function ResultsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [showIncidentForm, setShowIncidentForm] = useState(false)
  const [incidentMode, setIncidentMode] = useState<"create" | "add">("create")
  const [incidentFormData, setIncidentFormData] = useState({
    title: '',
    description: '',
    severity: 'MEDIUM' as const,
  })
  const [existingIncidents, setExistingIncidents] = useState<any[]>([])
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>('')
  const [creatingIncident, setCreatingIncident] = useState(false)
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: 'success' | 'error' | 'info' }>>([])

  const type = searchParams.get("type")
  const query = searchParams.get("query")

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 4000)
  }

  const loadExistingIncidents = async () => {
    try {
      const response = await fetch('/api/incidents')
      if (!response.ok) throw new Error('Failed to fetch incidents')
      const result = await response.json()
      setExistingIncidents(result.cases || [])
    } catch (error) {
      console.log('[v0] Error loading incidents:', error)
      showToast('Failed to load incidents', 'error')
    }
  }

  const addToExistingIncident = async () => {
    if (!selectedIncidentId) {
      showToast('Please select an incident case', 'error')
      return
    }

    setCreatingIncident(true)
    try {
      const incidentToUpdate = existingIncidents.find(inc => inc.id === selectedIncidentId)
      if (!incidentToUpdate) throw new Error('Incident not found')

      const newIOC = {
        type: type?.toLowerCase() || 'ip',
        value: query,
        threatLevel: data?.threatLevel || 'unknown',
        scanDate: new Date().toISOString(),
      }

      const updatedIncident = {
        ...incidentToUpdate,
        iocs: [...(incidentToUpdate.iocs || []), newIOC],
        lastUpdated: new Date().toISOString(),
      }

      const response = await fetch('/api/incidents', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedIncident),
      })

      if (!response.ok) throw new Error('Failed to update incident')

      showToast(`IOC added to incident case "${incidentToUpdate.title}" successfully!`, 'success')
      setShowIncidentForm(false)
      setSelectedIncidentId('')

      // Navigate to incidents page after toast shows
      setTimeout(() => {
        router.push('/incidents')
      }, 2000)
    } catch (error) {
      console.log('[v0] Error adding to incident:', error)
      showToast('Failed to add IOC to incident case. Please try again.', 'error')
    } finally {
      setCreatingIncident(false)
    }
  }

  useEffect(() => {
    if (!type || !query) {
      router.push("/scanner")
      return
    }

    const fetchData = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/scan?type=${type}&query=${encodeURIComponent(query)}`)
        const result = await response.json()
        setData(result)
      } catch (error) {
        console.error("Scan error:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [type, query, router])

  const createIncidentCase = async () => {
    if (!incidentFormData.title.trim()) {
      showToast('Please enter a case title', 'error')
      return
    }

    setCreatingIncident(true)
    try {
      const newCase = {
        title: incidentFormData.title,
        description: incidentFormData.description,
        severity: incidentFormData.severity,
        iocs: [
          {
            type: type?.toLowerCase() || 'ip',
            value: query,
            scanDate: new Date().toISOString(),
          }
        ],
        tags: [type?.toUpperCase() || 'IOC'],
      }

      const response = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCase),
      })

      if (!response.ok) throw new Error('Failed to create case')

      const result = await response.json()
      showToast(`Incident case created successfully! Case ID: ${result.case.id}`, 'success')
      setShowIncidentForm(false)
      setIncidentFormData({ title: '', description: '', severity: 'MEDIUM' })
      
      // Navigate to incidents page after toast shows
      setTimeout(() => {
        router.push('/incidents')
      }, 2000)
    } catch (error) {
      console.log('[v0] Error creating incident case:', error)
      showToast('Failed to create incident case. Please try again.', 'error')
    } finally {
      setCreatingIncident(false)
    }
  }

  const exportToPDF = async () => {
    setExporting(true)
    try {
      const { jsPDF } = await import("jspdf")
      const doc = new jsPDF()

      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      const margin = 15
      let yPos = margin

      const checkPageBreak = (requiredSpace = 20) => {
        if (yPos + requiredSpace > pageHeight - margin) {
          doc.addPage()
          yPos = margin
          return true
        }
        return false
      }

      const addSectionHeader = (title: string, color: [number, number, number] = [0, 200, 100]) => {
        checkPageBreak(15)
        doc.setFillColor(color[0], color[1], color[2])
        doc.rect(margin, yPos, pageWidth - 2 * margin, 8, "F")
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(11)
        doc.setFont("helvetica", "bold")
        doc.text(title, margin + 3, yPos + 6)
        yPos += 12
        doc.setTextColor(0, 0, 0)
      }

      // Title Header
      doc.setFillColor(15, 23, 42)
      doc.rect(0, 0, pageWidth, 50, "F")
      doc.setTextColor(0, 200, 100)
      doc.setFontSize(26)
      doc.setFont("helvetica", "bold")
      doc.text("ADVANCED OSINT PLATFORM", pageWidth / 2, 20, { align: "center" })
      doc.setTextColor(150, 150, 150)
      doc.setFontSize(12)
      doc.setFont("helvetica", "normal")
      doc.text("Professional Threat Intelligence Report", pageWidth / 2, 32, { align: "center" })

      // Report metadata
      doc.setFontSize(9)
      doc.text(
        `Generated: ${new Date().toLocaleString()} | Target: ${query} | Type: ${type?.toUpperCase()}`,
        pageWidth / 2,
        42,
        { align: "center" },
      )

      yPos = 58
      doc.setTextColor(0, 0, 0)

      // Scan Summary
      addSectionHeader("SCAN SUMMARY", [0, 150, 75])
      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")

      const threatColor =
        data.threatLevel === "critical" ? [220, 38, 38] : data.threatLevel === "high" ? [245, 85, 20] : [34, 197, 94]
      doc.setFillColor(threatColor[0], threatColor[1], threatColor[2])
      doc.rect(pageWidth - margin - 40, yPos - 8, 38, 8, "F")
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(8)
      doc.setFont("helvetica", "bold")
      doc.text(`${data.threatLevel?.toUpperCase() || "N/A"}`, pageWidth - margin - 20, yPos - 2, { align: "center" })
      doc.setTextColor(0, 0, 0)
      doc.setFont("helvetica", "normal")

      doc.text(`Target: ${query}`, margin + 5, yPos)
      yPos += 6
      doc.text(`Type: ${type?.toUpperCase()}`, margin + 5, yPos)
      yPos += 6
      doc.text(`Timestamp: ${new Date().toLocaleString()}`, margin + 5, yPos)
      yPos += 6
      doc.text(`Databases Checked: ${data.databasesChecked || 12}`, margin + 5, yPos)
      yPos += 12

      // Threat Intelligence
      if (data.threats && data.threats.length > 0) {
        addSectionHeader("THREAT INTELLIGENCE", [220, 38, 38])
        
        // Helper function to decode HTML entities
        const decodeHTMLEntities = (text: string) => {
          const textarea = typeof document !== 'undefined' ? document.createElement('textarea') : null
          if (textarea) {
            textarea.innerHTML = text
            return textarea.value
          }
          // Fallback for server-side: basic entity replacement
          return text
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&apos;/g, "'")
            .replace(/&nbsp;/g, ' ')
        }
        
        data.threats.forEach((threat: any) => {
          checkPageBreak(12)
          doc.setFontSize(10)
          doc.setFont("helvetica", "bold")
          const threatColor = threat.detected ? [220, 38, 38] : [34, 197, 94]
          doc.setTextColor(threatColor[0], threatColor[1], threatColor[2])
          
          // Decode threat name from HTML entities and remove extra symbols
          const decodedName = decodeHTMLEntities(threat.name)
          const cleanName = decodedName.replace(/^[&'\s]+/, "").trim()
          doc.text(`${threat.detected ? "⚠" : "✓"} ${cleanName}`, margin + 5, yPos)
          yPos += 5
          doc.setFont("helvetica", "normal")
          doc.setTextColor(80, 80, 80)
          doc.setFontSize(9)
          
          // Decode description from HTML entities
          const decodedDesc = decodeHTMLEntities(threat.description)
          const desc = doc.splitTextToSize(decodedDesc, pageWidth - 2 * margin - 10)
          desc.forEach((line: string) => {
            checkPageBreak()
            doc.text(line, margin + 8, yPos)
            yPos += 4
          })
          yPos += 2
        })
        yPos += 5
      }

      // Network Information (for IP scans from Shodan)
      if (data.network && (data.network.openPorts?.length > 0 || data.network.services?.length > 0)) {
        addSectionHeader("NETWORK INFORMATION (SHODAN)", [100, 150, 200])
        doc.setFontSize(10)
        doc.setFont("helvetica", "normal")

        if (data.network.os && data.network.os !== "Unknown") {
          checkPageBreak()
          doc.text(`Operating System: ${data.network.os}`, margin + 5, yPos)
          yPos += 5
        }

        if (data.network.openPorts?.length > 0) {
          checkPageBreak()
          doc.text(`Open Ports (${data.network.openPorts.length}): ${data.network.openPorts.join(", ")}`, margin + 5, yPos)
          yPos += 5
        }

        if (data.network.services?.length > 0) {
          checkPageBreak()
          doc.setFontSize(9)
          doc.text("Detected Services:", margin + 5, yPos)
          yPos += 4
          data.network.services.slice(0, 10).forEach((service: string) => {
            checkPageBreak()
            doc.text(service, margin + 8, yPos)
            yPos += 4
          })
        }

        if (data.network.tags?.length > 0) {
          checkPageBreak()
          doc.text(`Infrastructure Tags: ${data.network.tags.join(", ")}`, margin + 5, yPos)
          yPos += 5
        }
        yPos += 5
      }


      // Reputation Score - for domain scans with data
      if (data.reputation && type === "domain") {
        addSectionHeader("REPUTATION SCORE", [150, 100, 200])
        doc.setFontSize(10)
        doc.setFont("helvetica", "normal")
        
        checkPageBreak()
        doc.setFont("helvetica", "bold")
        doc.setTextColor(0, 0, 0)
        doc.setFontSize(12)
        doc.text(`Score: ${data.reputation.score}/100`, margin + 5, yPos)
        yPos += 6
        
        doc.setFont("helvetica", "normal")
        doc.setFontSize(9)
        
        if (data.reputation.isWhitelisted) {
          doc.setTextColor(34, 197, 94)
          doc.text("Status: WHITELISTED", margin + 5, yPos)
        } else if (data.reputation.threatLevel === "critical") {
          doc.setTextColor(220, 38, 38)
          doc.text(`Status: ${data.reputation.threatLevel?.toUpperCase()}`, margin + 5, yPos)
        } else {
          doc.text(`Threat Level: ${data.reputation.threatLevel?.toUpperCase() || "UNKNOWN"}`, margin + 5, yPos)
        }
        yPos += 5
        
        doc.setTextColor(0, 0, 0)
        checkPageBreak()
        doc.text(`Abuse Reports: ${data.reputation.reports || 0}`, margin + 5, yPos)
        yPos += 5
        
        if (data.reputation.categories?.length > 0) {
          doc.text(`Threat Categories: ${data.reputation.categories.join(", ")}`, margin + 5, yPos)
          yPos += 5
        }
        yPos += 5
      }

      // Geolocation
      if (data.geolocation) {
        addSectionHeader("GEOLOCATION DATA", [59, 130, 246])
        doc.setFontSize(10)
        doc.setFont("helvetica", "normal")
        const geoKeys = ["country", "city", "isp", "asn", "coordinates", "organization", "timezone"]
        geoKeys.forEach((key) => {
          if (data.geolocation[key] && data.geolocation[key] !== "Unknown") {
            checkPageBreak()
            doc.text(`${key.charAt(0).toUpperCase() + key.slice(1)}: ${data.geolocation[key]}`, margin + 5, yPos)
            yPos += 5
          }
        })
        yPos += 5
      }

      // DNS Records
      if (data.dns) {
        addSectionHeader("DNS RECORDS", [0, 200, 100])
        doc.setFontSize(9)
        doc.setFont("helvetica", "normal")
        Object.entries(data.dns).forEach(([key, value]: [string, any]) => {
          if (value && value !== "Unknown" && value !== "None") {
            checkPageBreak()
            const text = `${key.toUpperCase()}: ${value}`
            const lines = doc.splitTextToSize(text, pageWidth - 2 * margin - 10)
            lines.forEach((line: string) => {
              doc.text(line, margin + 5, yPos)
              yPos += 4
            })
          }
        })
        yPos += 5
      }

      // Email Security
      if (data.emailSecurity) {
        addSectionHeader("EMAIL SECURITY (SPF/DMARC/DKIM)", [200, 150, 0])
        doc.setFontSize(9)
        doc.setFont("helvetica", "normal")
        checkPageBreak()
        doc.text(`SPF: ${data.emailSecurity.spf.exists ? "Configured" : "Not Found"}`, margin + 5, yPos)
        yPos += 4
        doc.text(`DMARC: ${data.emailSecurity.dmarc.exists ? `Configured (Policy: ${data.emailSecurity.dmarc.policy})` : "Not Found"}`, margin + 5, yPos)
        yPos += 4
        doc.text(`DKIM: ${data.emailSecurity.dkim.exists ? `${data.emailSecurity.dkim.selectors.length} selector(s)` : "Not Found"}`, margin + 5, yPos)
        yPos += 5
      }

      // SSL Certificate
      if (data.ssl) {
        addSectionHeader("SSL CERTIFICATE", [100, 200, 100])
        doc.setFontSize(9)
        doc.setFont("helvetica", "normal")
        checkPageBreak()
        doc.text(`Issuer: ${data.ssl.issuer}`, margin + 5, yPos)
        yPos += 4
        doc.text(`Valid From: ${data.ssl.validFrom}`, margin + 5, yPos)
        yPos += 4
        doc.text(`Valid Until: ${data.ssl.validUntil}`, margin + 5, yPos)
        yPos += 4
        if (data.ssl.algorithm) {
          doc.text(`Algorithm: ${data.ssl.algorithm}`, margin + 5, yPos)
          yPos += 4
        }
        yPos += 5
      }

      // Vulnerabilities
      if (data.vulnerabilities && data.vulnerabilities.length > 0) {
        addSectionHeader(`VULNERABILITIES (${data.vulnerabilities.length} CVEs)`, [220, 38, 38])
        doc.setFontSize(9)
        doc.setFont("helvetica", "normal")
        data.vulnerabilities.slice(0, 20).forEach((vuln: any) => {
          checkPageBreak()
          doc.text(`${vuln.cve} [${vuln.severity?.toUpperCase() || "UNKNOWN"}]`, margin + 5, yPos)
          yPos += 4
        })
        yPos += 5
      }

      // Email Leaks
      if (data.emailLeaks && data.emailLeaks.length > 0) {
        addSectionHeader("EMAIL LEAKED CREDENTIALS", [220, 38, 38])
        data.emailLeaks.forEach((leak: any) => {
          checkPageBreak(10)
          doc.setFontSize(10)
          doc.setFont("helvetica", "bold")
          doc.setTextColor(220, 38, 38)
          doc.text(`● ${leak.name}`, margin + 5, yPos)
          yPos += 5
          doc.setFont("helvetica", "normal")
          doc.setTextColor(0, 0, 0)
          doc.setFontSize(9)
          doc.text(`Affected: ${leak.affectedAccounts?.toLocaleString() || "Unknown"} | ${leak.date}`, margin + 8, yPos)
          yPos += 4
          if (leak.dataClasses?.length > 0) {
            doc.text(`Data: ${leak.dataClasses.join(", ")}`, margin + 8, yPos)
            yPos += 4
          }
        })
        yPos += 5
      }

      // Hash Analysis
      if (data.hashAnalysis) {
        addSectionHeader("HASH ANALYSIS", [180, 100, 200])
        doc.setFontSize(9)
        doc.setFont("helvetica", "normal")
        checkPageBreak()
        doc.text(`Status: ${data.hashAnalysis.malicious ? "MALICIOUS" : "CLEAN"}`, margin + 5, yPos)
        yPos += 4
        doc.text(`Detection: ${data.hashAnalysis.engines}`, margin + 5, yPos)
        yPos += 4
        if (data.hashAnalysis.fileType) {
          doc.text(`File Type: ${data.hashAnalysis.fileType}`, margin + 5, yPos)
          yPos += 4
        }
        if (data.hashAnalysis.fileSize) {
          doc.text(`Size: ${data.hashAnalysis.fileSize}`, margin + 5, yPos)
          yPos += 4
        }
        yPos += 5
      }

      // Asset Exposure
      if (data.assetExposure) {
        addSectionHeader("ASSET EXPOSURE DISCOVERY", [150, 100, 200])
        doc.setFontSize(9)
        doc.setFont("helvetica", "normal")
        checkPageBreak()
        doc.text(`Total Exposed Assets: ${data.assetExposure.totalAssets || 0}`, margin + 5, yPos)
        yPos += 4
        if (data.assetExposure.subdomains?.length > 0) {
          doc.text(`Discovered Subdomains: ${data.assetExposure.subdomains.length}`, margin + 5, yPos)
          yPos += 4
        }
        if (data.assetExposure.certificates?.length > 0) {
          doc.text(`SSL Certificates: ${data.assetExposure.certificates.length}`, margin + 5, yPos)
          yPos += 4
        }
        yPos += 5
      }

      // Dark Web Monitoring - Only for domain scans
      if (data.darkweb && type === "domain") {
        addSectionHeader("DARK WEB MONITORING", [0, 200, 100])
        doc.setFontSize(9)
        doc.setFont("helvetica", "normal")
        
        checkPageBreak()
        doc.text(`Data Breaches: ${data.darkweb?.breaches?.length || 0} detected`, margin + 5, yPos)
        yPos += 4
        
        doc.text(`Credential Leaks: ${Array.isArray(data.darkweb?.pasteLeaks) ? data.darkweb.pasteLeaks.length : (data.darkweb?.pasteLeaks?.count || 0)} found`, margin + 5, yPos)
        yPos += 4
        
        doc.text(`Malware Mentions: ${Array.isArray(data.darkweb?.mentions) ? data.darkweb.mentions.length : (data.darkweb?.mentions?.malwareCount || 0)}`, margin + 5, yPos)
        yPos += 4
        
        doc.text(`Marketplace Listings: ${Array.isArray(data.darkweb?.mentions) ? data.darkweb.mentions.length : (data.darkweb?.mentions?.marketplaceListings || 0)}`, margin + 5, yPos)
        yPos += 4
        
        doc.text(`Forum Discussions: ${Array.isArray(data.darkweb?.mentions) ? data.darkweb.mentions.length : (data.darkweb?.mentions?.forumMentions || 0)}`, margin + 5, yPos)
        yPos += 5
      }

      // Risk Assessment & Recommendations
      addSectionHeader("RISK ASSESSMENT & RECOMMENDATIONS", [220, 100, 100])
      doc.setFontSize(10)
      doc.setFont("helvetica", "bold")
      
      checkPageBreak(12)
      const detectedThreats = data.threats?.filter((t: any) => t.detected).length || 0
      const criticalFindings = (data.vulnerabilities?.length || 0) + detectedThreats
      
      doc.setTextColor(220, 38, 38)
      doc.text(`Critical Findings: ${criticalFindings}`, margin + 5, yPos)
      yPos += 6
      
      doc.setFont("helvetica", "normal")
      doc.setTextColor(0, 0, 0)
      doc.setFontSize(9)
      
      // Generate contextual recommendations
      const recommendations = []
      
      if (detectedThreats > 0) {
        recommendations.push(`1. IMMEDIATE: Review ${detectedThreats} detected threat(s). Isolate affected systems if active compromise is confirmed.`)
      }
      
      if (data.vulnerabilities?.length > 0) {
        const critVulns = data.vulnerabilities.filter((v: any) => v.severity?.toUpperCase() === 'CRITICAL').length
        if (critVulns > 0) {
          recommendations.push(`2. URGENT: Apply patches for ${critVulns} critical CVE(s). These require immediate remediation.`)
        } else {
          recommendations.push(`2. HIGH: Schedule patching for ${data.vulnerabilities.length} vulnerabilities within 30 days.`)
        }
      }
      
      if (data.emailSecurity && (!data.emailSecurity.spf.exists || !data.emailSecurity.dmarc.exists)) {
        recommendations.push(`3. IMPORTANT: Implement missing email authentication (SPF/DMARC/DKIM) to prevent spoofing attacks.`)
      }
      
      if (data.network?.openPorts?.length > 5) {
        recommendations.push(`4. MEDIUM: Review ${data.network.openPorts.length} open ports. Disable unnecessary services and restrict access.`)
      }
      
      if (data.emailLeaks?.length > 0) {
        recommendations.push(`5. HIGH: ${data.emailLeaks.length} email breach(es) detected. Update passwords and enable MFA.`)
      }
      
      if (data.darkweb?.breaches?.length > 0 || data.darkweb?.pasteLeaks?.length > 0) {
        recommendations.push(`6. CRITICAL: Domain/emails found on dark web. Monitor for credential abuse and implement threat hunting.`)
      }
      
      if (recommendations.length === 0) {
        recommendations.push(`No critical vulnerabilities detected. Continue regular security monitoring and assessments.`)
      }
      
      recommendations.forEach((rec: string) => {
        checkPageBreak(6)
        const lines = doc.splitTextToSize(rec, pageWidth - 2 * margin - 10)
        lines.forEach((line: string, idx: number) => {
          if (idx > 0) checkPageBreak(4)
          doc.text(line, margin + 5, yPos)
          yPos += 4
        })
        yPos += 2
      })
      yPos += 5

      // Technical Summary
      addSectionHeader("TECHNICAL SUMMARY", [100, 150, 200])
      doc.setFontSize(9)
      doc.setFont("helvetica", "normal")
      
      checkPageBreak()
      doc.text(`Database Sources Checked: ${data.databasesChecked || 12}`, margin + 5, yPos)
      yPos += 4
      doc.text(`Total Findings: ${criticalFindings}`, margin + 5, yPos)
      yPos += 4
      doc.text(`Threat Level: ${data.threatLevel?.toUpperCase() || "UNKNOWN"}`, margin + 5, yPos)
      yPos += 4
      doc.text(`Scan Duration: ${data.scanDuration || "N/A"}`, margin + 5, yPos)
      yPos += 4
      doc.text(`Report Generated: ${new Date().toLocaleString()}`, margin + 5, yPos)
      yPos += 5

      // Disclaimer
      addSectionHeader("DISCLAIMER & NEXT STEPS", [150, 150, 150])
      doc.setFontSize(8)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(100, 100, 100)
      
      checkPageBreak()
      const disclaimer = "This report is generated by the Advanced OSINT Platform using publicly available threat intelligence data. Findings are based on multiple databases and may vary based on data freshness. This report should not be considered exhaustive and should be validated with additional security assessments. For critical findings, immediate investigation and remediation is recommended. This report is confidential and intended for authorized recipients only."
      
      const disclaimerLines = doc.splitTextToSize(disclaimer, pageWidth - 2 * margin - 10)
      disclaimerLines.forEach((line: string) => {
        checkPageBreak(4)
        doc.text(line, margin + 5, yPos)
        yPos += 3
      })

      // Add Final Summary Page
      doc.addPage()
      yPos = margin
      
      // Summary page header
      doc.setFillColor(15, 23, 42)
      doc.rect(0, 0, pageWidth, 40, "F")
      doc.setTextColor(0, 200, 100)
      doc.setFontSize(18)
      doc.setFont("helvetica", "bold")
      doc.text("REPORT SUMMARY", pageWidth / 2, 15, { align: "center" })
      doc.setTextColor(150, 150, 150)
      doc.setFontSize(10)
      doc.text(`Generated on ${new Date().toLocaleString()}`, pageWidth / 2, 28, { align: "center" })
      
      yPos = 50
      doc.setTextColor(0, 0, 0)
      
      // Key Metrics Box
      doc.setFillColor(240, 240, 240)
      doc.rect(margin, yPos, pageWidth - 2 * margin, 60, "F")
      
      doc.setFontSize(11)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(0, 0, 0)
      doc.text("KEY METRICS", margin + 5, yPos + 5)
      
      yPos += 12
      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      
      const metrics = [
        `Target: ${query}`,
        `Scan Type: ${type?.toUpperCase()}`,
        `Threat Level: ${data.threatLevel?.toUpperCase() || "UNKNOWN"}`,
        `Total Issues Found: ${criticalFindings}`,
        `Databases Checked: ${data.databasesChecked || 12}`,
      ]
      
      metrics.forEach((metric) => {
        doc.text(metric, margin + 8, yPos)
        yPos += 6
      })
      
      yPos += 10
      
      // Recommendations Summary
      addSectionHeader("ACTION ITEMS", [220, 100, 100])
      doc.setFontSize(9)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(0, 0, 0)
      
      if (detectedThreats > 0) {
        doc.text(`• Review ${detectedThreats} active threat(s) immediately`, margin + 5, yPos)
        yPos += 5
      }
      
      if (data.vulnerabilities?.length > 0) {
        doc.text(`• Apply patches for ${data.vulnerabilities.length} CVE(s)`, margin + 5, yPos)
        yPos += 5
      }
      
      if (data.emailLeaks?.length > 0) {
        doc.text(`• Investigate ${data.emailLeaks.length} credential leak(s)`, margin + 5, yPos)
        yPos += 5
      }
      
      if (recommendations.length > 0) {
        doc.text(`• Follow ${recommendations.length} prioritized recommendations in report`, margin + 5, yPos)
        yPos += 5
      }
      
      yPos += 5
      
      // Next Steps
      addSectionHeader("NEXT STEPS", [100, 150, 200])
      doc.setFontSize(9)
      doc.setFont("helvetica", "normal")
      
      const nextSteps = [
        "1. Review all findings in detail",
        "2. Prioritize remediation based on threat level",
        "3. Implement recommended security controls",
        "4. Schedule follow-up scan in 30 days",
        "5. Document changes and maintain audit trail",
      ]
      
      nextSteps.forEach((step) => {
        checkPageBreak(5)
        doc.text(step, margin + 5, yPos)
        yPos += 5
      })

      // Footer with professional styling
      const totalPages = doc.getNumberOfPages()
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(128, 128, 128)
        doc.setDrawColor(0, 200, 100)
        doc.setLineWidth(0.3)
        doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12)
        doc.text(`Advanced OSINT Platform | Confidential Report | Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 8, {
          align: "center",
        })
        doc.setFontSize(7)
        doc.text(`Report ID: ${new Date().getTime()} | Data Retention: 90 days`, margin, pageHeight - 4)
      }

      const filename = `osint-report-${query}-${new Date().toISOString().split("T")[0]}.pdf`
      doc.save(filename)
    } catch (error) {
      console.error("[v0] PDF export error:", error)
      alert("Failed to export PDF. Please try again.")
    } finally {
      setExporting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-primary font-mono flex items-center justify-center relative overflow-hidden">
        {/* Animated grid background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(rgba(0, 255, 0, 0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 255, 0, 0.03) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            animation: 'grid-move 20s linear infinite'
          }} />
        </div>

        {/* Scanlines effect */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'repeating-linear-gradient(0deg, transparent 0px, rgba(0, 255, 0, 0.03) 1px, transparent 2px)',
          animation: 'scanline 8s linear infinite'
        }} />

        <div className="relative z-10 text-center">
          {/* Radar scanning animation */}
          <div className="relative w-64 h-64 mx-auto mb-8">
            {/* Multiple concentric circles */}
            <div className="absolute inset-0 border-2 border-primary/30 rounded-full" />
            <div className="absolute inset-8 border-2 border-primary/25 rounded-full" />
            <div className="absolute inset-16 border-2 border-primary/20 rounded-full" />
            <div className="absolute inset-24 border-2 border-primary/15 rounded-full" />
            
            {/* Center dot */}
            <div className="absolute top-1/2 left-1/2 w-3 h-3 -mt-1.5 -ml-1.5 bg-primary rounded-full shadow-[0_0_10px_rgba(0,255,0,0.8)]" />
            
            {/* Rotating radar line */}
            <div 
              className="absolute top-1/2 left-1/2 w-1/2 h-0.5 origin-left"
              style={{
                background: 'linear-gradient(90deg, rgba(0,255,0,0.8) 0%, transparent 100%)',
                animation: 'radar-sweep 3s linear infinite',
                boxShadow: '0 0 10px rgba(0,255,0,0.5)'
              }}
            />
            
            {/* Threat detection blips */}
            <div className="absolute top-1/4 right-1/3 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(255,0,0,0.8)]" />
            <div className="absolute bottom-1/3 left-1/4 w-2 h-2 bg-yellow-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(255,255,0,0.8)]" style={{ animationDelay: '0.5s' }} />
            <div className="absolute top-1/3 left-1/3 w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_8px_rgba(0,255,0,0.8)]" style={{ animationDelay: '1s' }} />
          </div>

          <div className="space-y-4">
            <p className="text-primary text-3xl font-bold tracking-[0.3em] animate-pulse">
              SCANNING TARGET
            </p>
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="text-sm tracking-wide">Analyzing threat intelligence databases...</span>
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes radar-sweep {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes grid-move {
            0% { transform: translate(0, 0); }
            100% { transform: translate(50px, 50px); }
          }
          @keyframes scanline {
            0% { transform: translateY(-100%); }
            100% { transform: translateY(100%); }
          }
        `}</style>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-background text-foreground font-mono flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <p className="text-destructive text-xl font-bold">SCAN FAILED</p>
          <Link href="/scanner">
            <Button variant="outline" size="sm" className="border border-primary/70 text-primary bg-transparent hover:bg-primary/10 hover:text-white hover:shadow-lg hover:shadow-primary/30 whitespace-nowrap transition-all duration-300 text-xs font-bold">Return to Scanner</Button>
          </Link>
        </div>
      </div>
    )
  }

  const getThreatLevel = (level: string) => {
    switch (level) {
      case "critical":
        return { color: "text-destructive", bg: "bg-destructive/10", label: "CRITICAL RISK" }
      case "high":
        return { color: "text-destructive", bg: "bg-destructive/10", label: "HIGH RISK" }
      case "medium":
        return { color: "text-chart-2", bg: "bg-chart-2/10", label: "MEDIUM RISK" }
      case "low":
        return { color: "text-primary", bg: "bg-primary/10", label: "LOW RISK" }
      default:
        return { color: "text-muted-foreground", bg: "bg-muted", label: "UNKNOWN" }
    }
  }

  const threat = getThreatLevel(data.threatLevel)

  return (
    <div className="min-h-screen bg-background text-foreground font-mono">
      {/* Header */}
      <header className="border-b border-border/50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative w-12 h-12 rounded-full border-2 border-primary flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary" />
              <div className="absolute inset-0 rounded-full border-2 border-primary animate-ping opacity-20" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary cyber-glow tracking-wider">ADVANCED OSINT PLATFORM</h1>
              <p className="text-sm text-muted-foreground">Powered by AI • Scan Results - {type?.toUpperCase()}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Button
              onClick={() => {
                setIncidentMode("create")
                setShowIncidentForm(true)
              }}
              variant="outline"
              size="sm"
              className="border border-green-500/70 text-green-400 bg-transparent hover:bg-green-500/10 hover:text-white hover:shadow-lg hover:shadow-green-500/30 whitespace-nowrap transition-all duration-300 text-xs font-bold"
            >
              <AlertTriangle className="w-4 h-4 mr-1" />
              CREATE INCIDENT
            </Button>
            <Button
              onClick={exportToPDF}
              disabled={exporting}
              variant="outline"
              size="sm"
              className="border border-primary/70 text-primary bg-transparent hover:bg-primary/10 hover:text-white hover:shadow-lg hover:shadow-primary/30 whitespace-nowrap transition-all duration-300 text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4 mr-1" />
              {exporting ? "EXPORTING..." : "EXPORT PDF"}
            </Button>
            <Link href="/threat-feed">
              <Button variant="outline" size="sm" className="border border-primary/70 text-primary bg-transparent hover:bg-primary/10 hover:text-white hover:shadow-lg hover:shadow-primary/30 whitespace-nowrap transition-all duration-300 text-xs font-bold">
                <Activity className="w-4 h-4 mr-1" />
                THREAT FEED
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" size="sm" className="border border-primary/70 text-primary bg-transparent hover:bg-primary/10 hover:text-white hover:shadow-lg hover:shadow-primary/30 whitespace-nowrap transition-all duration-300 text-xs font-bold">
                <Home className="w-4 h-4 mr-1" />
                HOME
              </Button>
            </Link>
            <Link href="/scanner">
              <Button variant="outline" size="sm" className="border border-primary/70 text-primary bg-transparent hover:bg-primary/10 hover:text-white hover:shadow-lg hover:shadow-primary/30 whitespace-nowrap transition-all duration-300 text-xs font-bold">
                <Shield className="w-4 h-4 mr-1" />
                SCANNER
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Scan Summary */}
        <div className="cyber-card p-6 rounded-lg mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <p className="text-xs text-primary font-bold mb-2">TARGET</p>
              <p className="text-2xl font-mono text-foreground break-all">{query}</p>
            </div>
            <Badge className={`${threat.bg} ${threat.color} border-0 text-sm px-4 py-2 font-bold`}>
              {threat.label}
            </Badge>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div>
              <p className="text-xs text-muted-foreground mb-1">SCAN TYPE</p>
              <p className="text-sm font-bold text-foreground">{type?.toUpperCase()}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">TIMESTAMP</p>
              <p className="text-sm font-bold text-foreground">{new Date().toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">DATABASES CHECKED</p>
              <p className="text-sm font-bold text-foreground">{data.databasesChecked || 12}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">SCAN DURATION</p>
              <p className="text-sm font-bold text-foreground">{data.scanDuration || "1.2s"}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Threat Intelligence */}
          <div className="cyber-card p-6 rounded-lg">
            <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              THREAT INTELLIGENCE
            </h3>
            <div className="space-y-3">
              {data.threats?.map((threat: any, idx: number) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-secondary/30 rounded border border-border/50 hover:border-primary/50 transition-colors">
                  {threat.detected ? (
                    <XCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-bold text-foreground">{threat.name}</p>
                    <p className="text-xs text-muted-foreground">{threat.description}</p>
                    
                    {/* Display detailed VirusTotal information if available */}
                    {threat.details && threat.name.includes("VirusTotal") && (
                      <div className="mt-3 pt-3 border-t border-primary/20 space-y-2">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-muted-foreground">Malicious Engines:</span>
                            <span className="ml-2 font-mono text-destructive">{threat.details.maliciousEngines}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Suspicious Engines:</span>
                            <span className="ml-2 font-mono text-orange-400">{threat.details.suspiciousEngines}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Undetected:</span>
                            <span className="ml-2 font-mono text-primary">{threat.details.undetectedEngines}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Harmless:</span>
                            <span className="ml-2 font-mono text-green-400">{threat.details.analysisStats?.harmless || 0}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Total Engines:</span>
                            <span className="ml-2 font-mono">{threat.details.totalEngines}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Reputation Score:</span>
                            <span className="ml-2 font-mono">{threat.details.reputationScore}</span>
                          </div>
                        </div>
                        {threat.details.lastAnalysis && (
                          <div className="text-xs">
                            <span className="text-muted-foreground">Last Analysis:</span>
                            <span className="ml-2 font-mono">{new Date(threat.details.lastAnalysis).toLocaleDateString()}</span>
                          </div>
                        )}
                        {threat.details.categories && threat.details.categories.length > 0 && (
                          <div className="text-xs">
                            <p className="text-muted-foreground mb-1">Detected Categories:</p>
                            <div className="flex flex-wrap gap-1">
                              {threat.details.categories.slice(0, 5).map((cat: any, i: number) => (
                                <span key={i} className="px-2 py-1 bg-destructive/20 text-destructive rounded text-xs">
                                  {cat.engine}: {cat.category}
                                </span>
                              ))}
                              {threat.details.categories.length > 5 && (
                                <span className="px-2 py-1 text-xs text-muted-foreground">
                                  +{threat.details.categories.length - 5} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {data.geolocation && (
            <div className="cyber-card p-6 rounded-lg">
              <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                GEOLOCATION DATA
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between p-3 bg-secondary/30 rounded">
                  <span className="text-sm text-muted-foreground">Country</span>
                  <span className="text-sm font-bold text-foreground">{data.geolocation.country}</span>
                </div>
                <div className="flex justify-between p-3 bg-secondary/30 rounded">
                  <span className="text-sm text-muted-foreground">City</span>
                  <span className="text-sm font-bold text-foreground">{data.geolocation.city}</span>
                </div>
                {data.geolocation.region && data.geolocation.region !== "Unknown" && (
                  <div className="flex justify-between p-3 bg-secondary/30 rounded">
                    <span className="text-sm text-muted-foreground">Region</span>
                    <span className="text-sm font-bold text-foreground">{data.geolocation.region}</span>
                  </div>
                )}
                <div className="flex justify-between p-3 bg-secondary/30 rounded">
                  <span className="text-sm text-muted-foreground">ISP</span>
                  <span className="text-sm font-bold text-foreground">{data.geolocation.isp}</span>
                </div>
                {data.geolocation.asn && (
                  <div className="flex justify-between p-3 bg-secondary/30 rounded">
                    <span className="text-sm text-muted-foreground">ASN</span>
                    <span className="text-sm font-bold text-foreground font-mono">{data.geolocation.asn}</span>
                  </div>
                )}
                {data.geolocation.organization && (
                  <div className="flex justify-between p-3 bg-secondary/30 rounded">
                    <span className="text-sm text-muted-foreground">Organization</span>
                    <span className="text-sm font-bold text-foreground">{data.geolocation.organization}</span>
                  </div>
                )}
                {data.geolocation.timezone && data.geolocation.timezone !== "Unknown" && (
                  <div className="flex justify-between p-3 bg-secondary/30 rounded">
                    <span className="text-sm text-muted-foreground">Timezone</span>
                    <span className="text-sm font-bold text-foreground">{data.geolocation.timezone}</span>
                  </div>
                )}
                {data.geolocation.hostnames && data.geolocation.hostnames !== "None" && (
                  <div className="p-3 bg-secondary/30 rounded">
                    <p className="text-xs text-muted-foreground mb-1">HOSTNAMES</p>
                    <p className="text-sm font-bold text-foreground break-all">{data.geolocation.hostnames}</p>
                  </div>
                )}
                <div className="flex justify-between p-3 bg-secondary/30 rounded">
                  <span className="text-sm text-muted-foreground">Coordinates</span>
                  <span className="text-sm font-bold text-foreground font-mono">{data.geolocation.coordinates}</span>
                </div>
              </div>
            </div>
          )}

          {/* Network Information Section */}
          {data.network && (
            <div className="cyber-card p-6 rounded-lg">
              <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                <Server className="w-5 h-5" />
                NETWORK INFORMATION
              </h3>
              <div className="space-y-3">
                {data.network.os && data.network.os !== "Unknown" && (
                  <div className="p-3 bg-secondary/30 rounded">
                    <p className="text-xs text-muted-foreground mb-1">OPERATING SYSTEM</p>
                    <p className="text-sm font-bold text-foreground">{data.network.os}</p>
                  </div>
                )}
                {data.network.openPorts && (
                  <div className="p-3 bg-secondary/30 rounded">
                    <p className="text-xs text-muted-foreground mb-2">
                      OPEN PORTS {data.network.openPorts.length > 0 && `(${data.network.openPorts.length})`}
                    </p>
                    {data.network.openPorts.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {data.network.openPorts.map((port: string, idx: number) => (
                          <Badge key={idx} variant="outline" className="border-red-500/50 text-red-500 font-mono">
                            {port}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No open ports detected</p>
                    )}
                  </div>
                )}
                {data.network.services && (
                  <div className="p-3 bg-secondary/30 rounded">
                    <p className="text-xs text-muted-foreground mb-2">
                      DETECTED SERVICES {data.network.services.length > 0 && `(${data.network.services.length})`}
                    </p>
                    {data.network.services.length > 0 ? (
                      <div className="space-y-1 max-h-48 overflow-y-auto">
                        {data.network.services.map((service: string, idx: number) => (
                          <p key={idx} className="text-sm text-foreground font-mono">
                            • {service}
                          </p>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No services detected</p>
                    )}
                  </div>
                )}
                {data.network.banners && data.network.banners.length > 0 && (
                  <div className="p-3 bg-secondary/30 rounded">
                    <p className="text-xs text-muted-foreground mb-2">SERVICE BANNERS</p>
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {data.network.banners.map((banner: string, idx: number) => (
                        <p key={idx} className="text-xs text-foreground font-mono break-all bg-black/30 p-2 rounded">
                          {banner}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
                {data.network.tags && data.network.tags.length > 0 && (
                  <div className="p-3 bg-secondary/30 rounded">
                    <p className="text-xs text-muted-foreground mb-2">TAGS</p>
                    <div className="flex flex-wrap gap-2">
                      {data.network.tags.map((tag: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="border-primary/50 text-primary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {(!data.network.os || data.network.os === "Unknown") &&
                  (!data.network.openPorts || data.network.openPorts.length === 0) &&
                  (!data.network.services || data.network.services.length === 0) &&
                  (!data.network.banners || data.network.banners.length === 0) &&
                  (!data.network.tags || data.network.tags.length === 0) && (
                    <div className="p-4 bg-secondary/20 rounded text-center">
                      <p className="text-sm text-muted-foreground">
                        No network information available. Network data requires Shodan API access.
                      </p>
                    </div>
                  )}
              </div>
            </div>
          )}

          {/* DNS LOOKUP - Domain Scans Only */}
          {data.network && type === "domain" && (
            <div className="cyber-card p-6 rounded-lg">
              <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                <Server className="w-5 h-5" />
                DNS LOOKUP
              </h3>
              <div className="space-y-4">
                {/* Open Ports Section */}
                {data.network.openPorts && data.network.openPorts.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">OPEN PORTS ({data.network.openPorts.length})</p>
                    <div className="flex flex-wrap gap-2">
                      {data.network.openPorts.slice(0, 10).map((port: string | number, idx: number) => (
                        <Badge key={idx} variant="outline" className="border-destructive/50 text-destructive font-mono">
                          {port}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Detected Services Section */}
                {data.network.services && data.network.services.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">DETECTED SERVICES ({data.network.services.length})</p>
                    <ul className="space-y-1 max-h-40 overflow-y-auto">
                      {data.network.services.slice(0, 8).map((service: string, idx: number) => (
                        <li key={idx} className="text-xs text-foreground flex items-start gap-2">
                          <span className="text-primary mt-0.5">•</span>
                          <span className="font-mono break-all">{service}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Resolved IP Address (for domain scans) */}
                {data.network.resolvedIP && data.network.resolvedIP !== "Unknown" && (
                  <div className="flex justify-between p-3 bg-secondary/30 rounded">
                    <span className="text-xs text-muted-foreground">DNS LOOKUP RESULT</span>
                    <span className="text-xs font-bold text-foreground font-mono">{data.network.resolvedIP}</span>
                  </div>
                )}

                {/* Service Banners Section */}
                {data.network.banners && data.network.banners.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">SERVICE BANNERS</p>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {data.network.banners.slice(0, 2).map((banner: string, idx: number) => (
                        <p key={idx} className="text-xs text-foreground font-mono whitespace-pre-wrap break-all p-2 bg-secondary/30 rounded">
                          {banner}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {/* OS Information */}
                {data.network.os && data.network.os !== "Unknown" && (
                  <div className="flex justify-between p-3 bg-secondary/30 rounded">
                    <span className="text-xs text-muted-foreground">OPERATING SYSTEM</span>
                    <span className="text-xs font-bold text-foreground font-mono">{data.network.os}</span>
                  </div>
                )}

                {/* No network data detected message */}
                {(!data.network.openPorts || data.network.openPorts.length === 0) &&
                  (!data.network.services || data.network.services.length === 0) &&
                  (!data.network.banners || data.network.banners.length === 0) &&
                  (!data.network.os || data.network.os === "Unknown") &&
                  (!data.network.resolvedIP || data.network.resolvedIP === "Unknown") && (
                    <div className="text-center py-6">
                      <p className="text-xs text-muted-foreground italic">No network services detected</p>
                      <p className="text-xs text-muted-foreground mt-1">The target may not be responding to network probes</p>
                    </div>
                  )}
              </div>
            </div>
          )}

          {/* Dark Web Monitoring - Shows for IP scans where DNS LOOKUP is hidden, and for domain scans after DNS LOOKUP */}
          {(type !== "domain" || (type === "domain" && data.network && type === "domain")) && (
            <div className="cyber-card p-6 rounded-lg">
              <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                DARK WEB MONITORING
              </h3>
            <div className="space-y-3">
              {/* Data Breaches */}
              <div className="p-3 bg-secondary/30 rounded">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  <p className="text-xs text-muted-foreground font-mono">DATA BREACHES</p>
                </div>
                <p className="text-sm font-mono text-foreground ml-4">
                  {data.darkweb?.breaches && data.darkweb.breaches.length > 0 
                    ? `${data.darkweb.breaches.length} breach${data.darkweb.breaches.length !== 1 ? 'es' : ''} detected`
                    : 'No data breaches detected'}
                </p>
              </div>

              {/* Credential Leaks */}
              <div className="p-3 bg-secondary/30 rounded">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  <p className="text-xs text-muted-foreground font-mono">CREDENTIAL LEAKS</p>
                </div>
                <p className="text-sm font-mono text-foreground ml-4">
                  {data.darkweb?.pasteLeaks && (Array.isArray(data.darkweb.pasteLeaks) ? data.darkweb.pasteLeaks.length > 0 : data.darkweb.pasteLeaks.count > 0)
                    ? `${Array.isArray(data.darkweb.pasteLeaks) ? data.darkweb.pasteLeaks.length : data.darkweb.pasteLeaks.count} credential${Array.isArray(data.darkweb.pasteLeaks) && data.darkweb.pasteLeaks.length !== 1 ? 's' : ''} leaked`
                    : 'No credential leaks detected'}
                </p>
              </div>

              {/* Malware/Ransomware Mentions */}
              <div className="p-3 bg-secondary/30 rounded">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  <p className="text-xs text-muted-foreground font-mono">MALWARE/RANSOMWARE MENTIONS</p>
                </div>
                <p className="text-sm font-mono text-foreground ml-4">
                  {data.darkweb?.mentions && (Array.isArray(data.darkweb.mentions) ? data.darkweb.mentions.length > 0 : data.darkweb.mentions.malwareCount > 0)
                    ? `${Array.isArray(data.darkweb.mentions) ? data.darkweb.mentions.length : data.darkweb.mentions.malwareCount} mention${Array.isArray(data.darkweb.mentions) && data.darkweb.mentions.length !== 1 ? 's' : ''} detected`
                    : 'No malware mentions detected'}
                </p>
              </div>

              {/* Marketplace Listings */}
              <div className="p-3 bg-secondary/30 rounded">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  <p className="text-xs text-muted-foreground font-mono">MARKETPLACE LISTINGS</p>
                </div>
                <p className="text-sm font-mono text-foreground ml-4">
                  {data.darkweb?.mentions && (Array.isArray(data.darkweb.mentions) ? data.darkweb.mentions.length > 0 : data.darkweb.mentions.marketplaceListings > 0)
                    ? `${Array.isArray(data.darkweb.mentions) ? data.darkweb.mentions.length : data.darkweb.mentions.marketplaceListings} listing${Array.isArray(data.darkweb.mentions) && data.darkweb.mentions.length !== 1 ? 's' : ''} found`
                    : 'No marketplace listings detected'}
                </p>
              </div>

              {/* Hacker Forums Discussion */}
              <div className="p-3 bg-secondary/30 rounded">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  <p className="text-xs text-muted-foreground font-mono">HACKER FORUMS DISCUSSION</p>
                </div>
                <p className="text-sm font-mono text-foreground ml-4">
                  {data.darkweb?.mentions && (Array.isArray(data.darkweb.mentions) ? data.darkweb.mentions.length > 0 : data.darkweb.mentions.forumMentions > 0)
                    ? `Active threats or discussions detected`
                    : 'No active threats or discussions detected'}
                </p>
              </div>
            </div>
          </div>
          )}

          {/* Vulnerability Detection Section - now includes both IP and Domain scans */}
          {data.vulnerabilities && data.vulnerabilities.length > 0 && (
            <div className="border border-destructive/50 rounded-lg lg:col-span-2">
              <h3 className="text-lg font-bold text-destructive mb-4 flex items-center gap-2 p-6 pb-0">
                <AlertTriangle className="w-5 h-5" />
                VULNERABILITY DETECTION & CVE DATABASE
              </h3>
              <div className="p-6 pt-4 space-y-4">
                {/* Vulnerabilities Header */}
                <div className="p-4 bg-destructive/5 border border-destructive/50 rounded">
                  <p className="text-lg font-bold text-destructive mb-4">
                    {data.vulnerabilities.length} Known Vulnerabilities Detected
                  </p>
                  
                  {/* CVE Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-80 overflow-y-auto">
                    {data.vulnerabilities.map((vuln: any, idx: number) => (
                      <div key={idx} className="p-4 bg-black/40 border border-destructive/40 rounded">
                        <div className="flex items-start justify-between mb-3">
                          <p className="text-sm font-bold text-destructive font-mono">{vuln.cve || `CVE-${idx}`}</p>
                          <span className="px-2 py-1 bg-orange-600/20 border border-orange-600/50 text-orange-600 text-xs font-bold rounded">
                            {vuln.severity?.toUpperCase() || "UNKNOWN"}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">Common Vulnerability and Exposure</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Vulnerability Recommendations */}
                <div className="p-4 bg-black/20 rounded">
                  <p className="text-sm font-bold text-green-500 mb-3">VULNERABILITY RECOMMENDATIONS</p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2 text-muted-foreground">
                      <span className="text-green-500">•</span>
                      <span>Apply critical security patches immediately</span>
                    </li>
                    <li className="flex items-start gap-2 text-muted-foreground">
                      <span className="text-green-500">•</span>
                      <span>Monitor for active exploitation attempts</span>
                    </li>
                    <li className="flex items-start gap-2 text-muted-foreground">
                      <span className="text-green-500">•</span>
                      <span>Implement Web Application Firewall (WAF) rules</span>
                    </li>
                    <li className="flex items-start gap-2 text-muted-foreground">
                      <span className="text-green-500">•</span>
                      <span>Review and update vulnerability management policies</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* DNS Records */}
          {data.dns && (
            <div className="cyber-card p-6 rounded-lg">
              <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5" />
                DNS RECORDS
              </h3>
              <div className="space-y-3">
                {Object.entries(data.dns).map(([key, value]: [string, any], idx) => (
                  <div key={idx} className="p-3 bg-secondary/30 rounded">
                    <p className="text-xs text-muted-foreground mb-1">{key.toUpperCase()}</p>
                    <p className="text-sm font-mono text-foreground break-all">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Credential Leak Information Section for Domain Scans - enhanced from keyword scan */}
          {data.emailLeaks && data.emailLeaks.length > 0 && (
            <div className="cyber-card p-6 rounded-lg lg:col-span-2">
              <h3 className="text-lg font-bold text-destructive mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                EMAIL LEAKED CREDENTIALS DETECTED
              </h3>
              <div className="space-y-3">
                {data.emailLeaks.map((leak: any, idx: number) => (
                  <div key={idx} className="p-4 bg-destructive/5 border border-destructive/30 rounded">
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-sm font-bold text-destructive">{leak.name}</p>
                      {leak.verified && <Badge className="bg-destructive/10 text-destructive border-0">VERIFIED</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{leak.description}</p>
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-muted-foreground">
                        Affected: {leak.affectedAccounts?.toLocaleString() || "Unknown"} accounts
                      </span>
                      <span className="text-muted-foreground">{leak.date}</span>
                    </div>
                    {leak.dataClasses && leak.dataClasses.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {leak.dataClasses.map((dc: string, i: number) => (
                          <Badge key={i} variant="outline" className="border-destructive/50 text-destructive text-xs">
                            {dc}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.subdomains && data.subdomains.length > 0 && (
            <div className="cyber-card p-6 rounded-lg lg:col-span-2">
              <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5" />
                DISCOVERED SUBDOMAINS ({data.subdomains.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                {data.subdomains.map((sub: any, idx: number) => (
                  <div key={idx} className="p-3 bg-secondary/30 rounded border border-border/50">
                    <p className="text-sm font-bold text-primary mb-1 break-all">{sub.subdomain}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">IP:</span>
                      <span className="text-foreground font-mono">{sub.ip}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.ssl && (
            <div className="cyber-card p-6 rounded-lg lg:col-span-2">
              <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                SSL CERTIFICATE
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-secondary/30 rounded">
                  <p className="text-xs text-muted-foreground mb-1">ISSUER</p>
                  <p className="text-sm font-bold text-foreground">{data.ssl.issuer}</p>
                </div>
                {data.ssl.subject && data.ssl.subject !== "Unknown" && (
                  <div className="p-3 bg-secondary/30 rounded">
                    <p className="text-xs text-muted-foreground mb-1">SUBJECT</p>
                    <p className="text-sm font-bold text-foreground break-all">{data.ssl.subject}</p>
                  </div>
                )}
                <div className="p-3 bg-secondary/30 rounded">
                  <p className="text-xs text-muted-foreground mb-1">VALID FROM</p>
                  <p className="text-sm font-bold text-foreground">{data.ssl.validFrom}</p>
                </div>
                <div className="p-3 bg-secondary/30 rounded">
                  <p className="text-xs text-muted-foreground mb-1">VALID UNTIL</p>
                  <p className="text-sm font-bold text-foreground">{data.ssl.validUntil}</p>
                </div>
                {data.ssl.algorithm && (
                  <div className="p-3 bg-secondary/30 rounded">
                    <p className="text-xs text-muted-foreground mb-1">ALGORITHM</p>
                    <p className="text-sm font-bold text-foreground">{data.ssl.algorithm}</p>
                  </div>
                )}
                {data.ssl.keySize && (
                  <div className="p-3 bg-secondary/30 rounded">
                    <p className="text-xs text-muted-foreground mb-1">KEY SIZE</p>
                    <p className="text-sm font-bold text-foreground">{data.ssl.keySize}</p>
                  </div>
                )}
                {data.ssl.serialNumber && (
                  <div className="p-3 bg-secondary/30 rounded md:col-span-3">
                    <p className="text-xs text-muted-foreground mb-1">SERIAL NUMBER</p>
                    <p className="text-sm font-bold text-foreground font-mono break-all">{data.ssl.serialNumber}</p>
                  </div>
                )}
                {data.ssl.subjectAltNames && data.ssl.subjectAltNames.length > 0 && (
                  <div className="p-3 bg-secondary/30 rounded md:col-span-3">
                    <p className="text-xs text-muted-foreground mb-2">SUBJECT ALTERNATIVE NAMES</p>
                    <div className="flex flex-wrap gap-2">
                      {data.ssl.subjectAltNames.map((name: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="border-primary/50 text-primary">
                          {name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {data.hashAnalysis && (
            <div className="cyber-card p-6 rounded-lg lg:col-span-2">
              <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                HASH ANALYSIS
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-secondary/30 rounded">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-bold text-foreground">Malware Detection</p>
                    <Badge
                      className={
                        data.hashAnalysis.malicious
                          ? "bg-destructive/10 text-destructive border-0"
                          : "bg-primary/10 text-primary border-0"
                      }
                    >
                      {data.hashAnalysis.malicious ? "MALICIOUS" : "CLEAN"}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Detection Engines</p>
                      <p className="text-sm font-bold text-foreground">{data.hashAnalysis.engines}</p>
                    </div>
                    {data.hashAnalysis.fileType && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">File Type</p>
                        <p className="text-sm font-bold text-foreground">{data.hashAnalysis.fileType}</p>
                      </div>
                    )}
                    {data.hashAnalysis.fileSize && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">File Size</p>
                        <p className="text-sm font-bold text-foreground">{data.hashAnalysis.fileSize}</p>
                      </div>
                    )}
                    {data.hashAnalysis.submissionCount !== undefined && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Submissions</p>
                        <p className="text-sm font-bold text-foreground">{data.hashAnalysis.submissionCount}</p>
                      </div>
                    )}
                  </div>
                  {(data.hashAnalysis.md5 || data.hashAnalysis.sha1 || data.hashAnalysis.sha256) && (
                    <div className="grid grid-cols-1 gap-2 mb-3">
                      {data.hashAnalysis.md5 && data.hashAnalysis.md5 !== "Unknown" && (
                        <div className="p-2 bg-background/50 rounded">
                          <p className="text-xs text-muted-foreground">MD5</p>
                          <p className="text-xs font-mono text-foreground break-all">{data.hashAnalysis.md5}</p>
                        </div>
                      )}
                      {data.hashAnalysis.sha1 && data.hashAnalysis.sha1 !== "Unknown" && (
                        <div className="p-2 bg-background/50 rounded">
                          <p className="text-xs text-muted-foreground">SHA1</p>
                          <p className="text-xs font-mono text-foreground break-all">{data.hashAnalysis.sha1}</p>
                        </div>
                      )}
                      {data.hashAnalysis.sha256 && data.hashAnalysis.sha256 !== "Unknown" && (
                        <div className="p-2 bg-background/50 rounded">
                          <p className="text-xs text-muted-foreground">SHA256</p>
                          <p className="text-xs font-mono text-foreground break-all">{data.hashAnalysis.sha256}</p>
                        </div>
                      )}
                    </div>
                  )}
                  {data.hashAnalysis.signatures && data.hashAnalysis.signatures.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs text-muted-foreground mb-2">DETECTED SIGNATURES</p>
                      <div className="space-y-1 max-h-48 overflow-y-auto">
                        {data.hashAnalysis.signatures.map((sig: string, idx: number) => (
                          <p key={idx} className="text-sm text-destructive">
                            • {sig}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {data.detailedResults && data.detailedResults.length > 0 && (
            <div className="cyber-card p-6 rounded-lg lg:col-span-2">
              <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                <Database className="w-5 h-5" />
                DETAILED DETECTION RESULTS
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                {data.detailedResults.map((result: any, idx: number) => (
                  <div key={idx} className="p-3 bg-secondary/30 rounded">
                    <p className="text-xs font-bold text-foreground mb-1">{result.engine}</p>
                    <p className="text-xs text-destructive">{result.result}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.whois && (
            <div className="cyber-card p-6 rounded-lg lg:col-span-2">
              <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                WHOIS INFORMATION
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-secondary/30 rounded">
                  <p className="text-xs text-muted-foreground mb-1">REGISTRAR</p>
                  <p className="text-sm font-bold text-foreground">{data.whois.registrar}</p>
                </div>
                <div className="p-3 bg-secondary/30 rounded">
                  <p className="text-xs text-muted-foreground mb-1">REGISTRANT</p>
                  <p className="text-sm font-bold text-foreground">{data.whois.registrant}</p>
                </div>
                {data.whois.registrantCountry && data.whois.registrantCountry !== "Unknown" && (
                  <div className="p-3 bg-secondary/30 rounded">
                    <p className="text-xs text-muted-foreground mb-1">REGISTRANT COUNTRY</p>
                    <p className="text-sm font-bold text-foreground">{data.whois.registrantCountry}</p>
                  </div>
                )}
                <div className="p-3 bg-secondary/30 rounded">
                  <p className="text-xs text-muted-foreground mb-1">REGISTRATION DATE</p>
                  <p className="text-sm font-bold text-foreground">{data.whois.registrationDate}</p>
                </div>
                {data.whois.updatedDate && data.whois.updatedDate !== "Unknown" && (
                  <div className="p-3 bg-secondary/30 rounded">
                    <p className="text-xs text-muted-foreground mb-1">UPDATED DATE</p>
                    <p className="text-sm font-bold text-foreground">{data.whois.updatedDate}</p>
                  </div>
                )}
                <div className="p-3 bg-secondary/30 rounded">
                  <p className="text-xs text-muted-foreground mb-1">EXPIRATION DATE</p>
                  <p className="text-sm font-bold text-foreground">{data.whois.expirationDate}</p>
                </div>
                {data.whois.status && data.whois.status !== "Unknown" && (
                  <div className="p-3 bg-secondary/30 rounded md:col-span-2">
                    <p className="text-xs text-muted-foreground mb-1">STATUS</p>
                    <p className="text-sm font-bold text-foreground">{data.whois.status}</p>
                  </div>
                )}
                {data.whois.nameServers && data.whois.nameServers !== "Unknown" && (
                  <div className="p-3 bg-secondary/30 rounded md:col-span-2">
                    <p className="text-xs text-muted-foreground mb-1">NAME SERVERS</p>
                    <p className="text-sm font-bold text-foreground break-all">{data.whois.nameServers}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {data.technology && (
            <div className="cyber-card p-6 rounded-lg lg:col-span-2">
              <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                <Database className="w-5 h-5" />
                TECHNOLOGY STACK
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-secondary/30 rounded">
                  <p className="text-xs text-muted-foreground mb-2">WEB SERVER</p>
                  <p className="text-sm font-bold text-foreground">{data.technology.webServer}</p>
                </div>
                <div className="p-3 bg-secondary/30 rounded">
                  <p className="text-xs text-muted-foreground mb-2">FRAMEWORKS</p>
                  <div className="space-y-1">
                    {data.technology.frameworks.map((fw: string, idx: number) => (
                      <p key={idx} className="text-sm text-foreground">
                        • {fw}
                      </p>
                    ))}
                  </div>
                </div>
                <div className="p-3 bg-secondary/30 rounded">
                  <p className="text-xs text-muted-foreground mb-2">ANALYTICS</p>
                  <div className="space-y-1">
                    {data.technology.analytics.map((an: string, idx: number) => (
                      <p key={idx} className="text-sm text-foreground">
                        • {an}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {data.malwareFamily && (
            <div className="cyber-card p-6 rounded-lg lg:col-span-2">
              <h3 className="text-lg font-bold text-destructive mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                MALWARE FAMILY ANALYSIS
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-destructive/5 border border-destructive/30 rounded">
                  <p className="text-lg font-bold text-destructive mb-2">{data.malwareFamily.name}</p>
                  <p className="text-sm text-muted-foreground mb-4">{data.malwareFamily.description}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">CAPABILITIES</p>
                      <div className="space-y-1">
                        {data.malwareFamily.capabilities.map((cap: string, idx: number) => (
                          <p key={idx} className="text-sm text-foreground">
                            • {cap}
                          </p>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">TARGETED SECTORS</p>
                      <div className="flex flex-wrap gap-2">
                        {data.malwareFamily.targetedSectors.map((sector: string, idx: number) => (
                          <Badge key={idx} variant="outline" className="border-destructive/50 text-destructive">
                            {sector}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {data.iocs && (
            <div className="cyber-card p-6 rounded-lg lg:col-span-2">
              <h3 className="text-lg font-bold text-destructive mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                INDICATORS OF COMPROMISE (IOCs)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.iocs.domains && (
                  <div className="p-3 bg-secondary/30 rounded">
                    <p className="text-xs text-muted-foreground mb-2">MALICIOUS DOMAINS</p>
                    <div className="space-y-1">
                      {data.iocs.domains.map((domain: string, idx: number) => (
                        <p key={idx} className="text-sm text-destructive font-mono break-all">
                          • {domain}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
                {data.iocs.ips && (
                  <div className="p-3 bg-secondary/30 rounded">
                    <p className="text-xs text-muted-foreground mb-2">MALICIOUS IPs</p>
                    <div className="space-y-1">
                      {data.iocs.ips.map((ip: string, idx: number) => (
                        <p key={idx} className="text-sm text-destructive font-mono">
                          • {ip}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
                {data.iocs.urls && (
                  <div className="p-3 bg-secondary/30 rounded md:col-span-2">
                    <p className="text-xs text-muted-foreground mb-2">MALICIOUS URLS</p>
                    <div className="space-y-1">
                      {data.iocs.urls.map((url: string, idx: number) => (
                        <p key={idx} className="text-sm text-destructive font-mono break-all">
                          • {url}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
                {data.iocs.mutexes && (
                  <div className="p-3 bg-secondary/30 rounded">
                    <p className="text-xs text-muted-foreground mb-2">MUTEXES</p>
                    <div className="space-y-1">
                      {data.iocs.mutexes.map((mutex: string, idx: number) => (
                        <p key={idx} className="text-sm text-foreground font-mono break-all">
                          • {mutex}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
                {data.iocs.registryKeys && (
                  <div className="p-3 bg-secondary/30 rounded">
                    <p className="text-xs text-muted-foreground mb-2">REGISTRY KEYS</p>
                    <div className="space-y-1">
                      {data.iocs.registryKeys.map((key: string, idx: number) => (
                        <p key={idx} className="text-sm text-foreground font-mono break-all">
                          • {key}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Dark Web Monitoring Section */}
          {data.darkWeb &&
            (data.darkWeb.mentions?.length > 0 ||
              data.darkWeb.pasteLeaks?.length > 0 ||
              data.darkWeb.breaches?.length > 0) && (
              <div className="cyber-card p-6 rounded-lg lg:col-span-2">
                <h3 className="text-lg font-bold text-destructive mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  DARK WEB MONITORING
                </h3>

                {data.darkWeb.breaches && data.darkWeb.breaches.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-bold text-primary mb-3">DATA BREACHES</p>
                    <div className="space-y-3">
                      {data.darkWeb.breaches.map((breach: any, idx: number) => (
                        <div key={idx} className="p-4 bg-destructive/5 border border-destructive/30 rounded">
                          <div className="flex items-start justify-between mb-2">
                            <p className="text-sm font-bold text-destructive">{breach.name}</p>
                            {breach.verified && (
                              <Badge className="bg-destructive/10 text-destructive border-0">VERIFIED</Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">{breach.description}</p>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-muted-foreground">Date:</span>
                              <span className="text-foreground ml-2">{breach.date}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Affected:</span>
                              <span className="text-foreground ml-2">
                                {breach.affectedAccounts.toLocaleString()} accounts
                              </span>
                            </div>
                          </div>
                          <div className="mt-2">
                            <p className="text-xs text-muted-foreground mb-1">Compromised Data:</p>
                            <div className="flex flex-wrap gap-1">
                              {breach.dataClasses.map((dc: string, i: number) => (
                                <Badge
                                  key={i}
                                  variant="outline"
                                  className="border-destructive/50 text-destructive text-xs"
                                >
                                  {dc}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {data.darkWeb.mentions && data.darkWeb.mentions.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-bold text-primary mb-3">DARK WEB MENTIONS</p>
                    <div className="space-y-2">
                      {data.darkWeb.mentions.map((mention: any, idx: number) => (
                        <div key={idx} className="p-3 bg-secondary/30 rounded border border-border/50">
                          <div className="flex items-start justify-between mb-1">
                            <p className="text-sm font-bold text-foreground">{mention.source}</p>
                            <Badge
                              className={
                                mention.severity === "high"
                                  ? "bg-destructive/10 text-destructive border-0"
                                  : mention.severity === "medium"
                                    ? "bg-chart-2/10 text-chart-2 border-0"
                                    : "bg-primary/10 text-primary border-0"
                              }
                            >
                              {mention.severity.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-1">{mention.context}</p>
                          <p className="text-xs text-muted-foreground">Date: {mention.date}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {data.darkWeb.pasteLeaks && data.darkWeb.pasteLeaks.length > 0 && (
                  <div>
                    <p className="text-sm font-bold text-primary mb-3">PASTE SITE LEAKS</p>
                    <div className="space-y-2">
                      {data.darkWeb.pasteLeaks.map((leak: any, idx: number) => (
                        <div key={idx} className="p-3 bg-secondary/30 rounded border border-border/50">
                          <div className="flex items-start justify-between mb-1">
                            <p className="text-sm font-bold text-foreground">{leak.source}</p>
                            <Badge className="bg-destructive/10 text-destructive border-0">
                              {leak.type.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-1">{leak.description}</p>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Date: {leak.date}</span>
                            <span className="text-muted-foreground">
                              Records: {leak.affectedRecords.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {data.darkWeb.marketplaces && data.darkWeb.marketplaces.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-bold text-primary mb-3">UNDERGROUND MARKETPLACES</p>
                    <div className="space-y-2">
                      {data.darkWeb.marketplaces.map((marketplace: any, idx: number) => (
                        <div key={idx} className="p-3 bg-destructive/5 border border-destructive/30 rounded">
                          <p className="text-sm font-bold text-destructive mb-1">{marketplace.name}</p>
                          <p className="text-xs text-muted-foreground mb-2">{marketplace.listing}</p>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-foreground">Price: {marketplace.price}</span>
                            <span className="text-muted-foreground">Listed: {marketplace.date}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

          {/* Asset Exposure Section */}
          {data.assetExposure && (
            <div className="cyber-card p-6 rounded-lg lg:col-span-2">
              <h3 className="text-lg font-bold text-primary mb-6 flex items-center gap-2">
                <Server className="w-5 h-5" />
                ASSET EXPOSURE DISCOVERY
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="p-6 bg-secondary/30 rounded text-center border border-primary/20">
                  <p className="text-5xl font-bold text-primary mb-2">{data.assetExposure.totalAssets || 0}</p>
                  <p className="text-sm text-muted-foreground tracking-wide">Total Exposed Assets</p>
                </div>
                <div className="p-6 bg-secondary/30 rounded text-center border border-primary/20">
                  <p className="text-5xl font-bold text-primary mb-2">{data.assetExposure.subdomains?.length || 0}</p>
                  <p className="text-sm text-muted-foreground tracking-wide">Discovered Subdomains</p>
                </div>
                <div className="p-6 bg-secondary/30 rounded text-center border border-primary/20">
                  <p className="text-5xl font-bold text-primary mb-2">{data.assetExposure.certificates?.length || 0}</p>
                  <p className="text-sm text-muted-foreground tracking-wide">SSL Certificates</p>
                </div>
              </div>

              {data.assetExposure.exposedPorts && data.assetExposure.exposedPorts.length > 0 && (
                <div className="mb-6">
                  <p className="text-sm font-bold text-primary mb-4 tracking-wide">EXPOSED SERVICES</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {data.assetExposure.exposedPorts.map((port: any, idx: number) => (
                      <div key={idx} className="p-4 bg-secondary/30 rounded border border-primary/20">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-bold text-primary">Port {port.port}</p>
                            <p className="text-xs text-muted-foreground mt-1">{port.service}</p>
                          </div>
                          <Badge
                            className={
                              port.risk === "high"
                                ? "bg-destructive/10 text-destructive border-0"
                                : port.risk === "medium"
                                  ? "bg-chart-2/10 text-chart-2 border-0"
                                  : "bg-primary/10 text-primary border-0"
                            }
                          >
                            {port.risk.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {data.assetExposure.certificates && data.assetExposure.certificates.length > 0 && (
                <div>
                  <p className="text-sm font-bold text-primary mb-4 tracking-wide">
                    CERTIFICATE TRANSPARENCY LOGS ({data.assetExposure.certificates.length})
                  </p>
                  <div className="max-h-96 overflow-y-auto space-y-3 pr-2">
                    {data.assetExposure.certificates.map((cert: any, idx: number) => (
                      <div key={idx} className="p-4 bg-secondary/30 rounded border border-primary/20">
                        <p className="text-sm font-bold text-primary mb-3">{cert.commonName}</p>
                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <span className="text-xs text-muted-foreground">Issuer:</span>
                            <span className="text-xs text-foreground text-right flex-1 ml-4">{cert.issuer}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Valid:</span>
                            <span className="text-xs text-foreground">
                              {cert.notBefore ? new Date(cert.notBefore).toLocaleDateString() : "Unknown"}
                            </span>
                          </div>
                        </div>
                        {cert.nameValue && cert.nameValue !== cert.commonName && (
                          <div className="mt-2 pt-2 border-t border-border/30">
                            <p className="text-xs text-muted-foreground mb-1">Subject Alternative Names:</p>
                            <p className="text-xs text-foreground break-all">{cert.nameValue}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  {data.assetExposure.certificates.length > 10 && (
                    <p className="text-xs text-muted-foreground mt-3 text-center tracking-wide">
                      Showing {Math.min(10, data.assetExposure.certificates.length)} of{" "}
                      {data.assetExposure.certificates.length} certificates
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Email Security Section */}
          {data.emailSecurity && (
            <div className="cyber-card p-6 rounded-lg lg:col-span-2">
              <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                EMAIL SECURITY ANALYSIS
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div
                  className={`p-4 rounded border ${data.emailSecurity.spf.exists ? "bg-primary/5 border-primary/30" : "bg-destructive/5 border-destructive/30"}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-bold">SPF Record</p>
                    {data.emailSecurity.spf.exists ? (
                      <CheckCircle className="w-5 h-5 text-primary" />
                    ) : (
                      <XCircle className="w-5 h-5 text-destructive" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {data.emailSecurity.spf.exists ? "Configured" : "Not Found"}
                  </p>
                </div>

                <div
                  className={`p-4 rounded border ${data.emailSecurity.dmarc.exists ? "bg-primary/5 border-primary/30" : "bg-destructive/5 border-destructive/30"}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-bold">DMARC Record</p>
                    {data.emailSecurity.dmarc.exists ? (
                      <CheckCircle className="w-5 h-5 text-primary" />
                    ) : (
                      <XCircle className="w-5 h-5 text-destructive" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {data.emailSecurity.dmarc.exists ? `Policy: ${data.emailSecurity.dmarc.policy}` : "Not Found"}
                  </p>
                </div>

                <div
                  className={`p-4 rounded border ${data.emailSecurity.dkim.exists ? "bg-primary/5 border-primary/30" : "bg-destructive/5 border-destructive/30"}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-bold">DKIM Record</p>
                    {data.emailSecurity.dkim.exists ? (
                      <CheckCircle className="w-5 h-5 text-primary" />
                    ) : (
                      <XCircle className="w-5 h-5 text-destructive" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {data.emailSecurity.dkim.exists
                      ? `${data.emailSecurity.dkim.selectors.length} selector(s)`
                      : "Not Found"}
                  </p>
                </div>
              </div>

              {data.emailSecurity.spf.record && (
                <div className="mb-4">
                  <p className="text-xs text-muted-foreground mb-2">SPF RECORD</p>
                  <div className="p-3 bg-secondary/30 rounded">
                    <p className="text-xs font-mono text-foreground break-all">{data.emailSecurity.spf.record}</p>
                  </div>
                  {data.emailSecurity.spf.issues.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {data.emailSecurity.spf.issues.map((issue: string, idx: number) => (
                        <p key={idx} className="text-xs text-destructive flex items-start gap-2">
                          <AlertTriangle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                          {issue}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {data.emailSecurity.dmarc.record && (
                <div className="mb-4">
                  <p className="text-xs text-muted-foreground mb-2">DMARC RECORD</p>
                  <div className="p-3 bg-secondary/30 rounded">
                    <p className="text-xs font-mono text-foreground break-all">{data.emailSecurity.dmarc.record}</p>
                  </div>
                  {data.emailSecurity.dmarc.issues.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {data.emailSecurity.dmarc.issues.map((issue: string, idx: number) => (
                        <p key={idx} className="text-xs text-destructive flex items-start gap-2">
                          <AlertTriangle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                          {issue}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {data.emailSecurity.dkim.selectors.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">DKIM SELECTORS</p>
                  <div className="space-y-2">
                    {data.emailSecurity.dkim.selectors.map((sel: any, idx: number) => (
                      <div key={idx} className="p-3 bg-secondary/30 rounded">
                        <p className="text-xs font-bold text-primary mb-1">{sel.selector}._domainkey</p>
                        <p className="text-xs font-mono text-foreground break-all">{sel.record}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Phishing Detection Section */}
          {data.phishingDetection && (
            <div className="cyber-card p-6 rounded-lg lg:col-span-2">
              <h3 className="text-lg font-bold text-destructive mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                PHISHING DETECTION ANALYSIS
              </h3>

              <div className="p-6 bg-secondary/30 rounded mb-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">PHISHING RISK SCORE</p>
                    <p className="text-4xl font-bold text-foreground">{data.phishingDetection.riskScore}/100</p>
                  </div>
                  <Badge
                    className={
                      data.phishingDetection.isPhishing
                        ? "bg-destructive/10 text-destructive border-0 text-lg px-4 py-2"
                        : "bg-primary/10 text-primary border-0 text-lg px-4 py-2"
                    }
                  >
                    {data.phishingDetection.isPhishing ? "PHISHING DETECTED" : "LEGITIMATE"}
                  </Badge>
                </div>

                {data.phishingDetection.flags.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-muted-foreground mb-2">RISK INDICATORS</p>
                    <div className="space-y-2">
                      {data.phishingDetection.flags.map((flag: string, idx: number) => (
                        <div key={idx} className="flex items-start gap-2 p-2 bg-destructive/5 rounded">
                          <XCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-foreground">{flag}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {data.phishingDetection.suspiciousPatterns.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">SUSPICIOUS PATTERNS</p>
                    <div className="flex flex-wrap gap-2">
                      {data.phishingDetection.suspiciousPatterns.map((pattern: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="border-destructive/50 text-destructive">
                          {pattern}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Scan Again Button */}
        <div className="mt-8 text-center">
          <Link href="/scanner">
            <Button variant="outline" size="sm" className="border border-primary/70 text-primary bg-transparent hover:bg-primary/10 hover:text-white hover:shadow-lg hover:shadow-primary/30 whitespace-nowrap transition-all duration-300 text-xs font-bold px-8 py-6">
              <Shield className="w-4 h-4 mr-1" />
              SCANNER
            </Button>
          </Link>
        </div>
      </main>

      {/* Create Incident Case Modal */}
      {showIncidentForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-b from-secondary/50 to-secondary/30 border border-green-500/50 rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl shadow-green-500/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-green-400 tracking-wide">INCIDENT MANAGEMENT</h2>
              <button
                onClick={() => setShowIncidentForm(false)}
                className="text-green-400/60 hover:text-green-400 text-2xl font-bold transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Mode Selection */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setIncidentMode("create")
                    setIncidentFormData({ title: "", description: "", severity: "MEDIUM" })
                  }}
                  className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold transition-all border ${
                    incidentMode === "create"
                      ? "bg-green-500/30 border-green-500/50 text-green-400"
                      : "border-green-500/20 text-green-400/70 hover:bg-green-500/10"
                  }`}
                >
                  CREATE NEW
                </button>
                <button
                  onClick={() => {
                    setIncidentMode("add")
                    loadExistingIncidents()
                  }}
                  className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold transition-all border ${
                    incidentMode === "add"
                      ? "bg-green-500/30 border-green-500/50 text-green-400"
                      : "border-green-500/20 text-green-400/70 hover:bg-green-500/10"
                  }`}
                >
                  ADD TO EXISTING
                </button>
              </div>

              {/* Auto-added IOC Info */}
              <div className="bg-secondary/20 border border-green-500/30 rounded p-3">
                <p className="text-xs text-green-400/60 font-bold mb-2">IOC TO ADD</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded font-bold">{type?.toUpperCase()}</span>
                  <span className="text-sm font-mono text-foreground truncate">{query}</span>
                </div>
              </div>

              {incidentMode === "create" ? (
                <>
                  {/* Case Title */}
                  <div>
                    <label className="text-xs text-green-400 font-bold mb-2 block">CASE TITLE</label>
                    <input
                      type="text"
                      placeholder="e.g., Suspicious Domain Investigation"
                      value={incidentFormData.title}
                      onChange={(e) => setIncidentFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 bg-secondary/30 border border-green-500/30 text-foreground placeholder-green-400/40 rounded text-sm focus:outline-none focus:border-green-500"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="text-xs text-green-400 font-bold mb-2 block">DESCRIPTION</label>
                    <textarea
                      placeholder="Add context or notes about this investigation..."
                      value={incidentFormData.description}
                      onChange={(e) => setIncidentFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 bg-secondary/30 border border-green-500/30 text-foreground placeholder-green-400/40 rounded text-sm focus:outline-none focus:border-green-500 h-20"
                    />
                  </div>

                  {/* Severity */}
                  <div>
                    <label className="text-xs text-green-400 font-bold mb-2 block">SEVERITY</label>
                    <select
                      value={incidentFormData.severity}
                      onChange={(e) => setIncidentFormData(prev => ({ ...prev, severity: e.target.value as any }))}
                      className="w-full px-3 py-2 bg-secondary/30 border border-green-500/30 text-foreground rounded text-sm focus:outline-none focus:border-green-500"
                    >
                      <option value="LOW">LOW</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="HIGH">HIGH</option>
                      <option value="CRITICAL">CRITICAL</option>
                    </select>
                  </div>
                </>
              ) : (
                <>
                  {/* Select Existing Incident */}
                  <div>
                    <label className="text-xs text-green-400 font-bold mb-2 block">SELECT INCIDENT</label>
                    <select
                      value={selectedIncidentId}
                      onChange={(e) => setSelectedIncidentId(e.target.value)}
                      className="w-full px-3 py-2 bg-secondary/30 border border-green-500/30 text-foreground rounded text-sm focus:outline-none focus:border-green-500"
                    >
                      <option value="">Choose an incident...</option>
                      {existingIncidents.map((incident: any) => (
                        <option key={incident.id} value={incident.id}>
                          {incident.title} ({incident.severity || "MEDIUM"})
                        </option>
                      ))}
                    </select>
                    {existingIncidents.length === 0 && (
                      <p className="text-xs text-green-400/60 mt-2">No existing incidents found.</p>
                    )}
                  </div>
                </>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-green-500/30">
                <button
                  onClick={incidentMode === "create" ? createIncidentCase : addToExistingIncident}
                  disabled={creatingIncident || (incidentMode === "create" && !incidentFormData.title.trim()) || (incidentMode === "add" && !selectedIncidentId)}
                  className="flex-1 px-4 py-2 bg-green-500/30 text-green-400 hover:bg-green-500/50 rounded-lg text-xs font-bold transition-all border border-green-500/50 disabled:opacity-50"
                >
                  {creatingIncident ? 'PROCESSING...' : incidentMode === "create" ? 'CREATE CASE' : 'ADD TO INCIDENT'}
                </button>
                <button
                  onClick={() => setShowIncidentForm(false)}
                  className="flex-1 px-4 py-2 border border-green-500/40 text-green-400 hover:bg-green-500/10 rounded-lg text-xs font-bold transition-all"
                >
                  CANCEL
                </button>
              </div>
            </div>
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

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background text-foreground font-mono flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-primary text-xl font-bold tracking-wide">LOADING...</p>
          </div>
        </div>
      }
    >
      <ResultsContent />
    </Suspense>
  )
}
