import './App.css';
import { useElevatorSystem } from './hooks/useElevatorSystem';
import { DEFAULT_CONFIG } from './constants';
import ConfigPanel from './components/ConfigPanel';
import BuildingGrid from './components/BuildingGrid';

function App() {
  const { elevators, floors, callElevator, config, updateConfig } =
    useElevatorSystem(DEFAULT_CONFIG);

  return (
    <div className='building-container'>
      <h1 className='building-title'>Elevator Exercise</h1>

      <ConfigPanel config={config} onConfigChange={updateConfig} />

      <BuildingGrid
        floors={floors}
        elevators={elevators}
        config={config}
        onCallElevator={callElevator}
      />
    </div>
  );
}

export default App;
