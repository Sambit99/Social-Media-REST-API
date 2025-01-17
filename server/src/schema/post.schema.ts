import { z } from 'zod';

// Constants for validation
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/mkv', 'video/webm'];
const MAX_VIDEO_DURATION = 300; // 5 minutes

const fileSchema = z.object({
  size: z.number().max(MAX_FILE_SIZE, 'File size should not exceed 5 MB'),
  mimetype: z
    .string()
    .refine((type) => [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES].includes(type), 'Unsupported media'),
  buffer: z.instanceof(Buffer).optional()
});

const imageSchema = fileSchema.extend({
  mimetype: z.string().refine((type) => [...ALLOWED_IMAGE_TYPES].includes(type), 'Unsupported image type')
});

const videoSchema = fileSchema.extend({
  mimetype: z.string().refine((type) => [...ALLOWED_VIDEO_TYPES].includes(type), 'Unsupported video type'),
  duration: z.number().max(MAX_VIDEO_DURATION, 'Video duration exceeds 5 minutes').optional()
});

const uploadPostSchema = z
  .object({
    content: z.string().optional(),
    imageFile: imageSchema.optional(),
    videoFile: videoSchema.optional()
  })
  .refine((data) => data.imageFile || data.videoFile, {
    message: 'Please provide Content/Image/Video in order to create s post',
    path: []
  });

export { uploadPostSchema };
