/**
 * Cloudflare R2 S3-compatible client and presigned URL utilities.
 *
 * Uses @aws-sdk/client-s3 with the Cloudflare R2 S3-compatible endpoint.
 * Env vars required:
 *   R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME
 */
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import type { AllowedContentType } from '@/lib/schemas/upload'

// ---------------------------------------------------------------------------
// Environment validation
// ---------------------------------------------------------------------------

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

// ---------------------------------------------------------------------------
// Client factory — lazy-initialised so missing env vars only throw at call time
// ---------------------------------------------------------------------------

let _client: S3Client | null = null

function getR2Client(): S3Client {
  if (_client) return _client

  const accountId = requireEnv('R2_ACCOUNT_ID')
  const accessKeyId = requireEnv('R2_ACCESS_KEY_ID')
  const secretAccessKey = requireEnv('R2_SECRET_ACCESS_KEY')

  _client = new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  })

  return _client
}

// ---------------------------------------------------------------------------
// Extension map — derived from content type (never trust client filename)
// ---------------------------------------------------------------------------

const CONTENT_TYPE_TO_EXT: Record<AllowedContentType, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

export function extForContentType(contentType: AllowedContentType): string {
  return CONTENT_TYPE_TO_EXT[contentType]
}

// ---------------------------------------------------------------------------
// Presigned URL generation
// ---------------------------------------------------------------------------

export interface PresignedUploadParams {
  key: string
  contentType: AllowedContentType
  /** Expiry in seconds — defaults to 900 (15 min) */
  expiresIn?: number
}

export interface PresignedUploadResult {
  url: string
  key: string
}

export async function createPresignedUploadUrl(
  params: PresignedUploadParams
): Promise<PresignedUploadResult> {
  const { key, contentType, expiresIn = 900 } = params

  const bucketName = requireEnv('R2_BUCKET_NAME')
  const client = getR2Client()

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    ContentType: contentType,
  })

  const url = await getSignedUrl(client, command, { expiresIn })

  return { url, key }
}
