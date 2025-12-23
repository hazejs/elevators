import type { ElevatorConfig } from './types';

export const ELEVATOR_STATUS = {
  IDLE: 'IDLE',
  MOVING: 'MOVING',
  ARRIVED: 'ARRIVED',
} as const;

export const FLOOR_STATUS = {
  IDLE: 'IDLE',
  WAITING: 'WAITING',
  ARRIVED: 'ARRIVED',
} as const;

export const DEFAULT_CONFIG: ElevatorConfig = {
  floorCount: 10,
  elevatorCount: 5,
  travelTimePerFloor: 1000,
  waitTimeAtFloor: 1000,
};

export const getFloorName = (floorIndex: number): string => {
  if (floorIndex === 0) return 'Ground Floor';
  if (floorIndex === 1) return '1st';
  if (floorIndex === 2) return '2nd';
  if (floorIndex === 3) return '3rd';
  return `${floorIndex}th`;
};
