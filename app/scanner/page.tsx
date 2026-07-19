"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from 'next/navigation'
import { Shield, Search, Globe, Hash, Server, ArrowLeft, Upload, File, X, Moon, Sun, Settings, Zap, Maximize2, Minimize2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { detectScanType } from "@/lib/scan-type-detector"
import { BulkScanInput } from "@/components/bulk-scan-input"

export default function ScannerPage() {
  const router = useRouter()
  const [searchType, setSearchType] = useState<"ip" | "domain" | "hash" | "file" | "keyword">("ip")
  const [query, setQuery] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [recentScans, setRecentScans] = useState<Array<{ type: string; threatLevel: string; item: string }>>([])
  const [autoDetectedType, setAutoDetectedType] = useState<string | null>(null)
  const [isBulkMode, setIsBulkMode] = useState(false)
  const [bulkItems, setBulkItems] = useState<string[]>([])

  // Load recent scans from history API on mount
  useEffect(() => {
    const loadRecentScans = async () => {
      try {
        const response = await fetch("/api/history")
        const data = await response.json()
        if (data.history && Array.isArray(data.history)) {
          // Map history to recent scans format, show only last 8 unique items (4 columns x 2 rows)
          const formattedScans = data.history
            .slice(0, 16)
            .reduce((acc: any[], scan: any) => {
              const duplicate = acc.find(s => s.item === scan.query)
              if (!duplicate) {
                acc.push({
                  type: scan.type,
                  item: scan.query,
                  threatLevel: scan.threatLevel || "UNKNOWN"
                })
              }
              return acc
            }, [])
            .slice(0, 8)
          setRecentScans(formattedScans)
        }
      } catch (error) {
        console.log("[v0] Could not load scan history")
      }
    }
    loadRecentScans()
  }, [])

  // Auto-detect scan type when query changes (non-intrusive)
  useEffect(() => {
    if (query.trim()) {
      const detectedType = detectScanType(query)
      setAutoDetectedType(detectedType)
    } else {
      setAutoDetectedType(null)
    }
  }, [query])

  const handleScan = async () => {
    if (!query.trim()) return

    // Use detected type if available and current tab isn't file, otherwise use selected type
    let scanTypeToUse = searchType === "file" ? "hash" : searchType
    
    // If we have auto-detected a different type and user hasn't explicitly chosen a tab, use detected type
    if (autoDetectedType && autoDetectedType !== "keyword" && searchType === "ip") {
      // Only switch to detected type if user is still on default IP tab
      scanTypeToUse = autoDetectedType as typeof searchType
    }

    // Add to recent scans
    const newScan = {
      type: scanTypeToUse,
      item: query,
      threatLevel: "CRITICAL" // This will be updated from API
    }
    
    setRecentScans(prev => {
      const filtered = prev.filter(s => s.item !== query)
      return [newScan, ...filtered].slice(0, 8) // Keep 8 recent scans (4 columns x 2 rows)
    })

    setIsScanning(true)
    // Add a small delay to show animation, then navigate
    setTimeout(() => {
      router.push(`/results?type=${scanTypeToUse}&query=${encodeURIComponent(query)}`)
    }, 1500)
  }

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    if (!isDarkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }



  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setSelectedFile(file)
    setIsScanning(true)
    setUploadProgress(0)

    try {
      console.log("[v0] Starting file upload:", file.name, file.size)

      const formData = new FormData()
      formData.append("file", file)

      console.log("[v0] Sending upload request to /api/upload")

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      console.log("[v0] Upload response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
        console.error("[v0] Upload failed with error:", errorData)
        throw new Error(errorData.error || `Upload failed with status ${response.status}`)
      }

      const data = await response.json()
      console.log("[v0] Upload successful, hash:", data.sha256)

      // Navigate to results with file hash
      router.push(
        `/results?type=hash&query=${encodeURIComponent(data.sha256)}&fileName=${encodeURIComponent(file.name)}&fileSize=${file.size}`,
      )
    } catch (error) {
      console.error("[v0] File upload error:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to upload file"
      alert(`File upload failed: ${errorMessage}. Please try again.`)
      setIsScanning(false)
      setSelectedFile(null)
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    setUploadProgress(0)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleScan()
    }
  }

  const handleBulkScan = async () => {
    if (bulkItems.length === 0) return
    
    setIsScanning(true)
    try {
      // Determine scan type based on current tab (IP or Domain only for bulk)
      const bulkType = searchType === "domain" ? "domain" : "ip"
      
      // Store bulk items in session/query params and navigate to bulk-results
      setTimeout(() => {
        router.push(`/bulk-results?type=${bulkType}&items=${encodeURIComponent(JSON.stringify(bulkItems))}`)
      }, 1500)
    } catch (error) {
      console.error("[v0] Bulk scan error:", error)
      setIsScanning(false)
    }
  }

  if (isScanning) {
    return (
      <div className="min-h-screen bg-black text-primary font-mono flex items-center justify-center overflow-hidden relative">
        {/* Animated grid background for hacking aesthetic */}
        <div className="fixed inset-0 opacity-5 pointer-events-none">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(0deg, transparent 24%, rgba(0, 255, 0, 0.1) 25%, rgba(0, 255, 0, 0.1) 26%, transparent 27%, transparent 74%, rgba(0, 255, 0, 0.1) 75%, rgba(0, 255, 0, 0.1) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(0, 255, 0, 0.1) 25%, rgba(0, 255, 0, 0.1) 26%, transparent 27%, transparent 74%, rgba(0, 255, 0, 0.1) 75%, rgba(0, 255, 0, 0.1) 76%, transparent 77%, transparent)",
              backgroundSize: "50px 50px",
            }}
          />
        </div>

        <div className="w-full max-w-4xl px-4 relative z-10">
          <div className="relative w-64 h-64 mx-auto mb-8">
            {/* Radar circles */}
            <div className="absolute inset-0 border-2 border-green-500/20 rounded-full" />
            <div className="absolute inset-8 border-2 border-green-500/20 rounded-full" />
            <div className="absolute inset-16 border-2 border-green-500/20 rounded-full" />
            <div className="absolute inset-24 border-2 border-green-500/20 rounded-full" />

            <div className="absolute inset-0 opacity-30">
              <div
                className="absolute inset-0 border border-green-500/30 rounded-full"
                style={{ borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%" }}
              />
              <div
                className="absolute inset-4 border border-red-500/20 rounded-full"
                style={{ borderRadius: "40% 60% 70% 30% / 40% 70% 30% 60%" }}
              />
            </div>

            {/* Center dot with glow */}
            <div className="absolute top-1/2 left-1/2 w-3 h-3 -mt-1.5 -ml-1.5 bg-green-500 rounded-full shadow-[0_0_20px_rgba(34,197,94,0.8)]" />

            {/* Rotating radar line */}
            <div className="absolute inset-0 animate-[spin_3s_linear_infinite]">
              <div className="absolute top-1/2 left-1/2 w-1/2 h-0.5 origin-left bg-gradient-to-r from-green-500 to-transparent shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
            </div>

            {/* Scanning wave effect */}
            <div className="absolute inset-0 animate-[ping_2s_ease-out_infinite]">
              <div className="absolute inset-0 border-2 border-green-500/40 rounded-full" />
            </div>

            {/* Threat blips */}
            <div className="absolute top-1/4 left-1/3 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
            <div
              className="absolute top-2/3 right-1/4 w-2 h-2 bg-yellow-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(234,179,8,0.8)]"
              style={{ animationDelay: "0.5s" }}
            />
            <div
              className="absolute bottom-1/4 left-1/2 w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.8)]"
              style={{ animationDelay: "1s" }}
            />

            {/* Grid lines */}
            <div className="absolute top-0 left-1/2 w-0.5 h-full bg-green-500/10" />
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-green-500/10" />

            {/* Horizontal scanline */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                animation: "scanline 4s linear infinite",
              }}
            >
              <div
                className="absolute w-full h-px bg-gradient-to-r from-transparent via-green-500/50 to-transparent"
                style={{ top: "30%" }}
              />
            </div>
          </div>

          <div className="text-center mt-8">
            <p
              className="text-green-500 text-2xl font-bold tracking-[0.3em] mb-4"
              style={{
                textShadow: "0 0 10px rgba(34, 197, 94, 0.5)",
                animation: "flicker 2s infinite",
              }}
            >
              SCANNING TARGET
            </p>

            <div className="space-y-2 text-sm text-green-500/70">
              <div className="flex items-center justify-center gap-2 animate-pulse">
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full" />
                <span>Analyzing threat intelligence databases...</span>
              </div>
              <div className="flex items-center justify-center gap-2 animate-pulse" style={{ animationDelay: "0.3s" }}>
                <span className="inline-block w-2 h-2 bg-cyan-500 rounded-full" />
                <span>Retrieving geolocation data...</span>
              </div>
              <div className="flex items-center justify-center gap-2 animate-pulse" style={{ animationDelay: "0.6s" }}>
                <span className="inline-block w-2 h-2 bg-yellow-500 rounded-full" />
                <span>Discovering network information...</span>
              </div>
              <div className="flex items-center justify-center gap-2 animate-pulse" style={{ animationDelay: "0.9s" }}>
                <span className="inline-block w-2 h-2 bg-red-500 rounded-full" />
                <span>Scanning for vulnerabilities...</span>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes flicker {
            0%, 18%, 22%, 25%, 53%, 57%, 100% {
              text-shadow: 0 0 10px rgba(34, 197, 94, 0.8), 0 0 20px rgba(34, 197, 94, 0.5);
            }
            20%, 24%, 55% {
              text-shadow: 0 0 5px rgba(34, 197, 94, 0.3);
            }
          }
          
          @keyframes scanline {
            0% {
              transform: translateY(-100%);
            }
            100% {
              transform: translateY(100%);
            }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-background text-foreground font-mono ${isDarkMode ? "dark" : ""}`}>
      {/* Header */}
      <header className="border-b border-border/50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative w-12 h-12 rounded-full border-2 border-primary flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary" />
              <div className="absolute inset-0 rounded-full border-2 border-primary animate-ping opacity-20" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary cyber-glow tracking-wider">ADVANCED OSINT PLATFORM</h1>
              <p className="text-sm text-muted-foreground">Powered by AI • Real-Time Threat Intelligence</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setIsBulkMode(!isBulkMode)}
              className={`p-2 rounded transition-colors border ${isBulkMode ? "bg-primary/20 border-primary/50" : "hover:bg-secondary/50 border-border/50 hover:border-primary/50"}`}
              title={isBulkMode ? "Switch to Single Mode" : "Switch to Bulk Mode"}
            >
              {isBulkMode ? <Minimize2 className="w-5 h-5 text-primary" /> : <Maximize2 className="w-5 h-5 text-primary" />}
            </button>
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded hover:bg-secondary/50 transition-colors border border-border/50 hover:border-primary/50"
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? <Sun className="w-5 h-5 text-primary" /> : <Moon className="w-5 h-5 text-primary" />}
            </button>
            <Link href="/threat-feed">
              <Button variant="outline" size="sm" className="border border-primary/70 text-primary bg-transparent hover:bg-primary/10 hover:text-white hover:shadow-lg hover:shadow-primary/30 whitespace-nowrap transition-all duration-300 text-xs font-bold">
                THREAT FEED
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" size="sm" className="border border-primary/70 text-primary bg-transparent hover:bg-primary/10 hover:text-white hover:shadow-lg hover:shadow-primary/30 whitespace-nowrap transition-all duration-300 text-xs font-bold">
                <ArrowLeft className="w-4 h-4 mr-1" />
                HOME
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Scanner Interface */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-primary mb-4 cyber-glow tracking-wide">CYBER INTELLIGENCE SCANNER</h2>
          <p className="text-muted-foreground text-lg">
            Perform advanced OSINT reconnaissance on IP addresses, domains, file hashes, uploaded files, and keywords
          </p>
        </div>

        {/* Scanner Card */}
        <div className="cyber-card p-8 rounded-lg mb-8">
          {isBulkMode ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-primary mb-2 tracking-wide">BULK THREAT SCAN</h3>
                <p className="text-muted-foreground">Analyze multiple IPs or domains simultaneously</p>
              </div>

              {/* Bulk Mode Type Selector */}
              <div className="flex gap-4 mb-4">
                <button
                  onClick={() => setSearchType("ip")}
                  className={`px-4 py-2 rounded-lg font-bold transition-all border ${
                    searchType === "ip"
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-primary/30 text-primary hover:bg-primary/10"
                  }`}
                >
                  <Server className="w-4 h-4 inline mr-2" />
                  IP ADDRESSES
                </button>
                <button
                  onClick={() => setSearchType("domain")}
                  className={`px-4 py-2 rounded-lg font-bold transition-all border ${
                    searchType === "domain"
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-primary/30 text-primary hover:bg-primary/10"
                  }`}
                >
                  <Globe className="w-4 h-4 inline mr-2" />
                  DOMAINS
                </button>
              </div>

              {/* Bulk Scan Input Component */}
              <BulkScanInput items={bulkItems} onItemsChange={setBulkItems} />

              {/* Bulk Items Count and Scan Button */}
              <div className="flex items-center justify-between pt-4 border-t border-primary/30">
                <div className="text-sm text-muted-foreground">
                  <span className="text-primary font-bold">{bulkItems.length}</span> items selected (max 100)
                </div>
                <Button
                  onClick={handleBulkScan}
                  disabled={bulkItems.length === 0 || isScanning}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-6 py-2"
                >
                  <Search className="w-4 h-4 mr-2" />
                  START BULK SCAN
                </Button>
              </div>
            </div>
          ) : (
            <>
              <Tabs value={searchType} onValueChange={(v) => setSearchType(v as typeof searchType)} className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-8 bg-secondary/50">
              <TabsTrigger
                value="ip"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Server className="w-4 h-4 mr-2" />
                IP ADDRESS
              </TabsTrigger>
              <TabsTrigger
                value="domain"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Globe className="w-4 h-4 mr-2" />
                DOMAIN
              </TabsTrigger>
              <TabsTrigger
                value="hash"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Hash className="w-4 h-4 mr-2" />
                HASH
              </TabsTrigger>
              <TabsTrigger
                value="file"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Upload className="w-4 h-4 mr-2" />
                FILE UPLOAD
              </TabsTrigger>
              <TabsTrigger
                value="keyword"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Search className="w-4 h-4 mr-2" />
                KEYWORD
              </TabsTrigger>
            </TabsList>

            {/* Auto-Detection Indicator */}
            {autoDetectedType && searchType !== "file" && (
              <div className="mb-6 p-3 bg-primary/10 border border-primary/30 rounded-lg flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-sm text-primary">
                  Auto-detected: <span className="font-bold uppercase">{autoDetectedType}</span>
                </span>
              </div>
            )}

            <TabsContent value="ip" className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-primary font-bold tracking-wide">TARGET IP ADDRESS</label>
                <Input
                  placeholder="e.g., 8.8.8.8 or 192.168.1.1"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="cyber-border bg-secondary/30 text-foreground placeholder:text-muted-foreground h-12 text-lg font-mono"
                  disabled={isScanning}
                />
                <p className="text-xs text-muted-foreground">
                  Scan any IPv4 or IPv6 address for open ports, services, and vulnerabilities
                </p>
              </div>
            </TabsContent>

            <TabsContent value="domain" className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-primary font-bold tracking-wide">TARGET DOMAIN / URL</label>
                <Input
                  placeholder="e.g., example.com or https://example.com"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="cyber-border bg-secondary/30 text-foreground placeholder:text-muted-foreground h-12 text-lg font-mono"
                  disabled={isScanning}
                />
                <p className="text-xs text-muted-foreground">
                  Analyze domain DNS records, SSL certificates, security headers, vulnerability detection, and
                  credential leaks
                </p>
              </div>
            </TabsContent>

            <TabsContent value="hash" className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-primary font-bold tracking-wide">FILE HASH (MD5/SHA1/SHA256)</label>
                <Input
                  placeholder="e.g., 5d41402abc4b2a76b9719d911017c592"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="cyber-border bg-secondary/30 text-foreground placeholder:text-muted-foreground h-12 text-lg font-mono"
                  disabled={isScanning}
                />
                <p className="text-xs text-muted-foreground">
                  Check file hash against malware databases and threat intelligence feeds
                </p>
              </div>
            </TabsContent>

            <TabsContent value="file" className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-primary font-bold tracking-wide">UPLOAD FILE FOR ANALYSIS</label>

                {!selectedFile ? (
                  <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-primary/50 rounded-lg cursor-pointer bg-secondary/30 hover:bg-secondary/50 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-12 h-12 mb-4 text-primary" />
                      <p className="mb-2 text-sm text-primary font-bold">
                        <span className="font-bold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Any file type supported (Max 100MB) • Hash will be calculated automatically
                      </p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleFileUpload}
                      disabled={isScanning}
                      accept="*/*"
                    />
                  </label>
                ) : (
                  <div className="flex items-center justify-between p-4 border border-primary/50 rounded-lg bg-secondary/30">
                    <div className="flex items-center gap-3">
                      <File className="w-8 h-8 text-primary" />
                      <div>
                        <p className="text-sm font-bold text-foreground">{selectedFile.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    {!isScanning && (
                      <button
                        onClick={handleRemoveFile}
                        className="p-2 hover:bg-secondary/50 rounded transition-colors"
                      >
                        <X className="w-5 h-5 text-muted-foreground hover:text-foreground" />
                      </button>
                    )}
                  </div>
                )}

                <p className="text-xs text-muted-foreground">
                  File will be hashed locally and checked against VirusTotal and other threat intelligence databases
                </p>
              </div>
            </TabsContent>

            <TabsContent value="keyword" className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-primary font-bold tracking-wide">DARK WEB KEYWORD SEARCH</label>
                <Input
                  placeholder="e.g., company name, email domain, or specific term"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="cyber-border bg-secondary/30 text-foreground placeholder:text-muted-foreground h-12 text-lg font-mono"
                  disabled={isScanning}
                />
                <p className="text-xs text-muted-foreground">
                  Search for mentions of keywords in dark web forums, paste sites, and breach databases
                </p>
              </div>
            </TabsContent>
              </Tabs>

              <button
                onClick={searchType === "file" ? handleFileUpload : handleScan}
                disabled={!query.trim() || isScanning}
                className="w-full h-12 mt-6 border border-primary/70 rounded text-primary font-bold text-xs tracking-wide hover:bg-primary/10 hover:text-white hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed uppercase"
              >
                <Search className="w-4 h-4 inline mr-1" />
                INITIATE SCAN
              </button>
            </>
          )}
        </div>

        {/* Recent Scans Section */}
        {recentScans.length > 0 && (
          <div className="cyber-card p-8 rounded-lg mt-8">
            <h3 className="text-lg font-bold text-primary mb-6 tracking-wide">RECENT SCANS - QUICK RE-SCAN</h3>
            <div className="grid grid-cols-4 gap-4">
              {recentScans.map((scan, index) => {
                const getTypeIcon = () => {
                  const iconColor = getTypeColor()
                  if (scan.type === "ip") return <Server className="w-4 h-4" style={{ color: iconColor }} />
                  if (scan.type === "domain") return <Globe className="w-4 h-4" style={{ color: iconColor }} />
                  if (scan.type === "hash") return <Hash className="w-4 h-4" style={{ color: iconColor }} />
                  return <Shield className="w-4 h-4" style={{ color: iconColor }} />
                }
                const getTypeColor = () => {
                  if (scan.type === "ip") return "#00bfff"
                  if (scan.type === "domain") return "#00ff00"
                  if (scan.type === "hash") return "#ff69b4"
                  return "#ffd700"
                }
                const getThreatColor = () => {
                  if (scan.threatLevel === "CRITICAL") return "#ff0000"
                  if (scan.threatLevel === "HIGH") return "#ff9800"
                  if (scan.threatLevel === "MEDIUM") return "#ffc107"
                  return "#4caf50"
                }
                const getThreatBgColor = () => {
                  if (scan.threatLevel === "CRITICAL") return "rgba(255, 0, 0, 0.1)"
                  if (scan.threatLevel === "HIGH") return "rgba(255, 152, 0, 0.1)"
                  if (scan.threatLevel === "MEDIUM") return "rgba(255, 193, 7, 0.1)"
                  return "rgba(76, 175, 80, 0.1)"
                }
                const typeColor = getTypeColor()
                const threatColor = getThreatColor()
                const threatBgColor = getThreatBgColor()
                
                return (
                  <button
                    key={index}
                    onClick={() => {
                      setSearchType(scan.type as any)
                      setQuery(scan.item)
                    }}
                    className="text-left p-4 rounded border border-primary/70 bg-transparent hover:bg-primary/10 hover:text-white hover:shadow-lg hover:shadow-primary/30 transition-all duration-300"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div>
                        {getTypeIcon()}
                      </div>
                      <p className="text-xs font-bold" style={{ color: getTypeColor() }}>
                        {scan.type.toUpperCase()}
                      </p>
                    </div>
                    <div className="px-2 py-1 rounded text-xs font-bold inline-block mb-3" style={{
                      backgroundColor: 
                        scan.threatLevel === "CRITICAL" ? "rgba(239, 68, 68, 0.8)" :
                        scan.threatLevel === "HIGH" ? "rgba(255, 152, 0, 0.8)" :
                        scan.threatLevel === "MEDIUM" ? "rgba(255, 193, 7, 0.8)" :
                        "rgba(76, 175, 80, 0.8)",
                      color: "#000"
                    }}>
                      {scan.threatLevel}
                    </div>
                    <p className="text-sm text-primary font-mono truncate">{scan.item}</p>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Quick Examples */}
        <div className="cyber-card p-8 rounded-lg mt-8">
          <h3 className="text-lg font-bold text-primary mb-6 tracking-wide">QUICK EXAMPLES</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => {
                setSearchType("ip")
                setQuery("8.8.8.8")
              }}
              className="text-left p-4 rounded border border-primary/70 bg-transparent hover:bg-primary/10 hover:text-white hover:shadow-lg hover:shadow-primary/30 whitespace-nowrap transition-all duration-300"
            >
              <p className="text-xs text-primary font-bold mb-2">IP EXAMPLE</p>
              <p className="text-sm text-primary font-mono">8.8.8.8</p>
            </button>
            <button
              onClick={() => {
                setSearchType("domain")
                setQuery("google.com")
              }}
              className="text-left p-4 rounded border border-primary/70 bg-transparent hover:bg-primary/10 hover:text-white hover:shadow-lg hover:shadow-primary/30 whitespace-nowrap transition-all duration-300"
            >
              <p className="text-xs text-primary font-bold mb-2">DOMAIN EXAMPLE</p>
              <p className="text-sm text-primary font-mono">google.com</p>
            </button>
            <button
              onClick={() => {
                setSearchType("hash")
                setQuery("5d41402abc4b2a76b9719d911017c592")
              }}
              className="text-left p-4 rounded border border-primary/70 bg-transparent hover:bg-primary/10 hover:text-white hover:shadow-lg hover:shadow-primary/30 whitespace-nowrap transition-all duration-300"
            >
              <p className="text-xs text-primary font-bold mb-2">HASH EXAMPLE</p>
              <p className="text-sm text-primary font-mono truncate">5d41402abc...</p>
            </button>
            <button
              onClick={() => {
                setSearchType("keyword")
                setQuery("company name")
              }}
              className="text-left p-4 rounded border border-primary/70 bg-transparent hover:bg-primary/10 hover:text-white hover:shadow-lg hover:shadow-primary/30 whitespace-nowrap transition-all duration-300"
            >
              <p className="text-xs text-primary font-bold mb-2">KEYWORD EXAMPLE</p>
              <p className="text-sm text-primary font-mono">company name</p>
            </button>
          </div>
        </div>
      </main>

      {/* Scanning Animation Modal */}
      {isScanning && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
          <div className="text-center">
            {/* Radar Animation */}
            <div className="relative w-64 h-64 mx-auto mb-8">
              {/* Grid Background */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 300">
                <defs>
                  <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                    <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#00ff00" strokeWidth="0.5" opacity="0.2" />
                  </pattern>
                </defs>
                <rect width="300" height="300" fill="url(#grid)" />
                <line x1="150" y1="0" x2="150" y2="300" stroke="#00ff00" strokeWidth="1" opacity="0.3" />
                <line x1="0" y1="150" x2="300" y2="150" stroke="#00ff00" strokeWidth="1" opacity="0.3" />
              </svg>

              {/* Concentric Circles */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 300">
                <circle cx="150" cy="150" r="120" fill="none" stroke="#00ff00" strokeWidth="1.5" opacity="0.6" />
                <circle cx="150" cy="150" r="80" fill="none" stroke="#00ff00" strokeWidth="1.5" opacity="0.6" />
                <circle cx="150" cy="150" r="40" fill="none" stroke="#00ff00" strokeWidth="1.5" opacity="0.6" />
              </svg>

              {/* Animated Scan Line */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 300" style={{
                animation: "rotation 4s linear infinite",
              }}>
                <style>{`
                  @keyframes rotation {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                  }
                  @keyframes pulse-dot {
                    0%, 100% { r: 5; opacity: 1; }
                    50% { r: 8; opacity: 0.5; }
                  }
                `}</style>
                <line x1="150" y1="150" x2="150" y2="30" stroke="#00ff00" strokeWidth="2" opacity="0.8" />
              </svg>

              {/* Status Dots */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 300">
                <circle cx="150" cy="150" r="5" fill="#00ff00" style={{ animation: "pulse-dot 2s ease-in-out infinite" }} />
                <circle cx="160" cy="100" r="4" fill="#ff0000" opacity="0.7" />
                <circle cx="200" cy="150" r="4" fill="#ffaa00" opacity="0.7" />
                <circle cx="140" cy="190" r="4" fill="#00ffff" opacity="0.7" />
              </svg>
            </div>

            {/* Scanning Text */}
            <h2 className="text-4xl font-bold text-primary mb-6 cyber-glow" style={{ letterSpacing: "0.1em" }}>
              SCANNING TARGET
            </h2>

            {/* Status Messages */}
            <div className="space-y-3 text-lg font-mono max-w-md">
              <div className="flex items-center gap-3 text-green-400">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                Analyzing threat intelligence databases ...
              </div>
              <div className="flex items-center gap-3 text-cyan-400">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" style={{ animationDelay: "0.3s" }} />
                Retrieving geolocation data ...
              </div>
              <div className="flex items-center gap-3 text-yellow-400">
                <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" style={{ animationDelay: "0.6s" }} />
                Discovering network information ...
              </div>
              <div className="flex items-center gap-3 text-red-400">
                <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" style={{ animationDelay: "0.9s" }} />
                Scanning for vulnerabilities ...
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
