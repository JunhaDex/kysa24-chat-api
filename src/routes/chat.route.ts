import { FastifyInstance } from 'fastify'

export default function (fastify: FastifyInstance, opts, done) {
  fastify.get('/', { preHandler: [fastify.authUser] }, async (request, reply) => {
    return { hello: 'world' }
  })

  done()
}
