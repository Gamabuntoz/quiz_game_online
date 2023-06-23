import { IsString, IsUUID } from 'class-validator';

export class InputAnswerDTO {
  @IsString()
  answer: string;
}

export class InputId {
  @IsUUID()
  id: string;
}

class PlayerAnswers {
  questionId: string;
  answerStatus: string;
  addedAt: string;
}
class Questions {
  id: string;
  body: string;
}
class Player {
  id: string;
  login: string;
}

class PlayerViewDTO {
  answers: PlayerAnswers[];
  player: Player;
  score: number;
}

export class AnswerViewDTO {
  constructor(
    public questionId: string,
    public answerStatus: string,
    public addedAt: string,
  ) {}
}

export class GameViewDTO {
  constructor(
    public id: string,
    public firstPlayerProgress: PlayerViewDTO,
    public secondPlayerProgress: PlayerViewDTO | null,
    public questions: Questions[] | null,
    public status: string,
    public pairCreatedDate: string,
    public startGameDate: string,
    public finishGameDate: string,
  ) {}
}

export class QueryGamesDTO {
  constructor(
    public sortBy: string,
    public sortDirection: 'ASC' | 'DESC' | string = 'DESC',
    public pageNumber: number = 1,
    public pageSize: number = 10,
  ) {}
}

export class GameStatisticView {
  constructor(
    public sumScore: number,
    public avgScores: number,
    public gamesCount: number,
    public winsCount: number,
    public lossesCount: number,
    public drawsCount: number,
  ) {}
}
