import { executeDatabaseHealthCheck } from '@/lib/supabase/health-check'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const health = await executeDatabaseHealthCheck()
    return NextResponse.json(health, {
      status: health.status === 'healthy' ? 200 : 503,
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    )
  }
}
