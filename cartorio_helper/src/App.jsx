import './App.css'
import { PrimeReactProvider, PrimeReactContext } from 'primereact/api';
import Homepage from './ui/homepage';

export default function App() {
  return (
      <PrimeReactProvider>
          <Homepage />
      </PrimeReactProvider>
  );
}