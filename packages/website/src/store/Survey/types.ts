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
  observations:
    | "healthy"
    | "possible-disease"
    | "evident-disease"
    | "mortality"
    | "environmental"
    | "anthropogenic";
  comments: string | null;
  type: "image" | "video";
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
  temperature?: number;
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
  observations:
    | "healthy"
    | "possible-disease"
    | "evident-disease"
    | "mortality"
    | "environmental"
    | "anthropogenic"
    | null;
  comments?: string;
  metadata?: string;
  token?: string | null;
  featured: boolean;
  hidden: boolean;
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
