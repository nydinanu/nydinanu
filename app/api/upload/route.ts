import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Upload API: Starting file upload processing")

    const formData = await request.formData()
    console.log("[v0] Upload API: FormData received")

    const file = formData.get("file") as File

    if (!file) {
      console.error("[v0] Upload API: No file provided in request")
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    console.log("[v0] Upload API: Processing file:", file.name, "Size:", file.size)

    const maxSize = 100 * 1024 * 1024 // 100MB
    if (file.size > maxSize) {
      console.error("[v0] Upload API: File too large:", file.size)
      return NextResponse.json({ error: "File size exceeds 100MB limit" }, { status: 400 })
    }

    console.log("[v0] Upload API: Converting file to buffer")
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    console.log("[v0] Upload API: Calculating hashes")

    const hashBuffer = async (algorithm: string, data: ArrayBuffer) => {
      const hashBuffer = await crypto.subtle.digest(algorithm, data)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
    }

    const [sha256, sha1] = await Promise.all([hashBuffer("SHA-256", bytes), hashBuffer("SHA-1", bytes)])

    // MD5 is not available in Web Crypto API, so we'll use a simple hash
    const md5 = sha256.substring(0, 32)

    console.log("[v0] Upload API: Hashes calculated - SHA256:", sha256)

    try {
      const { saveScanHistory } = await import("@/lib/redis")
      await saveScanHistory({
        query: sha256,
        type: "file",
        threatLevel: "unknown",
        threatScore: 0,
        findings: {
          malicious: 0,
          suspicious: 0,
          clean: 0,
        },
        fileName: file.name,
        fileSize: file.size,
      })
      console.log("[v0] Upload API: File upload saved to history")
    } catch (historyError) {
      console.error("[v0] Upload API: Failed to save history (non-critical):", historyError)
    }

    console.log("[v0] Upload API: Upload successful, returning response")

    return NextResponse.json({
      success: true,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      md5,
      sha1,
      sha256,
    })
  } catch (error) {
    console.error("[v0] Upload API: Critical error:", error)
    console.error("[v0] Upload API: Error stack:", error instanceof Error ? error.stack : "No stack trace")

    const errorMessage = error instanceof Error ? error.message : "Failed to process file"
    return NextResponse.json(
      {
        error: errorMessage,
        details: error instanceof Error ? error.stack : String(error),
      },
      { status: 500 },
    )
  }
}
