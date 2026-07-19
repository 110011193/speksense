import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
import { ensureOrgStoreSeeded } from './api/mock/store';
import { redirectLegacyUrls } from './legacyUrlRedirect';
import './tokens.css';
import './dashboard.css';
import './dashboard-insights.css';
import './assessments.css';
import './people.css';
import './settings.css';
import './assessment-flow.css';
import './survey-360.css';
import './configure.css';
import './admin-console.css';
import './polish.css';

redirectLegacyUrls();
ensureOrgStoreSeeded();

const rootEl = document.getElementById('root');
if (rootEl) {
  createRoot(rootEl).render(
    <StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StrictMode>,
  );
}
