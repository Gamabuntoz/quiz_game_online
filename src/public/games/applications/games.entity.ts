import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Questions } from '../../../super_admin/sa_quiz/applications/questions.entity';

@Entity()
export class Games {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  pairCreatedDate: string;
  @Column({ nullable: true })
  startGameDate: string | null;
  @Column({ nullable: true })
  finishGameDate: string | null;
  @Column()
  status: string;
  @Column()
  firstPlayerId: string;
  @Column()
  firstPlayerLogin: string;
  @Column({ type: 'numeric', nullable: true })
  firstPlayerScore: number | null;
  @Column({ nullable: true })
  secondPlayerId: string | null;
  @Column({ nullable: true })
  secondPlayerLogin: string | null;
  @Column({ type: 'numeric', nullable: true })
  secondPlayerScore: number | null;
  @OneToMany(() => Questions, (q) => q.game, {})
  questions: Questions[];
}
