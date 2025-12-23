import React from 'react';
import type { ElevatorConfig } from '../types';

interface ConfigPanelProps {
  config: ElevatorConfig;
  onConfigChange: (newConfig: ElevatorConfig) => void;
}

const ConfigPanel: React.FC<ConfigPanelProps> = ({ config, onConfigChange }) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onConfigChange({
      ...config,
      [name]: parseInt(value) || 1,
    });
  };

  return (
    <div className='config-panel'>
      <div className='config-item'>
        <label>Floors:</label>
        <input
          type='number'
          name='floorCount'
          value={config.floorCount}
          onChange={handleInputChange}
          min='2'
          max='20'
        />
      </div>
      <div className='config-item'>
        <label>Elevators:</label>
        <input
          type='number'
          name='elevatorCount'
          value={config.elevatorCount}
          onChange={handleInputChange}
          min='1'
          max='10'
        />
      </div>
    </div>
  );
};

export default ConfigPanel;

