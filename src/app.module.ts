import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestingController } from './testing/testing.controller';
import { ConfigModule } from '@nestjs/config';
import { AuthRepository } from './public/auth/auth.repository';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './helpers/constants';
import { LocalStrategy } from './security/strategies/local.strategy';
import { JwtAccessStrategy } from './security/strategies/jwt-access.strategy';
import { BasicStrategy } from './security/strategies/basic.strategy';
import { OptionalJwtAuthGuard } from './security/guards/optional-jwt-auth.guard';
import { EmailAdapter } from './adapters/email-adapter/email.adapter';
import { AuthController } from './public/auth/auth.controller';
import { AuthService } from './public/auth/auth.service';
import { ThrottlerModule } from '@nestjs/throttler';
import { DevicesRepository } from './public/devices/devices.repository';
import { DevicesController } from './public/devices/devices.controller';
import { DevicesService } from './public/devices/devices.service';
import { LoginOrEmailExistRule } from './helpers/decorators/validate-email-and-login.param.decorator';
import { CqrsModule } from '@nestjs/cqrs';
import { ConfirmEmailUseCases } from './public/auth/applications/use-cases/confirm-email-for-registration-use-cases';
import { LoginUserUseCases } from './public/auth/applications/use-cases/login-user-use-cases';
import { NewPasswordUseCases } from './public/auth/applications/use-cases/new-user-password-use-cases';
import { PasswordRecoveryUseCases } from './public/auth/applications/use-cases/recovery-user-password-use-cases';
import { RefreshTokensUseCases } from './public/auth/applications/use-cases/refresh-user-tokens-user-use-cases';
import { RegistrationUserUseCases } from './public/auth/applications/use-cases/registration-user-use-cases';
import { ResendEmailUseCases } from './public/auth/applications/use-cases/resend-email-for-registration-use-cases';
import { VerifyTokenUseCases } from './public/auth/applications/use-cases/verify-token-use-cases';
import { LogoutUserUseCases } from './public/auth/applications/use-cases/logout-user-use-cases';
import { DeleteAllDeviceSessionsUseCases } from './public/devices/applications/use-cases/delete-all-device-sessions-use-cases';
import { DeleteDeviceSessionUseCases } from './public/devices/applications/use-cases/delete-device-session-use-cases';
import { ValidatePasswordRecoveryCodeRule } from './helpers/decorators/validate-password-recovery-code.param.decorator';
import { ValidateRegistrationConfirmationCodeRule } from './helpers/decorators/validate-registration-confirmation-code.param.decorator';
import { ValidateEmailForResendCodeRule } from './helpers/decorators/validate-email-for-resend-code.param.decorator';
import { SAUsersController } from './super_admin/sa_users/sa-users.controller';
import { SAUsersService } from './super_admin/sa_users/sa-users.service';
import { BanUserUseCases } from './super_admin/sa_users/applications/use-cases/ban-user-use-cases';
import { CreateUserByAdminUseCases } from './super_admin/sa_users/applications/use-cases/create-user-by-admin-use-case';
import { DeleteUserUseCases } from './super_admin/sa_users/applications/use-cases/delete-user-use-cases';
import { SAUsersRepository } from './super_admin/sa_users/sa-users.repository';
import { TypeOrmConfig } from './configs/type-orm.config';
import { Users } from './super_admin/sa_users/applications/users.entity';
import { Devices } from './public/devices/applications/devices.entity';
import { CreateQuestionUseCases } from './super_admin/sa_quiz/applications/use-cases/create-question-use-case';
import { DeleteQuestionUseCases } from './super_admin/sa_quiz/applications/use-cases/delete-question-use-cases';
import { UpdateQuestionUseCases } from './super_admin/sa_quiz/applications/use-cases/update-question-use-cases';
import { PublishQuestionUseCases } from './super_admin/sa_quiz/applications/use-cases/publish-question-use-cases';
import { Questions } from './super_admin/sa_quiz/applications/questions.entity';
import { SAQuestionsRepository } from './super_admin/sa_quiz/sa-questions.repository';
import { SAQuestionsService } from './super_admin/sa_quiz/sa-questions.service';
import { SAQuestionsController } from './super_admin/sa_quiz/sa-questions.controller';
import { GamesRepository } from './public/games/games.repository';
import { GamesService } from './public/games/games.service';
import { GamesController } from './public/games/games.controller';
import { SendAnswerUseCases } from './public/games/applications/use-cases/send-answer-for-question-use-cases';
import { StartNewGameUseCases } from './public/games/applications/use-cases/start-new-game-or-connect-to-pending-pair-use-cases';
import { Answers } from './public/games/applications/answers.entity';
import { Games } from './public/games/applications/games.entity';
import { GameQuestions } from './public/games/applications/questions_for_game.entity';
import { Statistics } from './public/games/applications/statistics.entity';

const useCases = [
  SendAnswerUseCases,
  StartNewGameUseCases,
  CreateQuestionUseCases,
  DeleteQuestionUseCases,
  UpdateQuestionUseCases,
  PublishQuestionUseCases,
  BanUserUseCases,
  CreateUserByAdminUseCases,
  DeleteUserUseCases,
  ConfirmEmailUseCases,
  LoginUserUseCases,
  LogoutUserUseCases,
  NewPasswordUseCases,
  PasswordRecoveryUseCases,
  RefreshTokensUseCases,
  RegistrationUserUseCases,
  ResendEmailUseCases,
  VerifyTokenUseCases,
  DeleteAllDeviceSessionsUseCases,
  DeleteDeviceSessionUseCases,
];
const strategies = [
  LocalStrategy,
  JwtAccessStrategy,
  BasicStrategy,
  OptionalJwtAuthGuard,
];
const decorators = [
  LoginOrEmailExistRule,
  ValidatePasswordRecoveryCodeRule,
  ValidateRegistrationConfirmationCodeRule,
  ValidateEmailForResendCodeRule,
];
const repositories = [
  GamesRepository,
  SAUsersRepository,
  AuthRepository,
  DevicesRepository,
  SAQuestionsRepository,
];
const services = [
  GamesService,
  AuthService,
  AppService,
  SAUsersService,
  DevicesService,
  SAQuestionsService,
];
const adapters = [EmailAdapter];
const controllers = [
  GamesController,
  SAQuestionsController,
  AppController,
  TestingController,
  SAUsersController,
  AuthController,
  DevicesController,
];

@Module({
  imports: [
    CqrsModule,
    ThrottlerModule.forRoot({
      ttl: 10,
      limit: 5,
    }),
    ConfigModule.forRoot(),
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secretKey,
      signOptions: { expiresIn: '5m' },
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfig,
      imports: [ConfigModule],
    }),
    TypeOrmModule.forFeature([
      Users,
      Devices,
      Questions,
      Answers,
      Games,
      GameQuestions,
      Statistics,
    ]),
  ],
  controllers: [...controllers],
  providers: [
    ...services,
    ...repositories,
    ...useCases,
    ...strategies,
    ...decorators,
    ...adapters,
  ],
})
export class AppModule {}
