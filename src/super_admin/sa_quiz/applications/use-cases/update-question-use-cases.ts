import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Result, ResultCode } from '../../../../helpers/contract';
import { SAQuestionsRepository } from '../../sa-questions.repository';
import { InputQuestionDTO } from '../sa-questions.dto';

export class UpdateQuestionCommand {
  constructor(public questionId: string, public inputData: InputQuestionDTO) {}
}

@CommandHandler(UpdateQuestionCommand)
export class UpdateQuestionUseCases
  implements ICommandHandler<UpdateQuestionCommand>
{
  constructor(protected saQuestionsRepository: SAQuestionsRepository) {}

  async execute(command: UpdateQuestionCommand): Promise<Result<boolean>> {
    const question = await this.saQuestionsRepository.updateQuestion(
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
