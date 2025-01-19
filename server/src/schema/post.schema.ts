import { z } from 'zod';

// Constants for validation
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/mkv', 'video/webm'];
const ALLOWED_VISIBILITY_TYPES = ['public', 'private', 'close-friends'];
const MAX_VIDEO_DURATION = 300; // 5 minutes

const fileSchema = z.object({
  size: z.number().max(MAX_FILE_SIZE, 'File size should not exceed 5 MB'),
  mimetype: z
    .string()
    .refine((type) => [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES].includes(type), 'Unsupported media'),
  originalname: z.string(),
  path: z.string(),
  encoding: z.string(),
  buffer: z.instanceof(Buffer).optional()
});

const imageSchema = fileSchema.extend({
  mimetype: z.string().refine((type) => [...ALLOWED_IMAGE_TYPES].includes(type), 'Unsupported image type')
});

const videoSchema = fileSchema.extend({
  mimetype: z.string().refine((type) => [...ALLOWED_VIDEO_TYPES].includes(type), 'Unsupported video type'),
  duration: z.number().max(MAX_VIDEO_DURATION, 'Video duration exceeds 5 minutes').optional()
});

const uploadPostSchema = z.object({
  content: z.string().optional(),
  visibility: z
    .string()
    .refine((type) => [...ALLOWED_VISIBILITY_TYPES].includes(type), {
      message: 'Not a valid visibility choice',
      path: ['visibility']
    })
    .optional()
});

const uploadFileSchema = z
  .object({
    imageFile: z
      .array(imageSchema)
      .optional()
      .refine((files) => !files || files.length === 1, {
        message: 'Only one image file is allowed.'
      }),
    videoFile: z
      .array(videoSchema)
      .optional()
      .refine((files) => !files || files.length === 1, {
        message: 'Only one video file is allowed.'
      })
  })
  .refine((data) => (data.imageFile && data.imageFile.length) || (data.videoFile && data.videoFile.length), {
    message: 'Please provide Image/Video in order to create s post',
    path: []
  })
  .refine((data) => !(data.imageFile && data.imageFile.length && data.videoFile && data.videoFile.length), {
    message: 'Either provide Image/Video to post. Not both',
    path: []
  });

const updatePostSchema = z
  .object({
    content: z.string().optional(),
    visibility: z
      .string()
      .refine((type) => [...ALLOWED_VISIBILITY_TYPES].includes(type), {
        message: 'Not a valid visibility choice',
        path: ['visibility']
      })
      .optional()
  })
  .refine((data) => data.content || data.visibility, {
    message: 'Provide Content/Visibility in-order to update post',
    path: ['visibility']
  });

export { uploadFileSchema, uploadPostSchema, updatePostSchema };
