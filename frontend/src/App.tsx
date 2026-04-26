import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Subscriptions from './pages/Subscriptions';
import Receipts from './pages/Receipts';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Protected Routes (Main Layout) */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/receipts" element={<Receipts />} />
        <Route path="/subscriptions" element={<Subscriptions />} />
      </Route>
    </Routes>
  );
}

export default App;
