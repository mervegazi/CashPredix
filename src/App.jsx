import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';

function App() {
  return (
    <BrowserRouter basename="/CashPredix">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        {/* Placeholder routes for next weeks */}
        <Route path="/login" element={<div className="p-8 text-white">Login Page (Week 2)</div>} />
        <Route path="/signup" element={<div className="p-8 text-white">Sign Up Page (Week 2)</div>} />
        <Route path="/dashboard" element={<div className="p-8 text-white">Dashboard (Week 7)</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
