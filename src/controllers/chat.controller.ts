import { WebSocket } from '@fastify/websocket'
import { ChatService } from '@/resources/chat.service'
import { formatResponse } from '@/utils/index.util'
import { FastifyReply, FastifyRequest } from 'fastify'
import { User } from '@/entity/User'
import { FastifyRedis } from '@fastify/redis'
import { UserService } from '@/resources/user.service'

export async function handleConnection(socket: WebSocket, req: FastifyRequest) {
  const redis = req.server.redis.publisher as FastifyRedis
  const chatSvc = new ChatService(redis)
  const userSvc = new UserService()
  // first connection
  if (socket.id === undefined) {
    socket.id = (req.user as User).ref
    socket.send(JSON.stringify(formatResponse(200, 'Connection established')))
    await chatSvc.pushOnline({ roomRef: (req.params as any).ref, socketId: socket.id })
  }
  // heartbeat
  socket.on('pong', () => {
    socket.isAlive = true
  })
  // handle message
  socket.on('message', async (raw: { message: string; encoded: boolean }) => {
    // init request data
    const sender = req.user as User
    const room = await chatSvc.getRoomByRef((req.params as any).ref)
    const receiver = await userSvc.findUsers(room.members)
    // add member to chat room - redis
    try {
      const res = await chatSvc.saveMessage({
        from: sender.id,
        roomRef: room.ref,
        payload: JSON.parse(raw.toString())
      })
      await chatSvc.publishMessage(
        {
          recipients: receiver.map((u) => u.ref),
          roomRef: room.ref,
          chat: res
        },
        receiver.filter((u) => u.id !== sender.id)
      )
    } catch (e: any) {
      console.error(e.message)
      if (e.message === ChatService.CHAT_SERVICE_EXCEPTIONS.ROOM_NOT_FOUND) {
        socket.send(JSON.stringify(formatResponse(404, 'Room not found')))
      } else {
        socket.send(JSON.stringify(formatResponse(500, 'Internal server error')))
      }
      socket.close()
    }
  })
  // graceful close
  socket.on('close', async () => {
    await chatSvc.popOnline({ roomRef: (req.params as any).ref, socketId: socket.id })
  })
}

export async function createRoomIfNotExist(req: FastifyRequest, res: FastifyReply) {}
