//src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './assets/components/LoginPage/Login';
import Dashboard from './assets/components/Dashboard/Dashboard';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;