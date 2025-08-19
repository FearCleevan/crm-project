//src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './assets/components/LoginPage/Login';
import Dashboard from './assets/components/Dashboard/Dashboard';
import UserCreation from './assets/components/UserCreation/UserCreation';
import ProtectedRoute from './assets/components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/user-management" element={<UserCreation />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Route>
        
        {/* Fallback redirect */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;