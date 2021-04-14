import { sampleSize } from "lodash";

import { Reef } from "../../store/Reefs/types";

export const createCollection = (reefs: Reef[], nReefs: number): Collection => {
  const sample = sampleSize(reefs, nReefs);

  return {
    name: "My collection",
    reefs: sample,
  };
};

export interface Collection {
  name: string;
  reefs: Reef[];
}
