import { LatestData } from "../store/Sites/types";

const aDayAgo = new Date(
  new Date().setDate(new Date().getDate() - 1)
).toISOString();

export const mockLatestData: LatestData[] = [
  {
    id: 8597,
    timestamp: aDayAgo,
    value: 0,
    source: "noaa",
    metric: "temp_alert",
    siteId: 1,
  },
  {
    id: 8660,
    timestamp: aDayAgo,
    value: 0,
    source: "noaa",
    metric: "temp_weekly_alert",
    siteId: 1,
  },
  {
    id: 8599,
    timestamp: aDayAgo,
    value: 0,
    source: "noaa",
    metric: "dhw",
    siteId: 1,
  },
  {
    id: 8600,
    timestamp: aDayAgo,
    value: 15.3299999237061,
    source: "noaa",
    metric: "satellite_temperature",
    siteId: 1,
  },
  {
    id: 3534,
    timestamp: aDayAgo,
    value: 20.160000000000004,
    source: "spotter",
    metric: "top_temperature",
    siteId: 1,
  },
  {
    id: 3508,
    timestamp: aDayAgo,
    value: 20.259999999999998,
    source: "spotter",
    metric: "bottom_temperature",
    siteId: 1,
  },
  {
    id: 63633,
    timestamp: aDayAgo,
    value: 30.177,
    source: "sonde",
    metric: "bottom_temperature",
    siteId: 1,
  },
  {
    id: 8598,
    timestamp: aDayAgo,
    value: -0.4800000762939014,
    source: "noaa",
    metric: "sst_anomaly",
    siteId: 1,
  },
  {
    id: 3450,
    timestamp: aDayAgo,
    value: 0.63,
    source: "spotter",
    metric: "significant_wave_height",
    siteId: 1,
  },
  {
    id: 3595,
    timestamp: aDayAgo,
    value: 5.9,
    source: "spotter",
    metric: "wave_mean_period",
    siteId: 1,
  },
  {
    id: 3433,
    timestamp: aDayAgo,
    value: 152.354,
    source: "spotter",
    metric: "wave_mean_direction",
    siteId: 1,
  },
  {
    id: 3601,
    timestamp: aDayAgo,
    value: 1.2,
    source: "spotter",
    metric: "wind_speed",
    siteId: 1,
  },
  {
    id: 3551,
    timestamp: aDayAgo,
    value: 262,
    source: "spotter",
    metric: "wind_direction",
    siteId: 1,
  },
  {
    id: 63608,
    timestamp: aDayAgo,
    value: 0.08,
    source: "sonde",
    metric: "cholorophyll_rfu",
    siteId: 1,
  },
  {
    id: 63610,
    timestamp: aDayAgo,
    value: 0.35,
    source: "sonde",
    metric: "cholorophyll_concentration",
    siteId: 1,
  },
  {
    id: 63611,
    timestamp: aDayAgo,
    value: 60847.4,
    source: "sonde",
    metric: "conductivity",
    siteId: 1,
  },
  {
    id: 63613,
    timestamp: aDayAgo,
    value: 7.922,
    source: "sonde",
    metric: "water_depth",
    siteId: 1,
  },
  {
    id: 63615,
    timestamp: aDayAgo,
    value: 111.9,
    source: "sonde",
    metric: "odo_saturation",
    siteId: 1,
  },
  {
    id: 63617,
    timestamp: aDayAgo,
    value: 6.9,
    source: "sonde",
    metric: "odo_concentration",
    siteId: 1,
  },
  {
    id: 63619,
    timestamp: aDayAgo,
    value: 36.56,
    source: "sonde",
    metric: "salinity",
    siteId: 1,
  },
  {
    id: 63620,
    timestamp: aDayAgo,
    value: 55372.3,
    source: "sonde",
    metric: "specific_conductance",
    siteId: 1,
  },
  {
    id: 63622,
    timestamp: aDayAgo,
    value: 35992,
    source: "sonde",
    metric: "tds",
    siteId: 1,
  },
  {
    id: 63624,
    timestamp: aDayAgo,
    value: 2.44,
    source: "sonde",
    metric: "turbidity",
    siteId: 1,
  },
  {
    id: 63626,
    timestamp: aDayAgo,
    value: 0,
    source: "sonde",
    metric: "total_suspended_solids",
    siteId: 1,
  },
  {
    id: 63627,
    timestamp: aDayAgo,
    value: 1.187,
    source: "sonde",
    metric: "sonde_wiper_position",
    siteId: 1,
  },
  {
    id: 63629,
    timestamp: aDayAgo,
    value: 8.26,
    source: "sonde",
    metric: "ph",
    siteId: 1,
  },
  {
    id: 63631,
    timestamp: aDayAgo,
    value: -80.7,
    source: "sonde",
    metric: "ph_mv",
    siteId: 1,
  },
  {
    id: 63635,
    timestamp: aDayAgo,
    value: 5.97,
    source: "sonde",
    metric: "sonde_battery_voltage",
    siteId: 1,
  },
  {
    id: 63636,
    timestamp: aDayAgo,
    value: 0,
    source: "sonde",
    metric: "sonde_cable_power_voltage",
    siteId: 1,
  },
];
