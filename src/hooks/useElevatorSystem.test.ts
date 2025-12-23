import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useElevatorSystem } from './useElevatorSystem';
import { DEFAULT_CONFIG, ELEVATOR_STATUS, FLOOR_STATUS } from '../constants';

class MockAudioContext {
  createOscillator = vi.fn().mockReturnValue({
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    frequency: {
      setValueAtTime: vi.fn(),
      exponentialRampToValueAtTime: vi.fn(),
    },
    type: 'sine',
  });
  createGain = vi.fn().mockReturnValue({
    connect: vi.fn(),
    gain: {
      setValueAtTime: vi.fn(),
      exponentialRampToValueAtTime: vi.fn(),
    },
  });
  currentTime = 0;
  destination = {};
}

describe('useElevatorSystem', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal('AudioContext', MockAudioContext);
    vi.stubGlobal('webkitAudioContext', MockAudioContext);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should initialize with correct number of elevators and floors', () => {
    const { result } = renderHook(() => useElevatorSystem(DEFAULT_CONFIG));

    expect(result.current.elevators.length).toBe(DEFAULT_CONFIG.elevatorCount);
    expect(result.current.floors.length).toBe(DEFAULT_CONFIG.floorCount);
    expect(result.current.elevators[0].currentFloor).toBe(0);
    expect(result.current.elevators[0].status).toBe(ELEVATOR_STATUS.IDLE);
  });

  it('should move the closest elevator when a floor is called', () => {
    const { result } = renderHook(() => useElevatorSystem(DEFAULT_CONFIG));

    act(() => {
      result.current.callElevator(3); // Call 3rd floor
    });

    // Advance by 10ms for the setTimeout(0) in callElevator
    act(() => {
      vi.advanceTimersByTime(10);
    });

    // Elevator 0 should be assigned as it's at floor 0 and closest
    expect(result.current.elevators[0].status).toBe(ELEVATOR_STATUS.MOVING);
    expect(result.current.elevators[0].targetFloor).toBe(3);
    expect(result.current.floors.find((f) => f.id === 3)?.callStatus).toBe(
      FLOOR_STATUS.WAITING
    );
  });

  it('should arrive at the floor after travel time', () => {
    const { result } = renderHook(() => useElevatorSystem(DEFAULT_CONFIG));

    act(() => {
      result.current.callElevator(2);
    });

    act(() => {
      vi.advanceTimersByTime(10);
    });

    // Travel time for 2 floors = 2 * 1000ms
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(result.current.elevators[0].status).toBe(ELEVATOR_STATUS.ARRIVED);
    expect(result.current.elevators[0].currentFloor).toBe(2);
    expect(result.current.floors.find((f) => f.id === 2)?.callStatus).toBe(
      FLOOR_STATUS.ARRIVED
    );
  });

  it('should become idle after waiting at the floor', () => {
    const { result } = renderHook(() => useElevatorSystem(DEFAULT_CONFIG));

    act(() => {
      result.current.callElevator(1);
    });

    act(() => {
      vi.advanceTimersByTime(10);
    });

    act(() => {
      vi.advanceTimersByTime(1000); // Travel
    });

    expect(result.current.elevators[0].status).toBe(ELEVATOR_STATUS.ARRIVED);

    act(() => {
      vi.advanceTimersByTime(2000); // Wait time
    });

    expect(result.current.elevators[0].status).toBe(ELEVATOR_STATUS.IDLE);
    expect(result.current.floors.find((f) => f.id === 1)?.callStatus).toBe(
      FLOOR_STATUS.IDLE
    );
  });

  it('should queue calls when all elevators are busy', () => {
    const config = { ...DEFAULT_CONFIG, elevatorCount: 1 };
    const { result } = renderHook(() => useElevatorSystem(config));

    act(() => {
      result.current.callElevator(5); // First call
    });

    act(() => {
      vi.advanceTimersByTime(10);
    });

    act(() => {
      result.current.callElevator(8); // Second call should be queued
    });

    act(() => {
      vi.advanceTimersByTime(10);
    });

    expect(result.current.floors.find((f) => f.id === 8)?.callStatus).toBe(
      FLOOR_STATUS.WAITING
    );
    expect(result.current.elevators[0].targetFloor).toBe(5);

    // Complete first call
    act(() => {
      vi.advanceTimersByTime(5000); // Travel to 5
    });
    act(() => {
      vi.advanceTimersByTime(2000); // Wait at 5
    });

    // The processQueue has a 10ms delay
    act(() => {
      vi.advanceTimersByTime(10);
    });

    // We also have a setTimeout(..., 0) now
    act(() => {
      vi.advanceTimersByTime(10);
    });

    // Should now be moving to floor 8
    expect(result.current.elevators[0].targetFloor).toBe(8);
    expect(result.current.elevators[0].status).toBe(ELEVATOR_STATUS.MOVING);
  });
});
