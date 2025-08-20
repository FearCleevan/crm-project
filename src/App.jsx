// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/LoginPage/Login';
import Dashboard from './components/Dashboard/Dashboard';
import UserCreation from './components/UserCreation/UserCreation';
import PermissionAndRequest from './components/PermissionAndRequest/PermissionAndRequest';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/user-management" element={<UserCreation />} />
          <Route path="/permissions" element={<PermissionAndRequest />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Route>
        
        {/* Fallback redirect */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;