/**
 * Collection name to ID mapping for public collections.
 * This mapping is used by both the worker (for SEO metadata) and Dashboard components.
 */

export const COLLECTIONS: Record<string, number> = {
  minderoo: 1,
  'heat-stress': 2, // Special case for heat stress collection
  bermuda: 746,
  mnmrc: 766,
  hokwo: 778,
  palau: 779,
  brazil: 787,
  caribbean: 804,
  supernova: 805,
  'florida-keys': 811,
  tnc: 837,
  hawaii: 838,
  malaysia: 839,
  kaust: 850,
  iran: 858,
  barbados: 859,
  jamaica: 862,
  'bleach-watch': 864,
  'saint-lucia': 865,
} as const;

// Type for collection names
export type CollectionName = keyof typeof COLLECTIONS;

// Helper function to get collection ID by name
export const getCollectionId = (name: string): number | undefined =>
  COLLECTIONS[name.toLowerCase() as CollectionName];

// Helper function to check if a collection name exists
export const isValidCollectionName = (name: string): boolean =>
  name.toLowerCase() in COLLECTIONS;
