import { type NextRequest, NextResponse } from "next/server"

async function getVirusTotalUrlReport(url: string) {
  try {
    const urlEncoded = Buffer.from(url).toString('base64').replace(/=/g, '')
    const response = await fetch(`https://www.virustotal.com/api/v3/urls/${urlEncoded}`, {
      headers: {
        "x-apikey": process.env.VIRUSTOTAL_API_KEY || "",
      },
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.log("[v0] VirusTotal URL API fetch error:", error)
    return null
  }
}

async function submitUrlToVirusTotal(url: string) {
  try {
    const formData = new FormData()
    formData.append('url', url)
    
    const response = await fetch('https://www.virustotal.com/api/v3/urls', {
      method: 'POST',
      headers: {
        "x-apikey": process.env.VIRUSTOTAL_API_KEY || "",
      },
      body: formData,
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.log("[v0] VirusTotal URL submission error:", error)
    return null
  }
}

function calculateThreatLevel(vtReport: any): { level: string; score: number; color: string } {
  if (!vtReport?.data?.attributes?.last_analysis_stats) {
    return { level: 'UNKNOWN', score: 0, color: 'gray' }
  }

  const stats = vtReport.data.attributes.last_analysis_stats
  const malicious = stats.malicious || 0
  const suspicious = stats.suspicious || 0

  if (malicious >= 5) {
    return { level: 'CRITICAL', score: malicious, color: 'red' }
  } else if (malicious >= 1) {
    return { level: 'HIGH', score: malicious, color: 'orange' }
  } else if (suspicious >= 3) {
    return { level: 'MEDIUM', score: suspicious, color: 'yellow' }
  } else if (suspicious >= 1) {
    return { level: 'LOW', score: suspicious, color: 'amber' }
  }

  return { level: 'CLEAN', score: 0, color: 'green' }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { urls } = body

    if (!urls || !Array.isArray(urls)) {
      return NextResponse.json({ error: "URLs array is required" }, { status: 400 })
    }

    if (!process.env.VIRUSTOTAL_API_KEY) {
      return NextResponse.json({ error: "VirusTotal API key not configured" }, { status: 500 })
    }

    const results = []
    let maliciousCount = 0
    let phishingCount = 0
    let suspiciousCount = 0

    for (const url of urls) {
      try {
        let vtReport = await getVirusTotalUrlReport(url)
        
        // If URL not found in VirusTotal, submit it for scanning
        if (!vtReport) {
          await submitUrlToVirusTotal(url)
          vtReport = await getVirusTotalUrlReport(url)
        }

        if (vtReport?.data?.attributes) {
          const stats = vtReport.data.attributes.last_analysis_stats
          const threatLevel = calculateThreatLevel(vtReport)
          const categories = vtReport.data.attributes.categories || {}
          
          // Count threat types
          if (stats.malicious > 0) maliciousCount++
          if (categories['phishing'] || vtReport.data.attributes.threat_verdict === 'phishing') phishingCount++
          if (stats.suspicious > 0) suspiciousCount++

          results.push({
            url,
            malicious: stats.malicious || 0,
            suspicious: stats.suspicious || 0,
            harmless: stats.harmless || 0,
            undetected: stats.undetected || 0,
            threatLevel: threatLevel.level,
            threatScore: threatLevel.score,
            threatColor: threatLevel.color,
            categories: categories,
            lastAnalysisDate: vtReport.data.attributes.last_analysis_date,
            scanned: true,
          })
        } else {
          results.push({
            url,
            malicious: 0,
            suspicious: 0,
            harmless: 0,
            undetected: 0,
            threatLevel: 'PENDING',
            threatScore: 0,
            threatColor: 'gray',
            scanned: false,
            pending: true,
          })
        }
      } catch (error) {
        console.log("[v0] Error scanning URL:", url, error)
        results.push({
          url,
          error: true,
          threatLevel: 'ERROR',
        })
      }
    }

    // Calculate overall risk level
    let overallRiskLevel = 'LOW'
    if (maliciousCount > 0) overallRiskLevel = 'CRITICAL'
    else if (phishingCount > 0) overallRiskLevel = 'HIGH'
    else if (suspiciousCount > 0) overallRiskLevel = 'MEDIUM'

    return NextResponse.json({
      results,
      threatSummary: {
        emailRiskLevel: overallRiskLevel,
        maliciousUrls: maliciousCount,
        phishingUrls: phishingCount,
        suspiciousUrls: suspiciousCount,
        totalUrlsScanned: results.filter(r => !r.error).length,
      },
    })
  } catch (error) {
    console.error("[v0] URL scanning error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to scan URLs" },
      { status: 500 }
    )
  }
}
