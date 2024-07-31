import { FastifyInstance } from 'fastify'
import { createRoomIfNotExist, handleConnection } from '@/controllers/chat.controller'
import { User } from '@/entity/User'

export default function (fastify: FastifyInstance, opts, done) {
  /**
   * @param ref: recipient ref (user)
   */
  fastify.get('/:ref', { websocket: true }, handleConnection)
  fastify.get(
    '/tester',
    { websocket: true, preHandler: [fastify.authUserSocket] },
    (socket, req) => {
      const protocolHeader = req.headers['sec-websocket-protocol']
      console.log('protocolHeader ::::::::: ')
      console.log(protocolHeader)
      socket.send('tester connected')
      console.log('userRef:', (req.user as User).ref)
    }
  )

  /**
   * Check room exist
   * @param ref: recipient ref (user)
   */
  fastify.post('/open/:ref', { preHandler: [fastify.authUser] }, createRoomIfNotExist)
  done()
}
