export default defineEventHandler(async (event) => {
  await dropSession(event)
  return redirect(event, '/')
})
