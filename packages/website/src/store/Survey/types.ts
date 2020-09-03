interface DiveLocation {
  lat: number;
  lng: number;
}

interface publicUser {
  id: number;
  fullName?: string;
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
  userId?: publicUser;
  surveyPoints?: SurveyPoint[];
  featuredSurveyMedia?: SurveyMedia;
}

export interface SurveyData {
  reef: number;
  diveDate: string;
  diveLocation?: DiveLocation | null;
  weatherConditions: string;
  comments?: string;
  token?: string | null;
}

export interface SurveyMediaData {
  url: string;
  poiId?: number;
  observations: string;
  comments?: string;
  metadata?: string;
  token?: string | null;
  featured: boolean;
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
