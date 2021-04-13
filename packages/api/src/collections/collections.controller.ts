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
} from '@nestjs/common';
import { CollectionsService } from './collections.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { FilterCollectionDto } from './dto/filter-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';

@Controller('collections')
export class CollectionsController {
  constructor(private collectionsService: CollectionsService) {}

  @Post()
  create(@Body() createCollectionDto: CreateCollectionDto) {
    return this.collectionsService.create(createCollectionDto);
  }

  @Get()
  find(@Query() filterCollectionDto: FilterCollectionDto) {
    return this.collectionsService.find(filterCollectionDto);
  }

  @Get(':collection_id')
  findOne(@Param('collection_id', ParseIntPipe) collectionId: number) {
    return this.collectionsService.findOne(collectionId);
  }

  @Put(':collection_id')
  update(
    @Param('collection_id', ParseIntPipe) collectionId: number,
    @Body() updateCollectionDto: UpdateCollectionDto,
  ) {
    return this.collectionsService.update(collectionId, updateCollectionDto);
  }

  @Delete(':collection_id')
  delete(@Param('collection_id', ParseIntPipe) collectionId: number) {
    return this.collectionsService.delete(collectionId);
  }
}
