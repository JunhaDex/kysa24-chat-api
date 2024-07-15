import { FastifyReply, FastifyRequest } from 'fastify'
import { formatResponse } from '@/utils/index.util'
import { AppDataSource } from '@/data-source'

export async function authUser(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const [type, token] = request.headers['authorization']?.split(' ') ?? []
  if (type === 'Bearer' && token) {
    try {
      const decoded = request.jwt.verify(token)
      if (decoded) {
        const ref = (decoded as any).sub
        const userRepo = AppDataSource.getRepository('User')
        const user = await userRepo.findOneBy({ ref })
        if (user) {
          request.user = user
        }
        return
      }
    } catch (error) {
      return reply.status(401).send(formatResponse(401, 'Unauthorized'))
    }
  }
  return reply.status(403).send(formatResponse(403, 'Forbidden'))
}
