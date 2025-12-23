import { useState, useRef, useEffect } from 'react';
import type { BuildingState, ElevatorConfig } from '../types';
import { DEFAULT_CONFIG, ELEVATOR_STATUS, FLOOR_STATUS } from '../constants';
import {
  createInitialState,
  processQueue,
  playDing,
  getCallElevatorState,
} from '../utils';

export const useElevatorSystem = (
  initialConfig: ElevatorConfig = DEFAULT_CONFIG
) => {
  const [config, setConfig] = useState(initialConfig);
  const [state, setState] = useState<BuildingState>(() =>
    createInitialState(initialConfig)
  );

  const audioContext = useRef<AudioContext | null>(null);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    state.elevators.forEach((el) => {
      const timerKey = `el-${el.id}-${el.status}-${el.targetFloor}`;
      if (timers.current[timerKey]) return;

      if (el.status === ELEVATOR_STATUS.MOVING && el.targetFloor !== null) {
        const travelTime =
          Math.abs(el.currentFloor - el.targetFloor) *
          config.travelTimePerFloor;
        timers.current[timerKey] = setTimeout(() => {
          playDing(audioContext);
          setState((prev) => {
            const arrivedState: BuildingState = {
              ...prev,
              elevators: prev.elevators.map((e) =>
                e.id === el.id
                  ? {
                      ...e,
                      status: ELEVATOR_STATUS.ARRIVED,
                      currentFloor: el.targetFloor!,
                      arrivalTime: travelTime,
                    }
                  : e
              ),
              floors: prev.floors.map((f) =>
                f.id === el.targetFloor
                  ? { ...f, callStatus: FLOOR_STATUS.ARRIVED }
                  : f
              ),
            };
            return arrivedState;
          });
          delete timers.current[timerKey];
        }, travelTime);
      } else if (el.status === ELEVATOR_STATUS.ARRIVED) {
        timers.current[timerKey] = setTimeout(() => {
          setState((prev) => {
            const idleState: BuildingState = {
              ...prev,
              elevators: prev.elevators.map((e) =>
                e.id === el.id
                  ? {
                      ...e,
                      status: ELEVATOR_STATUS.IDLE,
                      targetFloor: null,
                      arrivalTime: undefined,
                    }
                  : e
              ),
              floors: prev.floors.map((f) =>
                f.id === el.currentFloor
                  ? {
                      ...f,
                      callStatus: FLOOR_STATUS.IDLE,
                      assignedElevatorId: undefined,
                    }
                  : f
              ),
            };
            // When becoming idle, immediately check if we can process more from the queue
            return processQueue(idleState);
          });
          delete timers.current[timerKey];
        }, config.waitTimeAtFloor);
      }
    });
  }, [
    state.elevators,
    config,
    config.waitTimeAtFloor,
    config.travelTimePerFloor,
  ]);

  function callElevator(floorId: number) {
    setState((prev) => getCallElevatorState(prev, floorId));
  }

  function updateConfig(newConfig: ElevatorConfig) {
    setConfig(newConfig);
    setState(createInitialState(newConfig));
    // Clear all existing timers when config changes (state reset)
    Object.values(timers.current).forEach(clearTimeout);
    timers.current = {};
  }

  return {
    elevators: state.elevators,
    floors: state.floors,
    callElevator,
    config,
    updateConfig,
  };
};
