import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Protected Routes (Main Layout) */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/receipts" element={<div className="p-8"><h1 className="text-3xl font-bold">Receipts Tracker</h1></div>} />
        <Route path="/subscriptions" element={<div className="p-8"><h1 className="text-3xl font-bold">Subscription Guillotine</h1></div>} />
      </Route>
    </Routes>
  );
}

export default App;
