import { FastifyReply, FastifyRequest } from 'fastify'
import { formatResponse } from '@/utils/index.util'
import { UserService } from '@/resources/user.service'
import { User } from '@/entity/User'

export async function authUser(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const [type, token] = request.headers['authorization']?.split(' ') ?? []
  if (type === 'Bearer' && token) {
    try {
      const user = await verifyToken(request, token)
      if (user) {
        request.user = user
        return
      }
    } catch (error) {
      return reply.status(401).send(formatResponse(401, 'Unauthorized'))
    }
  }
  return reply.status(403).send(formatResponse(403, 'Forbidden'))
}

export async function authUserSocket(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const token = request.headers['sec-websocket-protocol']
  if (token) {
    try {
      const user = await verifyToken(request, token)
      if (user) {
        request.user = user
        console.log(':::::: done!')
        return
      }
    } catch (error) {
      return reply.status(401).send(formatResponse(401, 'Unauthorized'))
    }
  }
  return reply.status(403).send(formatResponse(403, 'Forbidden'))
}

async function verifyToken(request: FastifyRequest, token: string): Promise<User> {
  const decoded = request.jwt.verify(token)
  if (decoded) {
    const ref = (decoded as any).sub
    const userSvc = new UserService()
    const user = await userSvc.findUserByRef(ref)
    if (user) {
      return user
    }
  }
}
