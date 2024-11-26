import { ReefCheckOrganism } from 'store/ReefCheckSurveys/types';
import type { ColumnDef } from '../ReefCheckSurveyTable';

export const fishColumns: ColumnDef<ReefCheckOrganism>[] = [
  { field: 'organism', header: 'Fish Type' },
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
  // TODO: Determine how it's calculated
  { field: () => '-', header: 'Per 100m2', align: 'center', width: 200 },
];
