import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SeedService } from './seed.service';

@ApiTags('Seed')
@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Get()
  @ApiOperation({ summary: 'Populate the database with seed data' })
  @ApiResponse({ status: 200, description: 'Seed executed successfully' })
  async runSeed() {
    return await this.seedService.runSeed();
  }
}
