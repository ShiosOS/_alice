declare module '#auth-utils' {
  interface User {
    id: string
    email: string
    name?: string | null
    image?: string | null
    termsAccepted: boolean
  }

  interface UserSession {
    loggedInAt?: string
  }
}

export {}
