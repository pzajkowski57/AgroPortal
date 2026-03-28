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

interface R2ClientState {
  client: S3Client
  bucketName: string
}

let _state: R2ClientState | null = null

function getR2Client(): R2ClientState {
  if (_state) return _state

  const accountId = requireEnv('R2_ACCOUNT_ID')
  const accessKeyId = requireEnv('R2_ACCESS_KEY_ID')
  const secretAccessKey = requireEnv('R2_SECRET_ACCESS_KEY')
  const bucketName = requireEnv('R2_BUCKET_NAME')

  _state = {
    bucketName,
    client: new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    }),
  }

  return _state
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
  /** File size in bytes — sent as ContentLength so R2 enforces the limit server-side */
  size: number
  /** Expiry in seconds — defaults to 900 (15 min) */
  expiresIn?: number
}

export interface PresignedUploadResult {
  url: string
  key: string
  expiresIn: number
}

export async function createPresignedUploadUrl(
  params: PresignedUploadParams
): Promise<PresignedUploadResult> {
  const { key, contentType, size, expiresIn = 900 } = params

  const { client, bucketName } = getR2Client()

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    ContentType: contentType,
    ContentLength: size,
  })

  const url = await getSignedUrl(client, command, { expiresIn })

  return { url, key, expiresIn }
}
