import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsString,
  Length,
} from 'class-validator';

export class QuestionInfoDTO {
  constructor(
    public id: string,
    public body: string,
    public correctAnswers: string[],
    public published: boolean,
    public createdAt: string,
    public updatedAt: string,
  ) {}
}

export class InputQuestionDTO {
  @Length(10, 500)
  @IsString()
  @IsNotEmpty()
  body: string;
  @IsArray()
  correctAnswers: string[];
}

export class InputPublishQuestionDTO {
  @IsBoolean()
  @IsNotEmpty()
  published: boolean;
}

export class QueryQuestionsDTO {
  constructor(
    public publishedStatus: string,
    public sortBy: string = 'createdAt',
    public sortDirection: 'ASC' | 'DESC' | string = 'DESC',
    public pageNumber: number = 1,
    public pageSize: number = 10,
    public bodySearchTerm: string,
  ) {}
}
