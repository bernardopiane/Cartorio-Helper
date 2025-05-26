import './App.css'
import { PrimeReactProvider } from 'primereact/api';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.css';
import AppRouter from './routes';

export default function App() {
  return (
      <PrimeReactProvider>
          <AppRouter />
      </PrimeReactProvider>
  );
}