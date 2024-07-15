import { WebSocket } from '@fastify/websocket'
import { SocketMessage } from '@/types/general.type'
import { ChatService } from '@/resources/chat.service'
import { formatResponse } from '@/utils/index.util'

export async function handleConnection(socket: WebSocket, req: any) {
  const chatSvc = new ChatService()
  // attach health checker & socket id
  socket.on('connection', async (soc) => {})
  // open connection
  socket.on('message', async (raw: any) => {
    const message: SocketMessage = {
      from: req.user.id,
      roomRef: req.params.ref,
      payload: raw
    }
    // add member to chat room - redis
    try {
      const res = await chatSvc.saveMessage(message)
      // broadcast to the room, find client by socket
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
  // close broken connection
  socket.on('close', async (soc) => {})
}
