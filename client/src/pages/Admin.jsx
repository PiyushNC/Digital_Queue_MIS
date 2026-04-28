import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

export default function Admin() {
  const [stats, setStats] = useState(null);
  const [services, setServices] = useState([]);
  const [counters, setCounters] = useState([]);
  const [counterEdits, setCounterEdits] = useState({});
  const navigate = useNavigate();

  const getAuthConfig = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token found. Please log in as admin again.');
    }

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const authConfig = getAuthConfig();
      const statsResponse = await API.get('/admin/dashboard', authConfig);
      const servicesResponse = await API.get('/services', authConfig);
      const countersResponse = await API.get('/counters', authConfig);

      setStats(statsResponse.data);
      setServices(servicesResponse.data);
      setCounters(countersResponse.data);
      setCounterEdits(
        Object.fromEntries(
          countersResponse.data.map((counter) => [
            counter.id,
            {
              counterNo: counter.counterNo,
              serviceId: counter.serviceId,
            },
          ])
        )
      );
    } catch (error) {
      console.error('Error fetching data:', error);
      navigate('/login');
    }
  };

  const [newSvc, setNewSvc] = useState({ name: '', code: '', description: '' });

  const createService = async () => {
    try {
      await API.post('/services', newSvc, getAuthConfig());
      setNewSvc({ name: '', code: '', description: '' });
      fetchData();
    } catch (e) {
      alert(e.response?.data?.error || 'Failed to create');
    }
  };

  const [newStaff, setNewStaff] = useState({ name: '', email: '', password: '', serviceId: '' });

  const [newCounter, setNewCounter] = useState({ counterNo: '', serviceId: '' });

  const createStaff = async () => {
    try {
      await API.post('/admin/staff', newStaff, getAuthConfig());
      setNewStaff({ name: '', email: '', password: '', serviceId: '' });
      fetchData();
    } catch (e) {
      if (e.message === 'No token found. Please log in as admin again.') {
        alert(e.message);
        navigate('/login');
        return;
      }
      alert(e.response?.data?.error || 'Failed to create staff');
    }
  };

  const deleteService = async (id) => {
    if (!confirm('Delete this service and its queue?')) return;
    try {
      await API.delete(`/services/${id}`, getAuthConfig());
      fetchData();
    } catch (e) {
      alert(e.response?.data?.error || 'Failed to delete');
    }
  };

  const createCounter = async () => {
    try {
      await API.post('/counters', newCounter, getAuthConfig());
      setNewCounter({ counterNo: '', serviceId: '' });
      fetchData();
    } catch (e) {
      if (e.message === 'No token found. Please log in as admin again.') {
        alert(e.message);
        navigate('/login');
        return;
      }
      alert(e.response?.data?.error || 'Failed to create counter');
    }
  };

  const updateCounter = async (id) => {
    try {
      const edit = counterEdits[id];
      await API.patch(`/counters/${id}`, edit, getAuthConfig());
      fetchData();
    } catch (e) {
      if (e.message === 'No token found. Please log in as admin again.') {
        alert(e.message);
        navigate('/login');
        return;
      }
      alert(e.response?.data?.error || 'Failed to update counter');
    }
  };

  const deleteCounter = async (id) => {
    if (!confirm('Delete this counter? Staff assignments will be cleared.')) return;
    try {
      await API.delete(`/counters/${id}`, getAuthConfig());
      fetchData();
    } catch (e) {
      if (e.message === 'No token found. Please log in as admin again.') {
        alert(e.message);
        navigate('/login');
        return;
      }
      alert(e.response?.data?.error || 'Failed to delete counter');
    }
  };

  return (
    <div className="min-h-screen page-bg p-6 md:p-8 relative overflow-hidden">
      <div className="floating-orb top-10 left-10 w-44 h-44 bg-fuchsia-500/20"></div>
      <div className="floating-orb bottom-10 right-10 w-56 h-56 bg-cyan-400/20"></div>
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8 text-white">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-white/70 mb-2">Control center</p>
            <h1 className="text-4xl md:text-5xl font-black hero-title">Admin Dashboard</h1>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              navigate('/login');
            }}
            className="bg-red-500 text-white px-6 py-3 rounded-2xl font-semibold hover:bg-red-600 shadow-lg"
          >
            Logout
          </button>
        </div>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="glass-panel rounded-[1.75rem] p-6 lift-hover">
              <p className="text-slate-500 text-sm font-semibold mb-2">Total Services</p>
              <p className="text-4xl font-black text-sky-600">{stats.services}</p>
            </div>
            <div className="glass-panel rounded-[1.75rem] p-6 lift-hover">
              <p className="text-slate-500 text-sm font-semibold mb-2">Total Counters</p>
              <p className="text-4xl font-black text-emerald-600">{stats.counters}</p>
            </div>
            <div className="glass-panel rounded-[1.75rem] p-6 lift-hover">
              <p className="text-slate-500 text-sm font-semibold mb-2">Total Tokens</p>
              <p className="text-4xl font-black text-fuchsia-600">{stats.totalTokens}</p>
            </div>
            <div className="glass-panel rounded-[1.75rem] p-6 lift-hover">
              <p className="text-slate-500 text-sm font-semibold mb-2">Completed</p>
              <p className="text-4xl font-black text-orange-500">{stats.completedTokens}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="glass-panel rounded-[2rem] shadow-2xl p-8 animate-fade-in-up">
            <h2 className="text-2xl font-black text-slate-900 mb-6 section-title">Create Service</h2>
            <div className="space-y-3">
              <input className="w-full p-3 border border-slate-200 rounded-2xl bg-white" placeholder="Service name" value={newSvc.name} onChange={(e)=>setNewSvc({...newSvc,name:e.target.value})} />
              <input className="w-full p-3 border border-slate-200 rounded-2xl bg-white" placeholder="Code (A)" value={newSvc.code} onChange={(e)=>setNewSvc({...newSvc,code:e.target.value})} />
              <input className="w-full p-3 border border-slate-200 rounded-2xl bg-white" placeholder="Description" value={newSvc.description} onChange={(e)=>setNewSvc({...newSvc,description:e.target.value})} />
              <button onClick={createService} className="bg-gradient-to-r from-slate-900 via-indigo-700 to-cyan-600 text-white px-4 py-3 rounded-2xl font-semibold shadow-lg">Create Service</button>
            </div>
          </div>
          <div className="glass-panel rounded-[2rem] shadow-2xl p-8 animate-fade-in-up delay-1">
            <h2 className="text-2xl font-black text-slate-900 mb-6 section-title">Create Staff</h2>
            <div className="space-y-3">
              <input className="w-full p-3 border border-slate-200 rounded-2xl bg-white" placeholder="Full name" value={newStaff.name} onChange={(e)=>setNewStaff({...newStaff,name:e.target.value})} />
              <input className="w-full p-3 border border-slate-200 rounded-2xl bg-white" placeholder="Email address" value={newStaff.email} onChange={(e)=>setNewStaff({...newStaff,email:e.target.value})} />
              <input className="w-full p-3 border border-slate-200 rounded-2xl bg-white" placeholder="Password" type="password" value={newStaff.password} onChange={(e)=>setNewStaff({...newStaff,password:e.target.value})} />
              <select className="w-full p-3 border border-slate-200 rounded-2xl bg-white" value={newStaff.serviceId} onChange={(e)=>setNewStaff({...newStaff,serviceId:e.target.value})}>
                <option value="">Select Service</option>
                {services.map(s => <option key={s.id} value={s.id}>{s.code} - {s.name}</option>)}
              </select>
              <button onClick={createStaff} className="bg-gradient-to-r from-emerald-600 to-cyan-600 text-white px-4 py-3 rounded-2xl font-semibold shadow-lg">Create Staff</button>
            </div>
          </div>
          <div className="glass-panel rounded-[2rem] shadow-2xl p-8 animate-fade-in-up">
            <h2 className="text-2xl font-black text-slate-900 mb-6 section-title">Add Counter</h2>
            <div className="space-y-3">
              <input
                className="w-full p-3 border border-slate-200 rounded-2xl bg-white"
                placeholder="Counter number"
                type="number"
                value={newCounter.counterNo}
                onChange={(e) => setNewCounter({ ...newCounter, counterNo: e.target.value })}
              />
              <select
                className="w-full p-3 border border-slate-200 rounded-2xl bg-white"
                value={newCounter.serviceId}
                onChange={(e) => setNewCounter({ ...newCounter, serviceId: e.target.value })}
              >
                <option value="">Select Service</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.code} - {service.name}
                  </option>
                ))}
              </select>
              <button onClick={createCounter} className="bg-gradient-to-r from-indigo-600 to-cyan-600 text-white px-4 py-3 rounded-2xl font-semibold shadow-lg">Create Counter</button>
            </div>
          </div>
          <div className="glass-panel rounded-[2rem] shadow-2xl p-8 animate-fade-in-up delay-1">
            <h2 className="text-2xl font-black text-slate-900 mb-6 section-title">Services</h2>
            <div className="space-y-3">
              {services.map((service) => (
                <div key={service.id} className="border-l-4 border-cyan-500 pl-4 py-3 flex items-center justify-between bg-white/60 rounded-r-2xl lift-hover">
                  <div>
                    <p className="font-semibold text-slate-900">{service.name}</p>
                    <p className="text-sm text-slate-600">Code: {service.code}</p>
                  </div>
                  <div>
                    <button onClick={()=>deleteService(service.id)} className="bg-red-500 text-white px-3 py-2 rounded-2xl">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel rounded-[2rem] shadow-2xl p-8 animate-fade-in-up">
            <h2 className="text-2xl font-black text-slate-900 mb-6 section-title">Counters Status</h2>
            <div className="space-y-3">
              {counters.map((counter) => (
                <div key={counter.id} className="border-b border-slate-200 pb-4 space-y-3">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div>
                      <p className="font-semibold text-slate-900">Counter #{counter.counterNo}</p>
                      <p className="text-sm text-slate-600">{counter.Service?.name}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        counter.status === 'AVAILABLE'
                          ? 'bg-green-200 text-green-800'
                          : counter.status === 'BUSY'
                          ? 'bg-yellow-200 text-yellow-800'
                          : 'bg-red-200 text-red-800'
                        }`}
                      >
                        {counter.status}
                      </span>
                      <span className="text-xs text-slate-500">{counter.Service?.code}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                    <input
                      className="w-full p-3 border border-slate-200 rounded-2xl bg-white"
                      type="number"
                      value={counterEdits[counter.id]?.counterNo ?? counter.counterNo}
                      onChange={(e) =>
                        setCounterEdits((prev) => ({
                          ...prev,
                          [counter.id]: {
                            ...(prev[counter.id] || { counterNo: counter.counterNo, serviceId: counter.serviceId }),
                            counterNo: e.target.value,
                          },
                        }))
                      }
                    />
                    <select
                      className="w-full p-3 border border-slate-200 rounded-2xl bg-white"
                      value={counterEdits[counter.id]?.serviceId ?? counter.serviceId}
                      onChange={(e) =>
                        setCounterEdits((prev) => ({
                          ...prev,
                          [counter.id]: {
                            ...(prev[counter.id] || { counterNo: counter.counterNo, serviceId: counter.serviceId }),
                            serviceId: e.target.value,
                          },
                        }))
                      }
                    >
                      {services.map((service) => (
                        <option key={service.id} value={service.id}>
                          {service.code} - {service.name}
                        </option>
                      ))}
                    </select>
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => updateCounter(counter.id)}
                        className="bg-gradient-to-r from-indigo-600 to-cyan-600 text-white px-4 py-3 rounded-2xl font-semibold shadow-lg"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => deleteCounter(counter.id)}
                        className="bg-red-500 text-white px-4 py-3 rounded-2xl font-semibold shadow-lg"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
