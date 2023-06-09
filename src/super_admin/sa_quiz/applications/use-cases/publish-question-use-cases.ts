import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SAQuestionsRepository } from '../../sa-questions.repository';
import { Result, ResultCode } from '../../../../helpers/contract';
import { InputPublishQuestionDTO } from '../sa-questions.dto';

export class PublishQuestionCommand {
  constructor(
    public questionId: string,
    public inputData: InputPublishQuestionDTO,
  ) {}
}

@CommandHandler(PublishQuestionCommand)
export class PublishQuestionUseCases
  implements ICommandHandler<PublishQuestionCommand>
{
  constructor(protected saQuestionsRepository: SAQuestionsRepository) {}

  async execute(command: PublishQuestionCommand): Promise<Result<boolean>> {
    const question = await this.saQuestionsRepository.publishQuestion(
      command.questionId,
      command.inputData,
    );
    if (!question)
      return new Result<boolean>(
        ResultCode.NotFound,
        false,
        'Question not found',
      );
    return new Result<boolean>(ResultCode.Success, true, null);
  }
}
