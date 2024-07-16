import { FastifyInstance } from 'fastify'
import { createRoomIfNotExist, handleConnection } from '@/controllers/chat.controller'

export default function (fastify: FastifyInstance, opts, done) {
  /**
   * @param ref: recipient ref (user)
   */
  fastify.get('/:ref', { websocket: true, preHandler: [fastify.authUser] }, handleConnection)

  /**
   * Check room exist
   * @param ref: recipient ref (user)
   */
  fastify.post('/open/:ref', { preHandler: [fastify.authUser] }, createRoomIfNotExist)
  done()
}
