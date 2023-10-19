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

export interface YearMonth {
  year: number;
  month: number;
}

export interface DateRange {
  start?: YearMonth;
  end?: YearMonth;
}
