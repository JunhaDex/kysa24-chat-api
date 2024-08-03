import 'reflect-metadata'
import { DataSource } from 'typeorm'
import { StatusUserAct, User, UserDevice } from '@/entity/User'
import { Team } from '@/entity/Team'
import { Chat, ChatRoomView } from '@/entity/Chat'
import { ChatRoom } from '@/entity/ChatRoom'
import { SnakeNamingStrategy } from 'typeorm-naming-strategies'

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_MYSQL_HOST,
  port: Number(process.env.DB_MYSQL_PORT),
  username: process.env.DB_MYSQL_USERNAME,
  password: process.env.DB_MYSQL_PASSWORD,
  database: process.env.DB_MYSQL_DATABASE,
  namingStrategy: new SnakeNamingStrategy(),
  synchronize: false,
  logging: true,
  entities: [User, UserDevice, StatusUserAct, Team, Chat, ChatRoom, ChatRoomView]
})

export const RedisSource = {
  host: process.env.CACHE_REDIS_HOST,
  port: Number(process.env.CACHE_REDIS_PORT),
  password: process.env.CACHE_REDIS_PASSWORD
} as const
