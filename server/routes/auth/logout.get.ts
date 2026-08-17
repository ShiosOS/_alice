export default defineEventHandler(async (event) => {
  await clearUserSession(event as never)
  return sendRedirect(event, '/')
})
