import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { FirebaseProvider } from './context/FirebaseContext.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';

// The boundary sits outside the Firebase provider so it still renders if the
// provider itself throws — otherwise the failure it is meant to catch would
// take the boundary down with it.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <FirebaseProvider>
        <App />
      </FirebaseProvider>
    </ErrorBoundary>
  </StrictMode>,
);
