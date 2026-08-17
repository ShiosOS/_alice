import { initSentry } from '../utils/sentry'

export default defineNitroPlugin(() => {
  initSentry()
})
