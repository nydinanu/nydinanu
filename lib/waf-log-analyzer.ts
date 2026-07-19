import { WAFLogEntry, WAFLogAnalysis, ParsedWAFLog } from './waf-log-types'

// Simple attack patterns
const ATTACK_PATTERNS: Record<string, { pattern: RegExp; description: string }> = {
  sqlInjection: { pattern: /union.*select|select.*from|insert.*into/gi, description: 'SQL Injection' },
  xss: { pattern: /<script|javascript:|on\w+=/gi, description: 'Cross-Site Scripting' },
  directoryTraversal: { pattern: /\.\.\//gi, description: 'Directory Traversal' },
  commandInjection: { pattern: /[;&|`].*bash|cmd|powershell/gi, description: 'Command Injection' },
  botsAndCrawlers: { pattern: /bot|crawler|scanner/gi, description: 'Bot/Scanner Activity' },
}

export class WAFLogAnalyzer {
  parseWAFLog(content: string): ParsedWAFLog {
    const lines = content.split('\n').filter(l => l.trim())
    const entries: WAFLogEntry[] = []
    const parseErrors: string[] = []

    const detectedFormat = this.detectFormat(content)
    let csvHeaders: string[] = []

    if (detectedFormat === 'CSV' && lines.length > 0) {
      csvHeaders = this.parseCSVLine(lines[0])
    }

    for (let i = 0; i < lines.length; i++) {
      try {
        const line = lines[i]
        if (!line.trim()) continue

        let entry: WAFLogEntry | null = null

        if (detectedFormat === 'CSV') {
          if (i === 0) continue
          entry = this.parseCSVEntry(line, csvHeaders)
        } else if (line.includes('{')) {
          entry = this.parseJSONEntry(line)
        } else {
          entry = this.parseCommonLogEntry(line)
        }

        if (entry) entries.push(entry)
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'Parse error'
        parseErrors.push(`Line ${i + 1}: ${msg}`)
      }
    }

    return { entries, format: detectedFormat, parseErrors }
  }

  private parseCSVLine(line: string): string[] {
    // Handle quoted CSV values
    const result: string[] = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    result.push(current.trim())
    return result
  }

  private parseCSVEntry(line: string, headers: string[]): WAFLogEntry | null {
    try {
      const values = this.parseCSVLine(line)
      if (values.length < 3) return null

      // Create a map of headers to values
      const data: Record<string, string> = {}
      headers.forEach((header, idx) => {
        data[header.toLowerCase().trim()] = values[idx] || ''
      })

      // Try to extract common fields from CSV
      const getField = (keys: string[]) => {
        for (const key of keys) {
          if (data[key]) return data[key]
        }
        return ''
      }

      const sourceIp = getField(['source', 'source_ip', 'src_ip', 'client_ip', 'remote_ip', 'ip'])
      const method = getField(['method', 'http_method', 'request_method']) || 'UNKNOWN'
      const uri = getField(['uri', 'path', 'request', 'url', 'request_uri']) || '/'
      const statusStr = getField(['status', 'status_code', 'http_status', 'response_code'])
      const action = getField(['action', 'waf_action', 'block_action']) || 'UNKNOWN'
      
      // Handle timestamp - try multiple formats
      const timeStr = getField(['timestamp', 'time', 'date', 'datetime', 'request_time'])
      let timestamp = new Date().toISOString()
      if (timeStr) {
        const parsed = new Date(timeStr)
        if (!isNaN(parsed.getTime())) {
          timestamp = parsed.toISOString()
        }
      }

      const statusCode = parseInt(statusStr) || 0
      const blocked = action.toUpperCase().includes('BLOCK') || 
                     action.toUpperCase().includes('DENY') ||
                     action.toUpperCase().includes('DROP') ||
                     statusCode >= 400

      const payloadStr = getField(['payload', 'data', 'query_string']) || ''
      const attackType = this.classifyAttack(uri + ' ' + payloadStr)

      return {
        timestamp,
        sourceIp: sourceIp || 'unknown',
        destinationIp: getField(['destination', 'dest_ip', 'server_ip']) || 'unknown',
        method,
        uri,
        statusCode,
        bytesIn: parseInt(getField(['bytes_in', 'request_bytes'])) || 0,
        bytesOut: parseInt(getField(['bytes_out', 'response_bytes'])) || 0,
        userAgent: getField(['user_agent', 'useragent', 'ua']) || '',
        referer: getField(['referer', 'referrer']) || '',
        action,
        ruleId: getField(['rule_id', 'ruleid']) || '',
        ruleName: getField(['rule_name', 'rule']) || '',
        threat: getField(['threat', 'threat_type']) || '',
        attackType,
        severity: this.determineSeverity(action, statusCode),
        blocked,
        payload: payloadStr,
        rawLog: line,
      }
    } catch (err) {
      console.log('[v0] Error parsing CSV entry:', err instanceof Error ? err.message : 'Unknown error')
      return null
    }
  }

  private parseJSONEntry(line: string): WAFLogEntry | null {
    try {
      const json = JSON.parse(line)
      return {
        timestamp: json.timestamp || json.time || new Date().toISOString(),
        sourceIp: json.src_ip || json.source_ip || json.client_ip || 'unknown',
        destinationIp: json.dest_ip || json.destination_ip || json.server_ip || 'unknown',
        method: json.method || json.http_method || 'UNKNOWN',
        uri: json.uri || json.path || json.request || '/',
        statusCode: parseInt(json.status || json.status_code || '0'),
        bytesIn: parseInt(json.bytes_in || json.request_bytes || '0'),
        bytesOut: parseInt(json.bytes_out || json.response_bytes || '0'),
        userAgent: json.user_agent || json.useragent || '',
        referer: json.referer || json.referrer || '',
        action: json.action || json.waf_action || 'UNKNOWN',
        ruleId: json.rule_id || json.ruleid || '',
        ruleName: json.rule_name || json.rule || '',
        threat: json.threat || json.threat_type || '',
        attackType: this.classifyAttack(json.uri + ' ' + json.payload || ''),
        severity: json.severity || this.determineSeverity(json),
        blocked: json.action === 'BLOCK' || json.action === 'DENY' || json.blocked === true,
        payload: json.payload || '',
        rawLog: line,
      }
    } catch {
      return null
    }
  }

  private parseCommonLogEntry(line: string): WAFLogEntry | null {
    try {
      const parts = line.split(/\s+/)
      if (parts.length < 10) return null

      const timestamp = parts.slice(3, 5).join(' ')
      const request = parts.slice(5, 8)
      const method = request[0]
      const uri = request[1]
      const statusCode = parseInt(parts[8])

      return {
        timestamp: new Date().toISOString(),
        sourceIp: parts[0],
        destinationIp: parts[1],
        method: method,
        uri: uri,
        statusCode: statusCode,
        bytesIn: parseInt(parts[9]) || 0,
        bytesOut: 0,
        userAgent: parts.slice(10).join(' '),
        referer: '',
        action: statusCode >= 400 ? 'BLOCKED' : 'ALLOWED',
        ruleId: '',
        ruleName: '',
        threat: '',
        attackType: this.classifyAttack(uri),
        severity: statusCode >= 500 ? 'CRITICAL' : statusCode >= 400 ? 'HIGH' : 'LOW',
        blocked: statusCode >= 400,
        payload: uri,
        rawLog: line,
      }
    } catch {
      return null
    }
  }

  private classifyAttack(payload: string): string {
    if (!payload || typeof payload !== 'string') return 'unknown'
    
    for (const [type, config] of Object.entries(ATTACK_PATTERNS)) {
      try {
        if (config.pattern.test(payload)) return type
      } catch (e) {
        // Silent fail
      }
    }
    return 'unknown'
  }

  private determineSeverity(action: string, statusCode: number): string {
    if (action?.includes('BLOCK') || statusCode >= 400) return 'HIGH'
    return 'LOW'
  }

  private detectFormat(content: string): string {
    const firstLine = content.split('\n')[0] || ''
    
    // JSON detection
    if (content.includes('{') && content.includes('}')) {
      try {
        JSON.parse(firstLine)
        return 'JSON'
      } catch {
        // Not JSON, continue
      }
    }

    // CSV detection - look for comma-separated values with consistent columns
    if (firstLine.includes(',')) {
      const commaCount = (firstLine.match(/,/g) || []).length
      if (commaCount > 2) {
        return 'CSV'
      }
    }

    // Apache/Nginx common log format
    if (firstLine.match(/^\d+\.\d+\.\d+\.\d+\s+/) && firstLine.includes('[') && firstLine.includes(']')) {
      return 'Common Log'
    }

    // AWS WAF format
    if (content.includes('AWS WAF')) return 'AWS WAF'
    
    // ModSecurity format
    if (content.includes('ModSecurity')) return 'ModSecurity'

    // Space-separated format
    if (firstLine.split(' ').length > 10) return 'Space-Separated'
    
    return 'Unknown'
  }

  analyzeLogEntries(entries: WAFLogEntry[]): WAFLogAnalysis {
    const blocked = entries.filter(e => e.blocked)
    const blockRatio = entries.length > 0 ? (blocked.length / entries.length) * 100 : 0
    const riskScore = Math.min(100, blockRatio + Object.keys(this.getThreatBreakdown(entries)).filter(k => k !== 'unknown').length * 10)

    // Get unique IPs and URIs as simple arrays
    const uniqueIPs = [...new Set(entries.map(e => e.sourceIp))]
    const uniqueURIs = [...new Set(entries.map(e => e.uri))]

    const threatBreakdown = this.getThreatBreakdown(entries)
    const topAttackers = this.getTopAttackers(entries)
    const topTargets = this.getTopTargets(entries)

    return {
      totalEntries: entries.length,
      timeRange: { start: new Date().toISOString(), end: new Date().toISOString() },
      summary: {
        totalBlocked: blocked.length,
        totalAllowed: entries.length - blocked.length,
        blockRatio,
        uniqueSourceIPs: uniqueIPs.length,
        uniqueTargets: uniqueURIs.length,
      },
      threatBreakdown,
      topAttackers,
      topTargets,
      riskAssessment: {
        overallRisk: riskScore >= 80 ? 'CRITICAL' : riskScore >= 60 ? 'HIGH' : riskScore >= 40 ? 'MEDIUM' : 'LOW',
        riskScore: Math.round(riskScore),
        findings: this.generateFindings(entries, blocked.length, threatBreakdown),
        recommendations: this.generateRecommendations(threatBreakdown),
      },
      severityDistribution: { critical: 0, high: 0, medium: 0, low: 0, info: 0 },
      detailedFindings: [],
    }
  }

  private getThreatBreakdown(entries: WAFLogEntry[]): Record<string, number> {
    const breakdown: Record<string, number> = {}
    entries.forEach(e => {
      breakdown[e.attackType] = (breakdown[e.attackType] || 0) + 1
    })
    return breakdown
  }

  private getTopAttackers(entries: WAFLogEntry[]): Array<{ ip: string; count: number; severity: string; threats: string[] }> {
    const ipMap: Record<string, number> = {}
    entries.forEach(e => {
      ipMap[e.sourceIp] = (ipMap[e.sourceIp] || 0) + 1
    })

    return Object.entries(ipMap)
      .map(([ip, count]) => ({
        ip,
        count,
        severity: count > 50 ? 'CRITICAL' : count > 20 ? 'HIGH' : 'MEDIUM',
        threats: [],
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
  }

  private getTopTargets(entries: WAFLogEntry[]): Array<{ uri: string; count: number; attacks: number }> {
    const uriMap: Record<string, number> = {}
    entries.forEach(e => {
      uriMap[e.uri] = (uriMap[e.uri] || 0) + 1
    })

    return Object.entries(uriMap)
      .map(([uri, count]) => ({
        uri,
        count,
        attacks: 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
  }

  private generateFindings(entries: WAFLogEntry[], blockedCount: number, threatBreakdown: Record<string, number>): string[] {
    const findings: string[] = []
    const blockRate = entries.length > 0 ? ((blockedCount / entries.length) * 100).toFixed(1) : '0'
    findings.push(`WAF blocked ${blockedCount} of ${entries.length} requests (${blockRate}% block rate)`)

    Object.entries(threatBreakdown)
      .filter(([k]) => k !== 'unknown')
      .slice(0, 3)
      .forEach(([threat, count]) => {
        findings.push(`${threat}: ${count} attempts`)
      })

    return findings
  }

  private generateRecommendations(threatBreakdown: Record<string, number>): string[] {
    const recommendations: string[] = []
    if (threatBreakdown['sqlInjection'] > 0) {
      recommendations.push('Use parameterized queries to prevent SQL injection')
    }
    if (threatBreakdown['xss'] > 0) {
      recommendations.push('Implement Content Security Policy (CSP) headers')
    }
    recommendations.push('Continue monitoring WAF logs for emerging threats')
    return recommendations
  }


}

export const wafLogAnalyzer = new WAFLogAnalyzer()
