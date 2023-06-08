import { Injectable } from '@nestjs/common';
import { Users } from './applications/users.entity';
import { InputBanUserDTO, QueryUsersDTO } from './applications/sa-users.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class SAUsersRepository {
  constructor(
    @InjectRepository(Users)
    private readonly dbUsersRepository: Repository<Users>,
  ) {}

  async findAllUsers(queryData: QueryUsersDTO) {
    let sortBy = 'createdAt';
    if (queryData.sortBy) {
      sortBy = queryData.sortBy;
    }
    const direction = queryData.sortDirection.toUpperCase();
    try {
      const queryBuilder = await this.dbUsersRepository.createQueryBuilder('u');
      if (queryData.banStatus && queryData.banStatus !== 'all') {
        const status = queryData.banStatus === 'banned';
        queryBuilder.where({ userIsBanned: status });
      }
      if (queryData.searchEmailTerm || queryData.searchLoginTerm) {
        queryBuilder.andWhere(
          "email ILIKE '%' || :emailTerm || '%' OR login ILIKE '%' || :loginTerm || '%'",
          {
            emailTerm: queryData.searchEmailTerm,
            loginTerm: queryData.searchLoginTerm,
          },
        );
      }
      queryBuilder
        .orderBy(`u.${sortBy}`, (direction as 'ASC') || 'DESC')
        .limit(queryData.pageSize)
        .offset((queryData.pageNumber - 1) * queryData.pageSize);
      return queryBuilder.getMany();
    } catch (e) {
      console.log(e.message);
      console.log('catch in the find all users');
    }
  }

  async totalCountUsers(queryData: QueryUsersDTO) {
    try {
      const queryBuilder = await this.dbUsersRepository.createQueryBuilder('u');
      if (queryData.banStatus && queryData.banStatus !== 'all') {
        const status = queryData.banStatus === 'banned';
        queryBuilder.where({ userIsBanned: status });
      }
      if (queryData.searchEmailTerm || queryData.searchLoginTerm) {
        queryBuilder.andWhere(
          "email ILIKE '%' || :emailTerm || '%' OR login ILIKE '%' || :loginTerm || '%'",
          {
            emailTerm: queryData.searchEmailTerm,
            loginTerm: queryData.searchLoginTerm,
          },
        );
      }
      return queryBuilder.getCount();
    } catch (e) {
      console.log(e.message);
      console.log('catch in the total count users');
    }
  }

  async createUser(newUser: Users) {
    await this.dbUsersRepository.insert(newUser);
    return newUser;
  }

  async findUserById(id: string) {
    return this.dbUsersRepository.findOne({ where: { id: id } });
  }

  async updateUserBanStatus(
    userId: string,
    inputData: InputBanUserDTO,
  ): Promise<boolean> {
    const result = await this.dbUsersRepository.update(
      { id: userId },
      {
        userIsBanned: inputData.isBanned,
        userBanReason: inputData.isBanned ? inputData.banReason : null,
        userBanDate: inputData.isBanned ? new Date().toISOString() : null,
      },
    );
    return result.affected === 1;
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await this.dbUsersRepository.delete({ id: id });
    return result.affected === 1;
  }
}
