import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import MainDashboard from './pages/MainDashboard';
import DocumentDashboard from './pages/DocumentDashboard';
import DocumentDetailView from './pages/DocumentDetailView';
import InterviewDashboard from './pages/InterviewDashboard';
import ControlNavigator from './pages/ControlNavigator';
import SOAGenerator from './pages/SOAGenerator';
import GapAnalysis from './pages/GapAnalysis';
import PrivateRoute from './components/common/PrivateRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<MainDashboard />} />
          <Route path="documents" element={<DocumentDashboard />} />
          <Route path="documents/:slug" element={<DocumentDetailView />} />
          <Route path="interviews" element={<InterviewDashboard />} />
          <Route path="controls" element={<ControlNavigator />} />
          <Route path="soa" element={<SOAGenerator />} />
          <Route path="gaps" element={<GapAnalysis />} />
        </Route>

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
