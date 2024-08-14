import { FastifyInstance } from 'fastify'
import { WebSocket } from '@fastify/websocket'
import { FastifyRedis } from '@fastify/redis'

export function addHeartbeat(fastify: FastifyInstance, opts, done) {
  const wss = fastify.websocketServer
  const interval = setInterval(() => {
    fastify.log.info('Ping all clients...')
    for (const client of wss.clients as Set<WebSocket>) {
      client.isAlive = false
      client.ping()
    }
  }, 60000) // 1 minute
  fastify.log.info('Heartbeat interval has set to 1 minute')
  wss.on('close', () => {
    fastify.log.info('Server closed, clear heartbeat')
    clearInterval(interval)
  })
  done()
}

export function subscribeLiveChat(fastify: FastifyInstance, opts, done) {
  const redis = fastify.redis.subscriber as FastifyRedis
  const rCli = fastify.redis.publisher as FastifyRedis
  const wss = fastify.websocketServer
  redis.subscribe('live-chat', (err) => {
    if (err) {
      fastify.log.error('failed to subscribe')
      console.error(err)
      throw err
    } else {
      fastify.log.info('Subscribed to live-chat channel')
    }
  })
  redis.on('message', async (channel, message) => {
    const decoded = JSON.parse(message) as any
    const online = await rCli.smembers(decoded.roomRef)
    for (const socket of wss.clients as Set<WebSocket>) {
      if (online.includes(socket.id) && socket.readyState === 1) {
        socket.send(JSON.stringify(decoded.chat))
      }
    }
  })
  done()
}
