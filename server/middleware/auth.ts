import { Request, Response, NextFunction } from 'express'
import { prisma } from '../db/prisma'

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies.session

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true }
    })

    if (!session) {
      res.clearCookie('session')
      return res.status(401).json({ error: 'Invalid session' })
    }

    if (session.expiresAt < new Date()) {
      await prisma.session.delete({ where: { id: session.id } })
      res.clearCookie('session')
      return res.status(401).json({ error: 'Session expired' })
    }

    req.user = {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name
    }

    req.session = {
      id: session.id,
      token: session.token
    }

    next()
  } catch (error) {
    console.error('Auth middleware error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
