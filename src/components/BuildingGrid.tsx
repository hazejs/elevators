import React from 'react';
import type { FloorState, ElevatorState, ElevatorConfig } from '../types';
import { formatTime } from '../utils';
import ElevatorUnit from './ElevatorUnit';
import { ELEVATOR_STATUS, FLOOR_STATUS } from '../constants';

interface BuildingGridProps {
  floors: FloorState[];
  elevators: ElevatorState[];
  config: ElevatorConfig;
  onCallElevator: (floorId: number) => void;
}

const BuildingGrid: React.FC<BuildingGridProps> = ({
  floors,
  elevators,
  config,
  onCallElevator,
}) => {
  return (
    <div className='building-grid'>
      {floors.map((floor) => (
        <div key={floor.id} className='floor-row'>
          <div className='floor-label'>{floor.name}</div>

          {/* Elevator Shafts - Background visualization */}
          {elevators.map((elevator) => {
            const isAtThisFloor =
              elevator.targetFloor === floor.id &&
              elevator.status === ELEVATOR_STATUS.ARRIVED;
            return (
              <div key={elevator.id} className='elevator-shaft'>
                {isAtThisFloor && elevator.arrivalTime && (
                  <div className='arrival-time'>
                    {formatTime(elevator.arrivalTime)}
                  </div>
                )}
              </div>
            );
          })}

          <div className='call-button-container'>
            <button
              className={`call-btn ${floor.callStatus.toLowerCase()}`}
              onClick={() => onCallElevator(floor.id)}
              disabled={floor.callStatus !== FLOOR_STATUS.IDLE}
            >
              {floor.callStatus === FLOOR_STATUS.IDLE
                ? 'Call'
                : floor.callStatus === FLOOR_STATUS.WAITING
                ? 'Waiting'
                : 'Arrived'}
            </button>
          </div>
        </div>
      ))}

      {/* Absolutely positioned elevators */}
      {elevators.map((elevator) => (
        <ElevatorUnit 
          key={elevator.id} 
          elevator={elevator} 
          config={config} 
        />
      ))}
    </div>
  );
};

export default BuildingGrid;

