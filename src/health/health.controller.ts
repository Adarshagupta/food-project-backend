import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Health Check')
@Controller('health-check')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Check if the API is running' })
  healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      message: 'Foodo API is running',
    };
  }
}
