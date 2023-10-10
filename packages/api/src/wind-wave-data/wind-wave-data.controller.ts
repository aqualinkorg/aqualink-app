import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetWindWaveDataDTO } from './dto/get-wind-wave-data.dto';
import { WindWaveService } from './wind-wave-data.service';

@ApiTags('Wind Wave Data')
@Controller('wind-wave-data-hindcast')
export class WindWaveController {
  constructor(private windWaveService: WindWaveService) {}

  @ApiOperation({
    summary: 'Return hindcast wind and wave date for a specified site',
  })
  @Get('sites/:siteId')
  getWindWaveData(@Param() getWindWaveData: GetWindWaveDataDTO) {
    return this.windWaveService.getWindWaveDate(getWindWaveData.siteId);
  }
}
