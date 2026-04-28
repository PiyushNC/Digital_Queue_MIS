import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const endpoint = role === 'admin' ? '/auth/admin/login' : '/auth/staff/login';
      const response = await API.post(endpoint, { email, password });

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data[role]));

      if (role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/staff');
      }
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen page-bg flex items-center justify-center p-4 relative overflow-hidden">
      <div className="floating-orb top-10 left-10 w-40 h-40 bg-cyan-400/30"></div>
      <div className="floating-orb bottom-10 right-10 w-52 h-52 bg-fuchsia-500/25"></div>

      <div className="glass-panel rounded-[2rem] p-8 w-full max-w-md relative z-10 animate-fade-in-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 text-white font-semibold mb-5">
            <span>🔐</span>
            <span>Secure access</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 hero-title">Digital Queue and Tokenisation System</h1>
          <p className="text-slate-600 mt-3">Sign in to continue to your role dashboard.</p>
        </div>

        <div className="mb-6 flex gap-4">
          <button
            onClick={() => setRole('staff')}
            className={`flex-1 py-3 rounded-2xl font-semibold transition lift-hover ${
              role === 'staff'
                ? 'bg-slate-900 text-white shadow-lg'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            Staff
          </button>
          <button
            onClick={() => setRole('admin')}
            className={`flex-1 py-3 rounded-2xl font-semibold transition lift-hover ${
              role === 'admin'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            Admin
          </button>
        </div>
        {!role && <p className="text-sm text-red-500 mb-4">Please select Staff or Admin</p>}

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white/90"
          />
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white/90"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={!role}
            className="w-full bg-gradient-to-r from-slate-900 via-indigo-700 to-cyan-600 text-white py-3 rounded-2xl font-semibold hover:brightness-110 disabled:opacity-50 shadow-lg"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
