import { z } from 'zod';

const newComment = z.object({
  content: z.string()
});

export { newComment };
