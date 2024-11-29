import { Site } from 'store/Sites/types';

export interface ReefCheckSite {
  id: string;
  siteId: number;
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
  id: number;
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
  id: number;
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
  errors: string | null;
  depth: number | null;
  timeOfDayWorkBegan: string | null;
  timeOfDayWorkEnded: string | null;
  satelliteTemperature: number | null | null;
  methodUsedToDetermineLocation: string | null;
  riverMouthWidth: string | null;
  weather: string | null;
  airTemp: number | null;
  waterTempAtSurface: number | null;
  waterTempAt3M: number | null;
  waterTempAt10M: number | null;
  approxPopnSizeX1000: number | null;
  horizontalVisibilityInWater: number | null;
  bestReefArea: string | null;
  whyWasThisSiteSelected: string | null;
  shelteredOrExposed: string | null;
  anyMajorStormsInLastYears: string | null;
  whenStorms: string | null;
  overallAnthroImpact: string | null;
  whatKindOfImpacts: string | null;
  siltation: string | null;
  dynamiteFishing: string | null;
  poisonFishing: string | null;
  aquariumFishCollection: string | null;
  harvestOfInvertsForFood: string | null;
  harvestOfInvertsForCurio: string | null;
  touristDivingSnorkeling: string | null;
  sewagePollution: string | null;
  industrialPollution: string | null;
  commercialFishing: string | null;
  liveFoodFishing: string | null;
  artisinalRecreational: string | null;
  otherFormsOfFishing: string | null;
  otherFishing: string | null;
  yachts: string | null;
  levelOfOtherImpacts: string | null;
  otherImpacts: string | null;
  isSiteProtected: string | null;
  isProtectionEnforced: string | null;
  levelOfPoaching: string | null;
  spearfishing: string | null;
  bannedCommercialFishing: string | null;
  recreationalFishing: string | null;
  invertebrateShellCollection: string | null;
  anchoring: string | null;
  diving: string | null;
  otherSpecify: string | null;
  natureOfProtection: string | null;
  siteComments: string | null;
  substrateComments: string | null;
  fishComments: string | null;
  invertsComments: string | null;
  commentsFromOrganismSheet: string | null;
  grouperSize: string | null;
  percentBleaching: string | null;
  percentColoniesBleached: string | null;
  percentOfEachColony: string | null;
  suspectedDisease: string | null;
  rareAnimalsDetails: string | null;
  submittedBy: string | null;
}

export interface ReefCheckSurveyState {
  survey: ReefCheckSurvey | null;
  loading: boolean | null;
  error?: string;
}
