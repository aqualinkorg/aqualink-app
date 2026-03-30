import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
} from "@nestjs/common";
import { ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";

import { SitesService } from "./sites.service";

@ApiTags("sites")
@Controller("sites")
export class SitesController {
  constructor(private readonly sitesService: SitesService) {}

  @ApiOperation({
    summary: "Get all sites",
    description:
      "Returns all sites with their most recent daily data. Optionally accepts a `date` query parameter to return data for a specific historical date.",
  })
  @ApiQuery({
    name: "date",
    required: false,
    description:
      "ISO 8601 date string. When provided, returns site data (SST, bleaching alerts, etc.) for the specified date instead of the most recent available data.",
    example: "2020-03-15",
  })
  @Get()
  findAll(@Query("date") date?: string) {
    return this.sitesService.findAll(date);
  }

  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.sitesService.findOne(id);
  }

  @ApiQuery({ name: "start", required: false })
  @ApiQuery({ name: "end", required: false })
  @Get(":id/daily_data")
  getDailyData(
    @Param("id", ParseIntPipe) id: number,
    @Query("start") start?: string,
    @Query("end") end?: string
  ) {
    return this.sitesService.getDailyData(id, start, end);
  }

  @Get(":id/live_data")
  getLiveData(@Param("id", ParseIntPipe) id: number) {
    return this.sitesService.getLiveData(id);
  }
}
