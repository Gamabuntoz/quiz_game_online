import { Injectable } from '@nestjs/common';
import { Games } from './applications/games.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Answers } from './applications/answers.entity';
import { Questions } from '../../super_admin/sa_quiz/applications/questions.entity';

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
  ): Promise<boolean> {
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
    instance.secondPlayerId = userId;
    instance.secondPlayerLogin = userLogin;
    instance.startGameDate = new Date().toISOString();
    instance.questions = questions;
    instance.status = 'Active';
    await this.dbGamesRepository.save(instance);
    return !!instance;
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
