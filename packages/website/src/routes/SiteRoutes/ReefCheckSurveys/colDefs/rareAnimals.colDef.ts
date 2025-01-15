import { ReefCheckOrganism } from 'store/ReefCheckSurveys/types';
import { mean } from 'lodash';
import type { ColumnDef } from '../ReefCheckSurveyTable';

export const rareAnimalsColumns: ColumnDef<ReefCheckOrganism>[] = [
  { field: 'organism', header: 'Rare Animals Type' },
  { field: 's1', header: 's1 (0-20m)', align: 'center', width: 200 },
  { field: 's2', header: 's2 (25-45m)', align: 'center', width: 200 },
  { field: 's3', header: 's3 (50-70m)', align: 'center', width: 200 },
  { field: 's4', header: 's4 (75-95m)', align: 'center', width: 200 },
  {
    field: (row) => row.s1 + row.s2 + row.s3 + row.s4,
    header: 'Total',
    align: 'center',
    width: 200,
  },
  {
    field: (row) => mean([row.s1, row.s2, row.s3, row.s4]),
    header: 'Average per 100m²',
    align: 'center',
    width: 200,
  },
];
