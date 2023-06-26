import { Injectable } from '@nestjs/common';
import { Games } from './applications/games.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Answers } from './applications/answers.entity';
import { Questions } from '../../super_admin/sa_quiz/applications/questions.entity';
import { QueryGamesDTO, QueryTopPlayersDTO } from './applications/games.dto';
import { Statistics } from './applications/statistics.entity';

@Injectable()
export class GamesRepository {
  constructor(
    @InjectRepository(Games)
    private readonly dbGamesRepository: Repository<Games>,
    @InjectRepository(Answers)
    private readonly dbAnswersRepository: Repository<Answers>,
    @InjectRepository(Questions)
    private readonly dbQuestionsRepository: Repository<Questions>,
    @InjectRepository(Statistics)
    private readonly dbStatisticsRepository: Repository<Statistics>,
  ) {}

  async createUserGamesStat(stat: Statistics) {
    await this.dbStatisticsRepository.insert(stat);
    return stat;
  }

  async saveGamesUserStat(stat: Statistics) {
    await this.dbStatisticsRepository.save(stat);
    return stat;
  }

  async findGamesUserStat(userId: string) {
    return this.dbStatisticsRepository.findOne({ where: { userId: userId } });
  }

  async totalCountPlayersGamesStat() {
    return this.dbStatisticsRepository.count();
  }

  async findTopPlayersGamesStat(queryData: QueryTopPlayersDTO) {
    const sortBy = {};
    if (Array.isArray(queryData.sort)) {
      queryData.sort.forEach((s) => {
        const sort = s.split(' ');
        sortBy[sort[0]] = sort[1];
      });
    } else {
      const sort = queryData.sort.split(' ');
      sortBy[sort[0]] = sort[1];
    }
    return this.dbStatisticsRepository.find({
      order: sortBy,
      take: queryData.pageSize,
      skip: (queryData.pageNumber - 1) * queryData.pageSize,
    });
  }

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

  async updateGamesCountUserStat(userId: string) {
    await this.dbStatisticsRepository
      .createQueryBuilder()
      .update()
      .set({ gamesCount: () => 'gamesCount + 1' })
      .where('userId = :userId', { userId: userId })
      .execute();
    return true;
  }

  async findGameById(gameId: string) {
    return this.dbGamesRepository.findOne({
      where: { id: gameId },
      relations: ['questions'],
    });
  }
}
