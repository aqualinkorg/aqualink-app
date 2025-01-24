import { useSelector } from 'react-redux';
import { reefCheckSurveySelector } from 'store/ReefCheckSurveys/reefCheckSurveySlice';
import { ReefCheckOrganism } from 'store/ReefCheckSurveys/types';
import { ColumnDef, ReefCheckSurveyTable } from './ReefCheckSurveyTable';
import { segmentsTotalSortComparator } from './utils';

type ReefCheckSurveyOrganismsTableProps = {
  columns: ColumnDef<ReefCheckOrganism>[];
  title: string;
  description?: string;
  filter?: (organism: ReefCheckOrganism) => boolean;
};

export const ReefCheckSurveyOrganismsTable = ({
  columns,
  title,
  description = '',
  filter = () => true,
}: ReefCheckSurveyOrganismsTableProps) => {
  const { survey, loading, error } = useSelector(reefCheckSurveySelector);
  const rows =
    survey?.organisms.filter(filter).sort(segmentsTotalSortComparator) ?? [];

  if (error) {
    return null;
  }

  return (
    <ReefCheckSurveyTable<ReefCheckOrganism>
      data={rows}
      columns={columns}
      title={title}
      loading={loading}
      description={description}
    />
  );
};
