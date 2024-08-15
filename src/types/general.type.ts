import { Chat } from '@/entity/Chat'
import { User } from '@/entity/User'

export interface ApiResponse {
  code: number
  message: string
  result: any
}

export interface SocketMessage {
  from: number
  roomRef: string
  payload: {
    message: string
    encoded: boolean
  }
}

export interface PublishPayload {
  recipients: string[]
  roomRef: string
  sender: User
  chat: Chat
}
