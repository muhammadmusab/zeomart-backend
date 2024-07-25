import { Op } from 'sequelize';
// export type operators=Op.or'|'eq'|'like'|'gte'|'lte'|'gt'|'lt';
export enum operators {
  'or' = Op.or as any,
  'and' = Op.and as any,
  'like' = Op.like as any,
  'eq' = Op.eq as any,
  'gte' = Op.gte as any,
  'lte' = Op.lte as any,
  'gt' = Op.gt as any,
  'lt' = Op.lt as any,
  'iLike' = Op.iLike as any,
  'contains' = Op.contains as any,
}

export interface Filters {
  operator: operators | string;
  property: string;
  value: string | number | object | [];
  type?: 'normal' | 'range' | 'search';
  parent?:string;
  parentOperator?:operators | string;
}
