import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProblemsPage from './pages/ProblemsPage';
import ProblemDetailPage from './pages/ProblemDetailPage';
import AttemptPage from './pages/AttemptPage';
import FeedbackPage from './pages/FeedbackPage';
import MyAttemptsPage from './pages/MyAttemptsPage';
import ProgressPage from './pages/ProgressPage';
import ProfilePage from './pages/ProfilePage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<ProtectedRoute><ProblemsPage /></ProtectedRoute>} />
          <Route path="/problems/:id" element={<ProtectedRoute><ProblemDetailPage /></ProtectedRoute>} />
          <Route path="/attempts" element={<ProtectedRoute><MyAttemptsPage /></ProtectedRoute>} />
          <Route path="/my-attempts" element={<ProtectedRoute><MyAttemptsPage /></ProtectedRoute>} />
          <Route path="/attempts/:id" element={<ProtectedRoute><AttemptPage /></ProtectedRoute>} />
          <Route path="/submissions/:id" element={<ProtectedRoute><FeedbackPage /></ProtectedRoute>} />
          <Route path="/progress" element={<ProtectedRoute><ProgressPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
