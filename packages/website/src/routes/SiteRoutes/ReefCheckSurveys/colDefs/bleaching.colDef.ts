import { ReefCheckOrganism } from 'store/ReefCheckSurveys/types';
import { mean } from 'lodash';
import type { ColumnDef } from '../ReefCheckSurveyTable';

// TODO: Finalize columns
export const bleachingColumns: ColumnDef<ReefCheckOrganism>[] = [
  { field: 'organism', header: 'Bleaching and Coral Diseases Type' },
  { field: 's1', header: 's1 (0-20m)', align: 'center', width: 200 },
  { field: 's2', header: 's2 (25-45m)', align: 'center', width: 200 },
  { field: 's3', header: 's3 (50-70m)', align: 'center', width: 200 },
  { field: 's4', header: 's4 (75-95m)', align: 'center', width: 200 },
  {
    field: ({ s1, s2, s3, s4 }) => mean([s1, s2, s3, s4]),
    header: 'Overall Percentage',
    align: 'center',
    width: 200,
  },
];
