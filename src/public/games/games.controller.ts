import {
  Controller,
  Get,
  UseGuards,
  HttpCode,
  HttpStatus,
  Post,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { GamesService } from './games.service';
import { CurrentUserId } from '../../helpers/decorators/current-user.param.decorator';
import { CommandBus } from '@nestjs/cqrs';
import { SendAnswerCommand } from './applications/use-cases/send-answer-for-question-use-cases';
import { Result, ResultCode } from '../../helpers/contract';
import { JwtAccessAuthGuard } from '../../security/guards/jwt-access-auth.guard';
import {
  InputAnswerDTO,
  InputId,
  QueryGamesDTO,
  QueryTopPlayersDTO,
} from './applications/games.dto';
import { StartNewGameCommand } from './applications/use-cases/start-new-game-or-connect-to-pending-pair-use-cases';

@Controller('pair-game-quiz/')
export class GamesController {
  constructor(
    private readonly gamesService: GamesService,
    private commandBus: CommandBus,
  ) {}
  //
  // Query controller
  //
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAccessAuthGuard)
  @Get('pairs/my')
  async findAllCurrentUserGames(
    @Query() queryData: QueryGamesDTO,
    @CurrentUserId() currentUserId,
  ) {
    const result = await this.gamesService.findAllCurrentUserGames(
      queryData,
      currentUserId,
    );
    if (result.code !== ResultCode.Success) {
      Result.sendResultError(result.code);
    }
    return result.data;
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAccessAuthGuard)
  @Get('pairs/my-current')
  async findCurrentUserGame(@CurrentUserId() currentUserId) {
    const result = await this.gamesService.findCurrentUserGame(currentUserId);
    if (result.code !== ResultCode.Success) {
      Result.sendResultError(result.code);
    }
    return result.data;
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAccessAuthGuard)
  @Get('users/my-statistic')
  async findCurrentUserGamesStatistic(@CurrentUserId() currentUserId) {
    const result = await this.gamesService.findCurrentUserGamesStatistic(
      currentUserId,
    );
    if (result.code !== ResultCode.Success) {
      Result.sendResultError(result.code);
    }
    return result.data;
  }

  @HttpCode(HttpStatus.OK)
  @Get('users/top')
  async findTopPlayers(@Query() queryData: QueryTopPlayersDTO) {
    const result = await this.gamesService.findTopPlayers(queryData);
    if (result.code !== ResultCode.Success) {
      Result.sendResultError(result.code);
    }
    return result.data;
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAccessAuthGuard)
  @Get('pairs/:id')
  async findGameById(@Param() gameId: InputId, @CurrentUserId() currentUserId) {
    const result = await this.gamesService.findGameById(
      gameId.id,
      currentUserId,
    );
    if (result.code !== ResultCode.Success) {
      Result.sendResultError(result.code);
    }
    return result.data;
  }
  //
  // Command controller
  //
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAccessAuthGuard)
  @Post('pairs/connection')
  async startNewGame(@CurrentUserId() currentUserId) {
    const result = await this.commandBus.execute(
      new StartNewGameCommand(currentUserId),
    );
    if (result.code !== ResultCode.Success) {
      Result.sendResultError(result.code);
    }
    return result.data;
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAccessAuthGuard)
  @Post('pairs/my-current/answers')
  async sendAnswer(
    @CurrentUserId() currentUserId,
    @Body() inputData: InputAnswerDTO,
  ) {
    const result = await this.commandBus.execute(
      new SendAnswerCommand(inputData, currentUserId),
    );
    if (result.code !== ResultCode.Success) {
      Result.sendResultError(result.code);
    }
    return result.data;
  }
}
