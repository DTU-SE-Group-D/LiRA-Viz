export const ALL = 'ALL';
export const KPI = 'KPI';
export const DI = 'DI';
export const IRI = 'IRI';
export const IRInew = 'IRI_new';
export const Mu = 'Mu';
export const Enrg = 'E_norm';

export const conditionTypes = [
  ALL,
  KPI,
  DI,
  IRI, // IRInew,
  Mu,
  Enrg,
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

export const SeverityOptions = [
  { value: 'Critical', label: 'Critical' },
  { value: 'High', label: 'High' },
  { value: 'Medium', label: 'Medium' },
  { value: 'Low', label: 'Low' },
];

// MultiMode manager

export interface MultiMode {
  count?: number;
  mode?: string[];
  ALL?: boolean;
}

// MultiMode manager default

export const DefaultMode: MultiMode = {
  count: 5,
  mode: ['KPI', 'DI', 'IRI', 'Mu', 'E_norm'],
  ALL: true,
};

export interface YearMonth {
  year: number;
  month: number;
}

export interface DateRange {
  start?: YearMonth;
  end?: YearMonth;
}
