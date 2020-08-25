interface DiveLocation {
  lat: number;
  lng: number;
}

export interface SurveyState {
  diveLocation?: DiveLocation | null;
  diveDateTime?: string | null;
  weatherConditions?: string;
  comments?: string;
}

export interface SurveyData {
  reef: number;
  diveDate: string;
  weatherConditions: string;
  comments?: string;
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
