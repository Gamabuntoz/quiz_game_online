import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Games } from '../../../public/games/applications/games.entity';

@Entity()
export class Questions {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  body: string;
  @Column('text', { array: true })
  correctAnswers: string[];
  @Column()
  published: boolean;
  @Column()
  createdAt: string;
  @Column({ nullable: true })
  updatedAt: string | null;
  @ManyToOne(() => Games, { cascade: true, nullable: true })
  @JoinColumn({ name: 'gameId' })
  game?: Games;
}
