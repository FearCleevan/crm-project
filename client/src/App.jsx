// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/LoginPage/Login';
import Dashboard from './components/Dashboard/Dashboard';
import UserCreation from './components/UserCreation/UserCreation';
import PermissionAndRequest from './components/PermissionAndRequest/PermissionAndRequest';
import ProtectedRoute from './components/ProtectedRoute';
import LeadsManagement from './components/LeadsManagement/LeadsManagement';
import IPManagement from './components/IPManagement/IPManagement';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>

        <Route element={<ProtectedRoute requiredPermission="LEADS_VIEW" />}>
          <Route path="/leads" element={<LeadsManagement />} />
        </Route>

        <Route element={<ProtectedRoute requiredPermission="USER_MANAGEMENT" />}>
          <Route path="/user-management" element={<UserCreation />} />
        </Route>

        <Route element={<ProtectedRoute requiredPermission="PERMISSIONS" />}>
          <Route path="/permissions" element={<PermissionAndRequest />} />
        </Route>

        <Route element={<ProtectedRoute requiredPermission="IP_MANAGEMENT" />}>
          <Route path="/ip-management" element={<IPManagement />} />
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Fallback redirect */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;