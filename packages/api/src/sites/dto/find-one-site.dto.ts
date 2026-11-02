import { PickType } from '@nestjs/swagger';
import { FilterSiteDto } from './filter-site.dto';

export class FindOneSiteDto extends PickType(FilterSiteDto, ['until']) {}
