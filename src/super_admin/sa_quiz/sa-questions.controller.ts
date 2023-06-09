import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  InputPublishQuestionDTO,
  InputQuestionDTO,
  QueryQuestionsDTO,
} from './applications/sa-questions.dto';
import { BasicAuthGuard } from '../../security/guards/basic-auth.guard';
import { CommandBus } from '@nestjs/cqrs';
import { DeleteQuestionCommand } from './applications/use-cases/delete-question-use-cases';
import { Result, ResultCode } from '../../helpers/contract';
import { CreateQuestionCommand } from './applications/use-cases/create-question-use-case';
import { UpdateQuestionCommand } from './applications/use-cases/update-question-use-cases';
import { PublishQuestionCommand } from './applications/use-cases/publish-question-use-cases';
import { SAQuestionsService } from './sa-questions.service';

@Controller('sa/quiz/questions')
export class SAQuestionsController {
  constructor(
    protected saQuestionsService: SAQuestionsService,
    private commandBus: CommandBus,
  ) {}
  //
  // Query controller
  //
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get()
  async getQuestions(@Query() query: QueryQuestionsDTO) {
    const result = await this.saQuestionsService.findQuestions(query);
    if (result.code !== ResultCode.Success) {
      Result.sendResultError(result.code);
    }
    return result.data;
  }
  //
  // Command controller
  //
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async createQuestions(@Body() inputData: InputQuestionDTO) {
    const result = await this.commandBus.execute(
      new CreateQuestionCommand(inputData),
    );
    if (result.code !== ResultCode.Success) {
      Result.sendResultError(result.code);
    }
    return result.data;
  }

  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':questionId')
  async updateQuestions(
    @Param('questionId') questionId: string,
    @Body() inputData: InputQuestionDTO,
  ) {
    const result = await this.commandBus.execute(
      new UpdateQuestionCommand(questionId, inputData),
    );
    if (result.code !== ResultCode.Success) {
      Result.sendResultError(result.code);
    }
    return result.data;
  }

  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':questionId/publish')
  async publishQuestions(
    @Param('questionId') questionId: string,
    @Body() inputData: InputPublishQuestionDTO,
  ) {
    const result = await this.commandBus.execute(
      new PublishQuestionCommand(questionId, inputData),
    );
    if (result.code !== ResultCode.Success) {
      Result.sendResultError(result.code);
    }
    return result.data;
  }

  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':questionId')
  async deleteQuestions(@Param('questionId') questionId: string) {
    const result = await this.commandBus.execute(
      new DeleteQuestionCommand(questionId),
    );
    if (result.code !== ResultCode.Success) {
      Result.sendResultError(result.code);
    }
    return result.data;
  }
}
