import { Entity, JoinTable, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Games } from './games.entity';
import { Questions } from '../../../super_admin/sa_quiz/applications/questions.entity';

@Entity()
export class GameQuestions {
  @PrimaryGeneratedColumn('uuid')
  questionId: string;
  @PrimaryGeneratedColumn('uuid')
  gameId: string;
  @OneToOne(() => Games, { cascade: true })
  @JoinTable({ name: 'gameId' })
  game: Games;
  @OneToOne(() => Questions, { cascade: true })
  @JoinTable({ name: 'questionId' })
  question: Questions;
}
