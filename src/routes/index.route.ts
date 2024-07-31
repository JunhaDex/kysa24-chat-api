import chatRoute from './chat.route'
import { FastifyInstance } from 'fastify'
import { authUser, authUserSocket } from '@/middlewares/auth.middleware'

export default function (fastify: FastifyInstance, opts, done) {
  // middlewares
  fastify.decorate('authUser', authUser)
  fastify.decorate('authUserSocket', authUserSocket)

  // routes by version
  fastify.register(
    (fas: FastifyInstance, opts, done) => {
      fas.register(chatRoute, { prefix: '/chat' })
      done()
    },
    { prefix: '/api/v1' }
  )
  done()
}
