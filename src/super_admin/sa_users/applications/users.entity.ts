import {
  Column,
  Entity,
  JoinTable,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Devices } from '../../../public/devices/applications/devices.entity';
import { Statistics } from '../../../public/games/applications/statistics.entity';

@Entity()
export class Users {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  login: string;
  @Column()
  email: string;
  @Column()
  passwordHash: string;
  @Column()
  createdAt: string;
  @Column()
  emailConfirmationCode: string;
  @Column()
  emailIsConfirmed: boolean;
  @Column()
  emailConfirmExpirationDate: string;
  @Column({ nullable: true })
  passwordRecoveryCode: string | null;
  @Column({ nullable: true })
  passwordRecoveryExpirationDate: string | null;
  @Column()
  userIsBanned: boolean;
  @Column({ nullable: true })
  userBanReason: string | null;
  @Column({ nullable: true })
  userBanDate: string | null;
  @OneToMany(() => Devices, (d) => d.user, {})
  devices: Devices[];
  @OneToOne(() => Statistics, (s) => s.user, {})
  statistic?: Statistics;
}
