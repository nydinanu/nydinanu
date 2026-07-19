import { NextResponse } from "next/server"
import { getScanHistory, getScanStats } from "@/lib/redis"

export async function GET() {
  try {
    console.log("[v0] History API: Starting fetch...")
    
    const [history, stats] = await Promise.all([getScanHistory(1000), getScanStats()])

    console.log("[v0] History API: Successfully fetched data")
    console.log(`[v0] History API: Got ${history.length} records and stats`)

    return NextResponse.json({ history, stats })
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error("[v0] History fetch error:", errorMsg)
    
    // Return partial response with empty data instead of error
    // This prevents the threat-feed from completely failing
    return NextResponse.json({
      history: [],
      stats: {
        total: 0,
        byType: { ip: 0, domain: 0, hash: 0, file: 0 },
        byThreatLevel: { critical: 0, high: 0, medium: 0, low: 0, clean: 0, unknown: 0 },
        avgThreatScore: 0,
      },
      error: "Scan history temporarily unavailable",
    })
  }
}
