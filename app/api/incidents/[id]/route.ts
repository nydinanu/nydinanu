import { NextResponse } from 'next/server'
import { redis } from '@/lib/redis'

const INCIDENTS_KEY = 'incidents:all'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    if (!redis) {
      return NextResponse.json({ error: 'Redis not available' }, { status: 500 })
    }

    const { id } = params
    const body = await request.json()
    const { iocs, tags } = body

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
    
    // Find and update the incident
    const updated = cases.map((c: any) => {
      if (c.id === id) {
        const existingIocs = c.iocs || []
        const updatedIocs = [...existingIocs, ...(iocs || [])]
        const existingTags = c.tags || []
        const updatedTags = [...new Set([...existingTags, ...(tags || [])])]
        
        return {
          ...c,
          iocs: updatedIocs,
          tags: updatedTags,
          lastUpdated: new Date().toISOString(),
        }
      }
      return c
    })

    // Save updated cases
    await redis.set(INCIDENTS_KEY, JSON.stringify(updated))
    
    const updatedIncident = updated.find((c: any) => c.id === id)
    console.log('[v0] IOCs added to incident:', id, 'Total IOCs now:', updatedIncident?.iocs?.length || 0)
    return NextResponse.json({ success: true, case: updatedIncident })
  } catch (error) {
    console.log('[v0] Incidents PATCH error:', error)
    return NextResponse.json({ error: 'Failed to update incident', details: String(error) }, { status: 400 })
  }
}
