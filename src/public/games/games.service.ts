import { Injectable } from '@nestjs/common';
import {
  GameStatisticView,
  GameViewDTO,
  QueryGamesDTO,
} from './applications/games.dto';
import { Result, ResultCode } from '../../helpers/contract';
import { Games } from './applications/games.entity';
import { Answers } from './applications/answers.entity';
import { GamesRepository } from './games.repository';
import { Paginated } from '../../helpers/paginated';

@Injectable()
export class GamesService {
  constructor(protected gamesRepository: GamesRepository) {}

  async findAllCurrentUserGames(
    queryData: QueryGamesDTO,
    userId: string,
  ): Promise<Result<Paginated<GameViewDTO[]>>> {
    const totalCount = await this.gamesRepository.totalCountCurrentUserGames(
      queryData,
      userId,
    );
    const allCurrentUserGames =
      await this.gamesRepository.findAllCurrentUserGames(queryData, userId);
    try {
      const paginatedGames = await Paginated.getPaginated<GameViewDTO[]>({
        pageNumber: queryData.pageNumber,
        pageSize: queryData.pageSize,
        totalCount: totalCount,
        items: await Promise.all(
          allCurrentUserGames.map(async (g) => await this.createGameView(g)),
        ),
      });
      return new Result<Paginated<GameViewDTO[]>>(
        ResultCode.Success,
        paginatedGames,
        null,
      );
    } catch (e) {
      console.log(e.message);
      console.log('catch in the all games for current user pagination');
    }
  }

  async findCurrentUserGamesStatistic(
    userId: string,
  ): Promise<Result<GameStatisticView>> {
    const allUserGames: Games[] =
      await this.gamesRepository.findAllCurrentUserGamesForStat(userId);
    const gamesStatistic = {
      sumScore: 0,
      avgScores: 0,
      gamesCount: allUserGames.length,
      winsCount: 0,
      lossesCount: 0,
      drawsCount: 0,
    };
    allUserGames.forEach((g) => {
      const isFirstPlayer = g.firstPlayerId === userId;
      if (isFirstPlayer) {
        gamesStatistic.sumScore += g.firstPlayerScore;
        if (g.winner === 1) {
          gamesStatistic.winsCount += 1;
        } else if (g.winner === 2) {
          gamesStatistic.lossesCount += 1;
        } else {
          gamesStatistic.drawsCount += 1;
        }
      } else {
        gamesStatistic.sumScore += g.secondPlayerScore;
        if (g.winner === 2) {
          gamesStatistic.winsCount += 1;
        } else if (g.winner === 1) {
          gamesStatistic.lossesCount += 1;
        } else {
          gamesStatistic.drawsCount += 1;
        }
      }
    });
    gamesStatistic.avgScores =
      gamesStatistic.sumScore % gamesStatistic.gamesCount === 0
        ? gamesStatistic.sumScore / gamesStatistic.gamesCount
        : parseFloat(
            (gamesStatistic.sumScore / gamesStatistic.gamesCount).toFixed(2),
          );
    return new Result<GameStatisticView>(
      ResultCode.Success,
      gamesStatistic,
      null,
    );
  }

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
          addedAt: af.addedAt,
          answerStatus: af.answerStatus,
          questionId: af.questionId,
        })),
        player: {
          id: game.firstPlayerId,
          login: game.firstPlayerLogin,
        },
        score: game.firstPlayerScore,
      },
      secondPlayerProgress:
        game.status === 'PendingSecondPlayer'
          ? null
          : {
              answers: secondPlayerAnswers.map((as) => ({
                addedAt: as.addedAt,
                answerStatus: as.answerStatus,
                questionId: as.questionId,
              })),
              player: {
                id: game.secondPlayerId,
                login: game.secondPlayerLogin,
              },
              score: game.secondPlayerScore,
            },
      questions:
        game.status === 'PendingSecondPlayer'
          ? null
          : game.questionsId.map((qi) => {
              const question = game.questions.find((q) => q.id === qi);
              return {
                id: question.id,
                body: question.body,
              };
            }),
      status: game.status,
      pairCreatedDate: new Date(game.pairCreatedDate).toISOString(),
      startGameDate: game.startGameDate
        ? new Date(game.startGameDate).toISOString()
        : null,
      finishGameDate: game.finishGameDate
        ? new Date(game.finishGameDate).toISOString()
        : null,
    };
  }
}
