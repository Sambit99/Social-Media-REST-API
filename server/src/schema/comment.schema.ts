import { z } from 'zod';

const newCommentSchema = z.object({
  content: z.string()
});

const updateCommentSchema = z.object({
  content: z.string()
});

export { newCommentSchema, updateCommentSchema };
