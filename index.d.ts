import { JWT } from '@fastify/jwt'
import { FastifyRedis } from '@fastify/redis'

declare module 'fastify' {
  interface FastifyRequest {
    jwt: JWT
  }

  export interface FastifyInstance {
    authUser: any
    redis: {
      publisher: FastifyRedis
      subscriber: FastifyRedis
    }
  }
}

declare module 'ws' {
  export interface WebSocket {
    isAlive: boolean
    id: string
  }
}
