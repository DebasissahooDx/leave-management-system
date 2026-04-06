import { useState, useEffect } from 'react';
import API from '../api/axios';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import { Users, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';

const ManagerDash = () => {
  const [stats, setStats] = useState({ totalEmployees: 50, totalApprovedLeaves: 0 });
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchManagerData();
  }, []);

  const fetchManagerData = async () => {
    try {
      const [statsRes, leavesRes] = await Promise.all([
        API.get('/leave/dashboard/stats'),
        API.get('/leave/all')
      ]);
      
      setStats({ 
        totalApprovedLeaves: statsRes.data.totalApprovedLeaves || 0, 
        totalEmployees: 50 
      });
      
      setLeaves(leavesRes.data || []);
    } catch (err) {
      console.error("Error fetching manager data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, status) => {
    const actionText = status === 'approved' ? "APPROVE" : "REJECT";
    const managerComment = prompt(`Enter a comment for this ${actionText}:`);
    
    if (managerComment === null) return;

    try {
      await API.put(`/leave/${id}`, { status, managerComment });
      fetchManagerData(); 
    } catch (err) {
      alert("Action failed: " + (err.response?.data?.message || "Server Error"));
    }
  };

  const calendarEvents = (leaves || [])
    .filter(l => l.status === 'approved')
    .map(l => {
      const empName = l.userId?.name || "Employee";
      
      // Fix for end-date visibility (FullCalendar exclusive end)
      const end = new Date(l.endDate);
      end.setDate(end.getDate() + 1);

      return {
        title: `${empName.toUpperCase()} (${l.type === 'sick' ? 'MED' : 'VAC'})`, 
        start: l.startDate.split('T')[0],
        end: end.toISOString().split('T')[0],
        backgroundColor: l.type === 'vacation' ? '#f97316' : '#0f172a',
        borderColor: 'transparent',
        textColor: '#ffffff',
        display: 'block' // Ensures the color fills the background
      };
    });

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#f8fafc]">
      <div className="h-12 w-12 border-4 border-slate-200 border-t-orange-600 rounded-full animate-spin mb-4"></div>
      <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Synchronizing Manager Suite</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-6 bg-[#f8fafc] min-h-screen font-sans">
      
      {/* 1. Statistics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Total Workforce</p>
            <p className="text-4xl font-black text-slate-900 tracking-tighter">{stats.totalEmployees}</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-2xl text-orange-600"><Users size={28} /></div>
        </div>

        <div className="bg-slate-900 p-8 rounded-[2rem] shadow-xl flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Active Approvals</p>
            <p className="text-4xl font-black text-white tracking-tighter">{stats.totalApprovedLeaves}</p>
          </div>
          <div className="bg-white/10 p-4 rounded-2xl text-orange-500"><CheckCircle size={28} /></div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        
        {/* 2. Pending Requests Table */}
        <div className="xl:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
              <Clock className="text-orange-600" size={18} /> Queue Management
            </h3>
            <span className="bg-orange-100 text-orange-600 text-[9px] font-black px-3 py-1 rounded-full uppercase">
              {leaves.filter(l => l.status === 'pending').length} Actions Required
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-slate-400 text-[9px] font-black uppercase tracking-widest border-b border-slate-50">
                  <th className="pb-4 text-left">Employee / Reason</th>
                  <th className="pb-4 text-left">Type</th>
                  <th className="pb-4 text-right">Decisions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {leaves.filter(l => l.status === 'pending').map((leave) => (
                  <tr key={leave._id} className="group hover:bg-slate-50/50 transition-all">
                    <td className="py-5">
                      <p className="font-black text-slate-900 text-sm">{leave.userId?.name || "Unknown User"}</p>
                      <p className="text-[11px] text-slate-400 font-medium line-clamp-1 italic">"{leave.reason}"</p>
                    </td>
                    <td className="py-5">
                      <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-md border ${
                        leave.type === 'vacation' ? 'bg-orange-50 border-orange-100 text-orange-600' : 'bg-slate-100 border-slate-200 text-slate-600'
                      }`}>
                        {leave.type}
                      </span>
                    </td>
                    <td className="py-5">
                      <div className="flex justify-end gap-4">
                        <button 
                          onClick={() => handleAction(leave._id, 'rejected')}
                          className="flex items-center gap-1.5 text-slate-300 hover:text-red-500 transition-colors uppercase text-[10px] font-black tracking-widest"
                        >
                          <XCircle size={16} /> Reject
                        </button>
                        <button 
                          onClick={() => handleAction(leave._id, 'approved')}
                          className="bg-slate-900 text-orange-500 hover:bg-orange-600 hover:text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg"
                        >
                          Approve
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {leaves.filter(l => l.status === 'pending').length === 0 && (
              <div className="py-20 text-center opacity-30">
                <AlertCircle className="mx-auto mb-3" size={32} />
                <p className="text-[10px] font-black uppercase tracking-[0.3em]">No pending items</p>
              </div>
            )}
          </div>
        </div>

        {/* 3. Calendar View */}
        <div className="xl:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
            <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-6">Attendance Matrix</h3>
            <div className="calendar-mini text-[10px] font-bold">
              <style>{`
                .fc .fc-toolbar-title { font-size: 0.9rem !important; font-weight: 900 !important; color: #0f172a; text-transform: uppercase; letter-spacing: 0.05em; }
                .fc .fc-button { background: #f8fafc !important; border: 1px solid #f1f5f9 !important; color: #0f172a !important; font-size: 0.6rem !important; font-weight: 900 !important; text-transform: uppercase; border-radius: 10px !important; padding: 6px 10px !important; }
                .fc-daygrid-day-number { font-size: 10px !important; font-weight: 800 !important; color: #94a3b8; }
                .fc-event { border: none !important; border-radius: 6px !important; }
              `}</style>
              <FullCalendar
                plugins={[dayGridPlugin]}
                initialView="dayGridMonth"
                events={calendarEvents}
                height="auto"
                headerToolbar={{ left: 'prev', center: 'title', right: 'next' }}
              />
            </div>

            <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-[#f97316] rounded-full shadow-[0_0_10px_rgba(249,115,22,0.4)]"></div>
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Vacation</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-[#0f172a] rounded-full shadow-[0_0_10px_rgba(15,23,42,0.4)]"></div>
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Medical</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ManagerDash;