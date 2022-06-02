import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FindSketchFabDto } from './dto/find-sketch-fab.dto';
import { SketchFab } from './site-sketch-fab.entity';

@Injectable()
export class SiteSketchFabService {
  constructor(
    @InjectRepository(SketchFab)
    private sketchFabRepository: Repository<SketchFab>,
  ) {}
  async find(findSketchFabDto: FindSketchFabDto) {
    return this.sketchFabRepository.findOne({
      where: {
        siteId: findSketchFabDto.siteId,
      },
    });
  }
}
