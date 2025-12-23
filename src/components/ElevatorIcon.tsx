import React from 'react';
import { PiElevatorFill } from 'react-icons/pi';

interface ElevatorIconProps {
  color?: string;
  width?: number;
  height?: number;
}

const ElevatorIcon: React.FC<ElevatorIconProps> = ({
  color = 'black',
  width = 40,
  height = 40,
}) => {
  const size = Math.min(width, height);

  return <PiElevatorFill size={size} style={{ color }} />;
};

export default ElevatorIcon;
