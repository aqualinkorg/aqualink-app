import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FindSketchFabDto } from './dto/find-sketchfab.dto';
import { SketchFab } from './site-sketchfab.entity';

@Injectable()
export class SiteSketchFabService {
  constructor(
    @InjectRepository(SketchFab)
    private sketchFabRepository: Repository<SketchFab>,
  ) {}
  async find(findSketchFabDto: FindSketchFabDto) {
    return this.sketchFabRepository.findOne({
      where: {
        site: {
          id: findSketchFabDto.siteId,
        },
      },
    });
  }
}
