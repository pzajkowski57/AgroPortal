import { NextRequest, NextResponse } from 'next/server'
import { searchSuggestions } from '@/lib/repositories/listing.repository'

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q') ?? ''

  if (q.length < 2) {
    return NextResponse.json({ success: true, data: [] })
  }

  try {
    const suggestions = await searchSuggestions(q)
    return NextResponse.json({ success: true, data: suggestions })
  } catch (error) {
    console.error('Search suggestions failed:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch suggestions' },
      { status: 500 }
    )
  }
}
