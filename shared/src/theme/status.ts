// The single source of truth for seat/area status presentation.
// Every consumer — the 2D SVG fill resolver, the 3D material factory,
// <StatusBadge>, <OccupancyLegend>, and chart color scales — reads from
// this map instead of hard-coding a color. Change a status's color here
// and it changes everywhere at once (see ARCH-SPEC DAT·02).
//
// `colorVar` names a CSS custom property defined once in the client's
// design tokens (client/src/index.css); this file never hard-codes a hex
// value so the same status still resolves correctly in dark mode.

import type { SeatStatus } from '../types/enums.js';

export interface StatusVisual {
  label: string;
  colorVar: string;
  description: string;
}

export const STATUS_CONFIG: Record<SeatStatus, StatusVisual> = {
  AVAILABLE: {
    label: 'Available',
    colorVar: '--status-available',
    description: 'Unassigned seat, ready to allocate',
  },
  OCCUPIED: {
    label: 'Occupied',
    colorVar: '--status-occupied',
    description: 'Assigned to an active employee',
  },
  RESERVED: {
    label: 'Reserved',
    colorVar: '--status-reserved',
    description: 'Held for an incoming hire or transfer',
  },
  MAINTENANCE: {
    label: 'Maintenance',
    colorVar: '--status-maintenance',
    description: 'Temporarily out of service',
  },
  NOT_ASSIGNED: {
    label: 'Not Assigned',
    colorVar: '--status-unassigned',
    description: 'Exists in the plan but not yet provisioned',
  },
};
