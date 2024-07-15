import 'dotenv/config'
import fastify from 'fastify'
import ws from '@fastify/websocket'
import jwt from '@fastify/jwt'
import { AppDataSource } from '@/data-source'

// Initialize & Plugins
const server = fastify()
server.register(ws)
server.register(jwt, {secret: process.env.JWT_SECRET_HASH})

// Routers

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
      console.log(`Server listening at ${address}`)
    })
  })
  .catch((err) => console.error(err))
