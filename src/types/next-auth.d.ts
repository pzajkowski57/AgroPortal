import type { Role } from './index'
import 'next-auth'
import 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: Role
      email: string
      name?: string | null
      image?: string | null
    }
  }

  interface User {
    role: Role
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: Role
  }
}
