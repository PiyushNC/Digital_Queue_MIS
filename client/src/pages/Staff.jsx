import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

export default function Staff() {
  const [staff, setStaff] = useState(null);
  const [counter, setCounter] = useState(null);
  const [currentToken, setCurrentToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStaffData();
  }, []);

  useEffect(() => {
    // Listen for WebSocket updates to refresh current token in real-time
    const ws = new WebSocket('ws://localhost:5000');
    ws.onmessage = () => {
      if (counter) fetchCurrentToken(counter.id);
    };
    return () => ws.close();
  }, [counter]);

  const fetchStaffData = async () => {
    try {
      const response = await API.get('/staff');
      setStaff(response.data);

      if (response.data.counterId) {
        const counterResponse = await API.get(`/counters`);
        const myCounter = counterResponse.data.find((c) => c.id === response.data.counterId);
        setCounter(myCounter);
        fetchCurrentToken(response.data.counterId);
      }
    } catch (error) {
      console.error('Error fetching staff data:', error);
      navigate('/login');
    }
  };

  const fetchCurrentToken = async (counterId) => {
    try {
      const counterResponse = await API.get(`/counters`);
      const myCounter = counterResponse.data.find((c) => c.id === counterId);
      if (myCounter) {
        const tokensResponse = await API.get(`/tokens/${myCounter.serviceId}`);
        const current = tokensResponse.data.find(
          (t) => t.currentCounterId === counterId && ['CALLED', 'IN_PROGRESS'].includes(t.status)
        );
        setCurrentToken(current);
      }
    } catch (error) {
      console.error('Error fetching current token:', error);
    }
  };

  const handleStartService = async () => {
    if (!currentToken) return;
    setLoading(true);
    try {
      await API.patch(`/tokens/${currentToken.id}/start`);
      await fetchCurrentToken(counter.id);
    } catch (error) {
      console.error('Error starting service:', error);
    }
    setLoading(false);
  };

  const handleCompleteService = async () => {
    if (!currentToken) return;
    setLoading(true);
    try {
      await API.patch(`/tokens/${currentToken.id}/complete`);
      setCurrentToken(null);
      await new Promise((resolve) => setTimeout(resolve, 500));
      await fetchCurrentToken(counter.id);
    } catch (error) {
      console.error('Error completing service:', error);
    }
    setLoading(false);
  };

  if (!staff) {
    return <div className="min-h-screen page-bg text-white flex items-center justify-center">Loading...</div>;
  }

  if (!counter) {
    // allow staff to choose a service to claim a counter
    return (
      <div className="min-h-screen page-bg flex items-center justify-center p-4 relative overflow-hidden">
        <div className="floating-orb top-8 left-8 w-40 h-40 bg-amber-300/30"></div>
        <div className="glass-panel rounded-[2rem] shadow-2xl p-8 text-center max-w-lg w-full relative z-10 animate-fade-in-up">
          <div className="text-5xl mb-4">🪪</div>
          <h1 className="text-3xl font-black text-slate-900 mb-4">No Service Assigned</h1>
          <p className="text-slate-600 mb-4">Select the service you will serve and claim an available counter.</p>
          <ServiceSelector onAssigned={async () => { await fetchStaffData(); }} />
          <div className="mt-6">
            <button
              onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                navigate('/login');
              }}
              className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-semibold hover:bg-slate-800"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen page-bg p-6 md:p-8 relative overflow-hidden">
      <div className="floating-orb top-10 left-10 w-44 h-44 bg-cyan-400/25"></div>
      <div className="floating-orb bottom-10 right-10 w-52 h-52 bg-indigo-500/20"></div>
      <div className="max-w-2xl mx-auto relative z-10">
        <div className="glass-panel rounded-[2rem] p-8 mb-6 animate-fade-in-up">
          <div className="flex justify-between items-center mb-6">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500 mb-2">Staff view</p>
              <h1 className="text-3xl font-black text-slate-900">Staff Dashboard</h1>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                navigate('/login');
              }}
              className="bg-red-500 text-white px-4 py-3 rounded-2xl font-semibold hover:bg-red-600"
            >
              Logout
            </button>
          </div>

          <div className="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <p className="text-slate-600 text-sm">Staff: {staff.name}</p>
            <p className="text-slate-600 text-sm">Counter: #{counter.counterNo}</p>
            <p className="text-slate-600 text-sm">Status: {counter.status}</p>
          </div>
        </div>

        <div className="glass-panel rounded-[2rem] shadow-2xl p-8 animate-fade-in-up delay-1">
          <h2 className="text-2xl font-black text-slate-900 mb-6 section-title">Current Token</h2>

          {currentToken ? (
            <div>
              <div className="bg-gradient-to-br from-slate-900 via-indigo-700 to-cyan-600 rounded-[1.75rem] p-8 text-white text-center mb-6 transform transition duration-300 shadow-xl">
                <p className="text-lg mb-2">Now Serving</p>
                <p className="text-7xl font-bold animate-pulse">{currentToken.tokenNo}</p>
                <p className="text-sm mt-2">Status: {currentToken.status}</p>
              </div>

              <div className="flex gap-4">
                {currentToken.status === 'CALLED' && (
                  <button
                    onClick={handleStartService}
                    disabled={loading}
                    className="flex-1 bg-emerald-500 text-white py-4 rounded-2xl font-bold text-lg hover:bg-emerald-600 disabled:opacity-50 transform active:scale-95 transition shadow-lg"
                  >
                    {loading ? 'Starting...' : 'Start Service'}
                  </button>
                )}
                {currentToken.status === 'IN_PROGRESS' && (
                  <button
                    onClick={handleCompleteService}
                    disabled={loading}
                    className="flex-1 bg-cyan-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-cyan-700 disabled:opacity-50 transform active:scale-95 transition shadow-lg"
                  >
                    {loading ? 'Completing...' : 'Complete Service'}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <p className="text-center text-slate-600 text-lg py-8">Waiting for next token...</p>
          )}
        </div>
      </div>
    </div>
  );
}

function ServiceSelector({ onAssigned }) {
  const [services, setServices] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    API.get('/services').then((r) => setServices(r.data)).catch(() => {});
  }, []);

  const handleClaim = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      await API.post('/staff/assign', { serviceId: selected });
      onAssigned && onAssigned();
    } catch (e) {
      alert(e.response?.data?.error || 'Failed to assign');
    }
    setLoading(false);
  };

  return (
    <div>
      <select
        value={selected || ''}
        onChange={(e) => setSelected(Number(e.target.value))}
        className="w-full p-3 border border-slate-200 rounded-2xl mb-4 bg-white"
      >
        <option value="">Select Service</option>
        {services.map((s) => (
          <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
        ))}
      </select>
      <button onClick={handleClaim} disabled={!selected || loading} className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 text-white p-3 rounded-2xl font-semibold shadow-lg">
        {loading ? 'Claiming...' : 'Claim Service'}
      </button>
    </div>
  );
}
