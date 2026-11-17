import { z } from 'zod';

const name = (max: number) => z.string().trim().min(1, 'Không được để trống').max(max);

export const subjectInput = z.object({ name: name(50), sort: z.coerce.number().int().min(0) });
export const gradeInput = subjectInput;
export const topicInput = z.object({ name: name(80), subjectId: z.uuid(), gradeId: z.uuid() });
