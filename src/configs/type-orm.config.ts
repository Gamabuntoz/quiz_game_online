import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Users } from '../super_admin/sa_users/applications/users.entity';
import { Devices } from '../public/devices/applications/devices.entity';
import { Questions } from '../super_admin/sa_quiz/applications/questions.entity';
import { Answers } from '../public/games/applications/answers.entity';
import { Games } from '../public/games/applications/games.entity';
import { GameQuestions } from '../public/games/applications/questions_for_game.entity';
import { Statistics } from '../public/games/applications/statistics.entity';

@Injectable()
export class TypeOrmConfig implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      url: this.configService.get('DB_URL'),
      autoLoadEntities: true,
      entities: [
        Users,
        Devices,
        Questions,
        Answers,
        Games,
        GameQuestions,
        Statistics,
      ],
      synchronize: true,
    };
  }
}
