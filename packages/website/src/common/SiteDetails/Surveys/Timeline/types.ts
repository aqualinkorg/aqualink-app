import { ReefCheckSurvey } from 'store/ReefCheckSurveys';
import { SurveyListItem } from 'store/Survey/types';

export interface TimelineProps {
  siteId?: number;
  loading?: boolean;
  displayAddButton: boolean;
  surveys: TimelineSurvey[];
  pointId: number;
  pointName: string | null;
  isAdmin: boolean;
  timeZone?: string | null;
}

type TimelineSurvey = { date: string } & (
  | (SurveyListItem & { type: 'survey' })
  | (ReefCheckSurvey & { type: 'reefCheckSurvey' })
);
