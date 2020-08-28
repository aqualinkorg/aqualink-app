interface DiveLocation {
  lat: number;
  lng: number;
}

export interface SurveyMedia {
  url: string;
  featured: boolean;
  observations: string;
  comments: string | null;
  type: string;
}

export interface SurveyPoint {
  name: string;
  surveyMedia: SurveyMedia[];
}

export interface SurveyState {
  id?: number;
  diveLocation?: DiveLocation | null;
  diveDate?: string | null;
  weatherConditions?: string;
  comments?: string;
  temperature?: string;
  surveyPoints?: SurveyPoint[];
}

export interface SurveyData {
  reef: number;
  diveDate: string;
  weatherConditions: string;
  comments?: string;
  token?: string | null;
}

export interface SurveyMediaData {
  url: string;
  poiId: number;
  observations: string;
  comments?: string;
  metadata?: string;
  token?: string | null;
}

export interface SurveyListState {
  list: SurveyState[];
  loading: boolean;
  error?: string | null;
}

export interface SelectedSurveyState {
  details?: SurveyState;
  loading: boolean;
  error?: string | null;
}
