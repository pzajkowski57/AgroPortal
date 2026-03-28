/**
 * POST /api/v1/upload/presigned
 *
 * Generates presigned PUT URLs for direct upload to Cloudflare R2.
 * Requires an authenticated session (NextAuth).
 * Rate limiting for /api/v1/upload/* is handled by middleware.
 *
 * Request body:
 *   { files: Array<{ filename: string, contentType: string, size: number }> }
 *
 * Response (success):
 *   { success: true, data: { urls: Array<{ url: string, key: string, expiresIn: number }> } }
 *
 * Response (error):
 *   { success: false, error: string }
 */
import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { auth } from '@/auth'
import { presignedUploadRequestSchema } from '@/lib/schemas/upload'
import { createPresignedUploadUrl, extForContentType } from '@/lib/r2'
import type { AllowedContentType } from '@/lib/schemas/upload'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PresignedUrlEntry {
  url: string
  key: string
  expiresIn: number
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest): Promise<NextResponse> {
  // 1. Auth check
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const userId = session.user.id

  // 2. Parse request body
  let rawBody: unknown
  try {
    rawBody = await request.json()
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid JSON body' },
      { status: 400 }
    )
  }

  // 3. Validate with Zod
  const parsed = presignedUploadRequestSchema.safeParse(rawBody)

  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message ?? 'Validation error'
    return NextResponse.json(
      { success: false, error: firstError },
      { status: 400 }
    )
  }

  const { files } = parsed.data

  // 4. Generate presigned URLs
  try {
    const urls: PresignedUrlEntry[] = await Promise.all(
      files.map((file) => {
        const ext = extForContentType(file.contentType as AllowedContentType)
        const key = `uploads/${userId}/${uuidv4()}.${ext}`

        return createPresignedUploadUrl({
          key,
          contentType: file.contentType as AllowedContentType,
          size: file.size,
        })
      })
    )

    return NextResponse.json(
      { success: true, data: { urls } },
      { status: 200 }
    )
  } catch {
    // Do not expose internal R2/S3 error details to the client
    return NextResponse.json(
      { success: false, error: 'Failed to generate upload URL' },
      { status: 500 }
    )
  }
}
