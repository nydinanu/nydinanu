import { WAFAnalysisResult, OWASPVulnerability, REQUIRED_SECURITY_HEADERS, OWASP_Category } from "./waf-types"

export class WAFAnalysisEngine {
  async analyzeURL(url: string): Promise<WAFAnalysisResult> {
    try {
      // Validate URL format
      const urlObj = new URL(url)
      console.log("[v0] WAF Analysis starting for URL:", url)
      
      let response: Response
      let headers: Record<string, string> = {}
      let responseObtained = false

      // Try direct fetch with timeout and comprehensive error handling
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
        
        response = await fetch(url, {
          method: "HEAD",
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
          },
          signal: controller.signal,
          redirect: "follow"
        })
        
        clearTimeout(timeoutId)
        headers = Object.fromEntries(response.headers.entries())
        responseObtained = true
        console.log("[v0] Successfully fetched headers via HEAD request")
      } catch (headError) {
        console.log("[v0] HEAD request failed, attempting GET request with response body limit")
        try {
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 10000)
          
          response = await fetch(url, {
            method: "GET",
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
            },
            signal: controller.signal,
            redirect: "follow"
          })
          
          clearTimeout(timeoutId)
          headers = Object.fromEntries(response.headers.entries())
          responseObtained = true
          console.log("[v0] Successfully fetched headers via GET request")
        } catch (getError) {
          console.log("[v0] Both HEAD and GET requests failed:", getError)
        }
      }

      const vulnerabilities: OWASPVulnerability[] = []

      // If we got response headers, analyze them for real vulnerabilities
      if (responseObtained && Object.keys(headers).length > 0) {
        console.log("[v0] Analyzing real response headers:", Object.keys(headers))
        
        // Analyze security headers
        const headerAnalysis = this.analyzeSecurityHeaders(headers)
        vulnerabilities.push(...headerAnalysis.vulnerabilities)

        // Analyze server information
        const serverAnalysis = this.analyzeServerInfo(headers)
        vulnerabilities.push(...serverAnalysis.vulnerabilities)

        // Analyze SSL/TLS
        const sslAnalysis = await this.analyzeSSL(url)
        vulnerabilities.push(...sslAnalysis.vulnerabilities)

        // Analyze common web vulnerabilities patterns
        const webVulnAnalysis = this.analyzeCommonVulnerabilities(headers, url)
        vulnerabilities.push(...webVulnAnalysis.vulnerabilities)
      } else {
        // Fall back to estimation if we couldn't get real headers
        console.log("[v0] Could not obtain real headers, performing URL-based analysis")
        
        // At minimum, check if HTTPS is used
        const sslAnalysis = await this.analyzeSSL(url)
        vulnerabilities.push(...sslAnalysis.vulnerabilities)
        
        // Add estimation for missing headers
        const estimatedHeaders = this.estimateSecurityHeaders(url)
        vulnerabilities.push(...estimatedHeaders.vulnerabilities)
      }

      // Calculate risk score based on actual findings
      const riskScore = this.calculateRiskScore(vulnerabilities)
      const status = riskScore > 70 ? "VULNERABLE" : riskScore > 40 ? "WARNING" : "SECURE"

      console.log("[v0] WAF Analysis complete. Found", vulnerabilities.length, "vulnerabilities. Risk Score:", riskScore)

      return {
        url,
        timestamp: new Date().toISOString(),
        status,
        overallRiskScore: riskScore,
        vulnerabilities,
        headers,
        serverInfo: this.extractServerInfo(headers),
        securityHeaders: this.extractSecurityHeaders(headers),
        ssl: this.extractSSLInfo(url),
        recommendations: this.generateRecommendations(vulnerabilities)
      }
    } catch (error) {
      console.error("[v0] WAF Analysis Error:", error)
      throw new Error(`Failed to analyze URL: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  private estimateSecurityHeaders(url: string): { vulnerabilities: OWASPVulnerability[] } {
    const vulnerabilities: OWASPVulnerability[] = []

    // Estimate based on common patterns
    vulnerabilities.push({
      id: "estimated-missing-headers",
      category: "security-misconfiguration",
      name: "Unable to Verify Security Headers",
      description: "Could not retrieve response headers for analysis due to server blocking or timeout",
      severity: "MEDIUM",
      cvssScore: 5.0,
      findings: [
        "Response headers could not be obtained for verification",
        "Analysis based on URL structure only"
      ],
      remediation: "Ensure server allows HEAD/GET requests and responds with proper HTTP headers"
    })

    return { vulnerabilities }
  }

  private extractServerInfo(headers: Record<string, string>) {
    return {
      server: headers["server"] || headers["Server"] || null,
      poweredBy: headers["x-powered-by"] || headers["X-Powered-By"] || null,
      xPoweredBy: headers["x-aspnet-version"] || headers["X-AspNet-Version"] || null
    }
  }

  private extractSecurityHeaders(headers: Record<string, string>) {
    const present: string[] = []
    const missing: string[] = []

    const requiredHeaders = [
      "strict-transport-security",
      "content-security-policy",
      "x-frame-options",
      "x-content-type-options",
      "referrer-policy",
      "permissions-policy"
    ]

    requiredHeaders.forEach(headerName => {
      const headerExists = Object.keys(headers).some(
        key => key.toLowerCase() === headerName.toLowerCase()
      )
      if (headerExists) {
        present.push(headerName)
      } else {
        missing.push(headerName)
      }
    })

    return { present, missing }
  }

  private extractSSLInfo(url: string) {
    return {
      valid: url.startsWith("https://"),
      issuer: null,
      expiryDate: null
    }
  }

  private analyzeSecurityHeaders(headers: Record<string, string>) {
    const vulnerabilities: OWASPVulnerability[] = []
    const presentHeaders: string[] = []
    const missingHeaders: string[] = []

    for (const config of REQUIRED_SECURITY_HEADERS) {
      const headerExists = Object.keys(headers).some(
        key => key.toLowerCase() === config.name.toLowerCase()
      )

      if (headerExists) {
        presentHeaders.push(config.name)
      } else {
        missingHeaders.push(config.name)
        vulnerabilities.push({
          id: `missing-${config.name.toLowerCase()}`,
          category: "security-misconfiguration",
          severity: config.severity,
          name: `Missing: ${config.name}`,
          description: config.description,
          findings: [`${config.name} header is not set`],
          remediation: `Add header: ${config.name}: ${
            Array.isArray(config.recommended)
              ? config.recommended[0]
              : config.recommended
          }`,
          cvssScore: config.severity === "HIGH" ? 7.5 : config.severity === "MEDIUM" ? 5.0 : 2.0
        })
      }
    }

    return {
      vulnerabilities,
      securityHeaders: { present: presentHeaders, missing: missingHeaders }
    }
  }

  private analyzeServerInfo(headers: Record<string, string>) {
    const vulnerabilities: OWASPVulnerability[] = []
    const serverInfo = {
      server: headers["server"] || null,
      poweredBy: headers["x-powered-by"] || null,
      xPoweredBy: headers["x-aspnet-version"] || null
    }

    // Server disclosure vulnerability
    if (serverInfo.server) {
      vulnerabilities.push({
        id: "server-disclosure",
        category: "security-misconfiguration",
        severity: "MEDIUM",
        name: "Server Information Disclosure",
        description: "Server version information is exposed in headers",
        findings: [`Server header reveals: ${serverInfo.server}`],
        remediation: "Remove or obfuscate server version in headers",
        cvssScore: 5.3
      })
    }

    if (serverInfo.poweredBy) {
      vulnerabilities.push({
        id: "powered-by-disclosure",
        category: "security-misconfiguration",
        severity: "LOW",
        name: "Technology Stack Disclosure",
        description: "Application framework/technology is publicly exposed",
        findings: [`X-Powered-By header reveals: ${serverInfo.poweredBy}`],
        remediation: "Disable X-Powered-By header in application server configuration",
        cvssScore: 3.0
      })
    }

    return { vulnerabilities, serverInfo }
  }

  private async analyzeSSL(url: string) {
    const vulnerabilities: OWASPVulnerability[] = []
    const ssl = {
      valid: false,
      issuer: null as string | null,
      expiryDate: null as string | null
    }

    try {
      if (url.startsWith("https://")) {
        ssl.valid = true
      } else {
        vulnerabilities.push({
          id: "no-https",
          category: "cryptographic-failures",
          severity: "CRITICAL",
          name: "HTTPS Not Enforced",
          description: "Website does not use HTTPS encryption",
          findings: ["HTTP protocol detected instead of HTTPS"],
          remediation: "Implement HTTPS/SSL certificates and enforce redirect from HTTP to HTTPS",
          cvssScore: 9.8
        })
      }
    } catch (error) {
      vulnerabilities.push({
        id: "ssl-check-failed",
        category: "cryptographic-failures",
        severity: "HIGH",
        name: "SSL/TLS Configuration Error",
        description: "Unable to verify SSL/TLS certificate validity",
        findings: ["SSL certificate validation failed"],
        remediation: "Ensure valid SSL certificate is installed and properly configured",
        cvssScore: 7.5
      })
    }

    return { vulnerabilities, ssl }
  }

  private calculateRiskScore(vulnerabilities: OWASPVulnerability[]): number {
    if (vulnerabilities.length === 0) return 0

    let totalScore = 0
    const criticalCount = vulnerabilities.filter(v => v.severity === "CRITICAL").length
    const highCount = vulnerabilities.filter(v => v.severity === "HIGH").length
    const mediumCount = vulnerabilities.filter(v => v.severity === "MEDIUM").length
    const lowCount = vulnerabilities.filter(v => v.severity === "LOW").length

    totalScore += criticalCount * 25
    totalScore += highCount * 15
    totalScore += mediumCount * 8
    totalScore += lowCount * 2

    return Math.min(totalScore, 100)
  }

  private generateRecommendations(vulnerabilities: OWASPVulnerability[]): string[] {
    const recommendations: Set<string> = new Set()

    vulnerabilities.forEach((vuln) => {
      switch (vuln.category) {
        case "broken-access-control":
          recommendations.add("Implement proper role-based access control (RBAC) to restrict unauthorized access")
          recommendations.add("Validate user permissions on both client and server side for sensitive operations")
          recommendations.add("Use principle of least privilege - grant minimum necessary permissions")
          break

        case "cryptographic-failures":
          recommendations.add("Enforce HTTPS/TLS 1.2+ with valid SSL certificates for all communications")
          recommendations.add("Use strong encryption algorithms (AES-256, RSA-2048+) for sensitive data")
          recommendations.add("Implement secure key management practices and never hardcode secrets in code")
          recommendations.add("Hash passwords using bcrypt, scrypt, or Argon2 with appropriate salt")
          break

        case "injection":
          recommendations.add("Use parameterized queries and prepared statements to prevent SQL injection")
          recommendations.add("Implement input validation and output encoding to prevent XSS attacks")
          recommendations.add("Use security headers (CSP, X-Frame-Options) to mitigate injection vulnerabilities")
          recommendations.add("Validate all user inputs on the server side - never trust client-side validation alone")
          break

        case "insecure-design":
          recommendations.add("Implement threat modeling and security design reviews during architecture phase")
          recommendations.add("Define and enforce security requirements at the beginning of development")
          recommendations.add("Use secure design patterns and frameworks that enforce secure coding practices")
          break

        case "security-misconfiguration":
          recommendations.add("Remove unnecessary software, frameworks, and unused features")
          recommendations.add("Keep all software, libraries, and dependencies updated to latest security patches")
          recommendations.add("Configure security headers: HSTS, CSP, X-Frame-Options, X-Content-Type-Options")
          recommendations.add("Disable unnecessary HTTP methods and services")
          recommendations.add("Run security scanners and vulnerability assessments regularly")
          break

        case "vulnerable-components":
          recommendations.add("Maintain an inventory of all third-party components and dependencies")
          recommendations.add("Regularly update and patch all libraries, frameworks, and dependencies")
          recommendations.add("Use dependency scanning tools to identify known vulnerabilities")
          recommendations.add("Remove unused dependencies to reduce attack surface")
          break

        case "auth-failures":
          recommendations.add("Implement multi-factor authentication (MFA) for all user accounts")
          recommendations.add("Use strong password policies and enforce password complexity requirements")
          recommendations.add("Implement secure session management with short timeout periods")
          recommendations.add("Never log passwords or sensitive authentication tokens")
          break

        case "integrity-failures":
          recommendations.add("Implement digital signatures and checksums for critical data")
          recommendations.add("Use HTTPS/TLS to protect data integrity during transmission")
          recommendations.add("Validate data integrity before processing or storing")
          recommendations.add("Implement audit logs for all data modifications")
          break

        case "logging-monitoring":
          recommendations.add("Log all security-relevant events including authentication attempts and access control failures")
          recommendations.add("Monitor logs for suspicious patterns and anomalies in real-time")
          recommendations.add("Protect logs from tampering and unauthorized access")
          recommendations.add("Retain logs for sufficient period and implement centralized log management")
          break

        case "ssrf":
          recommendations.add("Implement network segmentation to restrict outbound connections")
          recommendations.add("Validate and sanitize all URLs before making requests")
          recommendations.add("Use allowlists for permitted domains and block private IP ranges (10.0.0.0/8, etc.)")
          recommendations.add("Disable HTTP redirects or implement strict validation")
          break
      }
    })

    // Add general recommendations
    if (vulnerabilities.length > 0) {
      recommendations.add("Conduct regular security audits and penetration testing")
      recommendations.add("Implement security training for all development team members")
      recommendations.add("Establish incident response plan and security incident reporting procedures")
    }

    return Array.from(recommendations)
  }

  private analyzeCommonVulnerabilities(
    headers: Record<string, string>,
    url: string
  ): { vulnerabilities: OWASPVulnerability[] } {
    const vulnerabilities: OWASPVulnerability[] = []

    // Authentication Failures (A07:2021)
    if (!headers["www-authenticate"]) {
      vulnerabilities.push({
        id: "weak-auth-headers",
        category: "auth-failures",
        severity: "MEDIUM",
        name: "Weak Authentication Configuration",
        description: "No authentication mechanism headers detected",
        findings: ["WWW-Authenticate header not found", "No authentication method specified"],
        remediation: "Implement proper authentication headers and mechanisms (Basic Auth, Bearer tokens, OAuth2)",
        cvssScore: 5.5
      })
    }

    // Insecure Design (A04:2021) - Missing API versioning
    if (!headers["api-version"]) {
      vulnerabilities.push({
        id: "no-api-versioning",
        category: "insecure-design",
        severity: "MEDIUM",
        name: "Missing API Version Control",
        description: "API versioning not implemented or advertised",
        findings: ["No API-Version header detected", "Potential breaking changes risk"],
        remediation: "Implement API versioning strategy (URL path or header-based)",
        cvssScore: 5.0
      })
    }

    // Integrity Failures (A08:2021) - Missing ETags
    if (!headers["etag"]) {
      vulnerabilities.push({
        id: "missing-etag",
        category: "integrity-failures",
        severity: "LOW",
        name: "Missing Entity Tag (ETag)",
        description: "No ETag header for cache validation and integrity checking",
        findings: ["ETag header not found"],
        remediation: "Implement ETag headers for resource versioning and integrity verification",
        cvssScore: 2.0
      })
    }

    // Logging & Monitoring (A09:2021)
    vulnerabilities.push({
      id: "insufficient-logging",
      category: "logging-monitoring",
      severity: "MEDIUM",
      name: "Insufficient Logging and Monitoring",
      description: "Cannot verify comprehensive logging and monitoring capabilities from headers",
      findings: ["Security event logging not visible", "No monitoring headers detected"],
      remediation: "Implement centralized logging, real-time monitoring, and alerting for security events",
      cvssScore: 5.3
    })

    // SSRF Risk (A10:2021)
    if (url.includes("external") || url.includes("proxy")) {
      vulnerabilities.push({
        id: "potential-ssrf",
        category: "ssrf",
        severity: "HIGH",
        name: "Potential SSRF Vulnerability",
        description: "URL pattern suggests potential Server-Side Request Forgery exposure",
        findings: ["URL contains patterns indicative of SSRF risk"],
        remediation: "Implement strict URL validation, use allowlists for permitted domains, and validate redirects",
        cvssScore: 8.6
      })
    }

    return { vulnerabilities }
  }
}

export const wafEngine = new WAFAnalysisEngine()
