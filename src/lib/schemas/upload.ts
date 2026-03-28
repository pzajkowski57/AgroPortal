import { z } from 'zod'

export const ALLOWED_CONTENT_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const

export type AllowedContentType = (typeof ALLOWED_CONTENT_TYPES)[number]

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB
const MAX_FILES = 10

export const uploadFileEntrySchema = z.object({
  filename: z.string().min(1, 'Filename must not be empty'),
  contentType: z.enum(ALLOWED_CONTENT_TYPES, {
    errorMap: () => ({
      message: `Content type must be one of: ${ALLOWED_CONTENT_TYPES.join(', ')}`,
    }),
  }),
  size: z
    .number()
    .int()
    .min(1, 'File size must be greater than 0')
    .max(MAX_FILE_SIZE_BYTES, `File size must not exceed ${MAX_FILE_SIZE_BYTES} bytes`),
})

export const presignedUploadRequestSchema = z.object({
  files: z
    .array(uploadFileEntrySchema)
    .min(1, 'At least one file is required')
    .max(MAX_FILES, `Maximum ${MAX_FILES} files per request`),
})

export type UploadFileEntry = z.infer<typeof uploadFileEntrySchema>
export type PresignedUploadRequest = z.infer<typeof presignedUploadRequestSchema>
