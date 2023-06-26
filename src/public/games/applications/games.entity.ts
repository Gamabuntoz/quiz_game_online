import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Questions } from '../../../super_admin/sa_quiz/applications/questions.entity';

@Entity()
export class Games {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ type: 'timestamp', nullable: true })
  pairCreatedDate: Date;
  @Column({ type: 'timestamp', nullable: true })
  startGameDate: Date | null;
  @Column({ type: 'timestamp', nullable: true })
  finishGameDate: Date | null;
  @Column()
  status: string;
  @Column()
  firstPlayerId: string;
  @Column()
  firstPlayerLogin: string;
  @Column()
  firstPlayerScore: number;
  @Column({ nullable: true })
  secondPlayerId: string | null;
  @Column({ type: 'numeric', nullable: true })
  timerForEndGame: number;
  @Column({ nullable: true })
  secondPlayerLogin: string | null;
  @Column()
  secondPlayerScore: number;
  @ManyToMany(() => Questions)
  @JoinTable()
  questions: Questions[];
  @Column('text', { array: true, nullable: true })
  questionsId: string[];
  @Column({ nullable: true })
  winner: number | null;
}
