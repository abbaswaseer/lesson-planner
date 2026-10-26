import { Navigate, Route, Routes } from 'react-router-dom';
import Sidebar from './components/Sidebar.jsx';
import SetupPage from './pages/SetupPage.jsx';
import SourcesPage from './pages/SourcesPage.jsx';
import GeneratePage from './pages/GeneratePage.jsx';
import HistoryPage from './pages/HistoryPage.jsx';
import HelpPage from './pages/HelpPage.jsx';
import BeamsGuidePage from './pages/BeamsGuidePage.jsx';

/**
 * Root layout: navigation on the left (top on phones), the current page on the right.
 */
export default function App() {
  return (
    <div className="min-h-screen md:flex">
      <Sidebar />
      <main className="flex-1 px-4 py-6 md:px-10 md:py-10">
        <Routes>
          <Route path="/setup" element={<SetupPage />} />
          <Route path="/sources" element={<SourcesPage />} />
          <Route path="/generate" element={<GeneratePage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/beams" element={<BeamsGuidePage />} />
          {/* Generate is the page teachers use most, so it is the home page. */}
          <Route path="*" element={<Navigate to="/generate" replace />} />
        </Routes>
      </main>
    </div>
  );
}
