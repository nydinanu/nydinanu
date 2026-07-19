"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Activity, AlertTriangle, Shield, Clock, Globe, Server, FileText, Search, X } from "lucide-react"
import { Card } from "@/components/ui/card"
import { ThreatMap } from "@/components/threat-map"

interface ScanHistoryItem {
  id: string
  query: string
  type: "ip" | "domain" | "hash" | "file"
  timestamp: number
  threatLevel: "critical" | "high" | "medium" | "low" | "clean" | "unknown"
  threatScore: number
  findings: {
    malicious: number
    suspicious: number
    clean: number
  }
  country?: string
  isp?: string
  fileName?: string
  fileSize?: number
}

interface ScanStats {
  total: number
  byType: {
    ip: number
    domain: number
    hash: number
    file: number
  }
  byThreatLevel: {
    critical: number
    high: number
    medium: number
    low: number
    clean: number
    unknown: number
  }
  avgThreatScore: number
}

export default function ThreatFeedPage() {
  const [history, setHistory] = useState<ScanHistoryItem[]>([])
  const [stats, setStats] = useState<ScanStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState<"all" | "ip" | "domain" | "hash" | "file">("all")
  const [threatLevelFilter, setThreatLevelFilter] = useState<"all" | "critical" | "high" | "medium" | "low" | "clean">(
    "all",
  )
  const [searchQuery, setSearchQuery] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const itemsPerPage = 50

  useEffect(() => {
    fetchHistory()
    
    // Poll for new scans every 10 seconds
    const interval = setInterval(fetchHistory, 10000)
    return () => clearInterval(interval)
  }, [])

  const fetchHistory = async () => {
    try {
      setError(null)
      const response = await fetch("/api/history")
      if (!response.ok) {
        throw new Error(`Failed to fetch history: ${response.status}`)
      }
      const data = await response.json()
      setHistory(data.history || [])
      setStats(data.stats || null)
      setLastUpdated(new Date())
      
      // Only show error if Redis is actually misconfigured, not just empty
      if (data.error && data.history.length === 0 && !data.stats?.total) {
        // History is empty, but that's okay - show data once scans are performed
        console.log("[v0] Threat feed: No history yet. Run some scans to populate the feed.")
      }
    } catch (error) {
      console.error("[v0] Failed to fetch history:", error)
      setError("Unable to load threat feed. Redis storage may not be configured.")
    } finally {
      setLoading(false)
    }
  }

  const getThreatColor = (level: string) => {
    switch (level) {
      case "critical":
        return "text-red-500 bg-red-500/10 border-red-500/20"
      case "high":
        return "text-orange-500 bg-orange-500/10 border-orange-500/20"
      case "medium":
        return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20"
      case "low":
        return "text-blue-500 bg-blue-500/10 border-blue-500/20"
      case "clean":
        return "text-green-500 bg-green-500/10 border-green-500/20"
      default:
        return "text-gray-500 bg-gray-500/10 border-gray-500/20"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "ip":
        return <Server className="h-4 w-4" />
      case "domain":
        return <Globe className="h-4 w-4" />
      case "hash":
        return <Shield className="h-4 w-4" />
      case "file":
        return <FileText className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const getFilteredAndSortedHistory = () => {
    let filtered = history

    // Filter by type
    if (typeFilter !== "all") {
      filtered = filtered.filter((item) => item.type === typeFilter)
    }

    // Filter by threat level
    if (threatLevelFilter !== "all") {
      filtered = filtered.filter((item) => item.threatLevel === threatLevelFilter)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((item) => item.query.toLowerCase().includes(query))
    }

    const deduplicated = new Map<string, ScanHistoryItem & { scanCount: number }>()

    for (const item of filtered.sort((a, b) => b.timestamp - a.timestamp)) {
      if (!deduplicated.has(item.query)) {
        deduplicated.set(item.query, { ...item, scanCount: 1 })
      } else {
        const existing = deduplicated.get(item.query)!
        existing.scanCount += 1
      }
    }

    return Array.from(deduplicated.values()).sort((a, b) => b.timestamp - a.timestamp)
  }

  const filteredHistory = getFilteredAndSortedHistory()
  const hasActiveFilters = typeFilter !== "all" || threatLevelFilter !== "all" || searchQuery.trim() !== ""
  
  // Pagination
  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedHistory = filteredHistory.slice(startIndex, endIndex)

  return (
    <div className="min-h-screen bg-black text-green-500 font-mono p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <Activity className="h-8 w-8" />
              {"THREAT INTELLIGENCE FEED"}
            </h1>
            <p className="text-green-500/70">{"Real-time monitoring of security scans and threat detections"}</p>
          </div>
          <div className="flex gap-4 flex-wrap">
            <Link
              href="/"
              className="px-6 py-3 bg-green-500/10 border border-green-500/30 hover:bg-green-500/20 transition-colors text-green-500"
            >
              {"← HOME"}
            </Link>
            <Link
              href="/scanner"
              className="px-6 py-3 bg-green-500/10 border border-green-500/30 hover:bg-green-500/20 transition-colors text-green-500"
            >
              {"← BACK TO SCANNER"}
            </Link>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <Card className="bg-red-500/10 border-red-500/30 p-6 mb-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-red-500" />
              <div>
                <p className="text-red-500 font-bold">{"Threat Feed Unavailable"}</p>
                <p className="text-red-500/70 text-sm mt-1">{error}</p>
                <p className="text-red-500/70 text-sm mt-1">
                  {"Scans will continue to work, but history will not be saved."}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Info Message - Redis configured but no history yet */}
        {!error && !loading && history.length === 0 && stats?.total === 0 && (
          <Card className="bg-blue-500/10 border-blue-500/30 p-6 mb-6">
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-blue-500" />
              <div>
                <p className="text-blue-500 font-bold">{"Threat Feed Ready"}</p>
                <p className="text-blue-500/70 text-sm mt-1">
                  {"Redis is configured and working properly. Run scans from the Scanner page to populate the threat feed."}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-black border-green-500/30 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-green-500/70 text-sm">{"TOTAL SCANS"}</span>
                <Shield className="h-5 w-5 text-green-500" />
              </div>
              <div className="text-3xl font-bold text-green-500">{stats.total}</div>
            </Card>

            <Card
              className="bg-black border-red-500/30 p-6 cursor-pointer hover:border-red-500 transition-colors"
              onClick={() => {
                setThreatLevelFilter("critical")
                setTypeFilter("all")
                setSearchQuery("")
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-red-500/70 text-sm">{"CRITICAL THREATS"}</span>
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div className="text-3xl font-bold text-red-500">{stats.byThreatLevel.critical}</div>
            </Card>

            <Card
              className="bg-black border-orange-500/30 p-6 cursor-pointer hover:border-orange-500 transition-colors"
              onClick={() => {
                setThreatLevelFilter("high")
                setTypeFilter("all")
                setSearchQuery("")
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-orange-500/70 text-sm">{"HIGH THREATS"}</span>
                <AlertTriangle className="h-5 w-5 text-orange-500" />
              </div>
              <div className="text-3xl font-bold text-orange-500">{stats.byThreatLevel.high}</div>
            </Card>

            <Card className="bg-black border-green-500/30 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-green-500/70 text-sm">{"AVG THREAT SCORE"}</span>
                <Shield className="h-5 w-5 text-green-500" />
              </div>
              <div className="text-3xl font-bold text-green-500">{Math.round(stats.avgThreatScore)}</div>
            </Card>
          </div>
        )}

        {/* Global Threat Map */}
        {history.length > 0 && (
          <div className="mb-12 p-8 bg-black border border-green-500/30 rounded-lg">
            <ThreatMap scanHistory={history} />
          </div>
        )}

        {!error && (
          <div className="mb-6 space-y-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <div className="flex items-center gap-2 px-4 py-3 border border-green-500/30 bg-black hover:bg-green-500/5 transition-colors">
                <Search className="h-4 w-4 text-green-500/70 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search by IP, Domain, Hash, or Filename..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent text-green-500 placeholder-green-500/50 outline-none text-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="text-green-500/70 hover:text-green-500 transition-colors flex-shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Type and Threat Level Filters in one row */}
            <div className="flex flex-wrap gap-2 items-center">
              {/* Type Filters */}
              {["all", "ip", "domain", "hash", "file"].map((type) => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type as any)}
                  className={`px-3 py-2 border text-xs font-bold transition-colors whitespace-nowrap ${
                    typeFilter === type
                      ? "bg-green-500/20 border-green-500 text-green-500"
                      : "bg-black border-green-500/30 text-green-500/70 hover:bg-green-500/10"
                  }`}
                >
                  {type.toUpperCase()}
                  {type !== "all" && stats && (
                    <span className="ml-1 opacity-70">({stats.byType[type as keyof typeof stats.byType]})</span>
                  )}
                </button>
              ))}

              {/* Separator */}
              <div className="w-px h-6 bg-green-500/20" />

              {/* Threat Level Filters */}
              {["all", "critical", "high", "medium", "low", "clean"].map((level) => (
                <button
                  key={level}
                  onClick={() => setThreatLevelFilter(level as any)}
                  className={`px-3 py-2 border text-xs font-bold transition-colors ${
                    threatLevelFilter === level
                      ? level === "critical"
                        ? "bg-red-500/20 border-red-500 text-red-500"
                        : level === "high"
                          ? "bg-orange-500/20 border-orange-500 text-orange-500"
                          : level === "medium"
                            ? "bg-yellow-500/20 border-yellow-500 text-yellow-500"
                            : level === "low"
                              ? "bg-blue-500/20 border-blue-500 text-blue-500"
                              : level === "clean"
                                ? "bg-green-500/20 border-green-500 text-green-500"
                                : "bg-green-500/20 border-green-500 text-green-500"
                      : "bg-black border-green-500/30 text-green-500/70 hover:bg-green-500/10"
                  }`}
                >
                  {level.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <button
                onClick={() => {
                  setTypeFilter("all")
                  setThreatLevelFilter("all")
                  setSearchQuery("")
                }}
                className="text-green-500/70 hover:text-green-500 text-xs flex items-center gap-1 transition-colors"
              >
                <X className="h-3 w-3" />
                Clear all filters
              </button>
            )}
            
            {/* Last Updated Indicator */}
            <div className="text-xs text-green-500/70 ml-auto">
              {loading && <span>Updating...</span>}
              {!loading && lastUpdated && (
                <span>
                  Updated: {lastUpdated.toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Scanned History List - Formatted as Screenshot */}
        {!loading && !error && filteredHistory.length > 0 && (
          <div className="mt-8 space-y-4">
            {paginatedHistory.map((item) => (
              <Link
                key={`${item.id}-${item.timestamp}`}
                href={`/results?type=${item.type}&query=${encodeURIComponent(item.query)}`}
                className="block p-6 bg-black border border-green-500/30 hover:border-green-500/50 transition-colors"
              >
                {/* Header row: Type badge, threat badge, scan count, and timestamp */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {/* Type Badge */}
                    <div className="flex items-center gap-2 px-3 py-1 border border-green-500/50">
                      <span className="text-green-500">{getTypeIcon(item.type)}</span>
                      <span className="text-green-500 font-bold text-sm">{item.type.toUpperCase()}</span>
                    </div>
                    
                    {/* Threat Level Badge */}
                    <div className={`px-3 py-1 border ${
                      item.threatLevel === "critical" ? "border-red-500/50 text-red-500" :
                      item.threatLevel === "high" ? "border-orange-500/50 text-orange-500" :
                      item.threatLevel === "medium" ? "border-yellow-500/50 text-yellow-500" :
                      item.threatLevel === "low" ? "border-blue-500/50 text-blue-500" :
                      "border-green-500/50 text-green-500"
                    } font-bold text-sm`}>
                      {item.threatLevel.toUpperCase()}
                    </div>
                    
                    {/* Scan Count */}
                    <div className="px-3 py-1 border border-blue-500/50 text-blue-500 font-bold text-sm">
                      {(item as any).scanCount ? `${(item as any).scanCount} SCANS` : "1 SCAN"}
                    </div>
                  </div>
                  
                  {/* Timestamp on the right */}
                  <div className="flex items-center gap-2 text-green-500/70 text-xs">
                    <Clock className="h-3 w-3" />
                    {new Date(item.timestamp).toLocaleString()}
                  </div>
                </div>

                {/* Query line */}
                <div className="mb-3">
                  <p className="text-green-500 font-mono">Query: <span className="text-green-400 font-bold">{item.query}</span></p>
                </div>

                {/* Findings row */}
                <div className="flex gap-6 mb-3 text-sm">
                  <div>
                    <span className="text-green-500/70">Malicious: </span>
                    <span className="text-green-500 font-bold">{item.findings?.malicious || 0}</span>
                  </div>
                  <div>
                    <span className="text-green-500/70">Suspicious: </span>
                    <span className="text-green-500 font-bold">{item.findings?.suspicious || 0}</span>
                  </div>
                  <div>
                    <span className="text-green-500/70">Clean: </span>
                    <span className="text-green-500 font-bold">{item.findings?.clean || 0}</span>
                  </div>
                  <div className="ml-auto">
                    <span className="text-green-500/70">Threat Score: </span>
                    <span className="text-green-500 font-bold">{item.threatScore}</span>
                  </div>
                </div>

                {/* Location info */}
                <div className="mb-2 text-sm text-green-500/70">
                  Country: <span className="text-green-500">{item.country || "Unknown"}</span> ISP: <span className="text-green-500">{item.isp || "Unknown"}</span>
                </div>

                {/* Click to view link */}
                <div className="text-green-500/70 text-sm hover:text-green-500 transition-colors">
                  Click to view full scan details (no rescan) →
                </div>
              </Link>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8 pt-6 border-t border-green-500/20">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-green-500/50 text-green-500 text-sm disabled:opacity-50 hover:bg-green-500/10 transition-colors"
                >
                  Previous
                </button>
                <div className="flex items-center gap-2 text-sm text-green-500/70 px-4">
                  Page {currentPage} of {totalPages}
                </div>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-green-500/50 text-green-500 text-sm disabled:opacity-50 hover:bg-green-500/10 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <p className="text-green-500/70">Loading threat feed...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && history.length === 0 && (
          <div className="text-center py-12">
            <p className="text-green-500/70">No scans have been performed yet.</p>
          </div>
        )}
      </div>

      {/* Footer with Total Scans Analyzed */}
      <footer className="mt-12 py-6 border-t border-green-500/30 text-green-500/70">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center text-sm">
          <div className="flex gap-6">
            <span>Total Scans Analyzed: <span className="text-green-500 font-bold">{stats?.total || 0}</span></span>
            <span>History Retention: <span className="text-green-500 font-bold">365 Days</span></span>
          </div>
          <div className="text-xs">
            Last Updated: {new Date().toLocaleString()}
          </div>
        </div>
      </footer>
    </div>
  )
}
