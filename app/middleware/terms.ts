export default defineNuxtRouteMiddleware(() => {
  const { loggedIn, user } = useUserSession()

  if (loggedIn.value && user.value && !user.value.termsAccepted) {
    return navigateTo('/terms-accept')
  }
})
