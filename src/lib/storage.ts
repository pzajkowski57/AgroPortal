import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME

const missingVars = [
  ['R2_ACCOUNT_ID', R2_ACCOUNT_ID],
  ['R2_ACCESS_KEY_ID', R2_ACCESS_KEY_ID],
  ['R2_SECRET_ACCESS_KEY', R2_SECRET_ACCESS_KEY],
  ['R2_BUCKET_NAME', R2_BUCKET_NAME],
]
  .filter(([, value]) => !value)
  .map(([name]) => name)

if (missingVars.length > 0) {
  throw new Error(
    `Missing required Cloudflare R2 environment variables: ${missingVars.join(', ')}. ` +
      'Set these variables before starting the application.',
  )
}

export const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID!,
    secretAccessKey: R2_SECRET_ACCESS_KEY!,
  },
})

const ALLOWED_CONTENT_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
  'video/mp4',
  'video/quicktime',
])

const PRESIGNED_URL_EXPIRY_SECONDS = 5 * 60 // 5 minutes
const BYTES_PER_MB = 1024 * 1024
const MAX_KEY_LENGTH = 512
const ALLOWED_KEY_PATTERN = /^[a-zA-Z0-9\-_.\/]+$/

export function sanitizeStorageKey(key: string): string {
  // Strip leading slashes
  let sanitized = key.replace(/^\/+/, '')

  // Strip path traversal sequences
  sanitized = sanitized.replace(/\.\.\//g, '').replace(/\.\.$/, '')

  // Enforce character allowlist
  if (!ALLOWED_KEY_PATTERN.test(sanitized)) {
    throw new Error(
      `Invalid storage key: only alphanumeric characters, hyphens, underscores, dots, and forward slashes are allowed.`,
    )
  }

  // Enforce maximum length
  if (sanitized.length > MAX_KEY_LENGTH) {
    throw new Error(
      `Storage key exceeds maximum length of ${MAX_KEY_LENGTH} characters.`,
    )
  }

  if (sanitized.length === 0) {
    throw new Error('Storage key must not be empty after sanitization.')
  }

  return sanitized
}

export async function generatePresignedUploadUrl(
  key: string,
  contentType: string,
  maxSizeMB: number,
): Promise<string> {
  if (!ALLOWED_CONTENT_TYPES.has(contentType)) {
    throw new Error(
      `Content type "${contentType}" is not allowed. Permitted types: ${[...ALLOWED_CONTENT_TYPES].join(', ')}.`,
    )
  }

  const sanitizedKey = sanitizeStorageKey(key)

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME!,
    Key: sanitizedKey,
    ContentType: contentType,
    ContentLength: maxSizeMB * BYTES_PER_MB,
  })

  return getSignedUrl(r2Client, command, {
    expiresIn: PRESIGNED_URL_EXPIRY_SECONDS,
  })
}
