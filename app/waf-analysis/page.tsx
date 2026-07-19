"use client"

import { useState } from "react"
import Link from "next/link"
import { Lock, Home, AlertTriangle, CheckCircle, XCircle, Search, Loader, Shield, Zap, TrendingUp, FileText, Download, FileJson, Table, BookOpen, Code, Cpu, Upload, BarChart3 } from "lucide-react"
import { WAFAnalysisResult, REQUIRED_SECURITY_HEADERS } from "@/lib/waf-types"
import { WAFReportExporter } from "@/lib/waf-export"
import { WAFAnalysisGuide } from "@/components/waf-analysis-guide"
import { WAFLogAnalysis } from "@/lib/waf-log-types"

interface OWASPVulnerability {
  id: string
  name: string
  category: string
  description: string
  example: string
  vulnerable: boolean
  testResult?: string
}

const OWASP_VULNERABILITIES: OWASPVulnerability[] = [
  {
    id: 'sql-injection',
    name: 'SQL Injection',
    category: 'A03:2021 – Injection',
    description: 'Attacker injects malicious SQL code through user input, allowing unauthorized database access',
    example: "SELECT * FROM users WHERE username='' OR '1'='1'",
    vulnerable: true
  },
  {
    id: 'xss',
    name: 'Cross-Site Scripting (XSS)',
    category: 'A03:2021 – Injection',
    description: 'Attacker injects malicious JavaScript code that executes in victim\'s browser',
    example: '<img src=x onerror="alert(\'XSS\')"',
    vulnerable: true
  },
  {
    id: 'broken-auth',
    name: 'Broken Authentication',
    category: 'A07:2021 – Authentication Failures',
    description: 'Weak password policies, session management flaws, or credential exposure',
    example: 'password123, admin123, default credentials',
    vulnerable: true
  },
  {
    id: 'sensitive-data',
    name: 'Sensitive Data Exposure',
    category: 'A02:2021 – Cryptographic Failures',
    description: 'Unencrypted sensitive data transmitted over HTTP or stored without encryption',
    example: 'http://example.com/checkout (should be https)',
    vulnerable: true
  },
  {
    id: 'xxe',
    name: 'XML External Entity (XXE)',
    category: 'A03:2021 – Injection',
    description: 'XML parser processes external entity definitions, leading to DoS or data disclosure',
    example: '<?xml version="1.0"?><!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]>',
    vulnerable: true
  },
  {
    id: 'access-control',
    name: 'Broken Access Control',
    category: 'A01:2021 – Broken Access Control',
    description: 'User can access resources they shouldn\'t have permission to view or modify',
    example: '/user/123 → /user/124 (horizontal privilege escalation)',
    vulnerable: true
  },
  {
    id: 'security-misc',
    name: 'Security Misconfiguration',
    category: 'A05:2021 – Security Misconfiguration',
    description: 'Default credentials, unnecessary services, debugging enabled in production',
    example: 'Server: Apache 2.4.1, X-Powered-By: PHP/5.3.1',
    vulnerable: true
  },
  {
    id: 'insecure-deser',
    name: 'Insecure Deserialization',
    category: 'A08:2021 – Software and Data Integrity Failures',
    description: 'Untrusted data deserialization can lead to RCE or object manipulation',
    example: 'Deserializing user-controlled pickle/JSON objects',
    vulnerable: true
  },
  {
    id: 'ssrf',
    name: 'Server-Side Request Forgery (SSRF)',
    category: 'A10:2021 – Server-Side Request Forgery',
    description: 'Application makes requests to attacker-controlled URL, accessing internal resources',
    example: 'http://internal-api:8080/admin instead of http://external.com',
    vulnerable: true
  },
  {
    id: 'log-monitoring',
    name: 'Insufficient Logging & Monitoring',
    category: 'A09:2021 – Logging and Monitoring Failures',
    description: 'Failed login attempts, security events not logged; no alerting on suspicious activity',
    example: 'No logs for: failed logins, admin changes, data access',
    vulnerable: true
  }
]

export default function WAFAnalysisPage() {
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<WAFAnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"analyze" | "simulator" | "guide" | "logs">("analyze")
  const [selectedVuln, setSelectedVuln] = useState<OWASPVulnerability | null>(null)
  const [userInput, setUserInput] = useState('')
  const [testResults, setTestResults] = useState<string[]>([])
  const [logFile, setLogFile] = useState<File | null>(null)
  const [logAnalysis, setLogAnalysis] = useState<WAFLogAnalysis | null>(null)
  const [logLoading, setLogLoading] = useState(false)

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Normalize URL - add https:// if not present
    let normalizedUrl = url.trim()
    if (!normalizedUrl.startsWith("http://") && !normalizedUrl.startsWith("https://")) {
      normalizedUrl = "https://" + normalizedUrl
    }
    
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/waf-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: normalizedUrl })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "WAF analysis failed")
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      console.error("[v0] WAF Analysis Error:", err)
      setError(err instanceof Error ? err.message : "Failed to analyze URL")
    } finally {
      setLoading(false)
    }
  }

  const handleLogUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!logFile) {
      setError("Please select a file")
      return
    }

    setLogLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("file", logFile)

      const response = await fetch("/api/waf-log-analysis", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        let errorMessage = "Failed to analyze log file"
        const contentType = response.headers.get("content-type")
        
        try {
          if (contentType?.includes("application/json")) {
            const errorData = await response.json()
            errorMessage = errorData.error || errorMessage
            if (errorData.parseErrors && errorData.parseErrors.length > 0) {
              errorMessage += `\n\nDetected format: ${errorData.detectedFormat}\nFirst error: ${errorData.parseErrors[0]}`
            }
          }
        } catch (parseErr) {
          console.log("[v0] Could not parse error response:", parseErr)
        }
        throw new Error(errorMessage)
      }

      // Debug: Log response status and headers
      console.log("[v0] Response status:", response.status)
      console.log("[v0] Response headers:", response.headers.get("content-type"))

      let data
      try {
        data = await response.json()
        console.log("[v0] Parsed response successfully")
      } catch (parseErr) {
        console.log("[v0] Failed to parse response as JSON:", parseErr)
        const text = await response.text()
        console.log("[v0] Response text (first 500 chars):", text.substring(0, 500))
        throw new Error("Server returned invalid JSON")
      }

      if (!data.analysis) {
        console.log("[v0] Response data:", JSON.stringify(data).substring(0, 200))
        throw new Error("Invalid response: No analysis data received")
      }
      console.log("[v0] Setting analysis data with", data.analysis.totalEntries, "entries")
      setLogAnalysis(data.analysis)
    } catch (err) {
      console.error("[v0] Log Analysis Error:", err)
      let message = err instanceof Error ? err.message : "Failed to analyze log file"
      
      // Provide more helpful error messages
      if (message.includes("JSON")) {
        message = "Server returned invalid data. This might be a server error. Please try again."
      } else if (message.includes("Parse error")) {
        message = "Failed to parse the response from server. The file may not be compatible."
      } else if (message.includes("Invalid response")) {
        message = "Server returned incomplete analysis data."
      }
      
      setError(message + "\n\nTip: Ensure your log file is in CSV, JSON, or standard Apache/Nginx format")
    } finally {
      setLogLoading(false)
    }
  }

  const runTest = (vuln: OWASPVulnerability) => {
    const results: string[] = []
    
    switch (vuln.id) {
      case 'sql-injection':
        if (userInput.includes("'") || userInput.includes('--') || userInput.includes('*')) {
          results.push('⚠️ SQL Injection detected: Input contains suspicious SQL characters')
          results.push('💀 Attempted query: SELECT * FROM users WHERE username=\'' + userInput + '\'')
          results.push('🔴 Result: Attacker could bypass authentication or extract data')
        } else {
          results.push('✅ Input validated: No SQL injection detected')
        }
        break

      case 'xss':
        if (userInput.includes('<') || userInput.includes('>') || userInput.includes('script') || userInput.includes('onerror')) {
          results.push('⚠️ XSS Vulnerability detected: Input contains HTML/JavaScript')
          results.push('💀 Executed code: ' + userInput)
          results.push('🔴 Result: Attacker could steal cookies, sessions, or redirect users')
        } else {
          results.push('✅ Input validated: No XSS payload detected')
        }
        break

      case 'broken-auth':
        if (userInput.length < 8) {
          results.push('⚠️ Weak password: Password is less than 8 characters')
        } else if (!userInput.match(/[A-Z]/)) {
          results.push('⚠️ Weak password: No uppercase letters')
        } else if (!userInput.match(/[0-9]/)) {
          results.push('⚠️ Weak password: No numbers')
        } else if (!userInput.match(/[!@#$%^&*]/)) {
          results.push('⚠️ Weak password: No special characters')
        } else {
          results.push('✅ Strong password: Meets security requirements')
        }
        break

      case 'sensitive-data':
        if (userInput.toLowerCase().startsWith('http://')) {
          results.push('⚠️ Data exposure detected: Using unencrypted HTTP')
          results.push('💀 Attacker can intercept data using MITM attacks')
        } else if (userInput.toLowerCase().startsWith('https://')) {
          results.push('✅ Encrypted connection: Using HTTPS')
        } else {
          results.push('ℹ️ Provide a URL starting with http:// or https://')
        }
        break

      case 'xxe':
        if (userInput.includes('DOCTYPE') || userInput.includes('ENTITY') || userInput.includes('SYSTEM')) {
          results.push('⚠️ XXE Vulnerability detected: Dangerous XML syntax')
          results.push('💀 Could lead to: File disclosure, DoS, or SSRF')
          results.push('🔴 Result: /etc/passwd could be extracted')
        } else {
          results.push('✅ Input appears safe: No XXE patterns detected')
        }
        break

      case 'access-control':
        const resourceId = userInput.match(/\d+/)?.[0]
        if (resourceId) {
          results.push('⚠️ Access Control Test: Attempting to access resource ID ' + resourceId)
          results.push('💀 Without proper authorization checks, attacker could access ANY user\'s data')
          results.push('🔴 Result: User can view other users\' information')
        } else {
          results.push('ℹ️ Provide a resource ID (e.g., /user/123)')
        }
        break

      case 'security-misc':
        if (userInput.toLowerCase().includes('version') || userInput.toLowerCase().includes('apache') || userInput.toLowerCase().includes('php')) {
          results.push('⚠️ Information Disclosure: Server reveals technology stack')
          results.push('💀 Attacker knows exact versions and can target known CVEs')
          results.push('🔴 Result: Header should be customized to hide version info')
        } else {
          results.push('✅ Input does not reveal configuration details')
        }
        break

      case 'insecure-deser':
        if (userInput.includes('{') || userInput.includes('[') || userInput.toLowerCase().includes('pickle')) {
          results.push('⚠️ Insecure Deserialization: Input appears to be serialized data')
          results.push('💀 Attacker could craft malicious payload for RCE')
          results.push('🔴 Result: Remote Code Execution possible')
        } else {
          results.push('✅ Input is not in serialized format')
        }
        break

      case 'ssrf':
        if (userInput.includes('localhost') || userInput.includes('127.0.0.1') || userInput.includes('internal') || userInput.includes('192.168')) {
          results.push('⚠️ SSRF Vulnerability: Input targets internal resource')
          results.push('💀 Attacker could access: Internal APIs, databases, admin panels')
          results.push('🔴 Result: Server makes request to internal address')
        } else if (userInput.startsWith('http')) {
          results.push('✅ URL points to external resource (appears safe)')
        } else {
          results.push('ℹ️ Provide a URL (e.g., http://localhost/admin)')
        }
        break

      case 'log-monitoring':
        if (userInput.toLowerCase().includes('login') || userInput.toLowerCase().includes('attempt')) {
          results.push('⚠️ Security Event: ' + userInput)
          results.push('💀 Without logging: Attacker activity goes undetected')
          results.push('🔴 Result: No audit trail or alerts generated')
        } else {
          results.push('ℹ️ Describe a security event (e.g., "failed login attempt")')
        }
        break
    }

    setTestResults(results)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return { bg: "#991b1b", border: "#dc2626", text: "#fca5a5" }
      case "HIGH":
        return { bg: "#b91c1c", border: "#ef4444", text: "#fecaca" }
      case "MEDIUM":
        return { bg: "#d97706", border: "#f59e0b", text: "#fcd34d" }
      case "LOW":
        return { bg: "#1f2937", border: "#6b7280", text: "#9ca3af" }
      default:
        return { bg: "#111827", border: "#374151", text: "#d1d5db" }
    }
  }

  const getSeverityCounts = (vulnerabilities: any[] = []) => {
    return {
      critical: vulnerabilities.filter(v => v.severity === "CRITICAL").length,
      high: vulnerabilities.filter(v => v.severity === "HIGH").length,
      medium: vulnerabilities.filter(v => v.severity === "MEDIUM").length,
      low: vulnerabilities.filter(v => v.severity === "LOW").length,
      info: vulnerabilities.filter(v => v.severity === "INFO").length
    }
  }

  const getOWASPCategoryName = (category: string) => {
    const names: Record<string, string> = {
      "broken-access-control": "Broken Access Control",
      "cryptographic-failures": "Cryptographic Failures",
      "injection": "Injection",
      "insecure-design": "Insecure Design",
      "security-misconfiguration": "Security Misconfiguration",
      "vulnerable-components": "Vulnerable & Outdated Components",
      "auth-failures": "Authentication Failures",
      "integrity-failures": "Software & Data Integrity Failures",
      "logging-monitoring": "Logging & Monitoring Failures",
      "ssrf": "Server-Side Request Forgery (SSRF)"
    }
    return names[category] || category
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-mono">
      {/* Animated background grid */}
      <div className="fixed inset-0 pointer-events-none opacity-5">
        <div
          style={{
            backgroundImage:
              "linear-gradient(0deg, transparent 24%, rgba(16, 255, 0, 0.05) 25%, rgba(16, 255, 0, 0.05) 26%, transparent 27%, transparent 74%, rgba(16, 255, 0, 0.05) 75%, rgba(16, 255, 0, 0.05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(16, 255, 0, 0.05) 25%, rgba(16, 255, 0, 0.05) 26%, transparent 27%, transparent 74%, rgba(16, 255, 0, 0.05) 75%, rgba(16, 255, 0, 0.05) 76%, transparent 77%, transparent)",
            backgroundSize: "50px 50px"
          }}
        />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-background/98 backdrop-blur-md border-b border-primary/40 px-6 py-4 z-50 shadow-lg shadow-primary/20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Lock className="w-6 h-6 text-primary" />
            <h1 className="text-lg font-bold text-primary tracking-[0.15em]">WAF ANALYSIS</h1>
            <p className="text-xs text-primary/60">OWASP Top 10 Web Application Security</p>
          </div>
          <div className="flex gap-3">
            <Link href="/">
              <button className="px-4 py-2 border border-primary/40 text-primary hover:bg-primary/10 rounded transition-all text-xs font-bold">
                <Home className="w-4 h-4 inline mr-2" />
                HOME
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="pt-24 pb-12 px-6">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Tab Navigation */}
          <div className="flex gap-2 border-b border-primary/30 overflow-x-auto">
            <button
              onClick={() => setActiveTab("analyze")}
              className={`px-4 py-3 font-bold text-sm transition-all whitespace-nowrap ${
                activeTab === "analyze"
                  ? "text-primary border-b-2 border-primary bg-primary/5"
                  : "text-primary/60 hover:text-primary"
              }`}
            >
              <Search className="w-4 h-4 inline mr-2" />
              ANALYZE
            </button>
            <button
              onClick={() => setActiveTab("logs")}
              className={`px-4 py-3 font-bold text-sm transition-all whitespace-nowrap ${
                activeTab === "logs"
                  ? "text-primary border-b-2 border-primary bg-primary/5"
                  : "text-primary/60 hover:text-primary"
              }`}
            >
              <Upload className="w-4 h-4 inline mr-2" />
              WAF LOGS
            </button>
            <button
              onClick={() => {
                setActiveTab("simulator")
                setSelectedVuln(null)
                setUserInput('')
                setTestResults([])
              }}
              className={`px-4 py-3 font-bold text-sm transition-all whitespace-nowrap ${
                activeTab === "simulator"
                  ? "text-primary border-b-2 border-primary bg-primary/5"
                  : "text-primary/60 hover:text-primary"
              }`}
            >
              <Code className="w-4 h-4 inline mr-2" />
              OWASP SIMULATOR
            </button>
            <button
              onClick={() => setActiveTab("guide")}
              className={`px-4 py-3 font-bold text-sm transition-all whitespace-nowrap ${
                activeTab === "guide"
                  ? "text-primary border-b-2 border-primary bg-primary/5"
                  : "text-primary/60 hover:text-primary"
              }`}
            >
              <BookOpen className="w-4 h-4 inline mr-2" />
              OWASP GUIDE
            </button>
          </div>

          {activeTab === "analyze" ? (
            <>
          {/* Input Form */}
          <div className="cyber-card p-8 rounded-lg border border-primary/40">
            <h2 className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              ENTER URL TO ANALYZE
            </h2>
            <form onSubmit={handleAnalyze} className="space-y-4">
              <div>
                <label className="text-xs text-primary/60 mb-2 block">WEBSITE URL</label>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="example.com or https://example.com"
                  className="w-full px-4 py-3 bg-secondary/30 border border-primary/30 rounded text-primary placeholder:text-primary/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
                  required
                />
                <p className="text-xs text-primary/40 mt-2">Enter domain with or without https:// prefix</p>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-primary/20 border border-primary/30 text-primary hover:bg-primary/40 hover:border-primary rounded font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    ANALYZING...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    ANALYZE URL
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Error Message */}
          {error && (
            <div className="cyber-card p-6 rounded-lg border border-destructive/40 bg-destructive/5">
              <div className="flex items-center gap-3">
                <XCircle className="w-6 h-6 text-destructive" />
                <div>
                  <p className="text-destructive font-bold">ANALYSIS ERROR</p>
                  <p className="text-destructive/70 text-sm mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="space-y-6">
              {/* Risk Score Overview */}
              <div className="cyber-card p-8 rounded-lg border-l-4" style={{ borderLeftColor: result.overallRiskScore > 70 ? "#dc2626" : result.overallRiskScore > 40 ? "#f59e0b" : "#22c55e" }}>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
                  <div>
                    <p className="text-xs text-primary/60 mb-2">RISK SCORE</p>
                    <p className="text-3xl font-bold" style={{ color: result.overallRiskScore > 70 ? "#dc2626" : result.overallRiskScore > 40 ? "#f59e0b" : "#22c55e" }}>
                      {result.overallRiskScore}/100
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-primary/60 mb-2">STATUS</p>
                    <p className="text-lg font-bold" style={{ color: result.status === "VULNERABLE" ? "#dc2626" : result.status === "WARNING" ? "#f59e0b" : "#22c55e" }}>
                      {result.status}
                    </p>
                  </div>
                  <div className="bg-red-950/40 p-3 rounded border border-red-500/30">
                    <p className="text-xs text-primary/60 mb-2">CRITICAL</p>
                    <p className="text-2xl font-bold text-red-400">
                      {getSeverityCounts(result.vulnerabilities).critical}
                    </p>
                  </div>
                  <div className="bg-orange-950/40 p-3 rounded border border-orange-500/30">
                    <p className="text-xs text-primary/60 mb-2">HIGH</p>
                    <p className="text-2xl font-bold text-orange-400">
                      {getSeverityCounts(result.vulnerabilities).high}
                    </p>
                  </div>
                  <div className="bg-yellow-950/40 p-3 rounded border border-yellow-500/30">
                    <p className="text-xs text-primary/60 mb-2">MEDIUM</p>
                    <p className="text-2xl font-bold text-yellow-400">
                      {getSeverityCounts(result.vulnerabilities).medium}
                    </p>
                  </div>
                  <div className="bg-gray-900/40 p-3 rounded border border-gray-500/30">
                    <p className="text-xs text-primary/60 mb-2">LOW</p>
                    <p className="text-2xl font-bold text-gray-400">
                      {getSeverityCounts(result.vulnerabilities).low}
                    </p>
                  </div>
                </div>

                <div className="bg-secondary/30 p-4 rounded border border-primary/20">
                  <p className="text-xs text-primary font-bold mb-2">ANALYZED URL</p>
                  <p className="text-sm font-mono text-primary/80 break-all">{result.url}</p>
                </div>

                {/* Export Buttons */}
                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    onClick={() => WAFReportExporter.downloadReport(result, "html")}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500/40 rounded font-bold text-xs transition-all border border-blue-500/30"
                  >
                    <FileText className="w-4 h-4" />
                    EXPORT HTML
                  </button>
                  <button
                    onClick={() => WAFReportExporter.downloadReport(result, "json")}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 hover:bg-green-500/40 rounded font-bold text-xs transition-all border border-green-500/30"
                  >
                    <FileJson className="w-4 h-4" />
                    EXPORT JSON
                  </button>
                  <button
                    onClick={() => WAFReportExporter.downloadReport(result, "csv")}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 text-purple-400 hover:bg-purple-500/40 rounded font-bold text-xs transition-all border border-purple-500/30"
                  >
                    <Table className="w-4 h-4" />
                    EXPORT CSV
                  </button>
                </div>
              </div>

              {/* Vulnerabilities by Category */}
              {result.vulnerabilities.length > 0 && (
                <div className="cyber-card p-8 rounded-lg border border-primary/40">
                  <h3 className="text-lg font-bold text-primary mb-6 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                    DETECTED VULNERABILITIES ({result.vulnerabilities.length})
                  </h3>

                  {/* Group by category */}
                  {Array.from(new Set(result.vulnerabilities.map(v => v.category))).map(category => (
                    <div key={category} className="mb-6 pb-6 border-b border-primary/20 last:border-b-0">
                      <h4 className="text-sm font-bold text-primary mb-3">{getOWASPCategoryName(category)}</h4>
                      <div className="space-y-2">
                        {result.vulnerabilities
                          .filter(v => v.category === category)
                          .map((vuln, idx) => {
                            const colors = getSeverityColor(vuln.severity)
                            return (
                              <div key={idx} className="p-4 rounded border" style={{ backgroundColor: colors.bg + "20", borderColor: colors.border }}>
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="px-2 py-1 text-xs font-bold rounded" style={{ backgroundColor: colors.bg + "40", color: colors.text }}>
                                        {vuln.severity}
                                      </span>
                                      <p className="font-bold text-foreground">{vuln.name}</p>
                                    </div>
                                    <p className="text-xs text-primary/70 mb-2">{vuln.description}</p>
                                    <div className="bg-secondary/30 p-2 rounded text-xs font-mono text-primary/60 mb-2">
                                      {vuln.findings && vuln.findings.length > 0 ? (
                                        vuln.findings.map((finding, i) => (
                                          <div key={i}>• {finding}</div>
                                        ))
                                      ) : (
                                        <div>No findings available</div>
                                      )}
                                    </div>
                                    <p className="text-xs text-primary/80">
                                      <strong>Fix:</strong> {vuln.remediation}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-2xl font-bold" style={{ color: colors.text }}>
                                      {vuln.cvssScore}
                                    </p>
                                    <p className="text-xs text-primary/60">CVSS</p>
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Security Headers */}
              <div className="cyber-card p-8 rounded-lg border border-primary/40">
                <h3 className="text-lg font-bold text-primary mb-6">SECURITY HEADERS</h3>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-green-500/10 p-4 rounded border border-green-500/30">
                    <p className="text-xs text-primary/60 mb-2">PRESENT ({result.securityHeaders?.present?.length || 0})</p>
                    <div className="space-y-1">
                      {result.securityHeaders?.present && result.securityHeaders.present.length > 0 ? (
                        result.securityHeaders.present.map((header, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-green-400">
                            <CheckCircle className="w-3 h-3" />
                            {header}
                          </div>
                        ))
                      ) : (
                        <div className="text-xs text-green-400/60">No security headers detected</div>
                      )}
                    </div>
                  </div>
                  <div className="bg-destructive/10 p-4 rounded border border-destructive/30">
                    <p className="text-xs text-primary/60 mb-2">MISSING ({result.securityHeaders?.missing?.length || 0})</p>
                    <div className="space-y-1">
                      {result.securityHeaders?.missing && result.securityHeaders.missing.length > 0 ? (
                        result.securityHeaders.missing.map((header, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-destructive">
                            <XCircle className="w-3 h-3" />
                            {header}
                          </div>
                        ))
                      ) : (
                        <div className="text-xs text-destructive/60">All headers present</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              {result.recommendations && result.recommendations.length > 0 && (
                <div className="cyber-card p-8 rounded-lg border border-primary/40 bg-blue-500/5">
                  <h3 className="text-lg font-bold text-primary mb-6 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-400" />
                    RECOMMENDATIONS
                  </h3>
                  <div className="space-y-3">
                    {result.recommendations.map((rec, idx) => (
                      <div key={idx} className="flex gap-3 p-3 bg-secondary/30 rounded border border-blue-500/20">
                        <Zap className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-foreground">{rec}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Info Card */}
          {!result && !loading && (
            <div className="cyber-card p-8 rounded-lg border border-primary/40 bg-secondary/10">
              <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                ABOUT WAF ANALYSIS
              </h3>
              <div className="space-y-3 text-sm text-primary/80">
                <p>
                  This WAF Analysis tool evaluates web applications for OWASP Top 10 vulnerabilities and security misconfigurations.
                </p>
                <p className="font-bold text-primary">Key Features:</p>
                <ul className="space-y-1 pl-4">
                  <li>✓ Security header verification</li>
                  <li>✓ HTTPS/SSL configuration analysis</li>
                  <li>✓ Server information disclosure detection</li>
                  <li>✓ CORS misconfiguration detection</li>
                  <li>✓ Cookie security validation</li>
                  <li>✓ Authentication mechanism assessment</li>
                  <li>✓ CVSS severity scoring</li>
                  <li>✓ Remediation recommendations</li>
                </ul>
              </div>
            </div>
          )}
            </>
          ) : activeTab === "logs" ? (
            <>
              {/* WAF Log Upload */}
              <div className="cyber-card p-8 rounded-lg border border-primary/40">
                <h2 className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  UPLOAD WAF LOG FILE
                </h2>
                <form onSubmit={handleLogUpload} className="space-y-4">
                  <div>
                    <label className="text-xs text-primary/60 mb-2 block">SELECT LOG FILE</label>
                    <div className="border-2 border-dashed border-primary/40 rounded-lg p-6 text-center hover:border-primary/60 transition-all cursor-pointer">
                      <input
                        type="file"
                        onChange={(e) => setLogFile(e.target.files?.[0] || null)}
                        accept=".log,.txt,.csv,.json"
                        className="hidden"
                        id="log-file-input"
                      />
                      <label htmlFor="log-file-input" className="cursor-pointer block">
                        <FileText className="w-12 h-12 text-primary/40 mx-auto mb-3" />
                        <p className="text-primary font-bold mb-2">Click to upload or drag and drop</p>
                        <p className="text-xs text-primary/60">Supported formats: .log, .txt, .csv, .json (Max 50MB)</p>
                        {logFile && <p className="text-xs text-primary mt-2">Selected: {logFile.name}</p>}
                      </label>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={logLoading || !logFile}
                    className="w-full px-6 py-3 bg-primary/20 border border-primary/30 text-primary hover:bg-primary/40 hover:border-primary rounded font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {logLoading ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        ANALYZING...
                      </>
                    ) : (
                      <>
                        <BarChart3 className="w-4 h-4" />
                        ANALYZE LOG
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Error Message */}
              {error && activeTab === "logs" && (
                <div className="cyber-card p-6 rounded-lg border border-destructive/40 bg-destructive/5">
                  <div className="flex items-start gap-3">
                    <XCircle className="w-6 h-6 text-destructive mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-destructive font-bold">ANALYSIS ERROR</p>
                      <p className="text-destructive/70 text-sm mt-2 whitespace-pre-wrap break-words">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Log Analysis Results */}
              {logAnalysis && (
                <div className="space-y-6">
                  {/* Risk Assessment Overview */}
                  <div className="cyber-card p-8 rounded-lg border-l-4" style={{ borderLeftColor: logAnalysis.riskAssessment.riskScore > 70 ? "#dc2626" : logAnalysis.riskAssessment.riskScore > 40 ? "#f59e0b" : "#22c55e" }}>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                      <div>
                        <p className="text-xs text-primary/60 mb-2">RISK SCORE</p>
                        <p className="text-3xl font-bold" style={{ color: logAnalysis.riskAssessment.riskScore > 70 ? "#dc2626" : logAnalysis.riskAssessment.riskScore > 40 ? "#f59e0b" : "#22c55e" }}>
                          {logAnalysis.riskAssessment.riskScore}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-primary/60 mb-2">TOTAL LOGS</p>
                        <p className="text-2xl font-bold text-primary">{logAnalysis.totalEntries}</p>
                      </div>
                      <div>
                        <p className="text-xs text-primary/60 mb-2">BLOCKED</p>
                        <p className="text-2xl font-bold text-red-400">{logAnalysis.summary.totalBlocked}</p>
                      </div>
                      <div>
                        <p className="text-xs text-primary/60 mb-2">ALLOWED</p>
                        <p className="text-2xl font-bold text-green-400">{logAnalysis.summary.totalAllowed}</p>
                      </div>
                      <div>
                        <p className="text-xs text-primary/60 mb-2">BLOCK RATIO</p>
                        <p className="text-2xl font-bold text-primary">{logAnalysis.summary.blockRatio.toFixed(1)}%</p>
                      </div>
                    </div>
                  </div>

                  {/* Threat Breakdown */}
                  <div className="cyber-card p-6 rounded-lg border border-primary/40">
                    <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      THREAT BREAKDOWN
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Object.entries(logAnalysis.threatBreakdown).map(([threat, count]) => (
                        count > 0 && (
                          <div key={threat} className="bg-secondary/30 p-4 rounded border border-primary/20">
                            <p className="text-xs text-primary/60 mb-2">{threat.toUpperCase().replace(/_/g, ' ')}</p>
                            <p className="text-2xl font-bold text-primary">{count}</p>
                          </div>
                        )
                      ))}
                    </div>
                  </div>

                  {/* Top Attackers */}
                  {logAnalysis.topAttackers.length > 0 && (
                    <div className="cyber-card p-6 rounded-lg border border-primary/40">
                      <h3 className="text-lg font-bold text-primary mb-4">TOP ATTACKERS</h3>
                      <div className="space-y-3">
                        {logAnalysis.topAttackers.map((attacker, idx) => (
                          <div key={idx} className="bg-secondary/30 p-4 rounded border border-primary/20">
                            <div className="flex items-center justify-between mb-2">
                              <code className="text-sm text-primary font-mono">{attacker.ip}</code>
                              <span className={`px-2 py-1 rounded text-xs font-bold ${
                                attacker.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400' :
                                attacker.severity === 'HIGH' ? 'bg-orange-500/20 text-orange-400' :
                                'bg-yellow-500/20 text-yellow-400'
                              }`}>{attacker.severity}</span>
                            </div>
                            <p className="text-xs text-primary/60">Attempts: {attacker.count}</p>
                            {attacker.threats.length > 0 && (
                              <p className="text-xs text-primary/60 mt-1">Threats: {attacker.threats.join(', ')}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Findings & Recommendations */}
                  <div className="cyber-card p-6 rounded-lg border border-primary/40">
                    <h3 className="text-lg font-bold text-primary mb-4">KEY FINDINGS</h3>
                    <ul className="space-y-2 mb-6">
                      {logAnalysis.riskAssessment.findings.map((finding, idx) => (
                        <li key={idx} className="text-sm text-primary/80 flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-orange-400 mt-1 flex-shrink-0" />
                          <span>{finding}</span>
                        </li>
                      ))}
                    </ul>

                    <h4 className="text-sm font-bold text-primary mb-3">RECOMMENDATIONS</h4>
                    <ul className="space-y-2">
                      {logAnalysis.riskAssessment.recommendations.map((rec, idx) => (
                        <li key={idx} className="text-sm text-primary/80 flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Threat Confirmation Tool */}
                  <div className="cyber-card p-6 rounded-lg border border-purple-500/40 bg-purple-500/5">
                    <h3 className="text-lg font-bold text-purple-400 mb-4 flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      THREAT CONFIRMATION TOOL
                    </h3>
                    
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {/* WAF Attack Indicators */}
                      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                        <p className="text-xs font-bold text-red-400 mb-3">✕ WAF ATTACK PATTERNS:</p>
                        <ul className="text-xs text-primary/80 space-y-1">
                          {(() => {
                            const wafIndicators = []
                            if (logAnalysis.threatBreakdown.sqlInjection > 0) wafIndicators.push('SQL Injection detected')
                            if (logAnalysis.threatBreakdown.xss > 0) wafIndicators.push('XSS attack patterns')
                            if (logAnalysis.threatBreakdown.commandInjection > 0) wafIndicators.push('Command injection attempts')
                            if (logAnalysis.threatBreakdown.directoryTraversal > 0) wafIndicators.push('Directory traversal attempts')
                            return wafIndicators.length > 0 ? wafIndicators.map((ind, i) => <li key={i}>• {ind}</li>) : <li className="text-primary/40">No WAF-specific patterns detected</li>
                          })()}
                        </ul>
                      </div>

                      {/* Other Attack Indicators */}
                      <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
                        <p className="text-xs font-bold text-orange-400 mb-3">⚠ OTHER ATTACK INDICATORS:</p>
                        <ul className="text-xs text-primary/80 space-y-1">
                          {(() => {
                            const otherIndicators = []
                            if (logAnalysis.threatBreakdown.botsAndCrawlers > 0) otherIndicators.push('Bot/Scanner activity detected')
                            if (logAnalysis.threatBreakdown.unknown > 0) otherIndicators.push('Unknown attack patterns')
                            return otherIndicators.length > 0 ? otherIndicators.map((ind, i) => <li key={i}>• {ind}</li>) : <li className="text-primary/40">No other attack patterns detected</li>
                          })()}
                        </ul>
                      </div>
                    </div>

                    {/* Analyst Decision Framework */}
                    <div className="bg-secondary/30 rounded-lg p-4 border border-primary/20">
                      <p className="text-xs font-bold text-primary mb-3">ANALYSIS SUMMARY FOR THREAT CONFIRMATION:</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                        <div className="bg-secondary/60 p-3 rounded border border-primary/10">
                          <p className="text-primary/60 font-bold mb-1">Total Requests</p>
                          <p className="text-lg font-bold text-primary">{logAnalysis.totalEntries}</p>
                          <p className="text-primary/40 mt-1">Analyzed entries</p>
                        </div>
                        
                        <div className="bg-secondary/60 p-3 rounded border border-primary/10">
                          <p className="text-primary/60 font-bold mb-1">Attack Requests</p>
                          <p className="text-lg font-bold text-orange-400">
                            {Object.values(logAnalysis.threatBreakdown).reduce((a, b) => (a as number) + (b as number), 0)}
                          </p>
                          <p className="text-primary/40 mt-1">
                            {((Object.values(logAnalysis.threatBreakdown).reduce((a, b) => (a as number) + (b as number), 0) / logAnalysis.totalEntries) * 100).toFixed(1)}% of traffic
                          </p>
                        </div>

                        <div className="bg-secondary/60 p-3 rounded border border-primary/10">
                          <p className="text-primary/60 font-bold mb-1">Risk Level</p>
                          <p className={`text-lg font-bold ${
                            logAnalysis.riskAssessment.overallRiskScore >= 80 ? 'text-red-400' :
                            logAnalysis.riskAssessment.overallRiskScore >= 50 ? 'text-orange-400' :
                            'text-yellow-400'
                          }`}>
                            {logAnalysis.riskAssessment.overallRiskScore >= 80 ? 'CRITICAL' :
                             logAnalysis.riskAssessment.overallRiskScore >= 50 ? 'HIGH' :
                             logAnalysis.riskAssessment.overallRiskScore >= 25 ? 'MEDIUM' : 'LOW'}
                          </p>
                          <p className="text-primary/40 mt-1">Score: {logAnalysis.riskAssessment.overallRiskScore}</p>
                        </div>
                      </div>

                      <div className="mt-3 p-3 bg-primary/5 rounded border border-primary/20">
                        <p className="text-xs text-primary/80">
                          <span className="font-bold">Analyst Guidance:</span> {
                            Object.entries(logAnalysis.threatBreakdown).filter(([, count]) => (count as number) > 0).length > 2
                              ? 'Multiple attack patterns detected - High confidence this is a WAF attack. Recommend blocking source IPs and implementing additional rate limiting.'
                              : Object.entries(logAnalysis.threatBreakdown).filter(([, count]) => (count as number) > 0).length > 0
                              ? 'WAF-relevant attack detected. Cross-reference with threat intelligence to confirm malicious intent.'
                              : 'No significant WAF attack patterns detected. May be legitimate traffic or misconfigured clients.'
                          }
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Real-World Attack Pattern Analysis */}
                  <div className="cyber-card p-6 rounded-lg border border-emerald-500/40 bg-emerald-500/5 mt-6">
                    <h3 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
                      <Zap className="w-5 h-5" />
                      REAL-WORLD ATTACK PATTERN ANALYSIS
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      {/* Attack Correlation Analysis */}
                      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                        <h4 className="text-xs font-bold text-blue-400 mb-3">ATTACK CORRELATION</h4>
                        {(() => {
                          const attackTypes = Object.entries(logAnalysis.threatBreakdown)
                            .filter(([, count]) => (count as number) > 0)
                            .sort((a, b) => (b[1] as number) - (a[1] as number))
                          
                          if (attackTypes.length === 0) {
                            return <p className="text-xs text-primary/40">No correlated patterns detected</p>
                          }
                          
                          return (
                            <div className="space-y-2">
                              {attackTypes.slice(0, 3).map(([type, count], idx) => (
                                <div key={idx} className="flex items-center justify-between text-xs">
                                  <span className="text-primary/80 capitalize">{type}</span>
                                  <div className="flex items-center gap-1">
                                    <div className="w-12 h-1 bg-primary/20 rounded-full">
                                      <div 
                                        className="h-full bg-blue-500 rounded-full" 
                                        style={{ width: `${Math.min(100, ((count as number) / logAnalysis.totalEntries) * 300)}%` }}
                                      />
                                    </div>
                                    <span className="font-bold text-blue-400 w-8 text-right">{count as number}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )
                        })()}
                        <div className="mt-3 text-xs bg-blue-500/10 p-2 rounded border border-blue-500/20">
                          <p className="text-blue-400/80">
                            <span className="font-bold">Correlation Score:</span> {
                              Object.values(logAnalysis.threatBreakdown).filter((c: any) => c > 0).length > 2 ? 'HIGH - Multiple attack types indicate coordinated attempt' :
                              Object.values(logAnalysis.threatBreakdown).filter((c: any) => c > 0).length > 0 ? 'MEDIUM - Focused attack technique detected' :
                              'LOW - Isolated incident'
                            }
                          </p>
                        </div>
                      </div>

                      {/* Payload Analysis */}
                      <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                        <h4 className="text-xs font-bold text-purple-400 mb-3">PAYLOAD COMPLEXITY</h4>
                        {(() => {
                          const totalAttacks = Object.values(logAnalysis.threatBreakdown).reduce((a: number, b: any) => a + (b || 0), 0)
                          const avgPayloadSize = logAnalysis.totalEntries > 0 ? Math.round(totalAttacks / logAnalysis.totalEntries * 100) : 0
                          const payloadComplexity = avgPayloadSize > 50 ? 'ADVANCED' : avgPayloadSize > 20 ? 'INTERMEDIATE' : 'BASIC'
                          
                          return (
                            <div className="space-y-2">
                              <div className="text-xs">
                                <p className="text-primary/60 mb-1">Attack Intensity: <span className="font-bold text-purple-400">{payloadComplexity}</span></p>
                                <div className="w-full h-2 bg-primary/20 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full ${payloadComplexity === 'ADVANCED' ? 'bg-red-500' : payloadComplexity === 'INTERMEDIATE' ? 'bg-orange-500' : 'bg-yellow-500'}`}
                                    style={{ width: `${avgPayloadSize}%` }}
                                  />
                                </div>
                              </div>
                              <div className="mt-2 text-xs space-y-1">
                                <p className="text-primary/60">Detected Techniques:</p>
                                <ul className="text-primary/50 text-xs space-y-0.5">
                                  {logAnalysis.threatBreakdown.sqlInjection > 0 && <li>• Structured Query Language attacks</li>}
                                  {logAnalysis.threatBreakdown.xss > 0 && <li>• Script injection methods</li>}
                                  {logAnalysis.threatBreakdown.commandInjection > 0 && <li>• OS command execution</li>}
                                  {logAnalysis.threatBreakdown.directoryTraversal > 0 && <li>• Path manipulation</li>}
                                </ul>
                              </div>
                            </div>
                          )
                        })()}
                      </div>

                      {/* Source Behavior Profiling */}
                      <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                        <h4 className="text-xs font-bold text-amber-400 mb-3">SOURCE BEHAVIOR PROFILE</h4>
                        {(() => {
                          const totalRequests = logAnalysis.totalEntries
                          const attackRequests = Object.values(logAnalysis.threatBreakdown).reduce((a: number, b: any) => a + (b || 0), 0)
                          const attackPercentage = totalRequests > 0 ? ((attackRequests / totalRequests) * 100).toFixed(1) : 0
                          
                          return (
                            <div className="space-y-2">
                              <div className="text-xs">
                                <p className="text-primary/60 mb-1">Behavior Classification:</p>
                                <div className="flex gap-2 flex-wrap">
                                  {parseFloat(String(attackPercentage)) > 70 && <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs font-bold">MALICIOUS</span>}
                                  {parseFloat(String(attackPercentage)) > 30 && parseFloat(String(attackPercentage)) <= 70 && <span className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded text-xs font-bold">SUSPICIOUS</span>}
                                  {parseFloat(String(attackPercentage)) <= 30 && parseFloat(String(attackPercentage)) > 0 && <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs font-bold">ANOMALOUS</span>}
                                </div>
                              </div>
                              <div className="mt-2 text-xs">
                                <p className="text-primary/60">Attack Rate: <span className="font-bold text-amber-400">{attackPercentage}%</span></p>
                                <p className="text-primary/60 mt-1">{attackRequests} / {totalRequests} requests flagged</p>
                              </div>
                              <div className="mt-2 text-xs bg-amber-500/10 p-2 rounded border border-amber-500/20">
                                <p className="text-amber-400/80">
                                  {parseFloat(String(attackPercentage)) > 50 
                                    ? 'Hostile source - Recommend immediate blocking' 
                                    : parseFloat(String(attackPercentage)) > 10 
                                    ? 'Suspicious behavior - Monitor closely' 
                                    : 'Low threat - Standard security monitoring'}
                                </p>
                              </div>
                            </div>
                          )
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* Detailed Attack Analysis */}
                  {logAnalysis.detailedFindings && logAnalysis.detailedFindings.length > 0 && (
                    <div className="cyber-card p-6 rounded-lg border border-primary/40 mt-6">
                      <h3 className="text-lg font-bold text-primary mb-6 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5" />
                        ATTACK ANALYSIS DETAILS
                      </h3>
                      
                      <div className="space-y-6">
                        {logAnalysis.detailedFindings.map((finding, idx) => (
                          <div key={idx} className="border border-primary/30 rounded-lg p-4 bg-secondary/20">
                            {/* Attack Type Header */}
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <h4 className="font-bold text-primary capitalize mb-1">{finding.category.replace(/([A-Z])/g, ' $1')}</h4>
                                <p className="text-xs text-primary/60">{finding.description}</p>
                              </div>
                              <span className={`px-3 py-1 rounded text-xs font-bold whitespace-nowrap ml-4 ${
                                finding.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400' :
                                finding.severity === 'HIGH' ? 'bg-orange-500/20 text-orange-400' :
                                finding.severity === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-blue-500/20 text-blue-400'
                              }`}>{finding.severity}</span>
                            </div>

                            {/* Statistics */}
                            <div className="grid grid-cols-4 gap-3 mb-4">
                              <div className="bg-secondary/40 p-2 rounded">
                                <p className="text-xs text-primary/60">Total Attempts</p>
                                <p className="text-lg font-bold text-primary">{finding.count}</p>
                              </div>
                              <div className="bg-red-500/10 p-2 rounded">
                                <p className="text-xs text-primary/60">Blocked</p>
                                <p className="text-lg font-bold text-red-400">{finding.blocked}</p>
                              </div>
                              <div className="bg-green-500/10 p-2 rounded">
                                <p className="text-xs text-primary/60">Passed</p>
                                <p className="text-lg font-bold text-green-400">{finding.allowed}</p>
                              </div>
                              <div className="bg-blue-500/10 p-2 rounded">
                                <p className="text-xs text-primary/60">Methods</p>
                                <p className="text-sm font-bold text-blue-400">{finding.methods.join(', ')}</p>
                              </div>
                            </div>

                            {/* Attack Examples */}
                            <div className="mb-3">
                              <p className="text-xs font-bold text-primary/70 mb-2">SAMPLE ATTACK PATTERNS:</p>
                              <div className="space-y-2">
                                {finding.examples.slice(0, 3).map((example, eIdx) => (
                                  <div key={eIdx} className="bg-secondary/60 p-2 rounded text-xs">
                                    <p className="text-primary/80 font-mono break-all">{example.uri}</p>
                                    {example.payload && (
                                      <p className="text-primary/60 font-mono text-xs mt-1 break-all">Payload: {example.payload}</p>
                                    )}
                                    <p className="text-primary/50 text-xs mt-1">From: {example.sourceIp}</p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Status Codes */}
                            <div className="text-xs text-primary/60">
                              HTTP Status Codes: {finding.statusCodes.join(', ')}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : activeTab === "simulator" ? (
            <>
              {/* OWASP Simulator */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Vulnerabilities List */}
                <div className="lg:col-span-1 space-y-2">
                  <h2 className="text-sm font-bold text-primary mb-4 px-4 py-2 bg-primary/10 rounded">OWASP TOP 10</h2>
                  {OWASP_VULNERABILITIES.map((vuln) => (
                    <button
                      key={vuln.id}
                      onClick={() => {
                        setSelectedVuln(vuln)
                        setUserInput('')
                        setTestResults([])
                      }}
                      className={`w-full px-4 py-3 rounded border transition-all text-left text-xs font-bold ${
                        selectedVuln?.id === vuln.id
                          ? 'bg-primary/20 border-primary text-primary'
                          : 'border-primary/30 text-primary/60 hover:border-primary hover:bg-primary/5'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-3 h-3" />
                        {vuln.name}
                      </div>
                      <div className="text-xs text-primary/40 ml-5 mt-1">{vuln.category}</div>
                    </button>
                  ))}
                </div>

                {/* Vulnerability Details and Tester */}
                <div className="lg:col-span-2 space-y-4">
                  {selectedVuln ? (
                    <>
                      {/* Description Card */}
                      <div className="cyber-card p-6 rounded-lg border border-primary/40">
                        <div className="flex items-start gap-3 mb-4">
                          <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-1" />
                          <div>
                            <h3 className="text-lg font-bold text-primary">{selectedVuln.name}</h3>
                            <p className="text-xs text-primary/60 mt-1">{selectedVuln.category}</p>
                          </div>
                        </div>
                        <p className="text-sm text-primary/80 mb-4">{selectedVuln.description}</p>
                        <div className="bg-secondary/30 p-4 rounded border border-primary/20">
                          <p className="text-xs text-primary/60 mb-2">EXAMPLE ATTACK:</p>
                          <code className="text-xs text-red-400 break-all">{selectedVuln.example}</code>
                        </div>
                      </div>

                      {/* Interactive Tester */}
                      <div className="cyber-card p-6 rounded-lg border border-primary/40">
                        <h4 className="text-sm font-bold text-primary mb-4 flex items-center gap-2">
                          <Cpu className="w-4 h-4" />
                          INTERACTIVE TESTER
                        </h4>
                        <div className="space-y-3">
                          <div>
                            <label className="text-xs text-primary/60 mb-2 block">TEST INPUT:</label>
                            <input
                              type="text"
                              value={userInput}
                              onChange={(e) => setUserInput(e.target.value)}
                              placeholder="Enter test payload or value..."
                              className="w-full px-4 py-3 bg-secondary/30 border border-primary/30 rounded text-primary placeholder:text-primary/40 focus:outline-none focus:border-primary text-xs"
                            />
                          </div>
                          <button
                            onClick={() => runTest(selectedVuln)}
                            className="w-full px-4 py-3 bg-primary/20 border border-primary/30 text-primary hover:bg-primary/40 rounded font-bold text-xs transition-all flex items-center justify-center gap-2"
                          >
                            <Code className="w-4 h-4" />
                            RUN TEST
                          </button>
                        </div>
                      </div>

                      {/* Test Results */}
                      {testResults.length > 0 && (
                        <div className="cyber-card p-6 rounded-lg border border-primary/40">
                          <h4 className="text-sm font-bold text-primary mb-4 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            TEST RESULTS
                          </h4>
                          <div className="space-y-2">
                            {testResults.map((result, idx) => (
                              <div
                                key={idx}
                                className={`p-3 rounded border text-xs ${
                                  result.startsWith('✅')
                                    ? 'bg-green-500/10 border-green-500/30 text-green-400'
                                    : result.startsWith('⚠️')
                                    ? 'bg-orange-500/10 border-orange-500/30 text-orange-400'
                                    : result.startsWith('💀')
                                    ? 'bg-red-500/10 border-red-500/30 text-red-400'
                                    : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                                }`}
                              >
                                {result}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="cyber-card p-8 rounded-lg border border-primary/40 flex items-center justify-center min-h-96">
                      <p className="text-primary/60 text-center">
                        <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-orange-500" />
                        Select a vulnerability from the list to begin testing
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <WAFAnalysisGuide />
          )}
        </div>
      </div>
    </div>
  )
}

function getOWASPCategoryName(category: string): string {
  const categoryMap: Record<string, string> = {
    "broken-access-control": "A01:2021 – Broken Access Control",
    "cryptographic-failures": "A02:2021 – Cryptographic Failures",
    "injection": "A03:2021 – Injection",
    "insecure-design": "A04:2021 – Insecure Design",
    "security-misconfiguration": "A05:2021 – Security Misconfiguration",
    "vulnerable-components": "A06:2021 – Vulnerable and Outdated Components",
    "auth-failures": "A07:2021 – Identification and Authentication Failures",
    "integrity-failures": "A08:2021 – Software and Data Integrity Failures",
    "logging-monitoring": "A09:2021 – Logging and Monitoring Failures",
    "ssrf": "A10:2021 – Server-Side Request Forgery (SSRF)"
  }
  return categoryMap[category] || category
}
