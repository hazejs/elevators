import React from 'react';
import ElevatorIcon from './ElevatorIcon';
import type { ElevatorState, ElevatorConfig } from '../types';
import { getElevatorColor } from '../utils';
import { ELEVATOR_STATUS } from '../constants';

interface ElevatorUnitProps {
  elevator: ElevatorState;
  config: ElevatorConfig;
}

const ElevatorUnit: React.FC<ElevatorUnitProps> = ({ elevator, config }) => {
  const travelTime =
    elevator.targetFloor !== null && elevator.status === ELEVATOR_STATUS.MOVING
      ? Math.abs(elevator.currentFloor - elevator.targetFloor) *
        config.travelTimePerFloor
      : 0;

  const currentTarget =
    elevator.status === ELEVATOR_STATUS.MOVING ||
    elevator.status === ELEVATOR_STATUS.ARRIVED
      ? elevator.targetFloor ?? elevator.currentFloor
      : elevator.currentFloor;

  // Rows are rendered top-to-bottom. Floor 9 is row 0, Floor 0 is row 9.
  const rowIndex = config.floorCount - 1 - currentTarget;
  const topPos = rowIndex * 60 + 5;

  return (
    <div
      className='elevator-unit'
      style={{
        left: `${121 + elevator.id * 80}px`, // 120px label + 1px border
        top: `${topPos}px`,
        transitionDuration: `${travelTime}ms`,
      }}
    >
      <ElevatorIcon
        color={getElevatorColor(elevator.status)}
        width={45}
        height={45}
      />
    </div>
  );
};

export default ElevatorUnit;
