import { useState, useEffect } from 'react';
import API from '../api/axios';
import { 
  Plus, 
  History, 
  Calendar, 
  FileText,
  AlertCircle,
  Loader2
} from 'lucide-react';

const EmployeeDash = () => {
  const [balance, setBalance] = useState({ vacation: 0, sick: 0 });
  const [myLeaves, setMyLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Set to 30 as requested
  const TOTAL_SICK_ALLOWED = 30;
  const TOTAL_VACATION_ALLOWED = 30;

  const [leaveForm, setLeaveForm] = useState({
    type: 'vacation',
    startDate: '',
    endDate: '',
    reason: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  /**
   * Helper: Calculates total days between two dates inclusive.
   * Uses Math.round to prevent Daylight Savings Time (DST) floating point errors.
   */
  const getDaysCount = (start, end) => {
    const d1 = new Date(start);
    const d2 = new Date(end);
    
    // Reset times to midnight to ensure clean day calculation
    d1.setHours(0, 0, 0, 0);
    d2.setHours(0, 0, 0, 0);

    const diffInMs = d2.getTime() - d1.getTime();
    const diffInDays = Math.round(diffInMs / (1000 * 60 * 60 * 24)) + 1;
    
    return diffInDays > 0 ? diffInDays : 0;
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [balRes, leaveRes] = await Promise.all([
        API.get('/leave/balance'),
        API.get('/leave/my')
      ]);

      const history = leaveRes.data || [];
      
      // Calculate used days based ONLY on 'approved' status
      const usedVacation = history
        .filter(l => l.status === 'approved' && l.type === 'vacation')
        .reduce((acc, l) => acc + getDaysCount(l.startDate, l.endDate), 0);

      const usedSick = history
        .filter(l => l.status === 'approved' && l.type === 'sick')
        .reduce((acc, l) => acc + getDaysCount(l.startDate, l.endDate), 0);

      // UI Logic: Remaining = Total - Approved
      setBalance({
        vacation: Math.max(0, TOTAL_VACATION_ALLOWED - usedVacation),
        sick: Math.max(0, TOTAL_SICK_ALLOWED - usedSick)
      });
      
      setMyLeaves(history);
    } catch (err) {
      console.error("Error fetching dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    if (!leaveForm.startDate || !leaveForm.endDate || !leaveForm.reason) {
      return alert("Please fill in all fields.");
    }

    const requestedDays = getDaysCount(leaveForm.startDate, leaveForm.endDate);
    
    if (requestedDays <= 0) {
      return alert("End date must be after or equal to start date.");
    }

    if (requestedDays > balance[leaveForm.type]) {
      return alert(`Insufficient ${leaveForm.type} balance. You are requesting ${requestedDays} days, but only have ${balance[leaveForm.type]} left.`);
    }

    try {
      await API.post('/leave/apply', leaveForm);
      alert('Leave request submitted successfully!');
      setLeaveForm({ type: 'vacation', startDate: '', endDate: '', reason: '' });
      fetchData(); 
    } catch (err) {
      alert(err.response?.data?.message || 'Submission failed');
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-orange-600" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Updating Balance</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans antialiased pb-20">
      <div className="max-w-[1200px] mx-auto px-6 pt-10">
        
        {/* HEADER */}
        <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-10">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-10 bg-slate-900 rounded-full"></div>
              <h1 className="text-4xl font-black tracking-tighter uppercase">
                HY<span className="text-orange-600">SCALER</span>
              </h1>
            </div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-2 ml-6">Employee Command Center</p>
          </div>

          <div className="flex items-center gap-4 bg-white border border-slate-200 px-6 py-4 rounded-[2rem] shadow-sm">
            <Calendar className="text-orange-600" size={20} />
            <div className="border-l border-slate-100 pl-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Standard Time</p>
              <p className="text-sm font-bold text-slate-700">{new Date().toDateString()}</p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* LEFT SIDE */}
          <div className="lg:col-span-7 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Vacation Card */}
              <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Calendar size={80} className="text-white" />
                </div>
                <p className="text-orange-500 text-[11px] font-black uppercase tracking-[0.2em] mb-4">Vacation Remaining</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-7xl font-black text-white tracking-tighter">{balance.vacation}</span>
                  <span className="text-slate-500 text-sm font-bold uppercase">/ {TOTAL_VACATION_ALLOWED} Days</span>
                </div>
              </div>

              {/* Sick Card */}
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                <p className="text-slate-400 text-[11px] font-black uppercase tracking-[0.2em] mb-4">Medical Remaining</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-7xl font-black text-slate-900 tracking-tighter">{balance.sick}</span>
                  <span className="text-slate-300 text-sm font-bold uppercase">/ {TOTAL_SICK_ALLOWED} Days</span>
                </div>
              </div>
            </div>

            {/* LOGS */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-10 py-8 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                <h2 className="text-xs font-black uppercase tracking-widest text-slate-900 flex items-center gap-3">
                  <History size={18} className="text-orange-600" strokeWidth={2.5} /> Recent Activity
                </h2>
              </div>
              <div className="max-h-[450px] overflow-y-auto divide-y divide-slate-50">
                {myLeaves.length > 0 ? [...myLeaves].reverse().map((leave) => (
                  <div key={leave._id} className="px-10 py-6 flex items-center justify-between hover:bg-slate-50/80 transition-colors">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-black uppercase text-slate-900 tracking-tight">{leave.type}</p>
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          leave.status === 'approved' ? 'bg-green-500' : 
                          leave.status === 'rejected' ? 'bg-red-500' : 'bg-orange-500'
                        }`}></div>
                      </div>
                      <p className="text-[11px] text-slate-400 font-bold mt-1 tracking-tighter">
                        {formatDate(leave.startDate)} — {formatDate(leave.endDate)}
                        <span className="ml-2 text-slate-300">({getDaysCount(leave.startDate, leave.endDate)} Days)</span>
                      </p>
                    </div>
                    <span className={`text-[9px] font-black uppercase px-4 py-2 rounded-full border ${
                      leave.status === 'approved' ? 'border-green-100 text-green-600 bg-green-50' : 
                      leave.status === 'rejected' ? 'border-red-100 text-red-600 bg-red-50' :
                      'border-orange-100 text-orange-600 bg-orange-50'
                    }`}>
                      {leave.status}
                    </span>
                  </div>
                )) : (
                  <div className="p-24 text-center text-slate-300 font-black text-[10px] uppercase tracking-[0.4em]">No Leave History</div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: APPLICATION FORM */}
          <div className="lg:col-span-5">
            <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 sticky top-10">
              <div className="mb-10">
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-3">
                  <FileText className="text-orange-600" /> New <span className="text-orange-600">Request</span>
                </h2>
              </div>

              <form onSubmit={handleApply} className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Leave Category</label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl font-black text-[11px] uppercase focus:ring-2 focus:ring-orange-600 outline-none cursor-pointer" 
                    value={leaveForm.type} 
                    onChange={(e) => setLeaveForm({...leaveForm, type: e.target.value})}
                  >
                    <option value="vacation">Annual Vacation</option>
                    <option value="sick">Sick / Medical Leave</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Start Date</label>
                    <input 
                      type="date" 
                      className="w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl text-[11px] font-bold focus:ring-2 focus:ring-orange-600 outline-none" 
                      value={leaveForm.startDate} 
                      onChange={(e) => setLeaveForm({...leaveForm, startDate: e.target.value})} 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">End Date</label>
                    <input 
                      type="date" 
                      className="w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl text-[11px] font-bold focus:ring-2 focus:ring-orange-600 outline-none" 
                      value={leaveForm.endDate} 
                      onChange={(e) => setLeaveForm({...leaveForm, endDate: e.target.value})} 
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Reason for Leave</label>
                  <textarea 
                    placeholder="Enter description..." 
                    className="w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl h-36 text-xs font-medium focus:ring-2 focus:ring-orange-600 outline-none resize-none" 
                    value={leaveForm.reason} 
                    onChange={(e) => setLeaveForm({...leaveForm, reason: e.target.value})}
                  ></textarea>
                </div>

                <button className="group w-full bg-slate-900 hover:bg-orange-600 text-white font-black py-6 rounded-2xl transition-all shadow-xl uppercase text-[11px] tracking-[0.2em] flex items-center justify-center gap-4">
                  Submit to Manager <Plus size={18} className="group-hover:rotate-90 transition-transform" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDash;