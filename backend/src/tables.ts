import { Knex } from 'knex';

import { Geometry } from 'geojson';

interface Way {
  id: string;
  geom: any;
  ref: string;
  official_ref: string;
}

export const Ways = (k: Knex) => k.from<Way>('way');

interface RoadCondition {
  pk: any;
  way_id: string;
  way_dist: number;
  value: number;
  computed_at: Date;
  type: string;
}

export const RoadConditions = (k: Knex) =>
  k.from<RoadCondition>('road_conditions');

interface ZoomCondition extends RoadCondition {
  zoom: number;
}

export const ZoomConditions = (k: Knex) =>
  k.from<ZoomCondition>('zoom_conditions');

// ekki@dtu.dk: This is for PostGIS in the LiRAMap (LiraVis) database
export interface Condition_Coverage {
  id: string;
  fk_way_id: string;
  type: string;
  value: number;
  section_geom: Geometry;
  compute_time: Date;
}

export const Conditions = (k: Knex) =>
  k.from<Condition_Coverage>('condition_coverages');

export const Conditions2 = (k: Knex) =>
  k.from<Condition_Coverage>('coverage_values');
