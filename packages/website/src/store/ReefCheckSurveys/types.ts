import { Site } from 'store/Sites/types';

export interface ReefCheckSite {
  id: string;
  siteId: string;
  site?: Site;
  reefName: string | null;
  orientation: string | null;
  country: string | null;
  stateProvinceIsland: string | null;
  cityTown: string | null;
  region: string | null;
  distanceFromShore: number | null;
  distanceFromNearestRiver: number | null;
  distanceToNearestPopn: number | null;
  surveys?: ReefCheckSurvey[];
}

export interface ReefCheckOrganism {
  id: string;
  date: string;
  surveyId: string;
  organism: string;
  type: string;
  s1: number;
  s2: number;
  s3: number;
  s4: number;
  recordedBy: string | null;
  errors: string | null;
}

export interface ReefCheckSubstrate {
  id: string;
  surveyId: string;
  date: string;
  substrateCode: string;
  s1: number;
  s2: number;
  s3: number;
  s4: number;
  recordedBy: string | null;
  errors: string | null;
}

export interface ReefCheckSurvey {
  id: string;
  siteId: number;
  reefCheckSiteId: string;
  site?: Site;
  reefCheckSite?: ReefCheckSite;
  organisms: ReefCheckOrganism[];
  substrates: ReefCheckSubstrate[];
  date: string;
  errors: string;
  depth: number;
  timeOfDayWorkBegan: string;
  timeOfDayWorkEnded: string;
  satelliteTemperature: number | null;
  methodUsedToDetermineLocation: string;
  riverMouthWidth: string;
  weather: string;
  airTemp: number;
  waterTempAtSurface: number;
  waterTempAt3M: number;
  waterTempAt10M: number;
  approxPopnSizeX1000: number;
  horizontalVisibilityInWater: number;
  bestReefArea: string;
  whyWasThisSiteSelected: string;
  shelteredOrExposed: string;
  anyMajorStormsInLastYears: string;
  whenStorms: string;
  overallAnthroImpact: string;
  whatKindOfImpacts: string;
  siltation: string;
  dynamiteFishing: string;
  poisonFishing: string;
  aquariumFishCollection: string;
  harvestOfInvertsForFood: string;
  harvestOfInvertsForCurio: string;
  touristDivingSnorkeling: string;
  sewagePollution: string;
  industrialPollution: string;
  commercialFishing: string;
  liveFoodFishing: string;
  artisinalRecreational: string;
  otherFormsOfFishing: string;
  otherFishing: string;
  yachts: string;
  levelOfOtherImpacts: string;
  otherImpacts: string;
  isSiteProtected: string;
  isProtectionEnforced: string;
  levelOfPoaching: string;
  spearfishing: string;
  bannedCommercialFishing: string;
  recreationalFishing: string;
  invertebrateShellCollection: string;
  anchoring: string;
  diving: string;
  otherSpecify: string;
  natureOfProtection: string;
  siteComments: string;
  substrateComments: string;
  fishComments: string;
  invertsComments: string;
  commentsFromOrganismSheet: string;
  grouperSize: string;
  percentBleaching: string;
  percentColoniesBleached: string;
  percentOfEachColony: string;
  suspectedDisease: string;
  rareAnimalsDetails: string;
  submittedBy: string;
}

export interface ReefCheckSurveyState {
  survey: ReefCheckSurvey | null;
  loading: boolean | null;
  error?: string;
}
