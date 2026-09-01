import {
  ACTIVITY_ENTITY_TYPES,
  type ActivityAction,
  type ActivityEntityType,
} from '@/models/ActivityLog';

export const ACTIVITY_ACTIONS = [
  'create',
  'update',
  'delete',
  'status-change',
  'publish',
  'login',
  'send',
] as const;

export type ActivityLogFilters = {
  query: string;
  action: ActivityAction | 'all';
  entityType: ActivityEntityType | 'all';
};

export function parseActivityActionFilter(
  value: string | string[] | undefined,
): ActivityAction | 'all' {
  const action = typeof value === 'string' ? value : '';
  return ACTIVITY_ACTIONS.find((entry) => entry === action) ?? 'all';
}

export function parseActivityEntityTypeFilter(
  value: string | string[] | undefined,
): ActivityEntityType | 'all' {
  const entityType = typeof value === 'string' ? value : '';
  return ACTIVITY_ENTITY_TYPES.find((entry) => entry === entityType) ?? 'all';
}

export function parseActivityQuery(value: string | string[] | undefined): string {
  return typeof value === 'string' ? value.trim().slice(0, 120) : '';
}

export function parseActivityLogFilters(
  params: Record<string, string | string[] | undefined>,
): ActivityLogFilters {
  return {
    query: parseActivityQuery(params.q),
    action: parseActivityActionFilter(params.action),
    entityType: parseActivityEntityTypeFilter(params.entityType),
  };
}
