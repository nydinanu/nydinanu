import { NextRequest, NextResponse } from 'next/server'
import { wafLogAnalyzer } from '@/lib/waf-log-analyzer'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    const validTypes = ['text/plain', 'text/csv', 'application/json', 'application/octet-stream']
    if (!validTypes.includes(file.type) && !file.name.match(/\.(log|txt|csv|json)$/i)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload a log file (.log, .txt, .csv, or .json)' },
        { status: 400 }
      )
    }

    // Check file size (max 50MB)
    const maxSize = 50 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 50MB' },
        { status: 400 }
      )
    }

    console.log('[v0] WAF log analysis starting. File:', file.name, 'Size:', file.size)

    // Read file content
    const content = await file.text()

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'File is empty' },
        { status: 400 }
      )
    }

    // Parse WAF log
    const parsed = wafLogAnalyzer.parseWAFLog(content)

    console.log('[v0] Detected format:', parsed.format, 'Parse errors:', parsed.parseErrors.length)

    if (parsed.entries.length === 0) {
      let errorMsg = 'No valid log entries found in file'
      if (parsed.parseErrors.length > 0) {
        errorMsg += `. Format detected: ${parsed.format}. Sample errors: ${parsed.parseErrors.slice(0, 3).join('; ')}`
      }
      return NextResponse.json(
        { 
          error: errorMsg,
          detectedFormat: parsed.format,
          parseErrors: parsed.parseErrors.slice(0, 5),
        },
        { status: 400 }
      )
    }

    console.log('[v0] Parsed', parsed.entries.length, 'log entries')

    // Analyze log entries
    let analysis
    try {
      console.log('[v0] Starting analysis of', parsed.entries.length, 'entries')
      analysis = wafLogAnalyzer.analyzeLogEntries(parsed.entries)
      console.log('[v0] Analysis completed successfully')
      console.log('[v0] Analysis keys:', Object.keys(analysis))
      console.log('[v0] Risk score:', analysis.riskAssessment?.riskScore)
    } catch (analyzeErr) {
      console.error('[v0] Error during analysis:', analyzeErr)
      console.error('[v0] Error stack:', analyzeErr instanceof Error ? analyzeErr.stack : 'No stack trace')
      throw new Error(`Failed to analyze entries: ${analyzeErr instanceof Error ? analyzeErr.message : 'Unknown error'}`)
    }

    console.log('[v0] WAF log analysis complete. Risk Score:', analysis.riskAssessment.riskScore)

    // Verify the response is JSON serializable
    try {
      console.log('[v0] Building response data')
      const responseData = {
        success: true,
        analysis,
        parseDetails: {
          format: parsed.format,
          totalParsed: parsed.entries.length,
          parseErrors: parsed.parseErrors.slice(0, 10),
        },
      }
      
      // Test serialization
      console.log('[v0] Testing JSON serialization')
      const serialized = JSON.stringify(responseData)
      console.log('[v0] Serialization successful, length:', serialized.length)
      
      return NextResponse.json(responseData)
    } catch (jsonErr) {
      console.error('[v0] Response serialization error:', jsonErr)
      console.error('[v0] Error details:', jsonErr instanceof Error ? jsonErr.message : 'Unknown')
      console.log('[v0] Analysis object keys:', Object.keys(analysis))
      // Return a minimal safe response
      return NextResponse.json({
        success: true,
        analysis: {
          totalEntries: analysis.totalEntries,
          timeRange: analysis.timeRange,
          summary: analysis.summary,
          threatBreakdown: analysis.threatBreakdown,
          topAttackers: analysis.topAttackers,
          topTargets: analysis.topTargets,
          riskAssessment: analysis.riskAssessment,
          severityDistribution: analysis.severityDistribution,
          detailedFindings: analysis.detailedFindings,
        },
        parseDetails: {
          format: parsed.format,
          totalParsed: parsed.entries.length,
        },
      })
    }
  } catch (error) {
    console.error('[v0] WAF log analysis error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'WAF log analysis failed' },
      { status: 500 }
    )
  }
}
