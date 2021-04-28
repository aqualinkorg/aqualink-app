import { CollectionMetrics, Point, Reef } from "../store/Reefs/types";
import { mockUser } from "./mockUser";

const now = new Date();
const minutesAgo = 5;
const liveDataDate = new Date(now.getTime() - minutesAgo * 60000).toISOString();

export const mockReef: Reef = {
  id: 1,
  name: "",
  polygon: {
    coordinates: [0, 0],
    type: "Point",
  },
  hasHobo: false,
  spotterId: null,
  maxMonthlyMean: 0,
  depth: 0,
  status: "in_review",
  videoStream: null,
  region: { name: "Hawaii" },
  admins: [mockUser],
  surveyPoints: [],
  stream: null,
  historicalMonthlyMean: [],
  liveData: {
    reef: { id: 1 },
    bottomTemperature: {
      value: 39,
      timestamp: liveDataDate,
    },
    satelliteTemperature: {
      value: 29,
      timestamp: liveDataDate,
    },
    degreeHeatingDays: {
      value: 34,
      timestamp: liveDataDate,
    },
    waveHeight: {
      value: 1,
      timestamp: liveDataDate,
    },
    waveDirection: {
      value: 90,
      timestamp: liveDataDate,
    },
    wavePeriod: {
      value: 3,
      timestamp: liveDataDate,
    },
    windSpeed: {
      value: 6,
      timestamp: liveDataDate,
    },
    windDirection: {
      value: 180,
      timestamp: liveDataDate,
    },
  },
  dailyData: [
    {
      id: 171,
      date: liveDataDate,
      minBottomTemperature: 37,
      maxBottomTemperature: 39,
      avgBottomTemperature: 38,
      degreeHeatingDays: 34,
      topTemperature: 29,
      satelliteTemperature: 23,
      minWaveHeight: 2,
      maxWaveHeight: 4,
      avgWaveHeight: 3,
      waveDirection: 205,
      wavePeriod: 28,
      minWindSpeed: 3,
      maxWindSpeed: 5,
      avgWindSpeed: 4,
      windDirection: 229,
    },
  ],
  latestDailyData: {
    id: 171,
    date: liveDataDate,
    minBottomTemperature: 37,
    maxBottomTemperature: 39,
    avgBottomTemperature: 38,
    degreeHeatingDays: 34,
    topTemperature: 29,
    satelliteTemperature: 23,
    minWaveHeight: 2,
    maxWaveHeight: 4,
    avgWaveHeight: 3,
    waveDirection: 205,
    wavePeriod: 28,
    minWindSpeed: 3,
    maxWindSpeed: 5,
    avgWindSpeed: 4,
    windDirection: 229,
  },
  collectionData: {
    topTemperature: 9.54,
    bottomTemperature: 10.719999999999999,
    satelliteTemperature: 15.8900003433228,
    degreeHeatingDays: 0,
    weeklyAlertLevel: 0,
    sstAnomaly: 1.2,
  },
};

export const generateMockReef = ({
  id,
  name,
  regionName,
  deployed,
  isCollection,
  historicMax,
  collectionData,
  polygon,
}: {
  id: number;
  name: string;
  regionName: string;
  deployed: boolean;
  isCollection: boolean;
  historicMax: number;
  collectionData: CollectionMetrics;
  polygon: Point;
}): Reef => ({
  ...mockReef,
  id,
  name,
  region: { ...mockReef.region, name: regionName },
  polygon,
  status: deployed ? "deployed" : mockReef.status,
  spotterId: deployed ? "SPOT-0930" : mockReef.spotterId,
  collectionData,
  latestDailyData: isCollection ? undefined : mockReef.latestDailyData,
  maxMonthlyMean: historicMax,
});
