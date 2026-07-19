import { type NextRequest, NextResponse } from "next/server"
import { saveScanHistory } from "@/lib/redis"

function detectItemType(item: string): "ip" | "domain" | "hash" | "unknown" {
  const cleanItem = item.trim()

  const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/
  if (ipPattern.test(cleanItem)) {
    const octets = cleanItem.split(".").map(Number)
    if (octets.every((octet) => octet >= 0 && octet <= 255)) {
      return "ip"
    }
  }

  const hashPattern = /^[a-fA-F0-9]{32}$|^[a-fA-F0-9]{40}$|^[a-fA-F0-9]{64}$/
  if (hashPattern.test(cleanItem)) {
    return "hash"
  }

  const domainPattern = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/
  const cleanDomain = cleanItem.replace(/^https?:\/\//, "").split("/")[0]
  if (domainPattern.test(cleanDomain)) {
    return "domain"
  }

  return "unknown"
}

async function scanItem(item: string, type: string) {
  try {
    console.log(`[v0] Bulk scan: Scanning ${type} - ${item}`)

    const protocol = process.env.NODE_ENV === "production" ? "https" : "http"
    const host = process.env.VERCEL_URL || "localhost:3000"
    const url = `${protocol}://${host}/api/scan?type=${type}&query=${encodeURIComponent(item)}`
    
    console.log(`[v0] Bulk scan: Calling URL: ${url}`)

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    console.log(`[v0] Bulk scan: Response status for ${item}: ${response.status}`)

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error")
      console.error(`[v0] Bulk scan: Failed to scan ${item}:`, errorText)
      return {
        item,
        type,
        status: "error",
        error: `Scan failed with status ${response.status}`,
      }
    }

    const data = await response.json()
    console.log(`[v0] Bulk scan: Successfully scanned ${item} with data:`, {
      threatLevel: data.threatLevel,
      threats: data.threats?.length,
      hasGeolocation: !!data.geolocation,
    })

    return {
      item,
      type,
      status: "success",
      threatLevel: data.threatLevel,
      threats: data.threats?.filter((t: any) => t.detected).length || 0,
      data,
    }
  } catch (error) {
    console.error(`[v0] Bulk scan: Error scanning ${item}:`, error)
    return {
      item,
      type,
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Bulk scan API: Starting bulk scan")

    const body = await request.json()
    const { items } = body

    console.log("[v0] Bulk scan API: Received items:", items?.length || 0)

    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ error: "Invalid request: items array required" }, { status: 400 })
    }

    if (items.length === 0) {
      return NextResponse.json({ error: "No items provided" }, { status: 400 })
    }

    if (items.length > 100) {
      return NextResponse.json({ error: "Maximum 100 items allowed per bulk scan" }, { status: 400 })
    }

    const categorizedItems = items.map((item) => {
      const trimmed = item.trim()
      const type = detectItemType(trimmed)
      console.log(`[v0] Bulk scan: Detected ${trimmed} as ${type}`)
      return {
        item: trimmed,
        type,
      }
    })

    const validItems = categorizedItems.filter((i) => i.type !== "unknown")
    console.log(`[v0] Bulk scan API: ${validItems.length} valid items out of ${items.length}`)

    if (validItems.length === 0) {
      return NextResponse.json({ error: "No valid items found (must be IP, domain, or hash)" }, { status: 400 })
    }

    const scanId = `bulk_${Date.now()}_${Math.random().toString(36).substring(7)}`
    console.log(`[v0] Bulk scan API: Generated scan ID: ${scanId}`)

    const results = []

    for (let i = 0; i < validItems.length; i++) {
      const { item, type } = validItems[i]
      
      // Add delay between requests to avoid rate limiting (1 second between requests)
      if (i > 0) {
        console.log(`[v0] Bulk scan API: Waiting 1 second before scanning item ${i + 1}/${validItems.length}`)
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
      
      const result = await scanItem(item, type)
      results.push(result)

      if (result.status === "success") {
        try {
          await saveScanHistory({
            query: item,
            type: type as "ip" | "domain" | "hash",
            threatLevel: result.threatLevel,
            threatScore: result.threats * 20,
            findings: {
              malicious:
                result.data.threats?.filter((t: any) => t.detected && t.name.includes("malicious")).length || 0,
              suspicious:
                result.data.threats?.filter((t: any) => t.detected && !t.name.includes("malicious")).length || 0,
              clean: result.data.threats?.filter((t: any) => !t.detected).length || 0,
            },
            country: result.data.geolocation?.country,
            isp: result.data.geolocation?.isp,
          })
        } catch (error) {
          console.error("[v0] Failed to save bulk scan history:", error)
        }
      }
    }

    const summary = {
      total: results.length,
      successful: results.filter((r) => r.status === "success").length,
      failed: results.filter((r) => r.status === "error").length,
      critical: results.filter((r) => r.threatLevel === "critical").length,
      high: results.filter((r) => r.threatLevel === "high").length,
      medium: results.filter((r) => r.threatLevel === "medium").length,
      low: results.filter((r) => r.threatLevel === "low").length,
      clean: results.filter((r) => r.threatLevel === "low" && r.threats === 0).length,
    }

    console.log("[v0] Bulk scan API: Scan complete. Summary:", summary)

    return NextResponse.json({
      scanId,
      summary,
      results,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[v0] Bulk scan error:", error)
    return NextResponse.json(
      {
        error: "Failed to process bulk scan",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
