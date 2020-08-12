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
