import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiOkResponse,
  getSchemaPath,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Auth } from '../auth/auth.decorator';
import { AuthRequest } from '../auth/auth.types';
import { CollectionGuard } from '../auth/collection.guard';
import { Public } from '../auth/public.decorator';
import {
  ApiNestNotFoundResponse,
  ApiNestUnauthorizedResponse,
} from '../docs/api-response';
import { CollectionsService } from './collections.service';
import { Collection } from './collections.entity';
import { Site } from '../sites/sites.entity';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { FilterCollectionDto } from './dto/filter-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';

@ApiTags('Collections')
@Auth()
@Controller('collections')
export class CollectionsController {
  constructor(private collectionsService: CollectionsService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Creates a new collection' })
  @ApiCreatedResponse({ type: Collection })
  @Post()
  create(
    @Body() createCollectionDto: CreateCollectionDto,
    @Req() request: AuthRequest,
  ) {
    return this.collectionsService.create(createCollectionDto, request.user);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: "Fetch all user's private collections" })
  @ApiOkResponse({ type: Collection, isArray: true })
  @Get()
  find(
    @Query() filterCollectionDto: FilterCollectionDto,
    @Req() request: AuthRequest,
  ) {
    return this.collectionsService.find(filterCollectionDto, request.user);
  }

  @ApiOperation({ summary: 'Fetch the heat stress tracker' })
  @ApiExtraModels(Site)
  @ApiOkResponse({
    schema: {
      type: 'object',
      required: ['name', 'isPublic', 'siteIds', 'sites'],
      properties: {
        name: { type: 'string' },
        isPublic: { type: 'boolean' },
        siteIds: { type: 'array', items: { type: 'integer' } },
        sites: { type: 'array', items: { $ref: getSchemaPath(Site) } },
      },
    },
  })
  @Public()
  @Get('heat-stress-tracker')
  getHeatStressTracker() {
    return this.collectionsService.getHeatStressTracker();
  }

  @ApiOperation({ summary: 'Fetch all public collections' })
  @ApiOkResponse({ type: Collection, isArray: true })
  @Public()
  @Get('public')
  findPublic(@Query() filterCollectionDto: FilterCollectionDto) {
    return this.collectionsService.find(filterCollectionDto);
  }

  @ApiOperation({
    summary: 'Fetch detailed data from specified public collection',
  })
  @ApiOkResponse({ type: Collection })
  @ApiNestNotFoundResponse('No collection was found with the specified id')
  @ApiParam({ name: 'collectionId', example: 1 })
  @Public()
  @Get('public/:collectionId')
  findOnePublic(@Param('collectionId', ParseIntPipe) collectionId: number) {
    return this.collectionsService.findOne(collectionId, true);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Fetch detailed data from specified private collection',
  })
  @ApiOkResponse({ type: Collection })
  @ApiNestNotFoundResponse('No collection was found with the specified id')
  @ApiNestUnauthorizedResponse('Collection selected is not public')
  @ApiParam({ name: 'collectionId', example: 1 })
  @UseGuards(CollectionGuard)
  @Get(':collectionId')
  findOne(@Param('collectionId', ParseIntPipe) collectionId: number) {
    return this.collectionsService.findOne(collectionId);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update specified collection' })
  @ApiOkResponse({ type: Collection })
  @ApiNestNotFoundResponse('No collection was found with the specified id')
  @ApiParam({ name: 'collectionId', example: 1 })
  @UseGuards(CollectionGuard)
  @Put(':collectionId')
  update(
    @Param('collectionId', ParseIntPipe) collectionId: number,
    @Body() updateCollectionDto: UpdateCollectionDto,
  ) {
    return this.collectionsService.update(collectionId, updateCollectionDto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete specified collection' })
  @ApiNestNotFoundResponse('No collection was found with the specified id')
  @ApiParam({ name: 'collectionId', example: 1 })
  @UseGuards(CollectionGuard)
  @Delete(':collectionId')
  delete(@Param('collectionId', ParseIntPipe) collectionId: number) {
    return this.collectionsService.delete(collectionId);
  }
}
