import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Context & Components
import { AuthProvider, AuthContext } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import EmployeeDash from './pages/EmployeeDash';
import ManagerDash from './pages/ManagerDash';

const AppRoutes = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-8">
        <Routes>
          {/* --- Public Routes --- */}
          <Route path="/login" element={
            user ? (
              <Navigate to={user.role === 'manager' ? "/manager-dashboard" : "/employee-dashboard"} replace />
            ) : <Login />
          } />
          <Route path="/register" element={<Register />} />

          {/* --- Employee Private Routes --- */}
          <Route 
            path="/employee-dashboard" 
            element={
              <ProtectedRoute roleRequired="employee">
                <EmployeeDash />
              </ProtectedRoute>
            } 
          />

          {/* --- Manager Private Routes --- */}
          <Route 
            path="/manager-dashboard" 
            element={
              <ProtectedRoute roleRequired="manager">
                <ManagerDash />
              </ProtectedRoute>
            } 
          />

          {/* --- Fallback Redirects --- */}
          <Route path="/" element={
            user ? (
              <Navigate to={user.role === 'manager' ? "/manager-dashboard" : "/employee-dashboard"} replace />
            ) : <Navigate to="/login" replace />
          } />
          
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </main>

      <footer className="bg-white border-t py-6 text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
        &copy; {new Date().getFullYear()} HYSCALER - Internal Leave Management
      </footer>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;