// model and properties for conditions
// used in Condition(ML) page
export interface ConditionType {
  name: string;
  min: number;
  max: number;
  grid: boolean;
  samples?: number;
}
