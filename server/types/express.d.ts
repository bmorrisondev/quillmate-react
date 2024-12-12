declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number
        email: string
        name: string | null
      }
      session?: {
        id: number
        token: string
      }
    }
  }
}

export {}
