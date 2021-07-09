import { mapCollectionData } from "../Reefs/helpers";
import { CollectionDetails, CollectionDetailsResponse } from "./types";

export const constructCollection = (
  data: CollectionDetailsResponse
): CollectionDetails => ({
  ...data,
  reefs: data.reefs.map((item) => ({
    ...item,
    collectionData: mapCollectionData(item.collectionData || {}),
  })),
});
