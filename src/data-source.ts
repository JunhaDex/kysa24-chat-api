import 'reflect-metadata'
import { DataSource } from 'typeorm'
import { StatusUserAct, User, UserDevice } from '@/entity/User'
import { Team } from '@/entity/Team'
import { Chat, ChatRoomView } from '@/entity/Chat'
import { ChatRoom } from '@/entity/ChatRoom'

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.MYSQL_HOST,
  port: Number(process.env.DB_MYSQL_PORT),
  username: process.env.DB_MYSQL_USERNAME,
  password: process.env.DB_MYSQL_PASSWORD,
  database: process.env.DB_MYSQL_DATABASE,
  synchronize: false,
  logging: true,
  entities: [User, UserDevice, StatusUserAct, Team, Chat, ChatRoom, ChatRoomView]
})
