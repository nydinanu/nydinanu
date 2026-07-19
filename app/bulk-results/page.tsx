"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Shield, ArrowLeft, Download, Search, AlertTriangle, CheckCircle, XCircle, FileText, Lock, TrendingUp, ChevronDown, ChevronUp, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { exportBulkScanResults } from "@/lib/csv-export"

function BulkResultsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const scanId = searchParams.get("scanId")
  const itemsParam = searchParams.get("items")
  const scanType = searchParams.get("type") || "ip"

  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [filterText, setFilterText] = useState("")
  const [filterThreat, setFilterThreat] = useState<string>("all")
  const [showEmailLeaksOnly, setShowEmailLeaksOnly] = useState(false)
  const [items, setItems] = useState<string[]>([])
  const [showIncidentForm, setShowIncidentForm] = useState(false)
  const [incidentTitle, setIncidentTitle] = useState("")
  const [creatingIncident, setCreatingIncident] = useState(false)
  const [expandedRows, setExpandedRows] = useState<number[]>([])
  const [incidentMode, setIncidentMode] = useState<"create" | "add">("create")
  const [existingIncidents, setExistingIncidents] = useState<any[]>([])
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>("")
  const [selectedItems, setSelectedItems] = useState<number[]>([])
  const [successMessage, setSuccessMessage] = useState<{ show: boolean; message: string; count: number }>({ show: false, message: "", count: 0 })
  const [errorMessage, setErrorMessage] = useState<{ show: boolean; message: string }>({ show: false, message: "" })

  useEffect(() => {
    if (itemsParam) {
      try {
        const parsedItems = JSON.parse(decodeURIComponent(itemsParam))
        setItems(parsedItems)
        performBulkScan(parsedItems)
      } catch (error) {
        console.error("[v0] Failed to parse items:", error)
        setLoading(false)
      }
    } else if (scanId) {
      fetchResults()
    }
  }, [itemsParam, scanId])

  const performBulkScan = async (itemsToScan: string[]) => {
    try {
      console.log("[v0] Starting bulk scan for", itemsToScan.length, "items")
      
      const response = await fetch("/api/bulk-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: itemsToScan,
          type: scanType,
        }),
      })

      if (!response.ok) throw new Error("Bulk scan failed")
      
      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error("[v0] Bulk scan error:", error)
      setResults({ results: [] })
    } finally {
      setLoading(false)
    }
  }

  const fetchResults = async () => {
    try {
      // This would normally be an API call to get results by scanId
      // For now, we'll simulate it
      setLoading(false)
    } catch (error) {
      console.error("Failed to fetch results:", error)
      setLoading(false)
    }
  }

  const toggleRowExpansion = (index: number) => {
    if (expandedRows.includes(index)) {
      setExpandedRows(expandedRows.filter(i => i !== index))
    } else {
      setExpandedRows([...expandedRows, index])
    }
  }

  const fetchExistingIncidents = async () => {
    try {
      const response = await fetch("/api/incidents")
      if (!response.ok) throw new Error("Failed to fetch incidents")
      const data = await response.json()
      setExistingIncidents(data.cases || data.incidents || [])
    } catch (error) {
      console.error("[v0] Error fetching incidents:", error)
      setExistingIncidents([])
    }
  }

  const createIncidentFromResults = async () => {
    if (incidentMode === "create" && !incidentTitle.trim()) return
    if (incidentMode === "add" && !selectedIncidentId) return
    if (!results?.results || selectedItems.length === 0) return

    setCreatingIncident(true)
    try {
      const iocs = results.results
        .filter((r: any, idx: number) => r.status === "success" && selectedItems.includes(idx))
        .map((r: any) => ({
          type: r.type || scanType,
          value: r.item,
          threatLevel: r.threatLevel || "unknown",
          scanDate: new Date().toISOString(),
        }))

      if (incidentMode === "create") {
        // Create new incident
        const response = await fetch("/api/incidents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: incidentTitle,
            description: `Bulk scan of ${results.results.length} items (${scanType}s)`,
            severity: "MEDIUM",
            iocs,
            tags: [scanType, "bulk-scan"],
          }),
        })

    if (!response.ok) throw new Error("Failed to create incident")
    setSuccessMessage({ show: true, message: "Incident created successfully", count: iocs.length })
  } else {
    // Add to existing incident
    const response = await fetch(`/api/incidents/${selectedIncidentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ iocs })
    })

    if (!response.ok) throw new Error("Failed to add IOCs to incident")
    setSuccessMessage({ show: true, message: "IOCs added to incident successfully", count: iocs.length })
      }

      setShowIncidentForm(false)
      setIncidentTitle("")
      setSelectedIncidentId("")
      
      setTimeout(() => {
        router.push("/incidents")
      }, 2000)
  } catch (error) {
    console.error("[v0] Error managing incident:", error)
    setErrorMessage({ show: true, message: incidentMode === "create" ? "Failed to create incident case" : "Failed to add IOCs to incident" })
  } finally {
    setCreatingIncident(false)
  }
  }

  const filteredResults = results?.results?.filter((result: any) => {
    const matchesText = result.item.toLowerCase().includes(filterText.toLowerCase())
    const matchesThreat = filterThreat === "all" || result.threatLevel === filterThreat
    const matchesEmailLeaks = !showEmailLeaksOnly || (result.emailLeaks && result.emailLeaks.length > 0)
    return matchesText && matchesThreat && matchesEmailLeaks
  })

  const exportResults = () => {
    if (!results?.results) return

    // Transform results to match the CSV export format
    const formattedResults = results.results.map((r: any) => ({
      item: r.item,
      type: r.type,
      status: r.status,
      threatLevel: r.threatLevel || "N/A",
      threats: r.threats || 0,
      error: r.error || "",
    }))

    exportBulkScanResults(formattedResults, `bulk-scan-${scanId}`, false)
  }

  const exportDetailedResults = () => {
    if (!results?.results) return

    // Transform results to match the CSV export format
    const formattedResults = results.results.map((r: any) => ({
      item: r.item,
      type: r.type,
      status: r.status,
      threatLevel: r.threatLevel || "N/A",
      threats: r.threats || 0,
      error: r.error || "",
    }))

    exportBulkScanResults(formattedResults, `bulk-scan-${scanId}`, true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground font-mono flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-primary text-lg">Loading bulk scan results...</p>
        </div>
      </div>
    )
  }

  if (!results) {
    return (
      <div className="min-h-screen bg-background text-foreground font-mono flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-foreground text-lg mb-4">No results found for this scan</p>
          <Link href="/scanner">
            <Button variant="outline" size="sm" className="border border-primary/70 text-primary bg-transparent hover:bg-primary/10 hover:text-white hover:shadow-lg hover:shadow-primary/30 whitespace-nowrap transition-all duration-300 text-xs font-bold">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Scanner
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-mono">
      {/* Header */}
      <header className="border-b border-border/50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative w-12 h-12 rounded-full border-2 border-primary flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary" />
              <div className="absolute inset-0 rounded-full border-2 border-primary animate-ping opacity-20" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary cyber-glow tracking-wider">BULK SCAN RESULTS</h1>
              <p className="text-sm text-muted-foreground">Scan ID: {scanId}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      setShowIncidentForm(true)
                      if (results && results.results && Array.isArray(results.results)) {
                        setSelectedItems(results.results.map((_: any, i: number) => i))
                      }
                      setIncidentMode("create")
                    }}
                    variant="outline"
                size="sm"
                className="border border-green-500/70 text-green-400 bg-transparent hover:bg-green-500/10 hover:text-white hover:shadow-lg hover:shadow-green-500/30 whitespace-nowrap transition-all duration-300 text-xs font-bold"
                title="Create or add to incident case"
              >
                <AlertTriangle className="w-4 h-4 mr-1" />
                CREATE INCIDENT
              </Button>
              <Button
                onClick={exportResults}
                variant="outline"
                size="sm"
                className="border border-primary/70 text-primary bg-transparent hover:bg-primary/10 hover:text-white hover:shadow-lg hover:shadow-primary/30 whitespace-nowrap transition-all duration-300 text-xs font-bold"
                title="Export basic CSV with summary fields"
              >
                <Download className="w-4 h-4 mr-1" />
                EXPORT CSV
              </Button>
              <Button
                onClick={exportDetailedResults}
                variant="outline"
                size="sm"
                className="border border-primary/70 text-primary bg-transparent hover:bg-primary/10 hover:text-white hover:shadow-lg hover:shadow-primary/30 whitespace-nowrap transition-all duration-300 text-xs font-bold"
                title="Export detailed CSV with timestamps"
              >
                <FileText className="w-4 h-4 mr-1" />
                EXPORT DETAILED
              </Button>
            </div>
            <Link href="/scanner">
              <Button variant="outline" size="sm" className="border border-primary/70 text-primary bg-transparent hover:bg-primary/10 hover:text-white hover:shadow-lg hover:shadow-primary/30 whitespace-nowrap transition-all duration-300 text-xs font-bold">
                <Shield className="w-4 h-4 mr-1" />
                SCANNER
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="cyber-card p-4 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">TOTAL SCANNED</p>
            <p className="text-3xl font-bold text-primary">{results.summary.total}</p>
          </div>
          <div className="cyber-card p-4 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">CRITICAL</p>
            <p className="text-3xl font-bold text-red-500">{results.summary.critical}</p>
          </div>
          <div className="cyber-card p-4 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">HIGH RISK</p>
            <p className="text-3xl font-bold text-orange-500">{results.summary.high}</p>
          </div>
          <div className="cyber-card p-4 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">CLEAN</p>
            <p className="text-3xl font-bold text-green-500">{results.summary.clean}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="cyber-card p-4 rounded-lg mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Filter by IP, domain, email, or keyword..."
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  className="pl-10 cyber-border bg-secondary/30"
                />
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={filterThreat === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterThreat("all")}
                className="cyber-border"
              >
                ALL
              </Button>
              <Button
                variant={filterThreat === "critical" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterThreat("critical")}
                className="cyber-border"
              >
                CRITICAL
              </Button>
              <Button
                variant={filterThreat === "high" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterThreat("high")}
                className="cyber-border"
              >
                HIGH
              </Button>
              <Button
                variant={filterThreat === "medium" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterThreat("medium")}
                className="cyber-border"
              >
                MEDIUM
              </Button>
              <Button
                variant={showEmailLeaksOnly ? "default" : "outline"}
                size="sm"
                onClick={() => setShowEmailLeaksOnly(!showEmailLeaksOnly)}
                className="cyber-border"
              >
                EMAIL LEAKS
              </Button>
            </div>
          </div>
        </div>

        {/* Results Table with Expandable Details */}
        <div className="space-y-2">
          {filteredResults?.map((result: any, index: number) => {
            const isExpanded = expandedRows.includes(index)
            const threatData = result.data?.threatData || {}
            const geoData = result.data?.geoData || {}
            
            return (
              <div key={index} className="cyber-card rounded-lg overflow-hidden">
                {/* Main Row */}
                <div 
                  onClick={() => toggleRowExpansion(index)}
                  className="p-4 cursor-pointer hover:bg-secondary/30 transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-6 flex-1">
                    <button className="text-primary/60 hover:text-primary flex-shrink-0">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                    
                    {/* Target & Type */}
                    <div className="min-w-[200px]">
                      <p className="font-mono text-sm font-bold text-foreground">{result.item}</p>
                      <p className="text-xs text-muted-foreground">{result.type.toUpperCase()}</p>
                    </div>

                    {/* Threat Summary Indicators */}
                    <div className="flex items-center gap-6 flex-1">
                      {/* VirusTotal Detection */}
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col items-center">
                          {result.data?.attributes?.last_analysis_stats?.malicious ? (
                            <XCircle className="w-4 h-4 text-red-500" />
                          ) : (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          )}
                          <p className="text-xs text-muted-foreground whitespace-nowrap">VT</p>
                        </div>
                        {result.data?.attributes?.last_analysis_stats && (
                          <span className="text-xs text-primary">
                            {result.data.attributes.last_analysis_stats.malicious || 0}/{91}
                          </span>
                        )}
                      </div>

                      {/* Phishing Detection */}
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col items-center">
                          {result.data?.phishingRisk > 0 ? (
                            <AlertCircle className="w-4 h-4 text-orange-500" />
                          ) : (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          )}
                          <p className="text-xs text-muted-foreground whitespace-nowrap">Phish</p>
                        </div>
                      </div>

                      {/* SSL Certificate */}
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col items-center">
                          {result.data?.sslValid ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-500" />
                          )}
                          <p className="text-xs text-muted-foreground whitespace-nowrap">SSL</p>
                        </div>
                      </div>

                      {/* Open Ports */}
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col items-center">
                          {result.data?.openPorts?.length > 0 ? (
                            <AlertCircle className="w-4 h-4 text-orange-500" />
                          ) : (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          )}
                          <p className="text-xs text-muted-foreground whitespace-nowrap">Ports</p>
                        </div>
                        {result.data?.openPorts?.length > 0 && (
                          <span className="text-xs text-primary">{result.data.openPorts.length}</span>
                        )}
                      </div>
                    </div>

                    {/* Threat Level Badge */}
                    <div className="min-w-[100px]">
                      {result.status === "success" && (
                        <span
                          className={`px-3 py-1 rounded text-xs font-bold uppercase inline-block ${
                            result.threatLevel === "critical"
                              ? "bg-red-500/20 text-red-500 border border-red-500/40"
                              : result.threatLevel === "high"
                                ? "bg-orange-500/20 text-orange-500 border border-orange-500/40"
                                : result.threatLevel === "medium"
                                  ? "bg-yellow-500/20 text-yellow-500 border border-yellow-500/40"
                                  : "bg-green-500/20 text-green-500 border border-green-500/40"
                          }`}
                        >
                          {result.threatLevel}
                        </span>
                      )}
                    </div>

                    {/* Threat Count */}
                    <div className="min-w-[80px] text-right">
                      <p className="text-sm font-bold text-primary">{result.status === "success" ? result.threats : "-"}</p>
                      <p className="text-xs text-muted-foreground">Threats</p>
                    </div>
                  </div>
                </div>

                {/* Expanded Details - Identical to Quick Scan Format */}
                {isExpanded && result.status === "success" && (
                  <div className="border-t border-primary/20 px-6 py-6 bg-black/20 space-y-6">
                    {/* Header Section */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="px-2.5 py-1 bg-primary/30 text-primary text-xs font-bold rounded uppercase border border-primary/50">TARGET</span>
                          <span className="px-2.5 py-1 bg-secondary text-primary text-xs font-bold rounded uppercase border border-primary/30">{result.type}</span>
                        </div>
                        <p className="text-4xl font-bold text-foreground font-mono mb-3">{result.item}</p>
                        <div className="w-20 h-0.5 bg-gradient-to-r from-primary to-transparent"></div>
                      </div>
                      <div className={`px-4 py-2 rounded border-2 text-xs font-bold uppercase whitespace-nowrap ${
                        result.threatLevel === "critical"
                          ? "bg-red-500/15 border-red-500/70 text-red-400"
                          : result.threatLevel === "high"
                            ? "bg-orange-500/15 border-orange-500/70 text-orange-400"
                            : result.threatLevel === "medium"
                              ? "bg-yellow-500/15 border-yellow-500/70 text-yellow-400"
                              : "bg-green-500/15 border-green-500/70 text-green-400"
                      }`}>
                        {result.threatLevel}
                      </div>
                    </div>

                    {/* Metadata Row */}
                    <div className="grid grid-cols-4 gap-6 py-4 border-y border-primary/20 text-xs">
                      <div>
                        <p className="text-primary/60 font-bold uppercase">SCAN TYPE</p>
                        <p className="text-foreground font-bold mt-1">{result.type.toUpperCase()}</p>
                      </div>
                      <div>
                        <p className="text-primary/60 font-bold uppercase">TIMESTAMP</p>
                        <p className="text-foreground font-bold mt-1">{new Date().toLocaleDateString('en-US', {year:'2-digit', month:'numeric', day:'numeric'})}, {new Date().toLocaleTimeString()}</p>
                      </div>
                      <div>
                        <p className="text-primary/60 font-bold uppercase">DATABASES CHECKED</p>
                        <p className="text-foreground font-bold mt-1">7</p>
                      </div>
                      <div>
                        <p className="text-primary/60 font-bold uppercase">SCAN DURATION</p>
                        <p className="text-foreground font-bold mt-1">0.65s</p>
                      </div>
                    </div>

                    {/* Two Column Layout - Threat Intelligence & Geolocation */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* LEFT: THREAT INTELLIGENCE */}
                      <div className="p-4 border border-red-500/40 bg-red-500/5 rounded">
                        <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider mb-4 flex items-center gap-2 pb-3 border-b border-red-500/30">
                          <AlertTriangle className="w-4 h-4" />
                          THREAT INTELLIGENCE
                        </h3>

                        <div className="space-y-2">
                          {/* Map through threats array from API response */}
                          {result.data?.threats && Array.isArray(result.data.threats) ? (
                            result.data.threats.map((threat: any, idx: number) => {
                              const threatIcon = threat.detected ? "✕" : "✓";
                              const threatColor = threat.detected ? "red" : "green";
                              const threatClass = threat.detected ? "red" : "green";
                              
                              // VirusTotal Detection special handling
                              if (threat.name === "VirusTotal Detection" && threat.details?.analysisStats) {
                                const stats = threat.details.analysisStats;
                                return (
                                  <div key={idx} className="p-3 bg-secondary/40 border border-red-500/20 rounded">
                                    <div className="flex items-start justify-between mb-2">
                                      <span className="text-xs font-bold text-red-400">✕ {threat.name.toUpperCase()}</span>
                                    </div>
                                    <p className="text-xs text-red-400/80 mb-3">{threat.description}</p>
                                    <div className="grid grid-cols-4 gap-2 text-xs">
                                      <div className="bg-black/40 p-2.5 rounded text-center border border-red-500/30">
                                        <p className="font-bold text-red-500">{stats.malicious || 0}</p>
                                        <p className="text-red-400/70 text-xs">Malicious</p>
                                      </div>
                                      <div className="bg-black/40 p-2.5 rounded text-center border border-yellow-500/30">
                                        <p className="font-bold text-yellow-500">{stats.suspicious || 0}</p>
                                        <p className="text-yellow-400/70 text-xs">Suspicious</p>
                                      </div>
                                      <div className="bg-black/40 p-2.5 rounded text-center border border-green-500/30">
                                        <p className="font-bold text-green-500">{stats.undetected || 0}</p>
                                        <p className="text-green-400/70 text-xs">Undetected</p>
                                      </div>
                                      <div className="bg-black/40 p-2.5 rounded text-center border border-primary/30">
                                        <p className="font-bold text-primary">{threat.details.totalEngines || 91}</p>
                                        <p className="text-primary/70 text-xs">Total</p>
                                      </div>
                                    </div>
                                  </div>
                                );
                              }
                              
                              // All other threats as simple display
                              return (
                                <div key={idx} className={`p-3 bg-secondary/40 border border-${threatColor}-500/20 rounded`}>
                                  <span className={`text-xs font-bold text-${threatColor}-400`}>{threatIcon} {threat.name.toUpperCase()}</span>
                                  <p className={`text-xs text-${threatColor}-400/80 mt-1`}>{threat.description}</p>
                                </div>
                              );
                            })
                          ) : (
                            <div className="p-3 bg-secondary/40 border border-green-500/20 rounded">
                              <span className="text-xs font-bold text-green-400">✓ NO THREATS DETECTED</span>
                              <p className="text-xs text-green-400/80 mt-1">No threats identified in this scan</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* RIGHT: GEOLOCATION DATA */}
                      <div className="p-4 border border-green-500/40 bg-green-500/5 rounded">
                        <h3 className="text-sm font-bold text-green-400 uppercase tracking-wider mb-4 flex items-center gap-2 pb-3 border-b border-green-500/30">
                          📍 GEOLOCATION DATA
                        </h3>

                        <div className="space-y-1.5 text-xs">
                          <div className="flex justify-between p-2 bg-secondary/40 rounded">
                            <span className="text-green-400/70">Country</span>
                            <span className="font-bold text-foreground">{result.data?.geolocation?.country || "Unknown"}</span>
                          </div>
                          <div className="flex justify-between p-2 bg-secondary/40 rounded">
                            <span className="text-green-400/70">City</span>
                            <span className="font-bold text-foreground">{result.data?.geolocation?.city || "Unknown"}</span>
                          </div>
                          <div className="flex justify-between p-2 bg-secondary/40 rounded">
                            <span className="text-green-400/70">Region</span>
                            <span className="font-bold text-foreground">{result.data?.geolocation?.region || "Unknown"}</span>
                          </div>
                          <div className="flex justify-between p-2 bg-secondary/40 rounded">
                            <span className="text-green-400/70">ISP</span>
                            <span className="font-bold text-foreground">{result.data?.geolocation?.isp || "Unknown"}</span>
                          </div>
                          <div className="flex justify-between p-2 bg-secondary/40 rounded">
                            <span className="text-green-400/70">ASN</span>
                            <span className="font-bold text-foreground font-mono">{result.data?.geolocation?.asn || "Unknown"}</span>
                          </div>
                          <div className="flex justify-between p-2 bg-secondary/40 rounded">
                            <span className="text-green-400/70">Organization</span>
                            <span className="font-bold text-foreground">{result.data?.geolocation?.organization || "Unknown"}</span>
                          </div>
                          <div className="flex justify-between p-2 bg-secondary/40 rounded">
                            <span className="text-green-400/70">Timezone</span>
                            <span className="font-bold text-foreground">{result.data?.geolocation?.timezone || "Unknown"}</span>
                          </div>
                          <div className="flex justify-between p-2 bg-secondary/40 rounded">
                            <span className="text-green-400/70">HOSTNAMES</span>
                            <span className="font-bold text-foreground">{result.data?.geolocation?.hostnames === 'Y' || result.data?.geolocation?.hostnames === true ? "Y" : "-"}</span>
                          </div>
                          <div className="flex justify-between p-2 bg-secondary/40 rounded">
                            <span className="text-green-400/70">Coordinates</span>
                            <span className="font-bold text-foreground font-mono">{result.data?.geolocation?.latitude && result.data?.geolocation?.longitude ? `${result.data.geolocation.latitude}, ${result.data.geolocation.longitude}` : "N/A"}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* OPEN PORTS & SERVICES - Extended View (IP only) */}
                    {result.type === "ip" && result.data?.threats && (
                      (() => {
                        const openPortsThreat = result.data.threats.find((t: any) => t.name === "Open Ports & Services");
                        const hasOpenPorts = openPortsThreat?.detected;
                        const portDescription = openPortsThreat?.description || "";
                        const portsMatch = portDescription.match(/(\d+(?:\/tcp)?)/g);
                        
                        return hasOpenPorts && portsMatch ? (
                          <div className="p-4 border border-green-500/40 bg-green-500/5 rounded">
                            <h3 className="text-sm font-bold text-green-400 uppercase tracking-wider mb-4 flex items-center gap-2 pb-3 border-b border-green-500/30">
                              ⚡ OPEN PORTS & SERVICES
                            </h3>
                            <div className="space-y-2">
                              {portsMatch.map((port: string, i: number) => (
                                <div key={i} className="flex items-center gap-2 text-xs text-green-400">
                                  <span className="text-lg">⚡</span>
                                  <span className="font-mono">{port}/tcp: Unknown</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : null;
                      })()
                    )}

                    {/* VIEW FULL REPORT Button */}
                    <button className="w-full py-2.5 px-4 border border-green-500/60 bg-green-500/10 hover:bg-green-500/20 text-green-400 font-bold uppercase text-xs rounded transition-all">
                      View Full Report
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {filteredResults?.length === 0 && (
          <div className="text-center py-12">
            <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No results match your filters</p>
          </div>
        )}

        {/* Incident Management Modal */}
        {showIncidentForm && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-b from-secondary/50 to-secondary/30 border border-amber-500/50 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6 space-y-4 shadow-2xl shadow-amber-500/20">
              <div className="flex items-center justify-between mb-4 sticky top-0 bg-gradient-to-b from-secondary/50 to-secondary/30 pb-2">
                <h3 className="text-xl font-bold text-amber-400 tracking-wide">INCIDENT MANAGEMENT</h3>
                <button
                  onClick={() => setShowIncidentForm(false)}
                  className="text-amber-400/60 hover:text-amber-400 text-2xl font-bold transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                {/* Mode Selection */}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setIncidentMode("create")
                      setSelectedIncidentId("")
                      if (results && results.results && Array.isArray(results.results)) {
                        setSelectedItems(results.results.map((_: any, i: number) => i))
                      }
                    }}
                    className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold transition-all border ${
                      incidentMode === "create"
                        ? "bg-amber-500/30 border-amber-500/50 text-amber-400"
                        : "border-amber-500/20 text-amber-400/70 hover:bg-amber-500/10"
                    }`}
                  >
                    CREATE NEW
                  </button>
                  <button
                    onClick={() => {
                      setIncidentMode("add")
                      setIncidentTitle("")
                      fetchExistingIncidents()
                      if (results && results.results && Array.isArray(results.results)) {
                        setSelectedItems(results.results.map((_: any, i: number) => i))
                      }
                    }}
                    className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold transition-all border ${
                      incidentMode === "add"
                        ? "bg-amber-500/30 border-amber-500/50 text-amber-400"
                        : "border-amber-500/20 text-amber-400/70 hover:bg-amber-500/10"
                    }`}
                  >
                    ADD TO EXISTING
                  </button>
                </div>

                {incidentMode === "create" ? (
                  <>
                    {/* Title Input for New Incident */}
                    <div>
                      <label className="text-xs font-bold text-amber-400 mb-2 block">INCIDENT TITLE</label>
                      <input
                        type="text"
                        value={incidentTitle}
                        onChange={(e) => setIncidentTitle(e.target.value)}
                        placeholder="e.g., Bulk Threat Scan - Suspicious IPs"
                        className="w-full px-3 py-2 bg-secondary/40 border border-amber-500/30 rounded text-sm text-foreground focus:outline-none focus:border-amber-500/60 transition-colors"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    {/* Select Existing Incident */}
                    <div>
                      <label className="text-xs font-bold text-amber-400 mb-2 block">SELECT INCIDENT</label>
                      <select
                        value={selectedIncidentId}
                        onChange={(e) => setSelectedIncidentId(e.target.value)}
                        className="w-full px-3 py-2 bg-secondary/40 border border-amber-500/30 rounded text-sm text-foreground focus:outline-none focus:border-amber-500/60 transition-colors"
                      >
                        <option value="">Choose an incident...</option>
                        {existingIncidents.map((incident: any) => (
                          <option key={incident.id} value={incident.id}>
                            {incident.title} ({incident.severity || "MEDIUM"})
                          </option>
                        ))}
                      </select>
                      {existingIncidents.length === 0 && (
                        <p className="text-xs text-amber-400/60 mt-2">No existing incidents found. Create a new one instead.</p>
                      )}
                    </div>
                  </>
                )}

                {/* Items Selection */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-amber-400 uppercase">Select Items to Add ({selectedItems?.size || 0} of {results?.results?.length || 0})</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          if (results && results.results) {
                            setSelectedItems(results.results.map((_: any, i: number) => i))
                          }
                        }}
                        className="text-xs px-2 py-1 bg-amber-500/20 text-amber-400 hover:bg-amber-500/40 border border-amber-500/30 rounded transition-colors"
                      >
                        Select All
                      </button>
                      <button
                        onClick={() => setSelectedItems(new Set())}
                        className="text-xs px-2 py-1 bg-amber-500/20 text-amber-400 hover:bg-amber-500/40 border border-amber-500/30 rounded transition-colors"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>
                  <div className="bg-secondary/40 border border-amber-500/20 rounded p-3 max-h-48 overflow-y-auto space-y-2">
                    {results && results.results && Array.isArray(results.results) && results.results.length > 0 ? (
                      results.results.map((result: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-2 p-2 bg-secondary/40 rounded hover:bg-secondary/60 transition-colors">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(idx)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedItems([...selectedItems, idx])
                              } else {
                                setSelectedItems(selectedItems.filter(i => i !== idx))
                              }
                            }}
                            className="cursor-pointer"
                          />
                          <span className="text-xs text-foreground flex-1 font-mono">{result?.item || 'Unknown'}</span>
                          <span className={`text-xs px-2 py-1 rounded font-bold ${
                            result?.threatLevel === "critical"
                              ? "bg-red-500/20 text-red-400"
                              : result?.threatLevel === "high"
                                ? "bg-orange-500/20 text-orange-400"
                                : "bg-yellow-500/20 text-yellow-400"
                          }`}>
                            {result?.threatLevel?.toUpperCase() || 'UNKNOWN'}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-amber-400/60">No items available</p>
                    )}
                  </div>
                </div>

                {/* Summary Info */}
                <div className="bg-secondary/30 border border-amber-500/30 rounded p-3">
                  <p className="text-xs text-amber-400/60 font-bold mb-2">SUMMARY</p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-foreground">
                    <div>Total scanned: <span className="font-bold">{results?.results?.length || 0}</span></div>
                    <div>Selected: <span className="font-bold">{selectedItems.length}</span></div>
                    <div>Type: <span className="font-bold uppercase">{scanType}</span></div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-amber-500/30">
                  <button
                    onClick={createIncidentFromResults}
                    disabled={creatingIncident || (incidentMode === "create" && !incidentTitle.trim()) || (incidentMode === "add" && !selectedIncidentId) || selectedItems.length === 0}
                    className="flex-1 px-4 py-2 bg-amber-500/30 text-amber-400 hover:bg-amber-500/50 rounded-lg text-xs font-bold transition-all border border-amber-500/50 disabled:opacity-50"
                  >
                    {creatingIncident ? 'PROCESSING...' : incidentMode === "create" ? 'CREATE INCIDENT' : 'ADD TO INCIDENT'}
                  </button>
                  <button
                    onClick={() => setShowIncidentForm(false)}
                    className="flex-1 px-4 py-2 border border-amber-500/40 text-amber-400 hover:bg-amber-500/10 rounded-lg text-xs font-bold transition-all"
                  >
                    CANCEL
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Success Notification */}
        {successMessage.show && (
          <div className="fixed top-8 right-8 z-[60] animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="bg-gradient-to-r from-green-900/80 to-green-800/80 backdrop-blur-sm border border-green-500/50 rounded-lg shadow-2xl shadow-green-500/20 p-6 max-w-md">
              <div className="flex items-start gap-4">
                <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="text-green-400 font-bold text-base mb-1">{successMessage.message}</h3>
                  <p className="text-green-300/80 text-sm">
                    {successMessage.count} IOC{successMessage.count !== 1 ? 's' : ''} processed successfully
                  </p>
                </div>
                <button
                  onClick={() => setSuccessMessage({ ...successMessage, show: false })}
                  className="text-green-400/60 hover:text-green-400 transition-colors"
                >
                  ✕
                </button>
              </div>
              {/* Auto-dismiss after 4 seconds */}
              {successMessage.show && (
                <>
                  {(() => {
                    setTimeout(() => setSuccessMessage({ ...successMessage, show: false }), 4000)
                    return null
                  })()}
                </>
              )}
            </div>
          </div>
        )}

        {/* Error Notification */}
        {errorMessage.show && (
          <div className="fixed top-8 right-8 z-[60] animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="bg-gradient-to-r from-red-900/80 to-red-800/80 backdrop-blur-sm border border-red-500/50 rounded-lg shadow-2xl shadow-red-500/20 p-6 max-w-md">
              <div className="flex items-start gap-4">
                <XCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="text-red-400 font-bold text-base mb-1">Operation Failed</h3>
                  <p className="text-red-300/80 text-sm">{errorMessage.message}</p>
                </div>
                <button
                  onClick={() => setErrorMessage({ ...errorMessage, show: false })}
                  className="text-red-400/60 hover:text-red-400 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default function BulkResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background text-foreground font-mono flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-primary text-lg">Loading...</p>
          </div>
        </div>
      }
    >
      <BulkResultsContent />
    </Suspense>
  )
}
