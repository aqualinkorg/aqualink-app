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
import { Auth } from '../auth/auth.decorator';
import { AuthRequest } from '../auth/auth.types';
import { CollectionGuard } from '../auth/collection.guard';
import { OverrideLevelAccess } from '../auth/override-level-access.decorator';
import { AdminLevel } from '../users/users.entity';
import { CollectionsService } from './collections.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { FilterCollectionDto } from './dto/filter-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';

@Auth()
@Controller('collections')
export class CollectionsController {
  constructor(private collectionsService: CollectionsService) {}

  @OverrideLevelAccess(AdminLevel.SuperAdmin)
  @Post()
  create(@Body() createCollectionDto: CreateCollectionDto) {
    return this.collectionsService.create(createCollectionDto);
  }

  @Get()
  find(
    @Query() filterCollectionDto: FilterCollectionDto,
    @Req() request: AuthRequest,
  ) {
    return this.collectionsService.find(filterCollectionDto, request.user);
  }

  @UseGuards(CollectionGuard)
  @Get(':collectionId')
  findOne(@Param('collectionId', ParseIntPipe) collectionId: number) {
    return this.collectionsService.findOne(collectionId);
  }

  @UseGuards(CollectionGuard)
  @Put(':collectionId')
  update(
    @Param('collectionId', ParseIntPipe) collectionId: number,
    @Body() updateCollectionDto: UpdateCollectionDto,
  ) {
    return this.collectionsService.update(collectionId, updateCollectionDto);
  }

  @UseGuards(CollectionGuard)
  @Delete(':collectionId')
  delete(@Param('collectionId', ParseIntPipe) collectionId: number) {
    return this.collectionsService.delete(collectionId);
  }
}
