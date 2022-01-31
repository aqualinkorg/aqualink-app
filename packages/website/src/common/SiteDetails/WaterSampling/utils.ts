import { mapValues, meanBy } from "lodash";
import { TimeSeriesData } from "../../../store/Sites/types";

export const calculateSondeDataMeanValues = (
  sondeData?: TimeSeriesData["sonde"]
) => mapValues(sondeData, (data) => meanBy(data, "value"));
