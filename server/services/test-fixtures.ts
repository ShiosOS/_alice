/** When true, YouTube/AI services return deterministic fixtures (PR CI integration). */
export function useTestFixtures(): boolean {
  const flag = process.env.NUXT_TEST_FIXTURES
  return flag === '1' || flag === 'true'
}
