import 'dotenv/config'
import fastify, { FastifyRequest } from 'fastify'
import cors from '@fastify/cors'
import ws from '@fastify/websocket'
import jwt from '@fastify/jwt'
import rds from '@fastify/redis'
import { AppDataSource, RedisSource } from '@/data-source'
import routes from '@/routes/index.route'
import { addHeartbeat, subscribeLiveChat } from '@/plugins/wss.plugin'

// Initialize & Plugins & Routes
const server = fastify({ logger: false, pluginTimeout: 30000 })
server.register(cors, {
  origin: '*',
  credentials: true
})
server.register(ws)
server.register(jwt, { secret: process.env.JWT_SECRET_HASH })
server
  .register(rds, { ...RedisSource, namespace: 'publisher' })
  .register(rds, { ...RedisSource, namespace: 'subscriber' })
server.register(routes)
server.register(addHeartbeat)
server.register(subscribeLiveChat)

server.addHook('preHandler', (request: FastifyRequest, reply: any, next) => {
  request.jwt = server.jwt
  return next()
})

server.get('/healthz', (request, reply) => {
  return reply.send({ message: 'healthy!' })
})

// Start on 3002
AppDataSource.initialize()
  .then(async () => {
    server.listen({ port: 3002, host: '0.0.0.0' }, (err, address) => {
      if (err) {
        console.error(err)
        process.exit(1)
      }
      server.log.info(`Server listening at ${address}`)
      server.log.info(`Timezone: ${process.env.TZ}`)
      server.log.info(`Server started at ${new Date().toString()}`)
    })
  })
  .catch((err) => console.error(err))
