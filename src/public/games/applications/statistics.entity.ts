import {
  Column,
  Entity,
  JoinTable,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Users } from '../../../super_admin/sa_users/applications/users.entity';

@Entity()
export class Statistics {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  sumScore: number;
  @Column({ type: 'float', nullable: true })
  avgScores: number;
  @Column()
  gamesCount: number;
  @Column()
  winsCount: number;
  @Column()
  lossesCount: number;
  @Column()
  drawsCount: number;
  @OneToOne(() => Users, (u) => u.statistic, { cascade: true })
  @JoinTable()
  user: Users;
  @Column()
  userId: string;
  @Column()
  userLogin: string;
}
