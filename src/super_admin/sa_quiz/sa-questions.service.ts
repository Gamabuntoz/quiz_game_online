import { Injectable } from '@nestjs/common';
import { Result, ResultCode } from '../../helpers/contract';
import { Paginated } from '../../helpers/paginated';
import { SAQuestionsRepository } from './sa-questions.repository';
import {
  QueryQuestionsDTO,
  QuestionInfoDTO,
} from './applications/sa-questions.dto';
import { Questions } from './applications/questions.entity';

@Injectable()
export class SAQuestionsService {
  constructor(protected saQuestionsRepository: SAQuestionsRepository) {}

  async findQuestions(
    queryData: QueryQuestionsDTO,
  ): Promise<Result<Paginated<QuestionInfoDTO[]>>> {
    const totalCount = await this.saQuestionsRepository.totalCountQuestions(
      queryData,
    );
    const findAllQuestions: Questions[] =
      await this.saQuestionsRepository.findAllQuestions(queryData);
    try {
      const paginatedQuestions = await Paginated.getPaginated<
        QuestionInfoDTO[]
      >({
        pageNumber: queryData.pageNumber,
        pageSize: queryData.pageSize,
        totalCount: totalCount,
        items: findAllQuestions.map(
          (q) =>
            new QuestionInfoDTO(
              q.id,
              q.body,
              q.correctAnswers,
              q.published,
              q.createdAt,
              q.updatedAt,
            ),
        ),
      });
      return new Result<Paginated<QuestionInfoDTO[]>>(
        ResultCode.Success,
        paginatedQuestions,
        null,
      );
    } catch (e) {
      console.log(e.message);
      console.log('catch in the questions pagination');
    }
  }
}
