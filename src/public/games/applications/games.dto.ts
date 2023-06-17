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
    public secondPlayerProgress: PlayerViewDTO,
    public questions: Questions[],
    public status: string,
    public pairCreatedDate: string,
    public startGameDate: string,
    public finishGameDate: string,
  ) {}
}
