import { Injectable } from '@nestjs/common';
import { Questions } from './applications/questions.entity';
import {
  InputPublishQuestionDTO,
  InputQuestionDTO,
  QueryQuestionsDTO,
} from './applications/sa-questions.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class SAQuestionsRepository {
  constructor(
    @InjectRepository(Questions)
    private readonly dbQuestionsRepository: Repository<Questions>,
  ) {}

  async findAllQuestions(queryData: QueryQuestionsDTO) {
    let sortBy = 'createdAt';
    if (queryData.sortBy) {
      sortBy = queryData.sortBy;
    }
    const direction = queryData.sortDirection.toUpperCase();
    try {
      const queryBuilder = await this.dbQuestionsRepository.createQueryBuilder(
        'q',
      );
      if (queryData.publishedStatus && queryData.publishedStatus !== 'all') {
        const status = queryData.publishedStatus === 'published';
        queryBuilder.where({ published: status });
      }
      if (queryData.bodySearchTerm) {
        queryBuilder.andWhere("body ILIKE '%' || :bodyTerm || '%' ", {
          bodyTerm: queryData.bodySearchTerm,
        });
      }
      queryBuilder
        .orderBy(`q.${sortBy}`, (direction as 'ASC') || 'DESC')
        .limit(queryData.pageSize)
        .offset((queryData.pageNumber - 1) * queryData.pageSize);
      return queryBuilder.getMany();
    } catch (e) {
      console.log(e.message);
      console.log('catch in the find all questions');
    }
  }

  async totalCountQuestions(queryData: QueryQuestionsDTO) {
    try {
      const queryBuilder = await this.dbQuestionsRepository.createQueryBuilder(
        'q',
      );
      if (queryData.publishedStatus && queryData.publishedStatus !== 'all') {
        const status = queryData.publishedStatus === 'published';
        queryBuilder.where({ published: status });
      }
      if (queryData.bodySearchTerm) {
        queryBuilder.andWhere("body ILIKE '%' || :bodyTerm || '%' ", {
          bodyTerm: queryData.bodySearchTerm,
        });
      }
      return queryBuilder.getCount();
    } catch (e) {
      console.log(e.message);
      console.log('catch in the total count questions');
    }
  }

  async createQuestion(newQuestion: Questions) {
    await this.dbQuestionsRepository.insert(newQuestion);
    return newQuestion;
  }

  async updateQuestion(
    questionId: string,
    inputData: InputQuestionDTO,
  ): Promise<boolean> {
    const result = await this.dbQuestionsRepository.update(
      { id: questionId },
      {
        body: inputData.body,
        correctAnswers: inputData.correctAnswers,
      },
    );
    return result.affected === 1;
  }

  async publishQuestion(
    questionId: string,
    inputData: InputPublishQuestionDTO,
  ): Promise<boolean> {
    const result = await this.dbQuestionsRepository.update(
      { id: questionId },
      {
        published: inputData.published,
      },
    );
    return result.affected === 1;
  }

  async deleteQuestion(id: string): Promise<boolean> {
    const result = await this.dbQuestionsRepository.delete({ id: id });
    return result.affected === 1;
  }
}
