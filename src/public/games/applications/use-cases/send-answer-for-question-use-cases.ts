import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GamesRepository } from '../../games.repository';
import { AnswerViewDTO, InputAnswerDTO } from '../games.dto';
import { Result, ResultCode } from '../../../../helpers/contract';
import { Answers } from '../answers.entity';
import { v4 as uuidv4 } from 'uuid';
import { UnauthorizedException } from '@nestjs/common';
import { Games } from '../games.entity';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';

export class SendAnswerCommand {
  constructor(public inputData: InputAnswerDTO, public userId: string) {}
}

@CommandHandler(SendAnswerCommand)
export class SendAnswerUseCases implements ICommandHandler<SendAnswerCommand> {
  constructor(
    private gamesRepository: GamesRepository,
    private schedulerRegistry: SchedulerRegistry,
  ) {}

  async execute(command: SendAnswerCommand): Promise<Result<AnswerViewDTO>> {
    try {
      const game = await this.gamesRepository.findActiveGameByUserId(
        command.userId,
      );
      if (!game)
        return new Result<AnswerViewDTO>(
          ResultCode.Forbidden,
          null,
          'User dont have open game',
        );
      const isFirstPlayer = game.firstPlayerId === command.userId;
      const playerAnswers: Answers[] =
        await this.gamesRepository.findPlayerGameAnswers(
          game.id,
          command.userId,
        );
      if (playerAnswers.length >= 5)
        return new Result<AnswerViewDTO>(
          ResultCode.Forbidden,
          null,
          'User already answered to all questions',
        );
      const currentQuestion = game.questions.find(
        (q) => q.id === game.questionsId[playerAnswers.length],
      );
      const newAnswer: Answers = {
        id: uuidv4(),
        questionId: currentQuestion.id,
        answerStatus: 'Incorrect',
        addedAt: new Date().toISOString(),
        gameId: game.id,
        userId: command.userId,
      };
      if (currentQuestion.correctAnswers.includes(command.inputData.answer)) {
        newAnswer.answerStatus = 'Correct';
        isFirstPlayer
          ? (game.firstPlayerScore += 1)
          : (game.secondPlayerScore += 1);
      }
      await this.gamesRepository.saveAnswer(newAnswer);
      const secondPlayerAnswers =
        await this.gamesRepository.findPlayerGameAnswers(
          game.id,
          isFirstPlayer ? game.secondPlayerId : game.firstPlayerId,
        );
      if (playerAnswers.length + 1 === 5 && secondPlayerAnswers.length < 5) {
        game.timerForEndGame = new Date().getTime();
      }
      if (playerAnswers.length + 1 + secondPlayerAnswers.length === 10) {
        game.status = 'Finished';
        game.finishGameDate = new Date();
        if (
          isFirstPlayer ? game.secondPlayerScore > 0 : game.firstPlayerScore > 0
        ) {
          isFirstPlayer
            ? (game.secondPlayerScore += 1)
            : (game.firstPlayerScore += 1);
        }
        if (game.firstPlayerScore > game.secondPlayerScore) {
          game.winner = 1;
        }
        if (game.firstPlayerScore < game.secondPlayerScore) {
          game.winner = 2;
        }
        await this.updateGamesUserStat(true, game);
        await this.updateGamesUserStat(false, game);
      }
      await this.gamesRepository.updateGame(game);
      const viewAnswer: AnswerViewDTO = {
        questionId: currentQuestion.id,
        answerStatus: newAnswer.answerStatus,
        addedAt: newAnswer.addedAt,
      };
      return new Result<AnswerViewDTO>(ResultCode.Success, viewAnswer, null);
    } catch (e) {
      console.log(e);
      throw new UnauthorizedException();
    }
  }

  @Cron(CronExpression.EVERY_SECOND, { name: 'finishGameByTimer' })
  async finishGameByTimer() {
    const game = await this.gamesRepository.findActiveGameByTimer();
    if (!game) {
      return true;
    }
    if (new Date().getTime() - game.timerForEndGame > 9000) {
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
      let isFirstPlayer = firstPlayerAnswers.length === 5;
      if (firstPlayerAnswers.length + secondPlayerAnswers.length === 10) {
        isFirstPlayer =
          firstPlayerAnswers[5].addedAt < secondPlayerAnswers[5].addedAt;
      }
      game.status = 'Finished';
      game.finishGameDate = new Date();
      if (
        isFirstPlayer ? game.firstPlayerScore > 0 : game.secondPlayerScore > 0
      ) {
        isFirstPlayer
          ? (game.firstPlayerScore += 1)
          : (game.secondPlayerScore += 1);
      }
    }
    if (game.firstPlayerScore > game.secondPlayerScore) {
      game.winner = 1;
    }
    if (game.firstPlayerScore < game.secondPlayerScore) {
      game.winner = 2;
    }
    await this.updateGamesUserStat(true, game);
    await this.updateGamesUserStat(false, game);
    await this.gamesRepository.updateGame(game);
  }

  private async updateGamesUserStat(isFirstPlayer: boolean, game: Games) {
    const userId = isFirstPlayer ? game.firstPlayerId : game.secondPlayerId;
    const gamesStatistic = await this.gamesRepository.findGamesUserStat(userId);
    gamesStatistic.sumScore =
      +gamesStatistic.sumScore +
      (isFirstPlayer ? game.firstPlayerScore : game.secondPlayerScore);
    if (
      (game.winner === 1 && isFirstPlayer) ||
      (game.winner === 2 && !isFirstPlayer)
    ) {
      gamesStatistic.winsCount = +gamesStatistic.winsCount + 1;
    } else if (
      (game.winner === 2 && isFirstPlayer) ||
      (game.winner === 1 && !isFirstPlayer)
    ) {
      gamesStatistic.lossesCount = +gamesStatistic.lossesCount + 1;
    } else {
      gamesStatistic.drawsCount = +gamesStatistic.drawsCount + 1;
    }
    gamesStatistic.avgScores =
      gamesStatistic.sumScore % gamesStatistic.gamesCount === 0
        ? gamesStatistic.sumScore / gamesStatistic.gamesCount
        : parseFloat(
            (gamesStatistic.sumScore / gamesStatistic.gamesCount).toFixed(2),
          );
    await this.gamesRepository.saveGamesUserStat(gamesStatistic);
    return true;
  }
}
