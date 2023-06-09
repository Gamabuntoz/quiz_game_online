import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SAQuestionsRepository } from '../../sa-questions.repository';
import { Result, ResultCode } from '../../../../helpers/contract';

export class DeleteQuestionCommand {
  constructor(public questionId: string) {}
}

@CommandHandler(DeleteQuestionCommand)
export class DeleteQuestionUseCases
  implements ICommandHandler<DeleteQuestionCommand>
{
  constructor(protected saQuestionsRepository: SAQuestionsRepository) {}

  async execute(command: DeleteQuestionCommand): Promise<Result<boolean>> {
    const deletedQuestion = await this.saQuestionsRepository.deleteQuestion(
      command.questionId,
    );
    if (!deletedQuestion)
      return new Result<boolean>(
        ResultCode.NotFound,
        false,
        'Question not found',
      );
    return new Result<boolean>(ResultCode.Success, true, null);
  }
}
