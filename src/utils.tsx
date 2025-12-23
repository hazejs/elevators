import React from 'react';
import type { BuildingState, ElevatorConfig, ElevatorState } from './types';
import { getFloorName, ELEVATOR_STATUS, FLOOR_STATUS } from './constants';

/**
 * Creates the initial state for the elevator system based on configuration.
 */
export function createInitialState(config: ElevatorConfig): BuildingState {
  return {
    elevators: Array.from({ length: config.elevatorCount }, (_, i) => ({
      id: i,
      currentFloor: 0,
      targetFloor: null,
      status: ELEVATOR_STATUS.IDLE,
    })),
    floors: Array.from({ length: config.floorCount }, (_, i) => ({
      id: i,
      name: getFloorName(i),
      callStatus: FLOOR_STATUS.IDLE,
    })).reverse(),
    queue: [],
  };
}

/**
 * Processes the call queue and assigns idle elevators to pending calls.
 * Returns the new state.
 */
export function processQueue(currentState: BuildingState): BuildingState {
  const { queue, elevators, floors } = currentState;
  if (queue.length === 0) return currentState;

  const idleElevators = elevators.filter((e) => e.status === ELEVATOR_STATUS.IDLE);
  if (idleElevators.length === 0) return currentState;

  const nextQueue = [...queue];
  let nextElevators = [...elevators];
  let nextFloors = [...floors];
  let changed = false;

  while (nextQueue.length > 0) {
    const floorId = nextQueue[0];
    const available = nextElevators.filter((e) => e.status === ELEVATOR_STATUS.IDLE);
    if (available.length === 0) break;

    const closest = available.reduce((p, c) =>
      Math.abs(c.currentFloor - floorId) < Math.abs(p.currentFloor - floorId)
        ? c
        : p
    );

    // Assign locally
    nextQueue.shift();
    nextElevators = nextElevators.map((e) =>
      e.id === closest.id
        ? { ...e, status: ELEVATOR_STATUS.MOVING, targetFloor: floorId }
        : e
    );
    nextFloors = nextFloors.map((f) =>
      f.id === floorId
        ? {
            ...f,
            callStatus: FLOOR_STATUS.WAITING,
            assignedElevatorId: closest.id,
          }
        : f
    );
    changed = true;
  }

  return changed
    ? {
        ...currentState,
        queue: nextQueue,
        elevators: nextElevators,
        floors: nextFloors,
      }
    : currentState;
}

/**
 * Plays the arrival ding sound.
 */
export function playDing(audioContextRef: React.MutableRefObject<AudioContext | null>) {
  try {
    if (!audioContextRef.current) {
      const WinAudioContext =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (WinAudioContext) audioContextRef.current = new WinAudioContext();
    }
    if (audioContextRef.current) {
      const ctx = audioContextRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.5);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    }
  } catch (e) {
    console.error('Audio failed', e);
  }
}

/**
 * Logic for calling an elevator to a specific floor.
 * Returns the new state.
 */
export function getCallElevatorState(prevState: BuildingState, floorId: number): BuildingState {
  if (
    prevState.queue.includes(floorId) ||
    prevState.floors.find((f) => f.id === floorId)?.callStatus !== FLOOR_STATUS.IDLE
  ) {
    return prevState;
  }
  
  const withCall: BuildingState = {
    ...prevState,
    queue: [...prevState.queue, floorId],
    floors: prevState.floors.map((f) =>
      f.id === floorId ? { ...f, callStatus: FLOOR_STATUS.WAITING } : f
    ),
  };
  
  return processQueue(withCall);
}

/**
 * Formats milliseconds into a human-readable time string.
 */
export const formatTime = (ms: number) => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes > 0) {
    return `${minutes} min. ${seconds} sec.`;
  }
  return `${seconds} Sec.`;
};

/**
 * Gets the color for an elevator based on its status.
 */
export const getElevatorColor = (status: ElevatorState['status']) => {
  switch (status) {
    case ELEVATOR_STATUS.MOVING:
      return '#f66a6a'; // Red
    case ELEVATOR_STATUS.ARRIVED:
      return '#6edc9e'; // Green
    default:
      return 'black';
  }
};

