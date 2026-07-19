import { NextRequest, NextResponse } from "next/server"
import { wafEngine } from "@/lib/waf-analysis-engine"

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      )
    }

    // Validate URL format
    try {
      new URL(url)
    } catch {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 }
      )
    }

    console.log("[v0] WAF Analysis starting for URL:", url)

    const result = await wafEngine.analyzeURL(url)

    console.log("[v0] WAF Analysis complete. Risk Score:", result.overallRiskScore)

    return NextResponse.json(result)
  } catch (error) {
    console.error("[v0] WAF Analysis API Error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "WAF analysis failed" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url")

  if (!url) {
    return NextResponse.json(
      { error: "URL parameter is required" },
      { status: 400 }
    )
  }

  try {
    new URL(url)
  } catch {
    return NextResponse.json(
      { error: "Invalid URL format" },
      { status: 400 }
    )
  }

  try {
    console.log("[v0] WAF Analysis GET request for URL:", url)
    const result = await wafEngine.analyzeURL(url)
    return NextResponse.json(result)
  } catch (error) {
    console.error("[v0] WAF Analysis Error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "WAF analysis failed" },
      { status: 500 }
    )
  }
}
