import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm'
import { ChatRoom } from '@/entity/ChatRoom'

@Entity('chat')
export class Chat {
  @PrimaryGeneratedColumn()
  id: number
  @Column()
  roomId: number
  @Column()
  sender: number
  @Column()
  message: string
  @Column({ default: false })
  encoded: boolean
  @Column({ nullable: true })
  createdAt: Date
  @Column({ nullable: true })
  updatedAt: Date
  @ManyToOne(() => ChatRoom)
  @JoinColumn({ name: 'room_id' })
  room: ChatRoom
}

@Entity('chat_room_view')
export class ChatRoomView {
  @PrimaryGeneratedColumn()
  id: number
  @Column()
  roomId: number
  @Column()
  userId: number
  @Column()
  title: string
  @Column()
  isBlock: boolean
  @Column()
  lastRead: number
  @Column({ nullable: true })
  createdAt: Date
  @Column({ nullable: true })
  updatedAt: Date
  @OneToOne(() => ChatRoom)
  @JoinColumn({ name: 'room_id' })
  room: ChatRoom
}
