interface DiveLocation {
  lat: number;
  lng: number;
}

interface publicUser {
  id: number;
  fullName?: string;
}

export type Observations =
  | 'healthy'
  | 'possible-disease'
  | 'evident-disease'
  | 'mortality'
  | 'environmental'
  | 'anthropogenic'
  | 'invasive-species';

type WeatherConditions = 'calm' | 'waves' | 'storm';

export interface SurveyMedia {
  id: number;
  url: string;
  thumbnailUrl?: string;
  featured: boolean;
  observations: Observations;
  comments: string | null;
  type: 'image' | 'video';
  surveyPoint?: SurveyPoint;
}

export interface SurveyMediaUpdateRequestData {
  featured?: boolean;
  hidden?: boolean;
  observations?: Observations;
  comments?: string;
  surveyPoint?: Partial<SurveyPoint>;
}
export interface SurveyPoint {
  id?: number;
  name: string;
}

export interface SurveyPointUpdateParams {
  name?: string;
  longitude?: number;
  latitude?: number;
}

export interface SurveyBase {
  id?: number;
  diveLocation?: DiveLocation | null;
  diveDate?: string | null;
  weatherConditions?: WeatherConditions;
  comments?: string;
  temperature?: number;
  satelliteTemperature?: number;
  user?: publicUser;
  featuredSurveyMedia?: SurveyMedia;
}

export type SurveyState = SurveyBase & {
  surveyMedia?: SurveyMedia[];
};

export type SurveyListItem = SurveyBase & {
  observations: Observations[];
  surveyPoints?: number[];
  surveyPointImage?: {
    [surveyPointId: number]: { url: string; thumbnailUrl?: string }[];
  };
};

export interface SurveyData {
  site: number;
  diveDate: string;
  diveLocation?: DiveLocation | null;
  weatherConditions: WeatherConditions;
  comments?: string;
  token?: string | null;
}

export interface SurveyMediaData {
  url: string;
  thumbnailUrl?: string;
  surveyPointId?: number;
  observations: Observations | null;
  comments?: string;
  metadata?: string;
  token?: string | null;
  featured: boolean;
  hidden: boolean;
}

export interface SurveyListState {
  list: SurveyListItem[];
  loading: boolean;
  error?: string | null;
}

export interface SelectedSurveyState {
  selectedPoi?: string;
  details?: SurveyState | null;
  loading: boolean;
  loadingSurveyMediaEdit: boolean;
  error?: string | null;
}
