import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GamesRepository } from '../../games.repository';
import { Result, ResultCode } from '../../../../helpers/contract';
import { GameViewDTO } from '../games.dto';
import { AuthRepository } from '../../../auth/auth.repository';
import { Users } from '../../../../super_admin/sa_users/applications/users.entity';
import { Games } from '../games.entity';
import { GamesService } from '../../games.service';
import { v4 as uuidv4 } from 'uuid';

export class StartNewGameCommand {
  constructor(public userId: string) {}
}

@CommandHandler(StartNewGameCommand)
export class StartNewGameUseCases
  implements ICommandHandler<StartNewGameCommand>
{
  constructor(
    private gamesRepository: GamesRepository,
    private usersRepository: AuthRepository,
    private gamesService: GamesService,
  ) {}

  async execute(command: StartNewGameCommand): Promise<Result<GameViewDTO>> {
    const user: Users = await this.usersRepository.findUserById(command.userId);
    const checkUserGame = await this.gamesRepository.findOpenGameByUserId(
      user.id,
    );
    if (checkUserGame && !checkUserGame.finishGameDate)
      return new Result<GameViewDTO>(
        ResultCode.Forbidden,
        null,
        'User already connect to open game',
      );
    const tryJoinToGame = await this.gamesRepository.joinToGameInPending(
      user.id,
      user.login,
    );
    if (tryJoinToGame) {
      const game: Games = await this.gamesRepository.findOpenGameByUserId(
        user.id,
      );
      const currentUserGame = await this.gamesService.createGameView(game);
      return new Result<GameViewDTO>(ResultCode.Success, currentUserGame, null);
    }
    const newGame: Games = {
      id: uuidv4(),
      pairCreatedDate: new Date().toISOString(),
      startGameDate: null,
      finishGameDate: null,
      status: 'PendingSecondPlayer',
      firstPlayerId: user.id,
      firstPlayerLogin: user.login,
      firstPlayerScore: 0,
      secondPlayerId: null,
      secondPlayerLogin: null,
      secondPlayerScore: 0,
      questions: [],
    };
    await this.gamesRepository.createNewGame(newGame);
    const currentUserGame = await this.gamesService.createGameView(newGame);
    return new Result<GameViewDTO>(ResultCode.Success, currentUserGame, null);
  }
}
