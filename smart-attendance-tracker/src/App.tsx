import { Route, Routes } from 'react-router-dom'
import { Navbar, ProtectedRoute, ToastProvider } from './components/Shared'
import AuthPage from './pages/AuthPage'
import CRDashboard from './pages/CRDashboard'
import StudentDashboard from './pages/StudentDashboard'
import TeacherDashboard from './pages/TeacherDashboard'
import TimetablePage from './pages/TimetablePage'

export default function App() {
  return (
    <ToastProvider>
      <Navbar />
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/student" element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />
        <Route path="/teacher" element={<ProtectedRoute role="teacher"><TeacherDashboard /></ProtectedRoute>} />
        <Route path="/cr" element={<ProtectedRoute role="cr"><CRDashboard /></ProtectedRoute>} />
        <Route path="/timetable" element={<TimetablePage />} />
      </Routes>
    </ToastProvider>
  )
}