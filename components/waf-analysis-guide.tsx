'use client'

import { useState } from 'react'
import { ChevronDown, Book, Shield } from 'lucide-react'

const OWASP_CATEGORIES = [
  {
    id: 'broken-access-control',
    title: 'A01 – Broken Access Control',
    description: 'Enforces policy so users cannot act outside intended permissions',
    detection: 'Checks for X-Frame-Options, X-Content-Type-Options, and access control headers',
    examples: ['Accessing admin panel without authorization', 'URL parameter manipulation', 'IDOR attacks'],
    prevention: 'Implement RBAC, deny by default, log access failures'
  },
  {
    id: 'cryptographic-failures',
    title: 'A02 – Cryptographic Failures',
    description: 'Failure to protect sensitive data using encryption',
    detection: 'Verifies HTTPS, checks Strict-Transport-Security, validates TLS version',
    examples: ['HTTP instead of HTTPS', 'Weak encryption algorithms', 'Hardcoded encryption keys'],
    prevention: 'Use HTTPS/TLS 1.2+, AES-256 encryption, secure key management'
  },
  {
    id: 'injection',
    title: 'A03 – Injection',
    description: 'Untrusted data sent to interpreter as command or query',
    detection: 'Checks Content-Security-Policy, X-XSS-Protection headers',
    examples: ['SQL Injection', 'Cross-Site Scripting (XSS)', 'Command Injection', 'LDAP Injection'],
    prevention: 'Parameterized queries, input validation, output encoding, WAF rules'
  },
  {
    id: 'insecure-design',
    title: 'A04 – Insecure Design',
    description: 'Missing or ineffective control design in SDLC',
    detection: 'Analyzes API versioning, Rate-Limit headers, authentication patterns',
    examples: ['No MFA option', 'Weak password recovery', 'No rate limiting', 'Predictable tokens'],
    prevention: 'Threat modeling, security requirements, implement MFA, rate limiting'
  },
  {
    id: 'security-misconfiguration',
    title: 'A05 – Security Misconfiguration',
    description: 'Insecure defaults, incomplete setups, or unnecessary services',
    detection: 'Comprehensive security header analysis, server info detection',
    examples: ['Default credentials', 'Directory listing enabled', 'Outdated software', 'Missing headers'],
    prevention: 'Security headers, patching, minimal installations, regular audits'
  },
  {
    id: 'vulnerable-components',
    title: 'A06 – Vulnerable Components',
    description: 'Using libraries with known vulnerabilities',
    detection: 'Analyzes server/framework information, known vulnerability patterns',
    examples: ['Old jQuery with XSS vulns', 'Outdated CMS', 'Unpatched dependencies'],
    prevention: 'Maintain inventory, monitor advisories, auto-scanning, remove unused deps'
  },
  {
    id: 'auth-failures',
    title: 'A07 – Identification & Authentication Failures',
    description: 'Compromised accounts or weak credential/session management',
    detection: 'Checks authentication headers, session security flags',
    examples: ['Weak passwords', 'No session timeout', 'Credentials in URLs', 'No MFA'],
    prevention: 'Strong password policy, MFA, session management, hashing with bcrypt'
  },
  {
    id: 'integrity-failures',
    title: 'A08 – Data Integrity Failures',
    description: 'Failure to verify software updates or data integrity',
    detection: 'Analyzes ETag headers, Cache-Control, integrity mechanisms',
    examples: ['Unsigned software updates', 'No integrity checks', 'Unencrypted updates'],
    prevention: 'Digital signatures, encrypted updates, ETag validation, checksums'
  },
  {
    id: 'logging-monitoring',
    title: 'A09 – Logging & Monitoring Failures',
    description: 'Insufficient logging, detection, and active response',
    detection: 'Checks for audit logging capabilities and monitoring headers',
    examples: ['No login attempt logs', 'Logs easily deleted', 'No alert system', 'Missing debug info'],
    prevention: 'Comprehensive logging, centralized management, real-time alerts, log protection'
  },
  {
    id: 'ssrf',
    title: 'A10 – Server-Side Request Forgery (SSRF)',
    description: 'Web app fetches remote resource without URL validation',
    detection: 'Analyzes URL validation patterns and redirect handling',
    examples: ['Accessing internal IPs', 'AWS metadata exposure', 'Localhost access', 'Firewall bypass'],
    prevention: 'URL validation, allowlists, block private IPs, validate redirects'
  }
]

export function WAFAnalysisGuide() {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  return (
    <div className="space-y-4">
      <div className="bg-primary/5 border border-primary/30 p-4 rounded-lg">
        <h2 className="text-lg font-bold text-primary mb-2 flex items-center gap-2">
          <Book className="w-5 h-5" />
          OWASP Top 10 Vulnerability Guide
        </h2>
        <p className="text-sm text-foreground/80">
          Click on each category to learn about vulnerabilities, detection methods, and prevention techniques
        </p>
      </div>

      <div className="space-y-2">
        {OWASP_CATEGORIES.map((category) => (
          <div
            key={category.id}
            className="border border-primary/30 rounded-lg overflow-hidden bg-secondary/20 hover:bg-secondary/40 transition-colors"
          >
            <button
              onClick={() => setExpandedId(expandedId === category.id ? null : category.id)}
              className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-secondary/30"
            >
              <div className="flex items-center gap-3 flex-1">
                <Shield className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="font-bold text-primary">{category.title}</span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-primary transition-transform ${
                  expandedId === category.id ? 'rotate-180' : ''
                }`}
              />
            </button>

            {expandedId === category.id && (
              <div className="px-4 py-4 border-t border-primary/20 space-y-3 bg-secondary/10">
                <div>
                  <p className="text-xs text-primary font-bold mb-1">DESCRIPTION</p>
                  <p className="text-sm text-foreground/80">{category.description}</p>
                </div>

                <div>
                  <p className="text-xs text-primary font-bold mb-1">DETECTION METHOD</p>
                  <p className="text-sm text-foreground/80">{category.detection}</p>
                </div>

                <div>
                  <p className="text-xs text-primary font-bold mb-2">REAL-WORLD EXAMPLES</p>
                  <ul className="space-y-1">
                    {category.examples.map((example, i) => (
                      <li key={i} className="text-sm text-foreground/70 flex gap-2">
                        <span className="text-primary">•</span>
                        {example}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="text-xs text-primary font-bold mb-1">PREVENTION TECHNIQUES</p>
                  <p className="text-sm text-foreground/80">{category.prevention}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
