import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import add from 'date-fns/add';
import { SAUserInfoDTO } from '../sa-users.dto';
import { Result, ResultCode } from '../../../../helpers/contract';
import { SAUsersService } from '../../sa-users.service';
import { SAUsersRepository } from '../../sa-users.repository';
import { InputRegistrationDTO } from '../../../../public/auth/applications/auth.dto';
import { Users } from '../users.entity';
import { GamesRepository } from '../../../../public/games/games.repository';
import { Statistics } from '../../../../public/games/applications/statistics.entity';

export class CreateUserByAdminCommand {
  constructor(public inputData: InputRegistrationDTO) {}
}

@CommandHandler(CreateUserByAdminCommand)
export class CreateUserByAdminUseCases
  implements ICommandHandler<CreateUserByAdminCommand>
{
  constructor(
    private saUsersService: SAUsersService,
    private saUsersRepository: SAUsersRepository,
    private gamesRepository: GamesRepository,
  ) {}

  async execute(
    command: CreateUserByAdminCommand,
  ): Promise<Result<SAUserInfoDTO>> {
    const passwordSalt = await bcrypt.genSalt(10);
    const passwordHash = await this._generateHash(
      command.inputData.password,
      passwordSalt,
    );
    const newUser: Users = {
      id: uuidv4(),
      login: command.inputData.login,
      email: command.inputData.email,
      passwordHash: passwordHash,
      createdAt: new Date().toISOString(),
      emailConfirmationCode: uuidv4(),
      emailIsConfirmed: true,
      emailConfirmExpirationDate: add(new Date(), {
        hours: 1,
      }).toISOString(),
      passwordRecoveryCode: 'string',
      passwordRecoveryExpirationDate: new Date().toISOString(),
      userIsBanned: false,
      userBanReason: null,
      userBanDate: null,
      devices: [],
    };
    await this.saUsersRepository.createUser(newUser);
    const userGamesStat: Statistics = {
      id: uuidv4(),
      sumScore: 0,
      avgScores: 0,
      gamesCount: 0,
      winsCount: 0,
      lossesCount: 0,
      drawsCount: 0,
      user: newUser,
      userId: newUser.id,
      userLogin: newUser.login,
    };
    await this.gamesRepository.createUserGamesStat(userGamesStat);
    const userView = new SAUserInfoDTO(
      newUser.id,
      newUser.login,
      newUser.email,
      newUser.createdAt,
      {
        isBanned: newUser.userIsBanned,
        banDate: null,
        banReason: null,
      },
    );
    return new Result<SAUserInfoDTO>(ResultCode.Success, userView, null);
  }

  private async _generateHash(password: string, salt: string) {
    return await bcrypt.hash(password, salt);
  }
}
