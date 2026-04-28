import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import Login from './pages/Login';
import Kiosk from './pages/Kiosk';
import Display from './pages/Display';
import Staff from './pages/Staff';
import Admin from './pages/Admin';

export default function App() {
  return (
    <Router>
      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/75 backdrop-blur-xl text-white">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap gap-3 items-center justify-between">
          <Link to="/kiosk" className="inline-flex items-center gap-2 font-black text-lg tracking-tight text-cyan-300">
            <span className="text-2xl">🎟️</span>
            <span>Digital Queue</span>
          </Link>
          <nav className="flex flex-wrap gap-2 text-sm font-semibold">
            <Link to="/kiosk" className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition">Kiosk</Link>
            <Link to="/login" className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition">Login</Link>
            <Link to="/display" className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition">Display</Link>
            <Link to="/admin" className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition">Admin</Link>
            <Link to="/staff" className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition">Staff</Link>
          </nav>
        </div>
      </header>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/kiosk" element={<Kiosk />} />
        <Route path="/display" element={<Display />} />
        <Route path="/staff" element={<Staff />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/" element={<Navigate to="/kiosk" />} />
      </Routes>
    </Router>
  );
}
