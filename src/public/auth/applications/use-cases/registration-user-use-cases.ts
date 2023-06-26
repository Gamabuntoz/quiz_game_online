import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InputRegistrationDTO } from '../auth.dto';
import { EmailAdapter } from '../../../../adapters/email-adapter/email.adapter';
import { AuthRepository } from '../../auth.repository';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import add from 'date-fns/add';
import { UserInfoDTO } from '../users.dto';
import { Result, ResultCode } from '../../../../helpers/contract';
import { Users } from '../../../../super_admin/sa_users/applications/users.entity';
import { GamesRepository } from '../../../games/games.repository';
import { Statistics } from '../../../games/applications/statistics.entity';

export class RegistrationUserCommand {
  constructor(public inputData: InputRegistrationDTO) {}
}

@CommandHandler(RegistrationUserCommand)
export class RegistrationUserUseCases
  implements ICommandHandler<RegistrationUserCommand>
{
  constructor(
    private authRepository: AuthRepository,
    private emailAdapter: EmailAdapter,
    private gamesRepository: GamesRepository,
  ) {}

  async execute(command: RegistrationUserCommand): Promise<Result<boolean>> {
    await this.createUser(command.inputData);
    const user: Users = await this.authRepository.findUserByLoginOrEmail(
      command.inputData.login,
    );
    await this.emailAdapter.sendEmail(user.email, user.emailConfirmationCode);
    return new Result<boolean>(ResultCode.Success, true, null);
  }

  private async _generateHash(password: string, salt: string) {
    return await bcrypt.hash(password, salt);
  }

  private async createUser(
    inputData: InputRegistrationDTO,
  ): Promise<UserInfoDTO> {
    const passwordSalt = await bcrypt.genSalt(10);
    const passwordHash = await this._generateHash(
      inputData.password,
      passwordSalt,
    );
    const newUser: Users = {
      id: uuidv4(),
      login: inputData.login,
      email: inputData.email,
      passwordHash: passwordHash,
      createdAt: new Date().toISOString(),
      emailConfirmationCode: uuidv4(),
      emailIsConfirmed: false,
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
    await this.authRepository.createUser(newUser);
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
    return new UserInfoDTO(
      newUser.id,
      newUser.login,
      newUser.email,
      newUser.createdAt,
    );
  }
}
