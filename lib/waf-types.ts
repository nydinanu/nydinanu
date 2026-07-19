// OWASP Top 10 Categories
export type OWASP_Category = 
  | "broken-access-control"
  | "cryptographic-failures"
  | "injection"
  | "insecure-design"
  | "security-misconfiguration"
  | "vulnerable-components"
  | "auth-failures"
  | "integrity-failures"
  | "logging-monitoring"
  | "ssrf"

export interface OWASPVulnerability {
  id: string
  category: OWASP_Category
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"
  name: string
  description: string
  findings: string[]
  remediation: string
  cvssScore: number
}

export interface WAFAnalysisResult {
  url: string
  timestamp: string
  status: "SECURE" | "WARNING" | "VULNERABLE"
  overallRiskScore: number
  vulnerabilities: OWASPVulnerability[]
  headers: Record<string, string>
  serverInfo: {
    server: string | null
    poweredBy: string | null
    xPoweredBy: string | null
  }
  securityHeaders: {
    present: string[]
    missing: string[]
  }
  ssl: {
    valid: boolean
    issuer: string | null
    expiryDate: string | null
  }
  recommendations: string[]
}

export interface WAFAnalysisRequest {
  url: string
  includeSSLCheck: boolean
  includeHeaderAnalysis: boolean
  performDLPCheck: boolean
}

export interface HeaderSecurityConfig {
  name: string
  recommended: string | string[]
  description: string
  severity: "HIGH" | "MEDIUM" | "LOW"
}

export const REQUIRED_SECURITY_HEADERS: HeaderSecurityConfig[] = [
  {
    name: "Strict-Transport-Security",
    recommended: "max-age=31536000; includeSubDomains; preload",
    description: "Enforce HTTPS connections",
    severity: "HIGH"
  },
  {
    name: "X-Content-Type-Options",
    recommended: "nosniff",
    description: "Prevent MIME type sniffing",
    severity: "HIGH"
  },
  {
    name: "X-Frame-Options",
    recommended: "DENY or SAMEORIGIN",
    description: "Protect against clickjacking",
    severity: "HIGH"
  },
  {
    name: "Content-Security-Policy",
    recommended: "default-src 'self'",
    description: "Control resource loading",
    severity: "HIGH"
  },
  {
    name: "X-XSS-Protection",
    recommended: "1; mode=block",
    description: "Mitigate XSS attacks",
    severity: "MEDIUM"
  },
  {
    name: "Referrer-Policy",
    recommended: "strict-origin-when-cross-origin",
    description: "Control referrer information",
    severity: "MEDIUM"
  },
  {
    name: "Permissions-Policy",
    recommended: "camera=(), microphone=(), geolocation=()",
    description: "Control browser features",
    severity: "MEDIUM"
  }
]
