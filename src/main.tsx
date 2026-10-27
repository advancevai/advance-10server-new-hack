import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initSecurityProtection } from './lib/security.ts';

initSecurityProtection();

createRoot(document.getElementById('root')!).render(<App />);
