import { WAFAnalysisResult } from "./waf-types"

export interface ExportOptions {
  format: "json" | "csv" | "html"
  includeRecommendations: boolean
  includeHeaders: boolean
}

export class WAFReportExporter {
  static exportToJSON(result: WAFAnalysisResult): string {
    return JSON.stringify(result, null, 2)
  }

  static exportToCSV(result: WAFAnalysisResult): string {
    let csv = "WAF Analysis Report\n"
    csv += `URL,${result.url}\n`
    csv += `Date,${new Date(result.timestamp).toLocaleString()}\n`
    csv += `Overall Risk Score,${result.overallRiskScore}\n`
    csv += `Status,${result.status}\n\n`

    csv += "Vulnerabilities\n"
    csv += "Category,Severity,Name,CVSS Score,Description,Remediation\n"

    result.vulnerabilities.forEach((vuln) => {
      const sanitized = (str: string) => `"${str.replace(/"/g, '""')}"`
      csv += `${sanitized(vuln.category)},${sanitized(vuln.severity)},${sanitized(vuln.name)},${vuln.cvssScore},${sanitized(vuln.description)},${sanitized(vuln.remediation)}\n`
    })

    csv += "\n\nSecurity Headers\n"
    csv += "Header Name,Status\n"
    result.securityHeaders.present.forEach((header) => {
      csv += `${header},Present\n`
    })
    result.securityHeaders.missing.forEach((header) => {
      csv += `${header},Missing\n`
    })

    if (result.recommendations.length > 0) {
      csv += "\n\nRecommendations\n"
      result.recommendations.forEach((rec, idx) => {
        csv += `${idx + 1},"${rec}"\n`
      })
    }

    return csv
  }

  static exportToHTML(result: WAFAnalysisResult): string {
    const getSeverityColor = (severity: string) => {
      switch (severity) {
        case "CRITICAL":
          return "#dc2626"
        case "HIGH":
          return "#ea580c"
        case "MEDIUM":
          return "#eab308"
        case "LOW":
          return "#16a34a"
        default:
          return "#6b7280"
      }
    }

    const getStatusColor = (status: string) => {
      switch (status) {
        case "VULNERABLE":
          return "#dc2626"
        case "WARNING":
          return "#ea580c"
        case "SECURE":
          return "#16a34a"
        default:
          return "#6b7280"
      }
    }

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>WAF Analysis Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
      background: linear-gradient(135deg, #0f0f1e 0%, #1a1a2e 100%);
      color: #e0e0e0;
      padding: 20px;
      line-height: 1.6;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: #1a1a2e;
      border: 1px solid #00ff88;
      border-radius: 12px;
      padding: 30px;
      box-shadow: 0 0 20px rgba(0, 255, 136, 0.1);
    }
    .header {
      border-bottom: 2px solid #00ff88;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    h1 {
      color: #00ff88;
      font-size: 28px;
      margin-bottom: 10px;
    }
    .meta {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }
    .meta-item {
      background: #0f0f1e;
      padding: 15px;
      border-left: 3px solid #00ff88;
      border-radius: 4px;
    }
    .meta-label {
      font-size: 12px;
      color: #888;
      text-transform: uppercase;
      margin-bottom: 5px;
    }
    .meta-value {
      font-size: 18px;
      font-weight: bold;
      color: #00ff88;
    }
    .risk-score {
      font-size: 32px;
    }
    .status-badge {
      display: inline-block;
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: bold;
      margin-top: 10px;
    }
    .status-badge.VULNERABLE { background: #dc2626; color: white; }
    .status-badge.WARNING { background: #ea580c; color: white; }
    .status-badge.SECURE { background: #16a34a; color: white; }

    section {
      margin-bottom: 40px;
    }
    h2 {
      color: #00ff88;
      font-size: 20px;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 1px solid #00ff88;
    }

    .vulnerability-list {
      display: grid;
      gap: 15px;
    }
    .vulnerability-item {
      background: #0f0f1e;
      border-left: 4px solid;
      padding: 20px;
      border-radius: 4px;
    }
    .vuln-header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 10px;
    }
    .vuln-name {
      font-weight: bold;
      font-size: 16px;
    }
    .severity-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: bold;
      color: white;
    }
    .severity-CRITICAL { background: #dc2626; }
    .severity-HIGH { background: #ea580c; }
    .severity-MEDIUM { background: #eab308; color: #000; }
    .severity-LOW { background: #16a34a; }

    .vuln-detail {
      margin: 10px 0;
      font-size: 14px;
    }
    .vuln-label {
      color: #888;
      font-size: 12px;
      text-transform: uppercase;
      margin-top: 8px;
    }
    .vuln-findings {
      background: rgba(0, 0, 0, 0.3);
      padding: 10px;
      border-radius: 4px;
      margin: 5px 0;
      font-family: monospace;
      font-size: 13px;
    }
    .vuln-findings li { margin-left: 20px; margin-top: 5px; }

    .headers-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
    }
    .headers-column h3 {
      color: #00ff88;
      font-size: 14px;
      margin-bottom: 15px;
      text-transform: uppercase;
    }
    .headers-list {
      list-style: none;
    }
    .headers-list li {
      padding: 8px;
      margin: 5px 0;
      background: rgba(0, 255, 136, 0.05);
      border-left: 2px solid #00ff88;
      border-radius: 2px;
      font-family: monospace;
      font-size: 13px;
    }
    .missing-list li {
      border-left-color: #dc2626;
      background: rgba(220, 38, 38, 0.05);
    }

    .recommendations-list {
      list-style: none;
    }
    .recommendations-list li {
      padding: 12px;
      margin: 10px 0;
      background: rgba(0, 255, 136, 0.05);
      border-left: 3px solid #00ff88;
      border-radius: 4px;
    }

    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #00ff88;
      text-align: center;
      font-size: 12px;
      color: #888;
    }

    @media print {
      body { background: white; color: #000; }
      .container { background: white; border-color: #ddd; box-shadow: none; }
      h1, h2 { color: #1a1a2e; }
      .meta-item { background: #f5f5f5; border-left-color: #00ff88; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔒 WAF Security Analysis Report</h1>
      <div class="meta">
        <div class="meta-item">
          <div class="meta-label">Target URL</div>
          <div class="meta-value" style="font-size: 14px; word-break: break-all;">${escapeHtml(result.url)}</div>
        </div>
        <div class="meta-item">
          <div class="meta-label">Analysis Date</div>
          <div class="meta-value">${new Date(result.timestamp).toLocaleString()}</div>
        </div>
        <div class="meta-item">
          <div class="meta-label">Overall Risk Score</div>
          <div class="meta-value risk-score">${result.overallRiskScore}</div>
        </div>
        <div class="meta-item">
          <div class="meta-label">Status</div>
          <div class="status-badge ${result.status}">${result.status}</div>
        </div>
      </div>
    </div>

    ${
      result.vulnerabilities.length > 0
        ? `
    <section>
      <h2>Vulnerabilities Found (${result.vulnerabilities.length})</h2>
      <div class="vulnerability-list">
        ${result.vulnerabilities
          .map(
            (vuln) => `
        <div class="vulnerability-item" style="border-left-color: ${getSeverityColor(vuln.severity)};">
          <div class="vuln-header">
            <div>
              <div class="vuln-name">${escapeHtml(vuln.name)}</div>
              <div class="vuln-detail" style="color: #888; font-size: 12px; margin-top: 5px;">
                Category: ${escapeHtml(vuln.category)} | CVSS Score: ${vuln.cvssScore}
              </div>
            </div>
            <span class="severity-badge severity-${vuln.severity}">${vuln.severity}</span>
          </div>
          <div class="vuln-detail">${escapeHtml(vuln.description)}</div>
          <div class="vuln-label">Findings:</div>
          <ul class="vuln-findings">
            ${vuln.findings.map((f) => `<li>${escapeHtml(f)}</li>`).join("")}
          </ul>
          <div class="vuln-label">Remediation:</div>
          <div style="background: rgba(0, 255, 136, 0.1); padding: 10px; border-radius: 4px; margin-top: 5px;">
            ${escapeHtml(vuln.remediation)}
          </div>
        </div>
        `
          )
          .join("")}
      </div>
    </section>
    `
        : `
    <section>
      <h2>Vulnerabilities</h2>
      <div style="padding: 20px; background: rgba(22, 163, 74, 0.1); border-left: 3px solid #16a34a; border-radius: 4px;">
        No vulnerabilities detected - Application appears secure!
      </div>
    </section>
    `
    }

    <section>
      <h2>Security Headers Analysis</h2>
      <div class="headers-grid">
        <div class="headers-column">
          <h3>✓ Present Headers (${result.securityHeaders.present.length})</h3>
          <ul class="headers-list">
            ${result.securityHeaders.present.map((h) => `<li>${escapeHtml(h)}</li>`).join("") || "<li style='color: #888;'>None</li>"}
          </ul>
        </div>
        <div class="headers-column">
          <h3>✗ Missing Headers (${result.securityHeaders.missing.length})</h3>
          <ul class="headers-list missing-list">
            ${result.securityHeaders.missing.map((h) => `<li>${escapeHtml(h)}</li>`).join("") || "<li style='color: #888;'>None</li>"}
          </ul>
        </div>
      </div>
    </section>

    ${
      result.recommendations.length > 0
        ? `
    <section>
      <h2>Recommendations (${result.recommendations.length})</h2>
      <ul class="recommendations-list">
        ${result.recommendations.map((rec) => `<li>${escapeHtml(rec)}</li>`).join("")}
      </ul>
    </section>
    `
        : ""
    }

    <div class="footer">
      <p>Generated by WAF Analysis Engine | ${new Date().toLocaleString()}</p>
      <p style="margin-top: 10px;">This report contains sensitive security information. Please handle with care.</p>
    </div>
  </div>
</body>
</html>
    `

    return html
  }

  static downloadReport(
    result: WAFAnalysisResult,
    format: "json" | "csv" | "html" = "html"
  ): void {
    let content = ""
    let filename = `waf-report-${new Date().toISOString().split("T")[0]}`
    let mimeType = "text/plain"

    switch (format) {
      case "json":
        content = this.exportToJSON(result)
        filename += ".json"
        mimeType = "application/json"
        break
      case "csv":
        content = this.exportToCSV(result)
        filename += ".csv"
        mimeType = "text/csv"
        break
      case "html":
        content = this.exportToHTML(result)
        filename += ".html"
        mimeType = "text/html"
        break
    }

    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  }
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }
  return text.replace(/[&<>"']/g, (m) => map[m])
}
