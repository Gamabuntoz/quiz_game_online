import { Injectable } from '@nestjs/common';
import { Games } from './applications/games.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Answers } from './applications/answers.entity';
import { Questions } from '../../super_admin/sa_quiz/applications/questions.entity';
import { QueryGamesDTO } from './applications/games.dto';

@Injectable()
export class GamesRepository {
  constructor(
    @InjectRepository(Games)
    private readonly dbGamesRepository: Repository<Games>,
    @InjectRepository(Answers)
    private readonly dbAnswersRepository: Repository<Answers>,
    @InjectRepository(Questions)
    private readonly dbQuestionsRepository: Repository<Questions>,
  ) {}

  async totalCountCurrentUserGames(queryData: QueryGamesDTO, userId: string) {
    const queryBuilder = await this.dbGamesRepository
      .createQueryBuilder('g')
      .where('g.firstPlayerId = :userId OR g.secondPlayerId = :userId', {
        userId: userId,
      });
    return queryBuilder.getCount();
  }

  async findAllCurrentUserGames(queryData: QueryGamesDTO, userId: string) {
    let sortBy: any = {
      pairCreatedDate: 'DESC',
    };
    if (queryData.sortBy && queryData.sortBy !== 'pairCreatedDate') {
      sortBy = {
        [queryData.sortBy]: queryData.sortDirection.toUpperCase(),
        pairCreatedDate: 'DESC',
      };
    }
    return this.dbGamesRepository.find({
      where: [{ firstPlayerId: userId }, { secondPlayerId: userId }],
      order: sortBy,
      take: queryData.pageSize,
      skip: (queryData.pageNumber - 1) * queryData.pageSize,
      relations: ['questions'],
    });
  }

  async findAllCurrentUserGamesForStat(userId: string) {
    return this.dbGamesRepository.find({
      where: [{ firstPlayerId: userId }, { secondPlayerId: userId }],
    });
  }

  async findOpenGameByUserId(currentUserId: string) {
    return this.dbGamesRepository.findOne({
      where: [
        { firstPlayerId: currentUserId, finishGameDate: null },
        { secondPlayerId: currentUserId, finishGameDate: null },
      ],
      relations: ['questions'],
    });
  }

  async findActiveGameByUserId(currentUserId: string) {
    return this.dbGamesRepository.findOne({
      where: [
        { firstPlayerId: currentUserId, status: 'Active' },
        { secondPlayerId: currentUserId, status: 'Active' },
      ],
      relations: ['questions'],
    });
  }

  async updateGame(game: Games) {
    await this.dbGamesRepository.save(game);
    return game;
  }

  async findPlayerGameAnswers(gameId: string, userId: string) {
    return this.dbAnswersRepository.find({
      where: { gameId: gameId, userId: userId },
    });
  }

  async joinToGameInPending(
    userId: string,
    userLogin: string,
  ): Promise<Games | boolean> {
    const questions = await this.dbQuestionsRepository
      .createQueryBuilder('q')
      .select()
      .orderBy('RANDOM()')
      .limit(5)
      .getMany();
    const instance = await this.dbGamesRepository.findOne({
      where: { status: 'PendingSecondPlayer' },
    });
    if (!instance) return false;
    const questionsId = questions.map((q) => q.id);
    instance.secondPlayerId = userId;
    instance.secondPlayerLogin = userLogin;
    instance.startGameDate = new Date();
    instance.questions = questions;
    instance.questionsId = questionsId;
    instance.status = 'Active';
    await this.dbGamesRepository.save(instance);
    return instance;
  }

  async saveAnswer(newAnswer: Answers) {
    await this.dbAnswersRepository.insert(newAnswer);
    return newAnswer;
  }

  async createNewGame(newGame: Games) {
    await this.dbGamesRepository.insert(newGame);
    return newGame;
  }

  async findGameById(gameId: string) {
    return this.dbGamesRepository.findOne({
      where: { id: gameId },
      relations: ['questions'],
    });
  }
}
