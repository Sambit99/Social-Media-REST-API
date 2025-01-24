import { z } from 'zod';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/mkv', 'video/webm'];
const ALLOWED_VISIBILITY_TYPES = ['public', 'private', 'close-friends'];
const MAX_VIDEO_DURATION = 60; // 1 minutes

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

const newStoryFileSchema = z
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
    message: 'Please provide Image/Video in order to create story',
    path: ['ImageFile']
  })
  .refine((data) => !(data.imageFile && data.imageFile.length && data.videoFile && data.videoFile.length), {
    message: 'Either provide Image/Video for story. Not both',
    path: ['imageFile']
  });

const newStorySchema = z.object({
  visibility: z
    .string()
    .refine((data) => [...ALLOWED_VISIBILITY_TYPES].includes(data), {
      message: 'Not a valid visibility type',
      path: ['visibility']
    })
    .optional()
});

export { newStoryFileSchema, newStorySchema };
