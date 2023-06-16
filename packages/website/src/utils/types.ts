export type ArrayElement<ArrayType extends readonly unknown[]> =
  ArrayType extends readonly (infer ElementType)[] ? ElementType : never;

export interface BaseSourceConfig {
  title: string;
  units: string;
  description: string;
  visibility: string;
  order: number;
}
