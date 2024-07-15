import { FastifyInstance } from 'fastify'

export default function (fastify: FastifyInstance, opts, done) {
  const wss = fastify.websocketServer
  const interval = setInterval(() => {
    for (const client of wss.clients) {
      // set alive to false
      client.ping()
    }
  }, 60000) // 1 minute
  wss.on('close', () => {
    clearInterval(interval)
  })
  done()
}
