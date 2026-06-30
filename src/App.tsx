import { Navigate, Route, Routes } from 'react-router-dom';
import { AppHomeRedirect } from './components/AppHomeRedirect';
import { AssessmentListPage } from './pages/assessments/AssessmentListPage';
import { InstructionsPage } from './pages/assessments/InstructionsPage';
import { PeerSelectionPage } from './pages/assessments/PeerSelectionPage';
import { Survey360Page } from './pages/assessments/Survey360Page';
import { SurveyPage } from './pages/assessments/SurveyPage';
import { ThankYouPage } from './pages/assessments/ThankYouPage';
import { DashboardPage } from './pages/DashboardPage';
import { PeoplePage } from './pages/PeoplePage';
import { ProfilePage } from './pages/ProfilePage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { ConfigureHomePage } from './pages/configure/ConfigureHomePage';
import { ConfigureNewPage } from './pages/configure/ConfigureNewPage';
import { ConfigureAssignPage, ConfigureWizardPage } from './pages/configure/ConfigureWizardPage';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<AppHomeRedirect />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/people" element={<PeoplePage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/reports" element={<ReportsPage />} />
      <Route path="/configure" element={<ConfigureHomePage />} />
      <Route path="/configure/new" element={<ConfigureNewPage />} />
      <Route path="/configure/:id/assign" element={<ConfigureAssignPage />} />
      <Route path="/configure/:id" element={<ConfigureWizardPage />} />
      <Route path="/assessments" element={<AssessmentListPage />} />
      <Route path="/assessments/:id/peers" element={<PeerSelectionPage />} />
      <Route path="/assessments/:id/instructions" element={<InstructionsPage />} />
      <Route path="/assessments/:id/survey360" element={<Survey360Page />} />
      <Route path="/assessments/:id/survey" element={<SurveyPage />} />
      <Route path="/assessments/:id/complete" element={<ThankYouPage />} />
      <Route path="*" element={<AppHomeRedirect />} />
    </Routes>
  );
}
