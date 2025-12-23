import { ELEVATOR_STATUS, FLOOR_STATUS } from './constants';

export type ElevatorStatus = (typeof ELEVATOR_STATUS)[keyof typeof ELEVATOR_STATUS];
export type FloorCallStatus = (typeof FLOOR_STATUS)[keyof typeof FLOOR_STATUS];

export interface ElevatorState {
  id: number;
  currentFloor: number;
  targetFloor: number | null;
  status: ElevatorStatus;
  startTime?: number;
  arrivalTime?: number;
}

export interface FloorState {
  id: number;
  name: string;
  callStatus: FloorCallStatus;
  assignedElevatorId?: number;
}

export interface ElevatorConfig {
  floorCount: number;
  elevatorCount: number;
  travelTimePerFloor: number;
  waitTimeAtFloor: number;
}

export interface BuildingState {
  elevators: ElevatorState[];
  floors: FloorState[];
  queue: number[];
}
