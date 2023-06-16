import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Answers {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  questionId: string;
  @Column()
  answerStatus: string;
  @Column()
  addedAt: string;
  @Column()
  gameId: string;
  @Column()
  userId: string;
}
