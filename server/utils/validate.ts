import type { z } from 'zod'

export async function readZodBody<T>(event: Parameters<typeof readValidatedBody>[0], schema: z.ZodType<T>) {
  return readValidatedBody(event, (data) => {
    const parsed = schema.safeParse(data)
    if (!parsed.success) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid body' })
    }
    return parsed.data
  })
}
