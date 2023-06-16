import { SurveyListItem } from 'store/Survey/types';

export interface TimelineProps {
  siteId?: number;
  loading?: boolean;
  displayAddButton: boolean;
  surveys: (SurveyListItem | null)[];
  pointId: number;
  pointName: string | null;
  isAdmin: boolean;
  timeZone?: string | null;
}
