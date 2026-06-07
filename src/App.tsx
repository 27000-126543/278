import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useUserStore } from "@/store/useUserStore";
import { Header } from "@/components/layout/Header";
import { Login } from "@/pages/Login";
import { Dashboard } from "@/pages/Dashboard";
import { AlarmCenter } from "@/pages/AlarmCenter";
import { DispatchCenter } from "@/pages/DispatchCenter";
import { ReportCenter } from "@/pages/ReportCenter";
import { EnvironmentMonitor } from "@/pages/EnvironmentMonitor";
import { ProductionForecast } from "@/pages/ProductionForecast";
import { startDataSimulation } from "@/mock/simulator";
import type { UserRole } from "@/types";

function ProtectedRoute({ children, allowedRoles }: { children: JSX.Element; allowedRoles?: UserRole[] }) {
  const { currentUser } = useUserStore();
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function AppContent() {
  const { currentUser, login } = useUserStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [simulationStarted, setSimulationStarted] = useState(false);

  useEffect(() => {
    if (currentUser && !simulationStarted) {
      startDataSimulation();
      setSimulationStarted(true);
    }
  }, [currentUser, simulationStarted]);

  useEffect(() => {
    const path = location.pathname;
    if (path === '/') setCurrentPage('dashboard');
    else if (path === '/alarm') setCurrentPage('alarm');
    else if (path === '/dispatch') setCurrentPage('dispatch');
    else if (path === '/report') setCurrentPage('report');
    else if (path === '/environment') setCurrentPage('environment');
    else if (path === '/forecast') setCurrentPage('forecast');
  }, [location.pathname]);

  const showHeader = currentUser && location.pathname !== '/login';

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    if (page === 'dashboard') navigate('/');
    else navigate(`/${page}`);
  };

  const handleLogin = (role: UserRole) => {
    login(role);
    navigate('/');
  };

  return (
    <div className="h-screen flex flex-col bg-dark-900 overflow-hidden">
      {showHeader && <Header onNavigate={handleNavigate} currentPage={currentPage} />}
      <main className="flex-1 overflow-hidden">
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/alarm"
            element={
              <ProtectedRoute>
                <AlarmCenter />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dispatch"
            element={
              <ProtectedRoute allowedRoles={['leader', 'manager']}>
                <DispatchCenter />
              </ProtectedRoute>
            }
          />
          <Route
            path="/report"
            element={
              <ProtectedRoute allowedRoles={['leader', 'manager']}>
                <ReportCenter />
              </ProtectedRoute>
            }
          />
          <Route
            path="/environment"
            element={
              <ProtectedRoute>
                <EnvironmentMonitor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/forecast"
            element={
              <ProtectedRoute allowedRoles={['leader', 'manager']}>
                <ProductionForecast />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
