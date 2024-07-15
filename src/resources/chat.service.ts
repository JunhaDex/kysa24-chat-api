import { Repository } from 'typeorm'
import { Chat } from '@/entity/Chat'
import { AppDataSource } from '@/data-source'
import { ChatRoom } from '@/entity/ChatRoom'
import { SocketMessage } from '@/types/general.type'

export class ChatService {
  static CHAT_SERVICE_EXCEPTIONS = {
    ROOM_NOT_FOUND: 'ROOM_NOT_FOUND',
    INVALID_USER: 'INVALID_USER'
  } as const
  private chatRepo: Repository<Chat>
  private roomRepo: Repository<ChatRoom>
  private readonly Exception = ChatService.CHAT_SERVICE_EXCEPTIONS

  constructor() {
    this.chatRepo = AppDataSource.getRepository('Chat')
    this.roomRepo = AppDataSource.getRepository('ChatRoom')
  }

  async saveMessage(message: SocketMessage): Promise<Chat> {
    const room = await this.roomRepo.findOneBy({ ref: message.roomRef })
    if (room) {
      const chat = new Chat()
      chat.roomId = room.id
      chat.sender = message.from
      chat.message = message.payload.message
      chat.encoded = message.payload.encoded
      return await this.chatRepo.save(chat)
    }
    throw new Error(this.Exception.ROOM_NOT_FOUND)
  }
}
