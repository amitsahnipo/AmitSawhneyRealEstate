import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { AuthProvider } from './context/AuthContext.tsx';
import { AffordabilityProvider } from './context/AffordabilityContext.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <AffordabilityProvider>
        <App />
      </AffordabilityProvider>
    </AuthProvider>
  </StrictMode>,
);
