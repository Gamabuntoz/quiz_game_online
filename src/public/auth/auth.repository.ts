import { Injectable } from '@nestjs/common';
import { Users } from '../../super_admin/sa_users/applications/users.entity';
import { v4 as uuidv4 } from 'uuid';
import add from 'date-fns/add';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class AuthRepository {
  constructor(
    @InjectRepository(Users)
    private readonly dbUsersRepository: Repository<Users>,
  ) {}

  async createUser(newUser: Users) {
    await this.dbUsersRepository.insert(newUser);
    return newUser;
  }

  async findUserById(id: string) {
    try {
      return this.dbUsersRepository.findOne({ where: { id: id } });
    } catch (e) {
      console.log(e.message);
      console.log('catch in the findUserById auth');
    }
  }

  async findUserByLoginOrEmail(loginOrEmail: string) {
    const queryBuilder = await this.dbUsersRepository
      .createQueryBuilder('u')
      .where({ login: loginOrEmail })
      .orWhere({ email: loginOrEmail });
    return queryBuilder.getOne();
  }

  async findUserByRecoveryCode(code: string) {
    return this.dbUsersRepository.findOne({
      where: { passwordRecoveryCode: code },
    });
  }

  async findUserByConfirmationCode(code: string) {
    return this.dbUsersRepository.findOne({
      where: { emailConfirmationCode: code },
    });
  }

  async updateConfirmation(id: string) {
    return this.dbUsersRepository.update(
      { id: id },
      {
        emailIsConfirmed: true,
      },
    );
  }

  async setNewConfirmationCode(id: string) {
    const newCode = uuidv4();
    const newDate = add(new Date(), {
      hours: 1,
    });
    return this.dbUsersRepository.update(
      { id: id },
      {
        emailConfirmationCode: newCode,
        emailConfirmExpirationDate: newDate.toISOString(),
      },
    );
  }

  async createPasswordRecoveryCode(id: string) {
    const newCode = uuidv4();
    const newDate = add(new Date(), {
      hours: 1,
    });
    return this.dbUsersRepository.update(
      { id: id },
      {
        passwordRecoveryCode: newCode,
        passwordRecoveryExpirationDate: newDate.toISOString,
      },
    );
  }

  async updatePassword(id: string, passwordHash: string) {
    return this.dbUsersRepository.update(
      { id: id },
      {
        passwordHash: passwordHash,
      },
    );
  }
}
