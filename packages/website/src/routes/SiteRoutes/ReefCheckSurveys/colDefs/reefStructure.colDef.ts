import { mean } from 'lodash';
import {
  ReefCheckSubstrate,
  SubstrateCode,
} from 'store/ReefCheckSurveys/types';
import type { ColumnDef } from '../ReefCheckSurveyTable';

const substrateCodesMap: Record<SubstrateCode, string> = {
  HC: 'Hard Coral',
  'HC/B': 'Hard Coral Bleaching',
  'HC/D': 'Hard Coral Disease',
  SC: 'Soft Coral',
  RKC: 'Recently Killed Coral',
  NIA: 'Nutrient indicator Algea',
  FS: 'Fleshy Seaweed',
  SP: 'Sponge',
  RC: 'Rock',
  RB: 'Rubble',
  SD: 'Sand',
  SI: 'Silt/Clay',
  OT: 'Other',
};

export const reefStructureColumns: ColumnDef<ReefCheckSubstrate>[] = [
  {
    field: ({ substrateCode }) => substrateCodesMap[substrateCode],
    header: 'Reef Structure and Composition Type',
  },
  {
    field: ({ s1 }) => `${Math.round((s1 / 40) * 100)}%`,
    header: 's1 (0-20m)',
    align: 'center',
    width: 200,
  },
  {
    field: ({ s2 }) => `${Math.round((s2 / 40) * 100)}%`,
    header: 's2 (25-45m)',
    align: 'center',
    width: 200,
  },
  {
    field: ({ s3 }) => `${Math.round((s3 / 40) * 100)}%`,
    header: 's3 (50-70m)',
    align: 'center',
    width: 200,
  },
  {
    field: ({ s4 }) => `${Math.round((s4 / 40) * 100)}%`,
    header: 's4 (75-95m)',
    align: 'center',
    width: 200,
  },
  {
    field: (row) =>
      `${Math.round(
        mean([
          (row.s1 / 40) * 100,
          (row.s2 / 40) * 100,
          (row.s3 / 40) * 100,
          (row.s4 / 40) * 100,
        ]),
      )}%`,
    header: 'Average % per 100m²',
    align: 'center',
    width: 200,
  },
];
