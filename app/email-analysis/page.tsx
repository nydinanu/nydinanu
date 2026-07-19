"use client"

import { useState } from "react"
import { Shield, Mail, Upload, X, AlertTriangle, CheckCircle, AlertCircle, Download, Home, Copy, Check } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

interface EmailAnalysisResult {
  headers: {
    from: string
    to: string
    subject: string
    date: string
    messageId: string
    returnPath?: string
    replyTo?: string
    cc?: string
    bcc?: string
    contentType?: string
    dkim?: string
    spf?: string
    dmarc?: string
    originatingIp?: string
    xHeaders?: Record<string, string>
    receivedHeaders?: string[]
  }
  urlAnalysis: Array<{
    url: string
    malicious?: number
    suspicious?: number
    undetected?: number
    scanned?: boolean
    error?: boolean
  }>
  attachmentAnalysis: Array<{
    filename: string
    mimetype: string
    size: number
    sha256: string
    malicious?: number
    suspicious?: number
    scanned?: boolean
    error?: boolean
  }>
  bodyPreview: string
  bodyHtml?: string | null
  isHtml?: boolean
  totalUrls: number
  totalAttachments: number
  fileName: string
  fileSize: number
}

export default function EmailAnalysisPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<EmailAnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Header Analysis States
  const [headerInput, setHeaderInput] = useState('')
  const [headerAnalysisResult, setHeaderAnalysisResult] = useState<any>(null)
  const [isParsingHeader, setIsParsingHeader] = useState(false)
  const [headerError, setHeaderError] = useState<string | null>(null)
  const [headerCopied, setHeaderCopied] = useState(false)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.name.endsWith('.eml') && !file.name.endsWith('.msg')) {
      setError('Only .eml and .msg files are supported')
      return
    }

    setSelectedFile(file)
    setError(null)
    await analyzeEmail(file)
  }

  const analyzeEmail = async (file: File) => {
    setIsAnalyzing(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/email-analysis', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        let errorMessage = 'Failed to analyze email'
        const contentType = response.headers.get('content-type') || ''
        
        try {
          if (contentType.includes('application/json')) {
            const errorData = await response.json()
            errorMessage = errorData.error || errorMessage
          } else {
            // Server returned non-JSON error (HTML, text, etc)
            const text = await response.text()
            if (text.includes('Internal Server Error') || text.startsWith('<!DOCTYPE')) {
              errorMessage = `Server error (${response.status}): Please check if the file is a valid .eml or .msg email file`
            } else {
              errorMessage = text.substring(0, 200) || errorMessage
            }
          }
        } catch (parseErr) {
          errorMessage = `Server error (${response.status}): Invalid email file or server error`
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during analysis')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const calculateSpamScore = (antispamFields: Record<string, string>, antispamMailboxFields: Record<string, string>, xMsAntispamMessageInfo: string) => {
    let spamScore = 0
    let spamConfidenceLevel = 0
    let spamVerdict = 'UNKNOWN'
    let ipFilterVerdict = 'UNKNOWN'
    const spamReasons: string[] = []

    // Parse BCL (Bulk Complaint Level) from antispam message info
    if (xMsAntispamMessageInfo) {
      const bclMatch = xMsAntispamMessageInfo.match(/BCL:(\d+)/)
      if (bclMatch) {
        const bcl = parseInt(bclMatch[1], 10)
        spamConfidenceLevel = bcl
        // BCL scale: 0-3 = not spam, 4-6 = suspicious, 7-9 = likely spam
        if (bcl >= 7) {
          spamScore += 40
          spamReasons.push(`High BCL score (${bcl})`)
        } else if (bcl >= 4) {
          spamScore += 20
          spamReasons.push(`Medium BCL score (${bcl})`)
        }
      }

      // Parse PCL (Phishing Confidence Level)
      const pclMatch = xMsAntispamMessageInfo.match(/PCL:(\d+)/)
      if (pclMatch) {
        const pcl = parseInt(pclMatch[1], 10)
        if (pcl >= 7) {
          spamScore += 30
          spamReasons.push(`Phishing detected (PCL: ${pcl})`)
        }
      }
    }

    // Parse X-Forefront-Antispam-Report fields
    if (antispamFields) {
      // Check SCL (Spam Confidence Level)
      if (antispamFields['SCL']) {
        const scl = parseInt(antispamFields['SCL'], 10)
        spamConfidenceLevel = Math.max(spamConfidenceLevel, scl)
        if (scl >= 7) {
          spamScore += 35
          spamReasons.push(`SCL score: ${scl}`)
        } else if (scl >= 4) {
          spamScore += 15
        }
      }

      // Check SFV (Spam Filtering Verdict)
      if (antispamFields['SFV']) {
        const sfv = antispamFields['SFV']
        if (sfv === 'SPM') {
          spamScore += 50
          spamVerdict = 'SPAM'
          spamReasons.push('Marked as spam')
        } else if (sfv === 'SKA') {
          spamScore += 25
          spamVerdict = 'SUSPICIOUS'
          spamReasons.push('Skipped antispam')
        } else if (sfv === 'SKI') {
          spamVerdict = 'ALLOWED'
        } else if (sfv === 'SKN') {
          spamVerdict = 'ALLOWED'
        }
      }

      // Check IPV (IP Filter Verdict)
      if (antispamFields['IPV']) {
        const ipv = antispamFields['IPV']
        if (ipv === 'CAL') {
          ipFilterVerdict = 'ALLOWED'
        } else if (ipv === 'BAD') {
          spamScore += 40
          spamReasons.push('IP on blocklist')
          ipFilterVerdict = 'BLOCKED'
        }
      }

      // Check for other spam indicators
      if (antispamFields['PRA'] === '1' || antispamFields['SRF'] === '1') {
        spamScore += 15
        spamReasons.push('Spoofed or unauthenticated')
      }

      if (antispamFields['PCF'] === '1') {
        spamScore += 10
        spamReasons.push('Phishing confidence flag')
      }
    }

    // Determine overall verdict based on score
    if (spamVerdict === 'UNKNOWN') {
      if (spamScore >= 50) {
        spamVerdict = 'SPAM'
      } else if (spamScore >= 30) {
        spamVerdict = 'SUSPICIOUS'
      } else if (spamScore >= 10) {
        spamVerdict = 'LOW_RISK'
      } else {
        spamVerdict = 'CLEAN'
      }
    }

    return {
      spamScore: Math.min(spamScore, 100),
      spamConfidenceLevel,
      spamVerdict,
      ipFilterVerdict,
      spamReasons,
    }
  }

  const parseEmailHeader = () => {
    if (!headerInput.trim()) {
      setHeaderError('Please paste email header or raw message content')
      return
    }

    setIsParsingHeader(true)
    setHeaderError(null)

    try {
      const lines = headerInput.split('\n')
      const parsedHeaders: Record<string, string | string[]> = {}
      const allHeaders: Array<{name: string; value: string}> = []
      let bodyStart = -1

      // Parse headers - collect all headers including duplicates
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        
        // Empty line indicates end of headers
        if (line.trim() === '') {
          bodyStart = i + 1
          break
        }

        // Handle multiline headers (continuation lines start with space or tab)
        if (line.match(/^\s/) && allHeaders.length > 0) {
          const lastHeader = allHeaders[allHeaders.length - 1]
          lastHeader.value += '\n' + line.trim()
          const key = lastHeader.name.toLowerCase()
          if (Array.isArray(parsedHeaders[key])) {
            (parsedHeaders[key] as string[])[((parsedHeaders[key] as string[]).length - 1)] += '\n' + line.trim()
          } else if (parsedHeaders[key]) {
            parsedHeaders[key] = [parsedHeaders[key] as string, line.trim()]
          }
        } else {
          const colonIndex = line.indexOf(':')
          if (colonIndex > -1) {
            const name = line.substring(0, colonIndex).trim()
            const key = name.toLowerCase()
            const value = line.substring(colonIndex + 1).trim()
            
            allHeaders.push({ name, value })
            
            // For duplicate headers like Received, keep them as arrays
            if (parsedHeaders[key]) {
              if (Array.isArray(parsedHeaders[key])) {
                (parsedHeaders[key] as string[]).push(value)
              } else {
                parsedHeaders[key] = [parsedHeaders[key] as string, value]
              }
            } else {
              parsedHeaders[key] = value
            }
          }
        }
      }

      // Parse Received headers with detailed extraction
      const receivedHeaders = Array.isArray(parsedHeaders['received']) 
        ? (parsedHeaders['received'] as string[])
        : (parsedHeaders['received'] as string) ? [(parsedHeaders['received'] as string)] : []
      
      const parsedReceivedHeaders = receivedHeaders.map((header, idx) => {
        const fromMatch = header.match(/from\s+([^\[]+)(?:\[([^\]]+)\])?/)
        const byMatch = header.match(/by\s+([^\s]+)/)
        const withMatch = header.match(/with\s+([^\s]+)/)
        const timeMatch = header.match(/;?\s*(\d+\s+\w+\s+\d{4}\s+\d{2}:\d{2}:\d{2}\s+[+-]\d{4})/)

        return {
          hopNumber: idx + 1,
          from: fromMatch ? fromMatch[1].trim() : 'Unknown',
          fromIp: fromMatch && fromMatch[2] ? fromMatch[2] : 'Unknown',
          by: byMatch ? byMatch[1] : 'Unknown',
          with: withMatch ? withMatch[1] : 'Unknown',
          time: timeMatch ? timeMatch[1] : 'Unknown',
          fullHeader: header
        }
      })

      // Extract authentication results - handle both string and array cases
      let authenticationResults = ''
      const authResultsRaw = parsedHeaders['authentication-results']
      if (Array.isArray(authResultsRaw)) {
        authenticationResults = authResultsRaw[0] || ''
      } else if (typeof authResultsRaw === 'string') {
        authenticationResults = authResultsRaw
      }
      
      const dkimSignature = parsedHeaders['dkim-signature'] ? 'Present' : 'Not Found'
      const spfResult = parseHeaderValue(parsedHeaders['received-spf']) || parseSpfFromAuthResults(authenticationResults) || 'Not Found'
      const dmarcResult = parseHeaderValue(parsedHeaders['arc-authentication-results']) || parseDmarcFromAuthResults(authenticationResults) || 'Not Found'

      // Extract antispam and antivirus headers
      const xMsAntispamMailboxDelivery = parseHeaderValue(parsedHeaders['x-microsoft-antispam-mailbox-delivery']) || ''
      const xMsAntispamMessageInfo = parseHeaderValue(parsedHeaders['x-microsoft-antispam-message-info']) || ''
      const xForefrontAntiSpamReport = parseHeaderValue(parsedHeaders['x-forefront-antispam-report']) || ''

      // Parse antispam report header
      const parseAntispamReport = (report: string) => {
        if (!report) return {}
        const fields: Record<string, string> = {}
        const pairs = report.split(';').map(p => p.trim())
        pairs.forEach(pair => {
          const [key, value] = pair.split('=', 2).map(s => s.trim())
          if (key) fields[key] = value || ''
        })
        return fields
      }

      const antispamFields = parseAntispamReport(xForefrontAntiSpamReport)
      const antispamMailboxFields = parseAntispamReport(xMsAntispamMailboxDelivery)

      // Calculate spam score
      const spamAnalysis = calculateSpamScore(antispamFields, antispamMailboxFields, xMsAntispamMessageInfo)

      // Get originating IP
      let originatingIp = 'Unknown'
      if (parsedReceivedHeaders.length > 0) {
        originatingIp = parsedReceivedHeaders[parsedReceivedHeaders.length - 1].fromIp
      }

      // Get body preview
      const bodyContent = bodyStart > -1 ? lines.slice(bodyStart).join('\n') : ''
      const bodyPreview = bodyContent.substring(0, 500)

      // Extract URLs from body
      const urlRegex = /(https?:\/\/[^\s<>"{}|\\^`\[\]]*)/g
      const urls = new Set<string>()
      bodyContent.split('\n').forEach(line => {
        const matches = line.match(urlRegex)
        matches?.forEach(url => urls.add(url.replace(/[.,;:!?)]$/, '')))
      })

      // Extract delivery status notification info
      const reportingMta = parseHeaderValue(parsedHeaders['reporting-mta']) || ''
      const dsn = parseHeaderValue(parsedHeaders['status']) || ''

      // Prepare analysis object with placeholder for URL threat data
      const analysis = {
        summary: {
          subject: parseHeaderValue(parsedHeaders['subject']) || '(No Subject)',
          messageId: parseHeaderValue(parsedHeaders['message-id']) || 'Unknown',
          creationTime: parseHeaderValue(parsedHeaders['date']) || 'Unknown',
          from: parseHeaderValue(parsedHeaders['from']) || 'Unknown',
          to: parseHeaderValue(parsedHeaders['to']) || 'Unknown',
          originatingIp,
          deliveryStatus: dsn || 'Success'
        },
        headers: {
          from: parseHeaderValue(parsedHeaders['from']) || 'Unknown',
          to: parseHeaderValue(parsedHeaders['to']) || 'Unknown',
          cc: parseHeaderValue(parsedHeaders['cc']) || undefined,
          bcc: parseHeaderValue(parsedHeaders['bcc']) || undefined,
          subject: parseHeaderValue(parsedHeaders['subject']) || '(No Subject)',
          date: parseHeaderValue(parsedHeaders['date']) || 'Unknown',
          messageId: parseHeaderValue(parsedHeaders['message-id']) || 'Unknown',
          returnPath: parseHeaderValue(parsedHeaders['return-path']) || undefined,
          replyTo: parseHeaderValue(parsedHeaders['reply-to']) || undefined,
          contentType: parseHeaderValue(parsedHeaders['content-type']) || 'text/plain',
          dkim: dkimSignature,
          spf: spfResult,
          dmarc: dmarcResult,
          originatingIp,
          receivedHeaders: parsedReceivedHeaders
        },
        diagnostics: {
          authenticationResults: authenticationResults,
          xForefrontAntiSpamReport: antispamFields,
          xMsAntispamMailboxDelivery: antispamMailboxFields,
          xMsAntispamMessageInfo: xMsAntispamMessageInfo,
          reportingMta: reportingMta,
          spamAnalysis: spamAnalysis,
        },
        allHeaders: allHeaders,
        urlAnalysis: [],
        threatSummary: {
          emailRiskLevel: 'LOW',
          maliciousUrls: 0,
          phishingUrls: 0,
          suspiciousUrls: 0,
          totalUrlsScanned: 0,
          spamScore: spamAnalysis.spamScore,
          spamConfidenceLevel: spamAnalysis.spamConfidenceLevel,
          spamVerdict: spamAnalysis.spamVerdict,
          ipFilterVerdict: spamAnalysis.ipFilterVerdict,
          spamReasons: spamAnalysis.spamReasons,
        },
        attachmentAnalysis: [],
        bodyPreview: bodyPreview,
        isHtml: (parseHeaderValue(parsedHeaders['content-type']) || '').includes('html'),
        totalUrls: urls.size,
        totalAttachments: 0,
        fileName: 'header-analysis.txt',
        fileSize: headerInput.length,
        isHeaderAnalysis: true,
        extractedUrls: Array.from(urls)
      }

      setHeaderAnalysisResult(analysis)
      
      // Scan URLs if any found
      if (urls.size > 0) {
        scanHeaderUrls(Array.from(urls))
      }
    } catch (err) {
      setHeaderError(err instanceof Error ? err.message : 'Failed to parse email header')
    } finally {
      setIsParsingHeader(false)
    }
  }

  const scanHeaderUrls = async (urls: string[]) => {
    try {
      const response = await fetch('/api/scan-urls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls }),
      })

      if (!response.ok) {
        console.log("[v0] URL scanning failed")
        return
      }

      const data = await response.json()
      
      // Update header analysis result with threat data
      setHeaderAnalysisResult(prev => {
        if (!prev) return prev
        return {
          ...prev,
          urlAnalysis: data.results,
          threatSummary: data.threatSummary,
          totalUrls: urls.length,
        }
      })
    } catch (err) {
      console.log("[v0] Error scanning header URLs:", err)
    }
  }

  const parseSpfFromAuthResults = (authResults: string): string | null => {
    if (!authResults || typeof authResults !== 'string') return null
    const spfMatch = authResults.match(/spf=(\w+)/i)
    return spfMatch ? spfMatch[1] : null
  }

  const parseDmarcFromAuthResults = (authResults: string): string | null => {
    if (!authResults || typeof authResults !== 'string') return null
    const dmarcMatch = authResults.match(/dmarc=(\w+)/i)
    return dmarcMatch ? dmarcMatch[1] : null
  }

  const parseHeaderValue = (value: any): string | null => {
    if (!value) return null
    if (Array.isArray(value)) return value[0] || null
    if (typeof value === 'string') return value
    return null
  }

  const copyHeaderAnalysis = () => {
    if (!headerAnalysisResult) return
    const text = JSON.stringify(headerAnalysisResult, null, 2)
    navigator.clipboard.writeText(text)
    setHeaderCopied(true)
    setTimeout(() => setHeaderCopied(false), 2000)
  }

  const getThreatLevel = (malicious: number | undefined, suspicious: number | undefined) => {
    if (!malicious && !suspicious) return 'SAFE'
    if ((malicious || 0) > 0) return 'MALICIOUS'
    if ((suspicious || 0) > 0) return 'SUSPICIOUS'
    return 'SAFE'
  }

  const getThreatColor = (threatLevel: string) => {
    switch (threatLevel) {
      case 'MALICIOUS':
        return 'text-red-500'
      case 'SUSPICIOUS':
        return 'text-yellow-500'
      default:
        return 'text-green-500'
    }
  }

  const getThreatIcon = (threatLevel: string) => {
    switch (threatLevel) {
      case 'MALICIOUS':
      case 'SUSPICIOUS':
        return <AlertTriangle className="w-4 h-4" />
      default:
        return <CheckCircle className="w-4 h-4" />
    }
  }

  const downloadReport = () => {
    if (!result) return

    const reportText = `EMAIL ANALYSIS REPORT
Generated: ${new Date().toISOString()}

FILE INFORMATION
File Name: ${result.fileName}
File Size: ${result.fileSize} bytes

HEADERS
From: ${result.headers.from}
To: ${result.headers.to}
Subject: ${result.headers.subject}
Date: ${result.headers.date}
Message ID: ${result.headers.messageId}
Reply-To: ${result.headers.replyTo || 'N/A'}
CC: ${result.headers.cc || 'N/A'}
BCC: ${result.headers.bcc || 'N/A'}

AUTHENTICATION
DKIM: ${result.headers.dkim || 'Not Found'}
SPF: ${result.headers.spf || 'Not Found'}
DMARC: ${result.headers.dmarc || 'Not Found'}

THREAT ANALYSIS
Email Risk Level: ${result.threatSummary?.emailRiskLevel || 'Unknown'}
Malicious URLs: ${result.threatSummary?.maliciousUrls || 0}
Phishing URLs: ${result.threatSummary?.phishingUrls || 0}
Suspicious URLs: ${result.threatSummary?.suspiciousUrls || 0}
Total URLs Scanned: ${result.threatSummary?.totalUrlsScanned || 0}

URLS FOUND (${result.totalUrls})
${result.urlAnalysis.map(url => `URL: ${url.url}
  Status: ${url.error ? 'Error' : url.pending ? 'Pending' : 'Analyzed'}
  Threat Level: ${url.threatLevel || 'Unknown'}
  Malicious: ${url.malicious || 0}
  Suspicious: ${url.suspicious || 0}
  Harmless: ${url.harmless || 0}
  Undetected: ${url.undetected || 0}
${url.categories && Object.keys(url.categories).length > 0 ? `  Categories: ${Object.values(url.categories).join(', ')}` : ''}
`).join('\n')}

ATTACHMENTS (${result.totalAttachments})
${result.attachmentAnalysis.map(att => `File: ${att.filename}
  Type: ${att.mimetype}
  Size: ${att.size} bytes
  SHA256: ${att.sha256}
  Malicious: ${att.malicious || 0}
  Suspicious: ${att.suspicious || 0}
`).join('\n')}
`

    const blob = new Blob([reportText], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `email-analysis-${Date.now()}.txt`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg border border-primary/30">
              <Mail className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-primary tracking-widest">EMAIL ANALYSIS</h1>
              <p className="text-sm text-primary/60 mt-1">Analyze email headers, URLs, and attachments</p>
            </div>
          </div>
          <Link href="/">
            <Button variant="outline" size="sm" className="border border-primary/70 text-primary bg-transparent hover:bg-primary/10 hover:text-white hover:shadow-lg hover:shadow-primary/30 whitespace-nowrap transition-all duration-300 text-xs font-bold">
              <Home className="w-4 h-4 mr-1" />
              HOME
            </Button>
          </Link>
        </div>

        {/* Analysis Mode Tabs */}
        <Tabs defaultValue="file" className="w-full mb-8">
          <TabsList className="w-full justify-start bg-primary/5 border border-primary/20 rounded-lg p-1">
            <TabsTrigger value="file" className="text-sm">File Upload</TabsTrigger>
            <TabsTrigger value="header" className="text-sm">Header/Message Analysis</TabsTrigger>
          </TabsList>

          {/* File Upload Tab */}
          <TabsContent value="file" className="space-y-6">
        {/* File Upload Area */}
        <div className="mb-8">
          <div className="border-2 border-dashed border-primary/40 rounded-lg p-8 text-center hover:border-primary/60 transition-colors cursor-pointer"
            onClick={() => document.getElementById('fileInput')?.click()}>
            <input
              id="fileInput"
              type="file"
              accept=".eml,.msg"
              onChange={handleFileSelect}
              disabled={isAnalyzing}
              className="hidden"
            />
            <Upload className="w-12 h-12 text-primary/50 mx-auto mb-4" />
            <p className="text-primary font-semibold mb-2">Drop your email file here</p>
            <p className="text-sm text-primary/60">Supported formats: .eml, .msg</p>
            {selectedFile && (
              <p className="text-xs text-primary/50 mt-4">Selected: {selectedFile.name}</p>
            )}
          </div>
          {error && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-500">{error}</p>
            </div>
          )}
          {isAnalyzing && (
            <div className="mt-4 p-4 bg-primary/10 border border-primary/30 rounded-lg">
              <p className="text-sm text-primary animate-pulse">Analyzing email...</p>
            </div>
          )}
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-6">
            <div className="flex justify-between items-center p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <div>
                <h2 className="text-lg font-bold text-primary">Analysis Complete</h2>
                <p className="text-xs text-primary/60 mt-1">File: {result.fileName} ({result.fileSize} bytes)</p>
              </div>
              <Button onClick={downloadReport} size="sm" variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>

            {/* Threat Summary Section */}
            {result.threatSummary && (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg overflow-hidden">
                <div className="bg-blue-500/20 border-b border-blue-500/30 px-4 py-3">
                  <h3 className="text-sm font-bold text-blue-400">THREAT ANALYSIS SUMMARY</h3>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-background border border-primary/20 rounded p-3">
                      <p className="text-xs text-primary/60 font-semibold">EMAIL RISK LEVEL</p>
                      <div className="flex items-center gap-2 mt-2">
                        {result.threatSummary.emailRiskLevel === 'CRITICAL' && (
                          <>
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                            <p className="text-sm font-bold text-red-600">{result.threatSummary.emailRiskLevel}</p>
                          </>
                        )}
                        {result.threatSummary.emailRiskLevel === 'HIGH' && (
                          <>
                            <AlertTriangle className="w-5 h-5 text-orange-500" />
                            <p className="text-sm font-bold text-orange-500">{result.threatSummary.emailRiskLevel}</p>
                          </>
                        )}
                        {result.threatSummary.emailRiskLevel === 'MEDIUM' && (
                          <>
                            <AlertTriangle className="w-5 h-5 text-yellow-500" />
                            <p className="text-sm font-bold text-yellow-500">{result.threatSummary.emailRiskLevel}</p>
                          </>
                        )}
                        {result.threatSummary.emailRiskLevel === 'LOW' && (
                          <>
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            <p className="text-sm font-bold text-green-500">{result.threatSummary.emailRiskLevel}</p>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="bg-background border border-primary/20 rounded p-3">
                      <p className="text-xs text-primary/60 font-semibold">MALICIOUS URLS</p>
                      <p className="text-2xl font-bold text-red-600 mt-2">{result.threatSummary.maliciousUrls}</p>
                      <p className="text-xs text-primary/60 mt-1">out of {result.threatSummary.totalUrlsScanned} scanned</p>
                    </div>
                    <div className="bg-background border border-primary/20 rounded p-3">
                      <p className="text-xs text-primary/60 font-semibold">PHISHING URLS</p>
                      <p className="text-2xl font-bold text-orange-500 mt-2">{result.threatSummary.phishingUrls}</p>
                      <p className="text-xs text-primary/60 mt-1">URLs detected as phishing</p>
                    </div>
                    <div className="bg-background border border-primary/20 rounded p-3">
                      <p className="text-xs text-primary/60 font-semibold">SUSPICIOUS URLS</p>
                      <p className="text-2xl font-bold text-yellow-500 mt-2">{result.threatSummary.suspiciousUrls}</p>
                      <p className="text-xs text-primary/60 mt-1">Requires further review</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Spam Detection Section */}
            {result.threatSummary?.spamVerdict && (
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg overflow-hidden">
                <div className="bg-purple-500/20 border-b border-purple-500/30 px-4 py-3">
                  <h3 className="text-sm font-bold text-purple-400">SPAM & SECURITY ANALYSIS</h3>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-background border border-primary/20 rounded p-3">
                      <p className="text-xs text-primary/60 font-semibold">SPAM VERDICT</p>
                      <div className="flex items-center gap-2 mt-2">
                        {result.threatSummary.spamVerdict === 'SPAM' && (
                          <>
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                            <p className="text-sm font-bold text-red-600">SPAM</p>
                          </>
                        )}
                        {result.threatSummary.spamVerdict === 'SUSPICIOUS' && (
                          <>
                            <AlertTriangle className="w-5 h-5 text-orange-500" />
                            <p className="text-sm font-bold text-orange-500">SUSPICIOUS</p>
                          </>
                        )}
                        {result.threatSummary.spamVerdict === 'LOW_RISK' && (
                          <>
                            <AlertTriangle className="w-5 h-5 text-yellow-500" />
                            <p className="text-sm font-bold text-yellow-500">LOW RISK</p>
                          </>
                        )}
                        {result.threatSummary.spamVerdict === 'CLEAN' && (
                          <>
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            <p className="text-sm font-bold text-green-500">CLEAN</p>
                          </>
                        )}
                        {result.threatSummary.spamVerdict === 'UNKNOWN' && (
                          <>
                            <Mail className="w-5 h-5 text-gray-500" />
                            <p className="text-sm font-bold text-gray-500">UNKNOWN</p>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="bg-background border border-primary/20 rounded p-3">
                      <p className="text-xs text-primary/60 font-semibold">SPAM SCORE</p>
                      <p className="text-2xl font-bold text-purple-500 mt-2">{result.threatSummary.spamScore}</p>
                      <p className="text-xs text-primary/60 mt-1">out of 100</p>
                    </div>
                    <div className="bg-background border border-primary/20 rounded p-3">
                      <p className="text-xs text-primary/60 font-semibold">CONFIDENCE LEVEL</p>
                      <p className="text-2xl font-bold text-purple-400 mt-2">{result.threatSummary.spamConfidenceLevel}</p>
                      <p className="text-xs text-primary/60 mt-1">BCL/SCL score (0-9)</p>
                    </div>
                    <div className="bg-background border border-primary/20 rounded p-3">
                      <p className="text-xs text-primary/60 font-semibold">IP FILTER</p>
                      <div className="flex items-center gap-2 mt-2">
                        {result.threatSummary.ipFilterVerdict === 'BLOCKED' && (
                          <>
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                            <p className="text-xs font-bold text-red-500">BLOCKED</p>
                          </>
                        )}
                        {result.threatSummary.ipFilterVerdict === 'ALLOWED' && (
                          <>
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <p className="text-xs font-bold text-green-500">ALLOWED</p>
                          </>
                        )}
                        {result.threatSummary.ipFilterVerdict === 'UNKNOWN' && (
                          <>
                            <Mail className="w-4 h-4 text-gray-500" />
                            <p className="text-xs font-bold text-gray-500">UNKNOWN</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  {result.threatSummary.spamReasons && result.threatSummary.spamReasons.length > 0 && (
                    <div className="bg-background/50 rounded p-3 mt-3">
                      <p className="text-xs font-semibold text-primary/80 mb-2">Spam Indicators:</p>
                      <ul className="space-y-1">
                        {result.threatSummary.spamReasons.map((reason, idx) => (
                          <li key={idx} className="text-xs text-primary/60 flex items-start gap-2">
                            <span className="text-primary/40 mt-1">•</span>
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            <Tabs defaultValue="details" className="w-full">
              <TabsList className="w-full justify-start bg-primary/5 border border-primary/20 rounded-lg p-1 flex-wrap">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="authentication">Authentication</TabsTrigger>
                <TabsTrigger value="urls">URLs ({result.totalUrls})</TabsTrigger>
                <TabsTrigger value="attachments">Attachments ({result.totalAttachments})</TabsTrigger>
                <TabsTrigger value="transmission">Transmission</TabsTrigger>
                <TabsTrigger value="xheaders">X-Headers</TabsTrigger>
                <TabsTrigger value="preview">Body Preview</TabsTrigger>
              </TabsList>

              {/* Details Tab */}
              <TabsContent value="details" className="space-y-3">
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-primary/60 font-semibold">FROM</p>
                      <p className="text-sm text-foreground mt-1 break-all">{result.headers.from}</p>
                    </div>
                    <div>
                      <p className="text-xs text-primary/60 font-semibold">TO</p>
                      <p className="text-sm text-foreground mt-1 break-all">{result.headers.to}</p>
                    </div>
                    <div>
                      <p className="text-xs text-primary/60 font-semibold">CC</p>
                      <p className="text-sm text-foreground mt-1">{result.headers.cc || 'None'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-primary/60 font-semibold">BCC</p>
                      <p className="text-sm text-foreground mt-1">{result.headers.bcc || 'None'}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-xs text-primary/60 font-semibold">SUBJECT</p>
                      <p className="text-sm text-foreground mt-1">{result.headers.subject}</p>
                    </div>
                    <div>
                      <p className="text-xs text-primary/60 font-semibold">DATE</p>
                      <p className="text-sm text-foreground mt-1">{result.headers.date}</p>
                    </div>
                    <div>
                      <p className="text-xs text-primary/60 font-semibold">RETURN-PATH</p>
                      <p className="text-sm text-foreground mt-1 break-all">{result.headers.returnPath || 'None'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-primary/60 font-semibold">REPLY-TO</p>
                      <p className="text-sm text-foreground mt-1 break-all">{result.headers.replyTo || 'None'}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-xs text-primary/60 font-semibold">MESSAGE ID</p>
                      <p className="text-xs text-foreground mt-1 font-mono break-all">{result.headers.messageId}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-xs text-primary/60 font-semibold">ORIGINATING IP</p>
                      <p className="text-sm text-foreground mt-1 font-mono">{result.headers.originatingIp || 'Unknown'}</p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Authentication Tab */}
              <TabsContent value="authentication" className="space-y-3">
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border border-primary/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        {result.headers.dkim === 'Present' ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-yellow-500" />
                        )}
                        <p className="text-sm font-bold text-primary">DKIM</p>
                      </div>
                      <p className="text-xs text-foreground">{result.headers.dkim || 'Not Found'}</p>
                    </div>
                    <div className="p-4 border border-primary/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        {result.headers.spf && result.headers.spf !== 'Not Found' ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-yellow-500" />
                        )}
                        <p className="text-sm font-bold text-primary">SPF</p>
                      </div>
                      <p className="text-xs text-foreground break-all">{result.headers.spf || 'Not Found'}</p>
                    </div>
                    <div className="p-4 border border-primary/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        {result.headers.dmarc && result.headers.dmarc !== 'Not Found' ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-yellow-500" />
                        )}
                        <p className="text-sm font-bold text-primary">DMARC</p>
                      </div>
                      <p className="text-xs text-foreground break-all">{result.headers.dmarc || 'Not Found'}</p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Transmission Tab */}
              <TabsContent value="transmission" className="space-y-3">
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  {result.headers.receivedHeaders && result.headers.receivedHeaders.length > 0 ? (
                    <div className="space-y-4">
                      {result.headers.receivedHeaders.map((hop: string, idx: number) => (
                        <div key={idx} className="border-l-2 border-primary/40 pl-4 py-2">
                          <p className="text-xs text-primary/60 font-semibold mb-2">Hop {idx + 1}</p>
                          <p className="text-xs text-foreground break-all font-mono">{hop}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-primary/60 text-center py-4">No transmission trace available</p>
                  )}
                </div>
              </TabsContent>

              {/* X-Headers Tab */}
              <TabsContent value="xheaders" className="space-y-3">
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  {result.headers.xHeaders && Object.keys(result.headers.xHeaders).length > 0 ? (
                    <div className="space-y-3">
                      {Object.entries(result.headers.xHeaders).map(([key, value]) => (
                        <div key={key} className="border border-primary/10 rounded p-3">
                          <p className="text-xs text-primary/60 font-semibold mb-1">{key}</p>
                          <p className="text-xs text-foreground break-all">{String(value)}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-primary/60 text-center py-4">No X-Headers found</p>
                  )}
                </div>
              </TabsContent>

              {/* URLs Tab */}
              <TabsContent value="urls" className="space-y-3">
                {result.urlAnalysis.length === 0 ? (
                  <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg text-center text-primary/60">
                    No URLs found in email
                  </div>
                ) : (
                  <div className="space-y-3">
                    {result.urlAnalysis.map((urlItem, idx) => {
                      let threatStatusBg = 'bg-green-500/10 border-green-500/30'
                      let threatStatusText = 'text-green-400'
                      let threatStatusLabel = 'SAFE'
                      
                      if (urlItem.error) {
                        threatStatusBg = 'bg-gray-500/10 border-gray-500/30'
                        threatStatusText = 'text-gray-400'
                        threatStatusLabel = 'ERROR'
                      } else if (urlItem.threatLevel === 'CRITICAL') {
                        threatStatusBg = 'bg-red-600/10 border-red-600/30'
                        threatStatusText = 'text-red-500'
                        threatStatusLabel = 'CRITICAL'
                      } else if (urlItem.threatLevel === 'HIGH') {
                        threatStatusBg = 'bg-orange-500/10 border-orange-500/30'
                        threatStatusText = 'text-orange-500'
                        threatStatusLabel = 'HIGH'
                      } else if (urlItem.threatLevel === 'MEDIUM') {
                        threatStatusBg = 'bg-yellow-500/10 border-yellow-500/30'
                        threatStatusText = 'text-yellow-500'
                        threatStatusLabel = 'MEDIUM'
                      } else if (urlItem.threatLevel === 'LOW') {
                        threatStatusBg = 'bg-amber-500/10 border-amber-500/30'
                        threatStatusText = 'text-amber-500'
                        threatStatusLabel = 'LOW'
                      }
                      
                      return (
                        <div key={idx} className={`${threatStatusBg} border rounded-lg p-4 space-y-2`}>
                          <div className="flex items-start justify-between gap-4">
                            <p className="text-sm text-foreground font-mono break-all flex-1">{urlItem.url}</p>
                            <div className={`flex-shrink-0 px-3 py-1 rounded font-bold text-xs whitespace-nowrap ${threatStatusText}`}>
                              ✓ {threatStatusLabel}
                            </div>
                          </div>
                          {!urlItem.error && (
                            <div className="flex gap-4 text-xs">
                              <div className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                <span className="text-red-500 font-semibold">{urlItem.malicious || 0} Malicious</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                                <span className="text-yellow-500 font-semibold">{urlItem.suspicious || 0} Suspicious</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                <span className="text-green-500 font-semibold">{urlItem.undetected || 0} Undetected</span>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </TabsContent>

              {/* Attachments Tab */}
              <TabsContent value="attachments" className="space-y-3">
                {result.attachmentAnalysis.length === 0 ? (
                  <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg text-center text-primary/60">
                    No attachments found in email
                  </div>
                ) : (
                  result.attachmentAnalysis.map((attachment, idx) => {
                    const threatLevel = getThreatLevel(attachment.malicious, attachment.suspicious)
                    return (
                      <div key={idx} className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div>
                            <p className="text-sm text-foreground font-semibold">{attachment.filename}</p>
                            <p className="text-xs text-primary/60 mt-1">{attachment.mimetype} • {attachment.size} bytes</p>
                          </div>
                          <div className={`flex items-center gap-1 flex-shrink-0 ${getThreatColor(threatLevel)}`}>
                            {getThreatIcon(threatLevel)}
                            <span className="text-xs font-bold">{threatLevel}</span>
                          </div>
                        </div>
                        <p className="text-xs text-primary/60 font-mono mb-3 break-all">SHA256: {attachment.sha256}</p>
                        {attachment.error ? (
                          <p className="text-xs text-primary/60">Analysis failed</p>
                        ) : (
                          <div className="flex gap-4 text-xs">
                            <span className="text-red-500">🔴 {attachment.malicious || 0} Malicious</span>
                            <span className="text-yellow-500">🟡 {attachment.suspicious || 0} Suspicious</span>
                          </div>
                        )}
                      </div>
                    )
                  })
                )}
              </TabsContent>

              {/* Body Preview Tab */}
              <TabsContent value="preview" className="space-y-3">
                <div className="space-y-3">
                  {result.isHtml && result.bodyHtml ? (
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                      <p className="text-xs text-primary/60 font-semibold mb-3">RENDERED EMAIL PREVIEW</p>
                      <div className="bg-white border border-primary/20 rounded p-4 max-h-96 overflow-y-auto">
                        <iframe
                          srcDoc={`<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
body { font-family: Arial, sans-serif; margin: 0; padding: 10px; }
img { max-width: 100%; height: auto; }
a { color: #0066cc; }
table { border-collapse: collapse; }
</style>
</head>
<body>
${result.bodyHtml}
</body>
</html>`}
                          className="w-full border-0"
                          style={{ minHeight: '300px', display: 'block' }}
                          sandbox={{ allow: ['same-origin'] } as any}
                          title="Email Preview"
                        />
                      </div>
                    </div>
                  ) : null}
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                    <p className="text-xs text-primary/60 font-semibold mb-3">
                      {result.isHtml ? 'HTML SOURCE (First 5000 characters)' : 'TEXT CONTENT (First 5000 characters)'}
                    </p>
                    <div className="bg-background border border-primary/20 rounded p-3 max-h-96 overflow-y-auto">
                      <p className="text-xs text-foreground whitespace-pre-wrap break-words font-mono">
                        {result.bodyPreview || 'No content available'}
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setResult(null)
                  setSelectedFile(null)
                  setError(null)
                }}
                className="flex-1"
              >
                Analyze Another Email
              </Button>
            </div>
          </div>
        )}
          </TabsContent>

          {/* Header Analysis Tab */}
          <TabsContent value="header" className="space-y-6">
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 space-y-4">
              <div>
                <h3 className="text-lg font-bold text-primary mb-3">EMAIL HEADER/MESSAGE ANALYZER</h3>
                <p className="text-xs text-primary/60 mb-4">Similar to Microsoft Message Analyzer - Paste email headers or raw message content for analysis</p>
              </div>
              
              <div>
                <label className="text-sm font-bold text-primary/60 mb-2 block">PASTE EMAIL HEADER OR RAW MESSAGE</label>
                <textarea
                  value={headerInput}
                  onChange={(e) => setHeaderInput(e.target.value)}
                  disabled={isParsingHeader}
                  placeholder="Paste email headers here. Example:&#10;From: sender@example.com&#10;To: recipient@example.com&#10;Subject: Test Email&#10;Date: Mon, 1 Jan 2024 12:00:00 +0000&#10;...&#10;&#10;(Email body content here)"
                  className="w-full h-64 px-4 py-3 bg-background border border-primary/20 rounded-lg text-foreground placeholder:text-primary/40 focus:outline-none focus:border-primary resize-none font-mono text-xs"
                />
              </div>

              {headerError && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-500">{headerError}</p>
                </div>
              )}

              <button
                onClick={parseEmailHeader}
                disabled={isParsingHeader || !headerInput.trim()}
                className="w-full px-6 py-3 bg-primary/20 border border-primary/40 text-primary hover:bg-primary/30 disabled:opacity-50 rounded font-bold transition-all text-sm"
              >
                {isParsingHeader ? 'ANALYZING...' : 'ANALYZE HEADER'}
              </button>
            </div>

            {/* Header Analysis Results */}
            {headerAnalysisResult && (
              <div className="space-y-6">
                {/* Summary Section */}
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg overflow-hidden">
                  <div className="bg-blue-500/20 border-b border-blue-500/30 px-4 py-3">
                    <h3 className="text-sm font-bold text-blue-400">SUMMARY</h3>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-primary/60 font-semibold">SUBJECT</p>
                        <p className="text-sm text-foreground mt-1 break-all font-semibold">{headerAnalysisResult.summary.subject}</p>
                      </div>
                      <div>
                        <p className="text-xs text-primary/60 font-semibold">MESSAGE ID</p>
                        <p className="text-xs text-foreground mt-1 break-all font-mono">{headerAnalysisResult.summary.messageId}</p>
                      </div>
                      <div>
                        <p className="text-xs text-primary/60 font-semibold">CREATION TIME</p>
                        <p className="text-xs text-foreground mt-1">{headerAnalysisResult.summary.creationTime}</p>
                      </div>
                      <div>
                        <p className="text-xs text-primary/60 font-semibold">ORIGINATING IP</p>
                        <p className="text-xs text-foreground mt-1 font-mono">{headerAnalysisResult.summary.originatingIp}</p>
                      </div>
                      <div>
                        <p className="text-xs text-primary/60 font-semibold">FROM</p>
                        <p className="text-xs text-foreground mt-1 break-all">{headerAnalysisResult.summary.from}</p>
                      </div>
                      <div>
                        <p className="text-xs text-primary/60 font-semibold">TO</p>
                        <p className="text-xs text-foreground mt-1 break-all">{headerAnalysisResult.summary.to}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Threat Summary Section */}
                {headerAnalysisResult.threatSummary && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg overflow-hidden">
                    <div className="bg-red-500/20 border-b border-red-500/30 px-4 py-3">
                      <h3 className="text-sm font-bold text-red-400">THREAT ANALYSIS SUMMARY</h3>
                    </div>
                    <div className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-background border border-primary/20 rounded p-3">
                          <p className="text-xs text-primary/60 font-semibold">EMAIL RISK LEVEL</p>
                          <div className="flex items-center gap-2 mt-2">
                            {headerAnalysisResult.threatSummary.emailRiskLevel === 'CRITICAL' && (
                              <>
                                <AlertTriangle className="w-5 h-5 text-red-600" />
                                <p className="text-sm font-bold text-red-600">{headerAnalysisResult.threatSummary.emailRiskLevel}</p>
                              </>
                            )}
                            {headerAnalysisResult.threatSummary.emailRiskLevel === 'HIGH' && (
                              <>
                                <AlertTriangle className="w-5 h-5 text-orange-500" />
                                <p className="text-sm font-bold text-orange-500">{headerAnalysisResult.threatSummary.emailRiskLevel}</p>
                              </>
                            )}
                            {headerAnalysisResult.threatSummary.emailRiskLevel === 'MEDIUM' && (
                              <>
                                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                                <p className="text-sm font-bold text-yellow-500">{headerAnalysisResult.threatSummary.emailRiskLevel}</p>
                              </>
                            )}
                            {headerAnalysisResult.threatSummary.emailRiskLevel === 'LOW' && (
                              <>
                                <CheckCircle className="w-5 h-5 text-green-500" />
                                <p className="text-sm font-bold text-green-500">{headerAnalysisResult.threatSummary.emailRiskLevel}</p>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="bg-background border border-primary/20 rounded p-3">
                          <p className="text-xs text-primary/60 font-semibold">MALICIOUS URLS</p>
                          <p className="text-2xl font-bold text-red-600 mt-2">{headerAnalysisResult.threatSummary.maliciousUrls}</p>
                          <p className="text-xs text-primary/60 mt-1">out of {headerAnalysisResult.threatSummary.totalUrlsScanned} scanned</p>
                        </div>
                        <div className="bg-background border border-primary/20 rounded p-3">
                          <p className="text-xs text-primary/60 font-semibold">PHISHING URLS</p>
                          <p className="text-2xl font-bold text-orange-500 mt-2">{headerAnalysisResult.threatSummary.phishingUrls}</p>
                          <p className="text-xs text-primary/60 mt-1">URLs detected as phishing</p>
                        </div>
                        <div className="bg-background border border-primary/20 rounded p-3">
                          <p className="text-xs text-primary/60 font-semibold">SUSPICIOUS URLS</p>
                          <p className="text-2xl font-bold text-yellow-500 mt-2">{headerAnalysisResult.threatSummary.suspiciousUrls}</p>
                          <p className="text-xs text-primary/60 mt-1">Requires further review</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Spam Detection Section */}
                {headerAnalysisResult.threatSummary?.spamVerdict && (
                  <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg overflow-hidden">
                    <div className="bg-purple-500/20 border-b border-purple-500/30 px-4 py-3">
                      <h3 className="text-sm font-bold text-purple-400">SPAM & SECURITY ANALYSIS</h3>
                    </div>
                    <div className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div className="bg-background border border-primary/20 rounded p-3">
                          <p className="text-xs text-primary/60 font-semibold">SPAM VERDICT</p>
                          <div className="flex items-center gap-2 mt-2">
                            {headerAnalysisResult.threatSummary.spamVerdict === 'SPAM' && (
                              <>
                                <AlertTriangle className="w-5 h-5 text-red-600" />
                                <p className="text-sm font-bold text-red-600">SPAM</p>
                              </>
                            )}
                            {headerAnalysisResult.threatSummary.spamVerdict === 'SUSPICIOUS' && (
                              <>
                                <AlertTriangle className="w-5 h-5 text-orange-500" />
                                <p className="text-sm font-bold text-orange-500">SUSPICIOUS</p>
                              </>
                            )}
                            {headerAnalysisResult.threatSummary.spamVerdict === 'LOW_RISK' && (
                              <>
                                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                                <p className="text-sm font-bold text-yellow-500">LOW RISK</p>
                              </>
                            )}
                            {headerAnalysisResult.threatSummary.spamVerdict === 'CLEAN' && (
                              <>
                                <CheckCircle className="w-5 h-5 text-green-500" />
                                <p className="text-sm font-bold text-green-500">CLEAN</p>
                              </>
                            )}
                            {headerAnalysisResult.threatSummary.spamVerdict === 'UNKNOWN' && (
                              <>
                                <Mail className="w-5 h-5 text-gray-500" />
                                <p className="text-sm font-bold text-gray-500">UNKNOWN</p>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="bg-background border border-primary/20 rounded p-3">
                          <p className="text-xs text-primary/60 font-semibold">SPAM SCORE</p>
                          <p className="text-2xl font-bold text-purple-500 mt-2">{headerAnalysisResult.threatSummary.spamScore}</p>
                          <p className="text-xs text-primary/60 mt-1">out of 100</p>
                        </div>
                        <div className="bg-background border border-primary/20 rounded p-3">
                          <p className="text-xs text-primary/60 font-semibold">CONFIDENCE LEVEL</p>
                          <p className="text-2xl font-bold text-purple-400 mt-2">{headerAnalysisResult.threatSummary.spamConfidenceLevel}</p>
                          <p className="text-xs text-primary/60 mt-1">BCL/SCL score (0-9)</p>
                        </div>
                        <div className="bg-background border border-primary/20 rounded p-3">
                          <p className="text-xs text-primary/60 font-semibold">IP FILTER</p>
                          <div className="flex items-center gap-2 mt-2">
                            {headerAnalysisResult.threatSummary.ipFilterVerdict === 'BLOCKED' && (
                              <>
                                <AlertTriangle className="w-4 h-4 text-red-500" />
                                <p className="text-xs font-bold text-red-500">BLOCKED</p>
                              </>
                            )}
                            {headerAnalysisResult.threatSummary.ipFilterVerdict === 'ALLOWED' && (
                              <>
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                <p className="text-xs font-bold text-green-500">ALLOWED</p>
                              </>
                            )}
                            {headerAnalysisResult.threatSummary.ipFilterVerdict === 'UNKNOWN' && (
                              <>
                                <Mail className="w-4 h-4 text-gray-500" />
                                <p className="text-xs font-bold text-gray-500">UNKNOWN</p>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      {headerAnalysisResult.threatSummary.spamReasons && headerAnalysisResult.threatSummary.spamReasons.length > 0 && (
                        <div className="bg-background/50 rounded p-3 mt-3">
                          <p className="text-xs font-semibold text-primary/80 mb-2">Spam Indicators:</p>
                          <ul className="space-y-1">
                            {headerAnalysisResult.threatSummary.spamReasons.map((reason, idx) => (
                              <li key={idx} className="text-xs text-primary/60 flex items-start gap-2">
                                <span className="text-primary/40 mt-1">•</span>
                                <span>{reason}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg overflow-hidden">
                  <div className="bg-blue-500/20 border-b border-blue-500/30 px-4 py-3">
                    <h3 className="text-sm font-bold text-blue-400">DIAGNOSTICS REPORT</h3>
                  </div>
                  <div className="p-4">
                    <div className="space-y-3">
                      {headerAnalysisResult.diagnostics.xForefrontAntiSpamReport && Object.keys(headerAnalysisResult.diagnostics.xForefrontAntiSpamReport).length > 0 && (
                        <div>
                          <p className="text-xs text-primary/60 font-semibold mb-2">Forefront Antispam Report Header</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {Object.entries(headerAnalysisResult.diagnostics.xForefrontAntiSpamReport).map(([key, value], idx) => (
                              <div key={idx} className="bg-primary/5 p-2 rounded border border-primary/20">
                                <p className="text-xs text-primary/60 font-semibold">{key.toUpperCase()}</p>
                                <p className="text-xs text-foreground mt-1 break-all">{value || 'Not Set'}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {headerAnalysisResult.diagnostics.xMsAntispamMailboxDelivery && Object.keys(headerAnalysisResult.diagnostics.xMsAntispamMailboxDelivery).length > 0 && (
                        <div className="mt-4">
                          <p className="text-xs text-primary/60 font-semibold mb-2">Microsoft Antispam Header</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {Object.entries(headerAnalysisResult.diagnostics.xMsAntispamMailboxDelivery).map(([key, value], idx) => (
                              <div key={idx} className="bg-primary/5 p-2 rounded border border-primary/20">
                                <p className="text-xs text-primary/60 font-semibold">{key.toUpperCase()}</p>
                                <p className="text-xs text-foreground mt-1 break-all">{value || 'Not Set'}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Received Headers Table */}
                {headerAnalysisResult.headers.receivedHeaders.length > 0 && (
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg overflow-hidden">
                    <div className="bg-blue-500/20 border-b border-blue-500/30 px-4 py-3">
                      <h3 className="text-sm font-bold text-blue-400">RECEIVED HEADERS</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-primary/10 border-b border-primary/20">
                            <th className="px-3 py-2 text-left text-primary/60 font-semibold">HOP #</th>
                            <th className="px-3 py-2 text-left text-primary/60 font-semibold">SUBMITTING HOST</th>
                            <th className="px-3 py-2 text-left text-primary/60 font-semibold">RECEIVING HOST</th>
                            <th className="px-3 py-2 text-left text-primary/60 font-semibold">TIME</th>
                            <th className="px-3 py-2 text-left text-primary/60 font-semibold">TYPE</th>
                          </tr>
                        </thead>
                        <tbody>
                          {headerAnalysisResult.headers.receivedHeaders.map((header, idx) => (
                            <tr key={idx} className={idx % 2 === 0 ? 'bg-primary/5' : 'bg-background border-b border-primary/10'}>
                              <td className="px-3 py-2 text-foreground font-mono">{header.hopNumber}</td>
                              <td className="px-3 py-2 text-foreground font-mono break-all">{header.from} [{header.fromIp}]</td>
                              <td className="px-3 py-2 text-foreground font-mono break-all">{header.by}</td>
                              <td className="px-3 py-2 text-foreground text-nowrap">{header.time.substring(0, 19)}</td>
                              <td className="px-3 py-2 text-foreground">{header.with}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <Tabs defaultValue="details" className="w-full">
                  <TabsList className="w-full justify-start bg-primary/5 border border-primary/20 rounded-lg p-1 flex-wrap">
                    <TabsTrigger value="details">Core Headers</TabsTrigger>
                    <TabsTrigger value="authentication">Authentication</TabsTrigger>
                    <TabsTrigger value="urls">URLs ({headerAnalysisResult.totalUrls})</TabsTrigger>
                    <TabsTrigger value="allheaders">All Headers</TabsTrigger>
                    <TabsTrigger value="transmission">Message Route</TabsTrigger>
                  </TabsList>

                  {/* Core Headers Tab */}
                  <TabsContent value="details" className="space-y-3">
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-primary/60 font-semibold">FROM</p>
                          <p className="text-sm text-foreground mt-1 break-all">{headerAnalysisResult.headers.from}</p>
                        </div>
                        <div>
                          <p className="text-xs text-primary/60 font-semibold">TO</p>
                          <p className="text-sm text-foreground mt-1 break-all">{headerAnalysisResult.headers.to}</p>
                        </div>
                        {headerAnalysisResult.headers.cc && (
                          <div>
                            <p className="text-xs text-primary/60 font-semibold">CC</p>
                            <p className="text-sm text-foreground mt-1 break-all">{headerAnalysisResult.headers.cc}</p>
                          </div>
                        )}
                        {headerAnalysisResult.headers.bcc && (
                          <div>
                            <p className="text-xs text-primary/60 font-semibold">BCC</p>
                            <p className="text-sm text-foreground mt-1 break-all">{headerAnalysisResult.headers.bcc}</p>
                          </div>
                        )}
                        <div className="md:col-span-2">
                          <p className="text-xs text-primary/60 font-semibold">SUBJECT</p>
                          <p className="text-sm text-foreground mt-1">{headerAnalysisResult.headers.subject}</p>
                        </div>
                        <div>
                          <p className="text-xs text-primary/60 font-semibold">DATE</p>
                          <p className="text-xs text-foreground mt-1">{headerAnalysisResult.headers.date}</p>
                        </div>
                        <div>
                          <p className="text-xs text-primary/60 font-semibold">MESSAGE ID</p>
                          <p className="text-xs text-foreground mt-1 font-mono break-all">{headerAnalysisResult.headers.messageId}</p>
                        </div>
                        {headerAnalysisResult.headers.returnPath && (
                          <div>
                            <p className="text-xs text-primary/60 font-semibold">RETURN-PATH</p>
                            <p className="text-xs text-foreground mt-1 break-all">{headerAnalysisResult.headers.returnPath}</p>
                          </div>
                        )}
                        {headerAnalysisResult.headers.replyTo && (
                          <div>
                            <p className="text-xs text-primary/60 font-semibold">REPLY-TO</p>
                            <p className="text-xs text-foreground mt-1 break-all">{headerAnalysisResult.headers.replyTo}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-xs text-primary/60 font-semibold">CONTENT-TYPE</p>
                          <p className="text-xs text-foreground mt-1 break-all">{headerAnalysisResult.headers.contentType}</p>
                        </div>
                        <div className="md:col-span-2">
                          <p className="text-xs text-primary/60 font-semibold">ORIGINATING IP</p>
                          <p className="text-xs text-foreground mt-1 font-mono">{headerAnalysisResult.headers.originatingIp}</p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Authentication Tab */}
                  <TabsContent value="authentication" className="space-y-3">
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 border border-primary/20 rounded-lg bg-background">
                          <div className="flex items-center gap-2 mb-2">
                            {headerAnalysisResult.headers.dkim === 'Present' ? (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : (
                              <AlertTriangle className="w-5 h-5 text-yellow-500" />
                            )}
                            <p className="text-sm font-bold text-primary">DKIM</p>
                          </div>
                          <p className="text-xs text-foreground break-all">{headerAnalysisResult.headers.dkim}</p>
                        </div>
                        <div className="p-4 border border-primary/20 rounded-lg bg-background">
                          <div className="flex items-center gap-2 mb-2">
                            {headerAnalysisResult.headers.spf && headerAnalysisResult.headers.spf !== 'Not Found' ? (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : (
                              <AlertTriangle className="w-5 h-5 text-yellow-500" />
                            )}
                            <p className="text-sm font-bold text-primary">SPF</p>
                          </div>
                          <p className="text-xs text-foreground break-all">{headerAnalysisResult.headers.spf}</p>
                        </div>
                        <div className="p-4 border border-primary/20 rounded-lg bg-background">
                          <div className="flex items-center gap-2 mb-2">
                            {headerAnalysisResult.headers.dmarc && headerAnalysisResult.headers.dmarc !== 'Not Found' ? (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : (
                              <AlertTriangle className="w-5 h-5 text-yellow-500" />
                            )}
                            <p className="text-sm font-bold text-primary">DMARC</p>
                          </div>
                          <p className="text-xs text-foreground break-all">{headerAnalysisResult.headers.dmarc}</p>
                        </div>
                      </div>
                      {headerAnalysisResult.diagnostics.authenticationResults && (
                        <div className="mt-4 p-4 bg-background border border-primary/20 rounded-lg">
                          <p className="text-xs text-primary/60 font-semibold mb-2">AUTHENTICATION-RESULTS</p>
                          <p className="text-xs text-foreground break-all font-mono">{headerAnalysisResult.diagnostics.authenticationResults}</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  {/* URLs Tab */}
                  <TabsContent value="urls" className="space-y-3">
                    {headerAnalysisResult.urlAnalysis.length === 0 ? (
                      <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg text-center text-primary/60">
                        No URLs found in email headers
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {headerAnalysisResult.urlAnalysis.map((urlItem, idx) => {
                          let threatColor = 'bg-green-500/10 border-green-500/30'
                          let threatBadgeColor = 'bg-green-500/20 text-green-400'
                          let threatIcon = <CheckCircle className="w-4 h-4" />
                          
                          if (urlItem.error) {
                            threatColor = 'bg-gray-500/10 border-gray-500/30'
                            threatBadgeColor = 'bg-gray-500/20 text-gray-400'
                            threatIcon = <AlertCircle className="w-4 h-4" />
                          } else if (urlItem.pending) {
                            threatColor = 'bg-gray-500/10 border-gray-500/30'
                            threatBadgeColor = 'bg-gray-500/20 text-gray-400'
                            threatIcon = <Mail className="w-4 h-4" />
                          } else if (urlItem.threatLevel === 'CRITICAL') {
                            threatColor = 'bg-red-600/10 border-red-600/30'
                            threatBadgeColor = 'bg-red-600/20 text-red-500'
                            threatIcon = <AlertTriangle className="w-4 h-4" />
                          } else if (urlItem.threatLevel === 'HIGH') {
                            threatColor = 'bg-orange-500/10 border-orange-500/30'
                            threatBadgeColor = 'bg-orange-500/20 text-orange-500'
                            threatIcon = <AlertTriangle className="w-4 h-4" />
                          } else if (urlItem.threatLevel === 'MEDIUM') {
                            threatColor = 'bg-yellow-500/10 border-yellow-500/30'
                            threatBadgeColor = 'bg-yellow-500/20 text-yellow-500'
                            threatIcon = <AlertTriangle className="w-4 h-4" />
                          } else if (urlItem.threatLevel === 'LOW') {
                            threatColor = 'bg-amber-500/10 border-amber-500/30'
                            threatBadgeColor = 'bg-amber-500/20 text-amber-500'
                            threatIcon = <AlertTriangle className="w-4 h-4" />
                          }
                          
                          return (
                            <div key={idx} className={`${threatColor} border rounded-lg p-4`}>
                              <div className="flex items-start justify-between gap-4 mb-3">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-foreground font-mono break-all">{urlItem.url}</p>
                                  {urlItem.categories && Object.keys(urlItem.categories).length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                      {Object.values(urlItem.categories).slice(0, 3).map((cat, idx) => (
                                        <span key={idx} className="text-xs bg-primary/20 px-2 py-1 rounded text-primary/80">
                                          {cat}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <div className={`flex items-center gap-2 flex-shrink-0 px-3 py-1 rounded ${threatBadgeColor}`}>
                                  {threatIcon}
                                  <span className="text-xs font-bold whitespace-nowrap">{urlItem.threatLevel}</span>
                                </div>
                              </div>
                              {urlItem.error ? (
                                <p className="text-xs text-primary/60">Analysis failed - could not reach VirusTotal</p>
                              ) : urlItem.pending ? (
                                <p className="text-xs text-primary/60">Pending - submitted for scanning on VirusTotal</p>
                              ) : (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                                  <div className="bg-background/50 rounded p-2">
                                    <p className="text-red-500 font-semibold">{urlItem.malicious || 0}</p>
                                    <p className="text-primary/60 text-xs">Malicious</p>
                                  </div>
                                  <div className="bg-background/50 rounded p-2">
                                    <p className="text-yellow-500 font-semibold">{urlItem.suspicious || 0}</p>
                                    <p className="text-primary/60 text-xs">Suspicious</p>
                                  </div>
                                  <div className="bg-background/50 rounded p-2">
                                    <p className="text-green-500 font-semibold">{urlItem.harmless || 0}</p>
                                    <p className="text-primary/60 text-xs">Harmless</p>
                                  </div>
                                  <div className="bg-background/50 rounded p-2">
                                    <p className="text-primary/60 font-semibold">{urlItem.undetected || 0}</p>
                                    <p className="text-primary/60 text-xs">Undetected</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="allheaders" className="space-y-3">
                    <div className="bg-primary/5 border border-primary/20 rounded-lg overflow-hidden">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-primary/10 border-b border-primary/20">
                            <th className="px-4 py-2 text-left text-primary/60 font-semibold w-40">HEADER</th>
                            <th className="px-4 py-2 text-left text-primary/60 font-semibold">VALUE</th>
                          </tr>
                        </thead>
                        <tbody>
                          {headerAnalysisResult.allHeaders.map((header, idx) => (
                            <tr key={idx} className={idx % 2 === 0 ? 'bg-primary/5' : 'bg-background'}>
                              <td className="px-4 py-2 font-semibold text-blue-400 align-top">{header.name}</td>
                              <td className="px-4 py-2 text-foreground break-all font-mono text-xs">{header.value}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </TabsContent>

                  {/* Message Route Tab */}
                  <TabsContent value="transmission" className="space-y-3">
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                      <p className="text-xs text-primary/60 font-semibold mb-4">COMPLETE MESSAGE TRANSMISSION PATH</p>
                      <div className="space-y-3">
                        {headerAnalysisResult.headers.receivedHeaders.length > 0 ? (
                          headerAnalysisResult.headers.receivedHeaders.map((header, idx) => (
                            <div key={idx} className="bg-background border border-primary/20 rounded p-3">
                              <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-6 h-6 bg-primary/20 border border-primary/40 rounded-full flex items-center justify-center">
                                  <span className="text-xs font-bold text-primary">{header.hopNumber}</span>
                                </div>
                                <div className="flex-1">
                                  <p className="text-xs text-primary/60 font-semibold">FROM</p>
                                  <p className="text-xs text-foreground font-mono mb-2">{header.from} [{header.fromIp}]</p>
                                  <p className="text-xs text-primary/60 font-semibold">TO</p>
                                  <p className="text-xs text-foreground font-mono mb-2">{header.by}</p>
                                  <p className="text-xs text-primary/60 font-semibold">TIME</p>
                                  <p className="text-xs text-foreground">{header.time}</p>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-primary/60 text-center py-4">No received headers found</p>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                <button
                  onClick={() => {
                    setHeaderAnalysisResult(null)
                    setHeaderInput('')
                    setHeaderError(null)
                  }}
                  className="w-full px-6 py-3 bg-primary/20 border border-primary/40 text-primary hover:bg-primary/30 rounded font-bold transition-all text-sm"
                >
                  ANALYZE ANOTHER EMAIL
                </button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
