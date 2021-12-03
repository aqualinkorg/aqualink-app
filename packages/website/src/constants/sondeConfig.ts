export const sondeConfig: { [key: string]: any | undefined } = {
  cholorophyll_rfu: {
    title: "Chlorophyll Relative Fluorescence",
    units: "RFU",
    description: "",
    visibility: "public",
  },
  cholorophyll_concentration: {
    title: "Chlorophyll Concentration",
    units: "ug/L",
    description: "",
    visibility: "public",
  },
  conductivity: {
    title: "Conductivity",
    units: "µS/cm",
    description: "",
    visibility: "public",
  },
  water_depth: {
    title: "Depth",
    units: "m",
    description: "",
    visibility: "public",
  },
  odo_saturation: {
    title: "Optical Dissolved Oxygen (saturation)",
    units: "% sat",
    description: "",
    visibility: "public",
  },
  odo_concentration: {
    title: "Optical Dissolved Oxygen (concentration)",
    units: "mg/L",
    description: "",
    visibility: "public",
  },
  salinity: {
    title: "Salinity",
    units: "psu",
    description: "",
    visibility: "public",
  },
  specific_conductance: {
    title: "Specific Conductance",
    units: "µS/cm",
    description: "",
    visibility: "public",
  },
  tds: {
    title: "Concentration of Dissolved Particles (TDS)",
    units: "mg/L",
    description: "",
    visibility: "public",
  },
  turbidity: {
    title: "Turbidity",
    units: "FNU",
    description: "",
    visibility: "public",
  },
  total_suspended_solids: {
    title: "Total Suspended Solids",
    units: "mg/L",
    description: "",
    visibility: "public",
  },
  sonde_wiper_position: {
    title: "Sonde Wiper Position",
    units: "V",
    description: "",
    visibility: "admin",
  },
  ph: {
    title: "Acidity",
    units: "pH",
    description: "",
    visibility: "public",
  },
  ph_mv: {
    title: "Acidity Conrol Voltage",
    units: "mV",
    description: "",
    visibility: "admin",
  },
  bottom_temperature: {
    title: "Temperature at Depth",
    units: "°C",
    description: "",
    visibility: "public",
  },
  sonde_battery_voltage: {
    title: "Sonde Battery",
    units: "V",
    description: "",
    visibility: "admin",
  },
  sonde_cable_power_voltage: {
    title: "Sonder Cable Power Voltage",
    units: "V",
    description: "",
    visibility: "admin",
  },
};

export function getSondeConfig(configKey: string) {
  return sondeConfig[configKey] || {};
}
