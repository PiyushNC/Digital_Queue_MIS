import { useState, useEffect } from 'react';

export default function Display() {
  const [nowServing, setNowServing] = useState([]);
  const [waitingByService, setWaitingByService] = useState([]);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:5000');

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setNowServing(data.nowServing || []);
        setWaitingByService(data.waitingByService || []);
      } catch (error) {
        console.error('Error parsing WebSocket data:', error);
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  return (
    <div className="min-h-screen page-bg p-6 md:p-8 relative overflow-hidden">
      <div className="floating-orb top-16 left-10 w-48 h-48 bg-cyan-400/25"></div>
      <div className="floating-orb bottom-16 right-10 w-56 h-56 bg-purple-500/20"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center text-white mb-10 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/15 mb-4">
            <span>📺</span>
            <span className="font-semibold">Live queue broadcast</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black hero-title mb-3">Service Display Board</h1>
          <p className="text-white/75 max-w-2xl mx-auto">Now serving tokens and the next waiting token per service, updated in real time.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="glass-panel rounded-[2rem] p-8 lift-hover animate-fade-in-up">
            <h2 className="text-3xl font-black text-slate-900 mb-6 section-title">Now Serving</h2>
            <div className="space-y-4">
              {nowServing.length > 0 ? (
                nowServing.map((item, index) => (
                  <div key={index} className="bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-[1.5rem] p-6 text-white transform transition transform-gpu hover:scale-[1.02] hover:shadow-2xl shadow-lg">
                    <p className="text-lg text-white/80">Counter</p>
                    <p className="text-5xl font-bold mb-2">{item.counterNo}</p>
                    <p className="text-lg text-white/80">Token</p>
                    <p className="text-4xl font-bold">{item.tokenNo}</p>
                  </div>
                ))
              ) : (
                <p className="text-slate-600 text-lg">No one is being served right now</p>
              )}
            </div>
          </div>

          <div className="glass-panel rounded-[2rem] p-8 lift-hover animate-fade-in-up delay-1">
            <h2 className="text-3xl font-black text-slate-900 mb-6 section-title">Next in Queue</h2>
            <div className="space-y-4">
              {waitingByService.length > 0 ? (
                waitingByService.map((svc) => (
                  <div key={svc.serviceId} className="border border-slate-200 bg-white/70 p-4 rounded-[1.5rem]">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="text-lg font-bold text-slate-900">{svc.serviceCode} - {svc.serviceName}</div>
                        <div className="text-sm text-slate-500">Next up</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {svc.waiting.length > 0 ? (
                        svc.waiting.map((t, i) => (
                          <div key={i} className="bg-sky-50 rounded-2xl p-3 flex items-center transition transform hover:translate-x-1 hover:shadow">
                            <span className="text-slate-600 w-6">{i + 1}.</span>
                            <span className="ml-3 font-bold text-sky-700">{t.tokenNo}</span>
                            <span className="ml-auto text-sm text-slate-400">{t.createdAt ? new Date(t.createdAt).toLocaleTimeString() : ''}</span>
                          </div>
                        ))
                      ) : (
                        <div className="text-slate-500">No waiting tokens</div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-600 text-lg">Queue is empty</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
