import { eq } from 'drizzle-orm'
import { useDb, users } from '../../db'

export async function upsertGoogleUser(input: {
  sub: string
  email: string
  name?: string | null
  image?: string | null
}) {
  const db = useDb()
  const existing = await db.query.users.findFirst({
    where: eq(users.googleSub, input.sub),
  })
  if (existing) {
    const [updated] = await db
      .update(users)
      .set({
        email: input.email,
        name: input.name ?? existing.name,
        image: input.image ?? existing.image,
        updatedAt: new Date(),
      })
      .where(eq(users.id, existing.id))
      .returning()
    return updated
  }
  const [created] = await db
    .insert(users)
    .values({
      email: input.email,
      name: input.name,
      image: input.image,
      googleSub: input.sub,
    })
    .returning()
  return created
}

export async function deleteUserAccount(userId: string) {
  const db = useDb()
  await db.delete(users).where(eq(users.id, userId))
}

export async function acceptTerms(userId: string) {
  const db = useDb()
  const [updated] = await db
    .update(users)
    .set({ termsAcceptedAt: new Date(), updatedAt: new Date() })
    .where(eq(users.id, userId))
    .returning()
  return updated
}
