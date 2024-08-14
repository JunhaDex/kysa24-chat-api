import { In, Raw, Repository } from 'typeorm'
import { FastifyRedis } from '@fastify/redis'
import { v4 as uuidv4 } from 'uuid'
import { PublishPayload, SocketMessage } from '@/types/general.type'
import { Chat, ChatRoomView } from '@/entity/Chat'
import { AppDataSource } from '@/data-source'
import { ChatRoom } from '@/entity/ChatRoom'
import { User, UserDevice } from '@/entity/User'
import { getFirebase, sendTargetDevice } from '@/providers/firebase.provider'

export class ChatService {
  static CHAT_SERVICE_EXCEPTIONS = {
    ROOM_NOT_FOUND: 'ROOM_NOT_FOUND',
    INVALID_USER: 'INVALID_USER'
  } as const
  private chatRepo: Repository<Chat>
  private roomRepo: Repository<ChatRoom>
  private viewRepo: Repository<ChatRoomView>
  private userRepo: Repository<User>
  private deviceRepo: Repository<UserDevice>
  private redisConn: FastifyRedis
  private readonly Exception = ChatService.CHAT_SERVICE_EXCEPTIONS
  private fbToken: {
    token: string
    expireAt: Date
  }

  constructor(redis: FastifyRedis) {
    this.chatRepo = AppDataSource.getRepository('Chat')
    this.roomRepo = AppDataSource.getRepository('ChatRoom')
    this.viewRepo = AppDataSource.getRepository('ChatRoomView')
    this.userRepo = AppDataSource.getRepository('User')
    this.deviceRepo = AppDataSource.getRepository('UserDevice')
    this.redisConn = redis
  }

  async saveMessage(message: SocketMessage): Promise<Chat> {
    const room = await this.roomRepo.findOneBy({ ref: message.roomRef })
    if (room) {
      const chat = new Chat()
      chat.roomId = room.id
      chat.sender = message.from
      chat.message = message.payload.message
      chat.encoded = message.payload.encoded
      chat.createdAt = new Date()
      return await this.chatRepo.save(chat)
    }
    throw new Error(this.Exception.ROOM_NOT_FOUND)
  }

  async getRoomByRef(ref: string): Promise<ChatRoom> {
    return await this.roomRepo.findOneBy({ ref })
  }

  async getOrGenRoom(sender: number, receiver: number): Promise<ChatRoom> {
    const senderExist = await this.userRepo.findOneBy({ id: sender })
    const receiverExist = await this.userRepo.findOneBy({ id: receiver })
    if (sender !== receiver && senderExist && receiverExist) {
      const sorted = [sender, receiver].sort()
      const users = await this.userRepo.findBy({ id: In(sorted) })
      const titleWithNick = (except: number) => {
        return users
          .filter((u) => u.id !== except)
          .map((u) => u.nickname)
          .join(', ')
      }
      const room = await this.roomRepo.findOne({
        where: { members: Raw(`json_array(${sorted.join(',')})`) }
      })
      if (room) {
        return room
      } else {
        const newRoom = this.roomRepo.create()
        newRoom.ref = uuidv4()
        newRoom.members = sorted
        const views = sorted.map((id) => {
          const view = this.viewRepo.create()
          view.userId = id
          view.title = titleWithNick(id)
          view.isBlock = false
          view.lastRead = 0
          return view
        })
        const queryRunner = AppDataSource.createQueryRunner()
        await queryRunner.connect()
        await queryRunner.startTransaction()
        try {
          await queryRunner.manager.save(newRoom)
          await queryRunner.manager.save(
            views.map((v) => {
              v.roomId = newRoom.id
              return v
            })
          )
          await queryRunner.commitTransaction()
        } catch (err) {
          await queryRunner.rollbackTransaction()
        } finally {
          await queryRunner.release()
        }
        return await this.roomRepo.findOneBy({ id: newRoom.id })
      }
    }
    throw new Error(this.Exception.INVALID_USER)
  }

  async pushOnline(params: { roomRef: string; socketId: string }) {
    await this.redisConn.sadd(params.roomRef, params.socketId)
  }

  async popOnline(params: { roomRef: string; socketId: string }) {
    await this.redisConn.srem(params.roomRef, params.socketId)
  }

  async publishMessage(payload: PublishPayload, pushTarget: User[]) {
    const fbt = await this.setFBToken()
    const message = JSON.stringify(payload)
    await this.redisConn.publish('live-chat', message)
    // send fcm (Chat is push only, no notification)
    for (const user of pushTarget) {
      const devices = await this.deviceRepo.find({ where: { userId: user.id }, take: 3 })
      const isOnline = await this.redisConn.smembers(payload.roomRef)
      if (!isOnline.includes(user.ref)) {
        await Promise.all(
          devices.map(
            async (d) =>
              await sendTargetDevice(d.fcm, fbt.token, {
                roomRef: payload.roomRef
              }).catch((e) => console.error(e))
          )
        )
      }
    }
  }

  private async setFBToken() {
    if (!this.fbToken || this.fbToken.expireAt < new Date()) {
      const fb = await getFirebase()
      // expire in 10 min
      this.fbToken = {
        token: fb.token,
        expireAt: new Date(Date.now() + 600 * 1000)
      }
      return this.fbToken
    }
    return this.fbToken
  }
}
