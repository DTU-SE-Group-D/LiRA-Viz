export const ALL = 'ALL';
export const KPI = 'KPI';
export const DI = 'DI';
export const IRI = 'IRI';
export const IRInew = 'IRI_new';
export const Mu = 'Mu';
export const Enrg = 'E_norm';
export const Crack = 'Crack';
export const Rutting = 'Rutting';
export const MacroTexture = 'MacroTexture';
export const LaneMarking = 'LaneMarking';
export const RumbleStrip = 'RumbleStrip';
export const Potholes = 'Potholes';
export const DropOffCurb = 'DropOffCurb';
export const Joint = 'Joint';
export const Raveling = 'Raveling';
export const Roughness = 'Roughness';
export const RoadGeometry = 'RoadGeometry';
export const WaterEntrapment = 'WaterEntrapment';
export const Shoving = 'Shoving';
export const PickOut = 'PickOut';
export const Bleeding = 'Bleeding';
export const SealedCrack = 'SealedCrack';
export const Manholes = 'Manholes';
export const Patch = 'Patch';
export const Pumping = 'Pumping';

export const conditionTypes = [
  ALL,
  KPI,
  DI,
  IRI, // IRInew,
  Mu,
  Enrg,
  Crack,
  Rutting,
  MacroTexture,
  LaneMarking,
  RumbleStrip,
  Potholes,
  DropOffCurb,
  Joint,
  Raveling,
  Roughness,
  RoadGeometry,
  WaterEntrapment,
  Shoving,
  PickOut,
  Bleeding,
  SealedCrack,
  Manholes,
  Patch,
  Pumping,
];

// Options for condition indicator multiselect

export const ConditionTypeOptions = [
  { value: 'ALL', label: 'ALL' },
  { value: 'KPI', label: 'KPI' },
  { value: 'DI', label: 'DI' },
  { value: 'IRI', label: 'IRI' },
  { value: 'Mu', label: 'Mu' },
  { value: 'E_norm', label: 'E_norm' },
];

// Options for Severity

export const SeverityOptions = [
  { value: 'Critical', label: 'Critical' },
  { value: 'High', label: 'High' },
  { value: 'Medium', label: 'Medium' },
  { value: 'Low', label: 'Low' },
];

// MultiMode manager

export interface MultiMode {
  count: number;
  mode: string[];
  ALL: boolean;
}

// MultiMode manager default

export const DefaultMode: MultiMode = {
  count: 5,
  mode: ['KPI', 'DI', 'IRI', 'Mu', 'E_norm'],
  ALL: true,
};

// Severity manager
export interface SeverityMode {
  mode?: string[];
  selected?: boolean;
}

// Severity manager default

export const DefaultSeverityMode: SeverityMode = {
  mode: undefined,
  selected: false,
};

export interface YearMonth {
  year: number;
  month: number;
}

export interface DateRange {
  start?: YearMonth;
  end?: YearMonth;
}

export interface ConditionsGraphData {
  type: string;
  dataValues: {
    x: number;
    y: number;
  }[];
  minY: number;
  maxY: number;
  minX: number;
  maxX: number;
}
