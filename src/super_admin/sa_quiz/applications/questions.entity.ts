import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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
}
