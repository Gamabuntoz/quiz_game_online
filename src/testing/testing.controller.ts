import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
@Controller('testing')
export class TestingController {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('all-data')
  async deleteAllData() {
    {
    }
    await this.dataSource.query(
      `
      DELETE FROM "questions" CASCADE;
      DELETE FROM "answers" CASCADE;
      DELETE FROM "games" CASCADE;
      DELETE FROM "devices" CASCADE;
      DELETE FROM "users" CASCADE;
      `,
    );
    return;
  }
}
