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
    const gameInPending = await this.gamesRepository.joinToGameInPending(
      user.id,
      user.login,
    );
    if (gameInPending) {
      await this.gamesRepository.updateGamesCountUserStat(user.id);
      const currentUserGame = await this.gamesService.createGameView(
        gameInPending as Games,
      );
      return new Result<GameViewDTO>(ResultCode.Success, currentUserGame, null);
    }
    const newGame: Games = {
      id: uuidv4(),
      pairCreatedDate: new Date(),
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
      questionsId: [],
      winner: 0,
      timerForEndGame: null,
    };
    await this.gamesRepository.createNewGame(newGame);
    await this.gamesRepository.updateGamesCountUserStat(user.id);
    const currentUserGame = await this.gamesService.createGameView(newGame);
    return new Result<GameViewDTO>(ResultCode.Success, currentUserGame, null);
  }
}
