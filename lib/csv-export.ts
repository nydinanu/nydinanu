/**
 * CSV Export utilities for bulk scan results
 */

interface ScanResult {
  item: string
  type: "ip" | "domain" | "hash" | "unknown"
  status: "success" | "error" | "pending"
  threatLevel?: string
  threats?: number
  error?: string
  [key: string]: any
}

/**
 * Escape CSV field values
 */
function escapeCSVField(field: any): string {
  if (field === null || field === undefined) {
    return ""
  }

  const str = String(field)

  // If field contains comma, newline, or quotes, wrap in quotes and escape quotes
  if (str.includes(",") || str.includes("\n") || str.includes('"')) {
    return `"${str.replace(/"/g, '""')}"`
  }

  return str
}

/**
 * Convert scan results to CSV format
 */
export function resultsToCSV(results: ScanResult[], fileName: string = "bulk-scan-results"): string {
  if (!results || results.length === 0) {
    return ""
  }

  // Define CSV headers
  const headers = [
    "Item",
    "Type",
    "Status",
    "Threat Level",
    "Threats Detected",
    "Error Message",
  ]

  // Build CSV rows
  const rows = results.map((result) => [
    escapeCSVField(result.item),
    escapeCSVField(result.type),
    escapeCSVField(result.status),
    escapeCSVField(result.threatLevel || "N/A"),
    escapeCSVField(result.threats || "0"),
    escapeCSVField(result.error || ""),
  ])

  // Combine headers and rows
  const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n")

  return csvContent
}

/**
 * Generate detailed CSV with additional threat information
 */
export function detailedResultsToCSV(results: ScanResult[]): string {
  if (!results || results.length === 0) {
    return ""
  }

  const headers = [
    "Item",
    "Type",
    "Status",
    "Threat Level",
    "Threats Detected",
    "Error Message",
    "Scan Timestamp",
  ]

  const rows = results.map((result) => [
    escapeCSVField(result.item),
    escapeCSVField(result.type),
    escapeCSVField(result.status),
    escapeCSVField(result.threatLevel || "N/A"),
    escapeCSVField(result.threats || "0"),
    escapeCSVField(result.error || ""),
    escapeCSVField(new Date().toISOString()),
  ])

  const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n")

  return csvContent
}

/**
 * Download CSV file to user's computer
 */
export function downloadCSV(csvContent: string, fileName: string): void {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)

  link.setAttribute("href", url)
  link.setAttribute(
    "download",
    `${fileName}-${new Date().toISOString().split("T")[0]}.csv`,
  )
  link.style.visibility = "hidden"

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}

/**
 * Export bulk scan results as CSV
 */
export function exportBulkScanResults(
  results: ScanResult[],
  fileName: string = "bulk-scan-results",
  detailed: boolean = false,
): void {
  const csvContent = detailed ? detailedResultsToCSV(results) : resultsToCSV(results, fileName)

  if (!csvContent) {
    console.error("No results to export")
    return
  }

  downloadCSV(csvContent, fileName)
}
