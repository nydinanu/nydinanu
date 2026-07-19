'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Home, ChevronRight, AlertTriangle, Code, Shield, Lock, CheckCircle, XCircle, Cpu, Zap, TrendingUp, BookOpen } from 'lucide-react'

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

export default function OWASPSimulatorPage() {
  const [selectedVuln, setSelectedVuln] = useState<OWASPVulnerability | null>(null)
  const [userInput, setUserInput] = useState('')
  const [testResults, setTestResults] = useState<string[]>([])

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

  return (
    <div className="min-h-screen bg-background text-foreground font-mono">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 bg-background/98 backdrop-blur-md border-b border-primary/40 px-6 py-4 z-50 shadow-lg shadow-primary/20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="relative w-10 h-10 rounded-sm border-2 border-primary flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/50">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-primary tracking-[0.15em]">OWASP TOP 10 SIMULATOR</h1>
                <p className="text-xs text-primary/60">▸ INTERACTIVE VULNERABILITY TESTING ▸</p>
              </div>
            </Link>
          </div>
          <Link href="/">
            <button className="flex items-center gap-2 px-4 py-2 border border-primary/70 text-primary hover:bg-primary/10 rounded font-bold text-xs transition-all">
              <Home className="w-4 h-4" />
              HOME
            </button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
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

                  {/* Prevention Tips */}
                  <div className="cyber-card p-6 rounded-lg border border-primary/40 bg-green-500/5">
                    <h4 className="text-sm font-bold text-green-400 mb-4 flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      PREVENTION
                    </h4>
                    <div className="text-xs text-primary/80 space-y-2">
                      {selectedVuln.id === 'sql-injection' && (
                        <>
                          <p>• Use parameterized queries and prepared statements</p>
                          <p>• Implement input validation and sanitization</p>
                          <p>• Use ORM frameworks that prevent SQL injection</p>
                          <p>• Apply least privilege principle to database accounts</p>
                        </>
                      )}
                      {selectedVuln.id === 'xss' && (
                        <>
                          <p>• Encode/escape all user input before rendering</p>
                          <p>• Use Content Security Policy (CSP) headers</p>
                          <p>• Use templating engines with auto-escaping</p>
                          <p>• Validate input on both client and server side</p>
                        </>
                      )}
                      {selectedVuln.id === 'broken-auth' && (
                        <>
                          <p>• Enforce strong password policies (min 12 chars, complexity)</p>
                          <p>• Implement multi-factor authentication (MFA)</p>
                          <p>• Use secure session management with short timeouts</p>
                          <p>• Never store passwords in plain text; use bcrypt/Argon2</p>
                        </>
                      )}
                      {selectedVuln.id === 'sensitive-data' && (
                        <>
                          <p>• Use HTTPS/TLS for all data transmission</p>
                          <p>• Encrypt sensitive data at rest (AES-256)</p>
                          <p>• Implement proper key management</p>
                          <p>• Remove sensitive data from logs and backups</p>
                        </>
                      )}
                      {selectedVuln.id === 'xxe' && (
                        <>
                          <p>• Disable XML external entity processing</p>
                          <p>• Use safe XML parsers (XXE-hardened)</p>
                          <p>• Validate and sanitize XML input</p>
                          <p>• Use whitelisting for allowed XML entities</p>
                        </>
                      )}
                      {selectedVuln.id === 'access-control' && (
                        <>
                          <p>• Implement proper authorization checks on every request</p>
                          <p>• Use principle of least privilege</p>
                          <p>• Verify user permissions for resource access</p>
                          <p>• Use role-based access control (RBAC)</p>
                        </>
                      )}
                      {selectedVuln.id === 'security-misc' && (
                        <>
                          <p>• Remove or customize server headers</p>
                          <p>• Disable default accounts and credentials</p>
                          <p>• Remove unnecessary software and services</p>
                          <p>• Keep all software updated to latest patches</p>
                        </>
                      )}
                      {selectedVuln.id === 'insecure-deser' && (
                        <>
                          <p>• Never deserialize untrusted data</p>
                          <p>• Use safe serialization formats (JSON instead of pickle)</p>
                          <p>• Validate and verify data signatures/MACs</p>
                          <p>• Implement strict input validation</p>
                        </>
                      )}
                      {selectedVuln.id === 'ssrf' && (
                        <>
                          <p>• Validate and sanitize all URLs before requests</p>
                          <p>• Use allowlists for permitted domains</p>
                          <p>• Disable HTTP redirects or validate redirect targets</p>
                          <p>• Block access to private IP ranges (10.0.0.0/8, 172.16.0.0/12)</p>
                        </>
                      )}
                      {selectedVuln.id === 'log-monitoring' && (
                        <>
                          <p>• Log all security-relevant events (login attempts, changes)</p>
                          <p>• Use centralized logging and real-time monitoring</p>
                          <p>• Set up alerts for suspicious activities</p>
                          <p>• Protect logs from tampering and unauthorized access</p>
                        </>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="cyber-card p-12 rounded-lg border border-primary/40 flex items-center justify-center min-h-96">
                  <div className="text-center">
                    <AlertTriangle className="w-12 h-12 text-primary/40 mx-auto mb-4" />
                    <p className="text-primary/60">Select an OWASP Top 10 vulnerability to begin testing</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
