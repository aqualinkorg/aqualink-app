import React from 'react';
import { useSelector } from 'react-redux';
import { reefCheckSurveySelector } from 'store/ReefCheckSurveys/reefCheckSurveySlice';
import { ReefCheckSubstrate } from 'store/ReefCheckSurveys/types';
import { ColumnDef, ReefCheckSurveyTable } from './ReefCheckSurveyTable';
import { segmentsTotalSortComparator } from './utils';

type ReefCheckSurveySubstratesTableProps = {
  columns: ColumnDef<ReefCheckSubstrate>[];
  title: string;
  description?: string;
  filter?: (organism: ReefCheckSubstrate) => boolean;
};

export const ReefCheckSurveySubstrates = ({
  columns,
  title,
  description = '',
  filter = () => true,
}: ReefCheckSurveySubstratesTableProps) => {
  const { survey, loading, error } = useSelector(reefCheckSurveySelector);
  const rows =
    // eslint-disable-next-line fp/no-mutating-methods
    survey?.substrates.filter(filter).sort(segmentsTotalSortComparator) ?? [];

  if (error) {
    return null;
  }
  return (
    <ReefCheckSurveyTable<ReefCheckSubstrate>
      data={rows}
      columns={columns}
      title={title}
      loading={loading}
      description={description}
    />
  );
};
