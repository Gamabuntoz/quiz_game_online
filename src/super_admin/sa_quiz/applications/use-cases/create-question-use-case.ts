import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';
import { InputQuestionDTO, QuestionInfoDTO } from '../sa-questions.dto';
import { Result, ResultCode } from '../../../../helpers/contract';
import { SAQuestionsRepository } from '../../sa-questions.repository';
import { Questions } from '../questions.entity';

export class CreateQuestionCommand {
  constructor(public inputData: InputQuestionDTO) {}
}

@CommandHandler(CreateQuestionCommand)
export class CreateQuestionUseCases
  implements ICommandHandler<CreateQuestionCommand>
{
  constructor(private saQuestionsRepository: SAQuestionsRepository) {}

  async execute(
    command: CreateQuestionCommand,
  ): Promise<Result<QuestionInfoDTO>> {
    const newQuestion: Questions = {
      id: uuidv4(),
      body: command.inputData.body,
      correctAnswers: command.inputData.correctAnswers,
      published: false,
      createdAt: new Date().toISOString(),
      updatedAt: null,
    };
    await this.saQuestionsRepository.createQuestion(newQuestion);
    const questionView = new QuestionInfoDTO(
      newQuestion.id,
      newQuestion.body,
      newQuestion.correctAnswers,
      newQuestion.published,
      newQuestion.createdAt,
      newQuestion.updatedAt,
    );
    return new Result<QuestionInfoDTO>(ResultCode.Success, questionView, null);
  }
}
