import { Injectable } from '@nestjs/common';
import { GameViewDTO } from './applications/games.dto';
import { Result, ResultCode } from '../../helpers/contract';
import { Games } from './applications/games.entity';
import { Answers } from './applications/answers.entity';
import { GamesRepository } from './games.repository';

@Injectable()
export class GamesService {
  constructor(protected gamesRepository: GamesRepository) {}

  async findCurrentUserGame(
    currentUserId: string,
  ): Promise<Result<GameViewDTO>> {
    const game: Games = await this.gamesRepository.findOpenGameByUserId(
      currentUserId,
    );
    if (!game || game.finishGameDate)
      return new Result<GameViewDTO>(
        ResultCode.NotFound,
        null,
        'Active game not found',
      );
    const currentUserGame = await this.createGameView(game);
    return new Result<GameViewDTO>(ResultCode.Success, currentUserGame, null);
  }

  async findGameById(
    gameId: string,
    currentUserId: string,
  ): Promise<Result<GameViewDTO>> {
    const game: Games = await this.gamesRepository.findGameById(gameId);
    if (!game)
      return new Result<GameViewDTO>(
        ResultCode.NotFound,
        null,
        'Game not found',
      );
    if (
      currentUserId !== game.firstPlayerId &&
      currentUserId !== game.secondPlayerId
    )
      return new Result<GameViewDTO>(
        ResultCode.Forbidden,
        null,
        'Access denied',
      );
    const currentUserGame = await this.createGameView(game);
    return new Result<GameViewDTO>(ResultCode.Success, currentUserGame, null);
  }

  async createGameView(game: Games): Promise<GameViewDTO> {
    const firstPlayerAnswers: Answers[] =
      await this.gamesRepository.findPlayerGameAnswers(
        game.id,
        game.firstPlayerId,
      );
    const secondPlayerAnswers: Answers[] =
      await this.gamesRepository.findPlayerGameAnswers(
        game.id,
        game.secondPlayerId,
      );
    return {
      id: game.id,
      firstPlayerProgress: {
        answers: firstPlayerAnswers.map((af) => ({
          questionId: af.questionId,
          answerStatus: af.answerStatus,
          addedAt: af.addedAt,
        })),
        player: {
          id: game.firstPlayerId,
          login: game.firstPlayerLogin,
        },
        score: +game.firstPlayerScore,
      },
      secondPlayerProgress:
        game.status === 'PendingSecondPlayer'
          ? null
          : {
              answers: secondPlayerAnswers.map((as) => ({
                questionId: as.questionId,
                answerStatus: as.answerStatus,
                addedAt: as.addedAt,
              })),
              player: {
                id: game.secondPlayerId,
                login: game.secondPlayerLogin,
              },
              score: +game.secondPlayerScore,
            },
      questions:
        game.status === 'PendingSecondPlayer'
          ? null
          : game.questions.map((q) => ({
              id: q.id,
              body: q.body,
            })),
      status: game.status,
      pairCreatedDate: game.pairCreatedDate,
      startGameDate: game.startGameDate,
      finishGameDate: game.finishGameDate,
    };
  }
}
