import { Redis } from "@upstash/redis"

// Initialize Redis client with correct environment variables
let redis: Redis | null = null

try {
  // Try the standard Upstash environment variables first
  let redisUrl = process.env.UPSTASH_REDIS_URL || process.env.REDIS_URL
  let redisToken = process.env.UPSTASH_REDIS_TOKEN || process.env.KV_REST_API_TOKEN

  // Also check for KV_REST_API_URL variant
  if (!redisUrl && process.env.KV_REST_API_URL) {
    redisUrl = process.env.KV_REST_API_URL
  }

  if (redisUrl && redisToken) {
    redis = new Redis({
      url: redisUrl,
      token: redisToken,
    })
    console.log("[v0] Redis initialized successfully")
  } else {
    console.warn("[v0] Redis credentials not found. History features will be disabled.")
    console.warn("[v0] Looking for: UPSTASH_REDIS_URL, REDIS_URL, KV_REST_API_URL")
    console.warn("[v0] Looking for: UPSTASH_REDIS_TOKEN, KV_REST_API_TOKEN")
  }
} catch (error) {
  console.error("[v0] Failed to initialize Redis:", error)
}

export { redis }

// Types for scan history
export interface ScanHistoryItem {
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

// Save scan to history
export async function saveScanHistory(item: Omit<ScanHistoryItem, "id" | "timestamp">) {
  if (!redis) {
    console.warn("[v0] Redis not available, skipping history save")
    return null
  }

  try {
    const id = `scan:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`
    const timestamp = Date.now()

    const historyItem: ScanHistoryItem = {
      id,
      timestamp,
      ...item,
    }

    // Retain scan history for 365 days (1 year)
    await redis.setex(id, 365 * 24 * 60 * 60, JSON.stringify(historyItem))

    // Add to sorted set for easy retrieval (score is timestamp)
    await redis.zadd("scan:history", { score: timestamp, member: id })

    await redis.zremrangebyrank("scan:history", 0, -10001)

    console.log("[v0] Scan history saved successfully:", id)
    return historyItem
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error("[v0] Failed to save scan history - Error:", errorMsg)
    // Don't fail the scan if history save fails - history is non-critical
    return null
  }
}

// Get recent scan history
export async function getScanHistory(limit = 50): Promise<ScanHistoryItem[]> {
  if (!redis) {
    console.warn("[v0] Redis not available, returning empty history")
    return []
  }

  try {
    console.log("[v0] Attempting to fetch scan history from Redis...")
    
    // Get most recent scan IDs from sorted set (reverse order)
    let scanIds: any = []
    try {
      const result = await redis.zrange("scan:history", 0, limit - 1, { rev: true })
      // Ensure result is an array
      scanIds = Array.isArray(result) ? result : []
    } catch (zrangeError) {
      const msg = zrangeError instanceof Error ? zrangeError.message : String(zrangeError)
      console.error("[v0] Redis zrange error:", msg)
      console.log("[v0] Redis URL configured:", !!process.env.UPSTASH_REDIS_URL)
      console.log("[v0] Redis token configured:", !!process.env.UPSTASH_REDIS_TOKEN)
      return []
    }

    if (!scanIds || !Array.isArray(scanIds) || scanIds.length === 0) {
      console.log("[v0] No scan history found in Redis")
      return []
    }

    console.log(`[v0] Found ${scanIds.length} scan records, fetching details...`)

    // Ensure scanIds is a properly formatted array before mapping
    const validScanIds = Array.isArray(scanIds) ? scanIds.filter(id => typeof id === 'string') : []
    
    if (validScanIds.length === 0) {
      console.log("[v0] No valid scan IDs found after filtering")
      return []
    }

    // Fetch all scan details
    const scans = await Promise.all(
      validScanIds.map(async (id) => {
        try {
          const data = await redis!.get(id as string)
          if (typeof data === "string") {
            return JSON.parse(data) as ScanHistoryItem
          }
          return data as ScanHistoryItem
        } catch (parseError) {
          const msg = parseError instanceof Error ? parseError.message : String(parseError)
          console.error(`[v0] Failed to parse scan ${id}: ${msg}`)
          return null
        }
      }),
    )

    const results = scans.filter(Boolean) as ScanHistoryItem[]
    console.log(`[v0] Successfully retrieved ${results.length} scan history records`)
    return results
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error("[v0] Failed to get scan history - Error:", errorMsg)
    console.error("[v0] Redis client initialized:", !!redis)
    return []
  }
}

// Get scan statistics
export async function getScanStats() {
  if (!redis) {
    return {
      total: 0,
      byType: { ip: 0, domain: 0, hash: 0, file: 0 },
      byThreatLevel: { critical: 0, high: 0, medium: 0, low: 0, clean: 0, unknown: 0 },
      avgThreatScore: 0,
    }
  }

  try {
    const recentScans = await getScanHistory(1000)

    const stats = {
      total: recentScans.length,
      byType: {
        ip: 0,
        domain: 0,
        hash: 0,
        file: 0,
      },
      byThreatLevel: {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        clean: 0,
        unknown: 0,
      },
      avgThreatScore: 0,
    }

    let totalScore = 0

    recentScans.forEach((scan) => {
      stats.byType[scan.type]++
      stats.byThreatLevel[scan.threatLevel]++
      totalScore += scan.threatScore
    })

    stats.avgThreatScore = recentScans.length > 0 ? totalScore / recentScans.length : 0

    console.log("[v0] Scan statistics calculated:", stats)
    return stats
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error("[v0] Failed to get scan stats - Error:", errorMsg)
    return {
      total: 0,
      byType: { ip: 0, domain: 0, hash: 0, file: 0 },
      byThreatLevel: { critical: 0, high: 0, medium: 0, low: 0, clean: 0, unknown: 0 },
      avgThreatScore: 0,
    }
  }
}
