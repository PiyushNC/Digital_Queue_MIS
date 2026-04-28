import { useState, useEffect } from 'react';
import API from '../api';

export default function Kiosk() {
  const [services, setServices] = useState([]);
  const [token, setToken] = useState(null);
  const [queuePosition, setQueuePosition] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await API.get('/services');
      setServices(response.data);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const generateToken = async (serviceId) => {
    setLoading(true);
    try {
      const response = await API.post('/tokens/generate', { serviceId });
      setToken(response.data.tokenNo);

      const queueResponse = await API.get(`/tokens/${serviceId}/queue`);
      setQueuePosition(queueResponse.data.length);
    } catch (error) {
      console.error('Error generating token:', error);
    }
    setLoading(false);
  };

  if (token) {
    return (
      <div className="min-h-screen kiosk-bg flex items-center justify-center p-4">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-8 left-10 text-6xl float-slow">🎫</div>
          <div className="absolute bottom-10 left-16 text-5xl float-medium">⚡</div>
          <div className="absolute top-20 right-10 text-6xl float-fast">📢</div>
          <div className="absolute bottom-16 right-20 text-5xl float-slow">✨</div>
        </div>

        <div className="relative bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-[0_25px_80px_rgba(15,23,42,0.35)] p-8 text-center max-w-xl w-full border border-white/50 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 font-semibold mb-6 mx-auto">
            <span>✅</span>
            <span>Token issued successfully</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-black mb-3 text-slate-900">Your turn is reserved</h1>
          <p className="text-slate-600 mb-8">Please keep this screen open and wait for your token to be called.</p>

          <div className="bg-gradient-to-br from-sky-500 to-indigo-600 rounded-[1.75rem] p-8 mb-6 text-white shadow-xl token-card-glow">
            <p className="text-white/80 text-sm uppercase tracking-[0.35em] mb-3">Your Token</p>
            <p className="text-7xl font-black drop-shadow-lg">{token}</p>
            <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl bg-white/15 p-3">
                <div className="text-white/75">Queue Position</div>
                <div className="text-2xl font-bold">#{queuePosition}</div>
              </div>
              <div className="rounded-2xl bg-white/15 p-3">
                <div className="text-white/75">Status</div>
                <div className="text-2xl font-bold">Waiting</div>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              setToken(null);
              setQueuePosition(null);
            }}
            className="bg-slate-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-slate-800 transition transform active:scale-95"
          >
            Generate Another Token
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen kiosk-bg p-6 md:p-8 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-70">
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-cyan-300/30 blur-3xl"></div>
        <div className="absolute top-24 right-16 w-44 h-44 rounded-full bg-fuchsia-400/20 blur-3xl"></div>
        <div className="absolute bottom-10 left-1/3 w-56 h-56 rounded-full bg-emerald-300/20 blur-3xl"></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center text-white mb-10 animate-fade-in-up">
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/15 backdrop-blur-md border border-white/20 mb-5">
            <span className="text-2xl">🎟️</span>
            <span className="font-semibold tracking-wide">Digital Queue and Tokenisation System</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4 leading-tight">
            Faster service.
            <span className="block text-cyan-200">Smarter token flow.</span>
          </h1>
          <p className="text-white/80 max-w-2xl mx-auto text-base md:text-lg">
            Pick a service, generate a token, and watch the queue move in real time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 animate-fade-in-up delay-1">
          {[
            { icon: '🎫', title: 'Instant Token', text: 'Generate your turn in seconds.' },
            { icon: '📡', title: 'Live Updates', text: 'The display updates in real time.' },
            { icon: '🧑‍💼', title: 'Service Based', text: 'Select the right counter path.' },
          ].map((item) => (
            <div key={item.title} className="bg-white/14 backdrop-blur-md border border-white/20 rounded-3xl p-5 text-white shadow-xl hover:-translate-y-1 transition duration-300">
              <div className="text-3xl mb-3">{item.icon}</div>
              <h2 className="text-xl font-bold mb-1">{item.title}</h2>
              <p className="text-white/75 text-sm">{item.text}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service) => (
            <div
              key={service.id}
              className="group bg-white/92 backdrop-blur rounded-[1.75rem] shadow-2xl p-6 hover:-translate-y-2 hover:shadow-[0_20px_60px_rgba(15,23,42,0.25)] transform transition duration-300 ease-out border border-white/60"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-sky-100 text-sky-700 font-bold text-sm">
                    <span>🏷️</span>
                    <span>Service {service.code}</span>
                  </div>
                  <div className="text-2xl font-black text-slate-900 mb-1">{service.name}</div>
                  <div className="text-sm text-slate-500">{service.description}</div>
                </div>
                <div className="text-4xl animate-bounce-slow">{service.code === 'A' ? '🏦' : service.code === 'B' ? '💳' : service.code === 'C' ? '🏠' : '⚙️'}</div>
              </div>
              <div className="mt-6">
                <button
                  onClick={() => generateToken(service.id)}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-slate-900 via-indigo-700 to-cyan-600 text-white py-3 rounded-2xl font-semibold hover:brightness-110 transform active:scale-95 transition shadow-lg"
                >
                  {loading ? 'Generating...' : 'Get Token'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
