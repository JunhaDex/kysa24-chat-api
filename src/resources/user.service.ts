import { In, Repository } from 'typeorm'
import { User } from '@/entity/User'
import { AppDataSource } from '@/data-source'

export class UserService {
  private userRepo: Repository<User>

  constructor() {
    this.userRepo = AppDataSource.getRepository('User')
  }

  async findUserByRef(ref: string): Promise<User> {
    return await this.userRepo.findOneBy({ ref })
  }

  async findUsers(ids: number[]): Promise<User[]> {
    return await this.userRepo.findBy({ id: In(ids) })
  }
}
