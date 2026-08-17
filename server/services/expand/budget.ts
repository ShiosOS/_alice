import { and, count, eq, gte } from 'drizzle-orm'
import { expandLedger, useDb } from '../../db'
import {
  ErrorMessage,
  serviceUnavailable,
  tooManyRequests,
} from '../../utils/errors'
import { DEFAULT_EXPAND_DAILY_BUDGET } from './constants'

function expandDisabled() {
  const config = useRuntimeConfig()
  return config.expandDisabled === true || process.env.NUXT_EXPAND_DISABLED === 'true'
}

function dailyBudget() {
  const config = useRuntimeConfig()
  const n = Number(
    config.expandDailyBudget
    || process.env.NUXT_EXPAND_DAILY_BUDGET
    || DEFAULT_EXPAND_DAILY_BUDGET,
  )
  return Number.isFinite(n) ? n : DEFAULT_EXPAND_DAILY_BUDGET
}

export async function assertExpandBudget(userId: string) {
  if (expandDisabled()) {
    throw serviceUnavailable(ErrorMessage.expandDisabled)
  }
  const db = useDb()
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const [row] = await db
    .select({ c: count() })
    .from(expandLedger)
    .where(and(eq(expandLedger.userId, userId), gte(expandLedger.createdAt, since)))
  const used = Number(row?.c || 0)
  if (used >= dailyBudget()) {
    throw tooManyRequests(ErrorMessage.expandBudgetExhausted)
  }
}
