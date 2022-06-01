import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FindSketchFabDto } from './dto/find-sketch-fab.dto';
import { SiteSketchFab } from './site-sketch-fab.entity';

@Injectable()
export class SiteSketchFabService {
  constructor(
    @InjectRepository(SiteSketchFab)
    private sketchFabRepository: Repository<SiteSketchFab>,
  ) {}
  async find(findSketchFabDto: FindSketchFabDto) {
    return this.sketchFabRepository.findOne({
      where: {
        siteId: findSketchFabDto.siteId,
      },
    });
  }
}
