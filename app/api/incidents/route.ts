import { NextResponse } from 'next/server'
import { redis } from '@/lib/redis'

const INCIDENTS_KEY = 'incidents:all'

export async function GET() {
  try {
    if (!redis) {
      return NextResponse.json({ cases: [] })
    }
    
    const data = await redis.get(INCIDENTS_KEY)
    let cases = []
    
    if (data) {
      // Handle both string and object returns from Redis
      if (typeof data === 'string') {
        cases = JSON.parse(data)
      } else if (Array.isArray(data)) {
        cases = data
      } else if (typeof data === 'object') {
        cases = [data]
      }
    }
    
    console.log('[v0] Loaded', cases.length, 'incident cases from Redis')
    return NextResponse.json({ cases })
  } catch (error) {
    console.log('[v0] Incidents API GET error:', error)
    return NextResponse.json({ cases: [] }, { status: 200 })
  }
}

export async function POST(request: Request) {
  try {
    if (!redis) {
      return NextResponse.json({ error: 'Redis not available' }, { status: 500 })
    }

    const body = await request.json()
    
    const newCase = {
      id: Date.now().toString(),
      ...body,
      createdDate: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    }

    // Get existing cases
    const data = await redis.get(INCIDENTS_KEY)
    let cases = []
    
    if (data) {
      if (typeof data === 'string') {
        cases = JSON.parse(data)
      } else if (Array.isArray(data)) {
        cases = data
      }
    }
    
    // Add new case and save
    const updatedCases = [newCase, ...cases]
    await redis.set(INCIDENTS_KEY, JSON.stringify(updatedCases))

    console.log('[v0] Incident case created:', newCase.id)
    return NextResponse.json({ success: true, case: newCase })
  } catch (error) {
    console.log('[v0] Incidents API POST error:', error)
    return NextResponse.json({ error: 'Failed to create case', details: String(error) }, { status: 400 })
  }
}

export async function PUT(request: Request) {
  try {
    if (!redis) {
      return NextResponse.json({ error: 'Redis not available' }, { status: 500 })
    }

    const body = await request.json()
    const { id, ...updates } = body

    // Get existing cases
    const data = await redis.get(INCIDENTS_KEY)
    let cases = []
    
    if (data) {
      if (typeof data === 'string') {
        cases = JSON.parse(data)
      } else if (Array.isArray(data)) {
        cases = data
      }
    }
    
    // Update the specific case
    const updatedCases = cases.map((c: any) =>
      c.id === id
        ? {
            ...c,
            ...updates,
            lastUpdated: new Date().toISOString(),
          }
        : c
    )
    
    // Save updated cases
    await redis.set(INCIDENTS_KEY, JSON.stringify(updatedCases))
    
    const updated = updatedCases.find((c: any) => c.id === id)
    console.log('[v0] Incident case updated:', id)
    return NextResponse.json({ success: true, case: updated })
  } catch (error) {
    console.log('[v0] Incidents API PUT error:', error)
    return NextResponse.json({ error: 'Failed to update case' }, { status: 400 })
  }
}

export async function DELETE(request: Request) {
  try {
    if (!redis) {
      return NextResponse.json({ error: 'Redis not available' }, { status: 500 })
    }

    const body = await request.json()
    const { id } = body

    // Get existing cases
    const data = await redis.get(INCIDENTS_KEY)
    let cases = []
    
    if (data) {
      if (typeof data === 'string') {
        cases = JSON.parse(data)
      } else if (Array.isArray(data)) {
        cases = data
      }
    }
    
    // Filter out the case to delete
    const updatedCases = cases.filter((c: any) => c.id !== id)
    
    // Save updated cases
    await redis.set(INCIDENTS_KEY, JSON.stringify(updatedCases))
    
    console.log('[v0] Incident case deleted:', id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.log('[v0] Incidents API DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete case' }, { status: 400 })
  }
}
