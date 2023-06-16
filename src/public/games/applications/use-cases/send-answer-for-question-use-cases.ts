import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GamesRepository } from '../../games.repository';
import { AnswerViewDTO, InputAnswerDTO } from '../games.dto';
import { Result, ResultCode } from '../../../../helpers/contract';
import { Answers } from '../answers.entity';
import { v4 as uuidv4 } from 'uuid';

export class SendAnswerCommand {
  constructor(public inputData: InputAnswerDTO, public userId: string) {}
}

@CommandHandler(SendAnswerCommand)
export class SendAnswerUseCases implements ICommandHandler<SendAnswerCommand> {
  constructor(private gamesRepository: GamesRepository) {}

  async execute(command: SendAnswerCommand): Promise<Result<AnswerViewDTO>> {
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
      await this.gamesRepository.findPlayerGameAnswers(game.id, command.userId);
    if (playerAnswers.length >= 5)
      return new Result<AnswerViewDTO>(
        ResultCode.Forbidden,
        null,
        'User already answered to all questions',
      );
    const currentQuestion = game.questions[playerAnswers.length];
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
    if (
      playerAnswers.length + 1 === 5 &&
      secondPlayerAnswers.length < 5 &&
      isFirstPlayer
        ? game.firstPlayerScore > 0
        : game.secondPlayerScore > 0
    ) {
      isFirstPlayer
        ? (game.firstPlayerScore += 1)
        : (game.secondPlayerScore += 1);
    }
    if (playerAnswers.length + 1 + secondPlayerAnswers.length === 10) {
      game.status = 'Finished';
      game.finishGameDate = new Date().toISOString();
    }
    await this.gamesRepository.updateGame(game);
    const viewAnswer: AnswerViewDTO = {
      questionId: currentQuestion.id,
      answerStatus: newAnswer.answerStatus,
      addedAt: newAnswer.addedAt,
    };
    return new Result<AnswerViewDTO>(ResultCode.Success, viewAnswer, null);
  }
}