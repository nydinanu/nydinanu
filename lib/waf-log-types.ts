export interface WAFLogEntry {
  timestamp: string
  sourceIp: string
  destinationIp: string
  method: string
  uri: string
  statusCode: number
  bytesIn: number
  bytesOut: number
  userAgent: string
  referer: string
  action: string
  ruleId: string
  ruleName: string
  threat: string
  attackType: string
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO'
  blocked: boolean
  requestHeaders?: Record<string, string>
  responseHeaders?: Record<string, string>
  payload?: string
  rawLog: string
}

export interface WAFLogAnalysis {
  totalEntries: number
  timeRange: {
    start: string
    end: string
  }
  summary: {
    totalBlocked: number
    totalAllowed: number
    blockRatio: number
    uniqueSourceIPs: number
    uniqueTargets: number
  }
  threatBreakdown: {
    sqlInjection: number
    xss: number
    directoryTraversal: number
    commandInjection: number
    xxe: number
    ssrf: number
    rce: number
    botsAndCrawlers: number
    geoBlocked: number
    rateLimited: number
    other: number
  }
  topAttackers: {
    ip: string
    count: number
    severity: string
    countries: string[]
    threats: string[]
  }[]
  topTargets: {
    uri: string
    count: number
    methods: string[]
    threats: string[]
  }[]
  riskAssessment: {
    overallRisk: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
    riskScore: number
    findings: string[]
    recommendations: string[]
  }
  severityDistribution: {
    critical: number
    high: number
    medium: number
    low: number
    info: number
  }
  entries: WAFLogEntry[]
  detailedFindings: {
    category: string
    count: number
    severity: string
    examples: string[]
  }[]
}

export interface ParsedWAFLog {
  entries: WAFLogEntry[]
  format: string
  parseErrors: string[]
}
