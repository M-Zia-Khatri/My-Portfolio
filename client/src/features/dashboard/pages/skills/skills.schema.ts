import { z } from 'zod';
export const skillSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  fileName: z.string().min(1, 'File name is required'),
  lang: z.string().min(1, 'Language is required'),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color'),
  mode: z.enum(['code', 'terminal']),
  icon: z.string().min(1, 'Icon selection is required'),
  // We'll accept a multiline string in the form and split it into an array for the API
  content: z.string().min(1, 'Content is required'),
});
export type SkillFormValues = z.infer<typeof skillSchema>;
