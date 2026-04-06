import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut, LayoutGrid, User, ShieldCheck } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);

  if (!user) return null; // Don't show navbar if not logged in

  return (
    <nav className="bg-[#1a1a1e] border-b border-slate-800 px-8 py-4 flex justify-between items-center sticky top-0 z-50">
      {/* Brand Identity */}
      <div className="flex items-center gap-3">
        <div className="bg-orange-500 p-1.5 rounded-sm">
          <LayoutGrid size={20} className="text-white" />
        </div>
        <span className="text-xl font-black text-white tracking-tighter uppercase">
          HY<span className="text-orange-500">SCALER</span>
        </span>
      </div>

      <div className="flex items-center gap-8">
        {/* Dashboard Link */}
        <Link 
          to={user.role === 'manager' ? '/manager-dashboard' : '/employee-dashboard'} 
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-orange-500 transition-colors"
        >
          <LayoutGrid size={14} /> Dashboard
        </Link>
        
        {/* User Profile & Logout */}
        <div className="flex items-center gap-6 border-l border-slate-800 pl-8">
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs font-bold text-white tracking-tight">{user.name}</p>
              <div className="flex items-center justify-end gap-1 mt-0.5">
                {user.role === 'manager' && <ShieldCheck size={10} className="text-orange-500" />}
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">
                  {user.role}
                </p>
              </div>
            </div>
            <div className="h-8 w-8 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700">
              <User size={16} className="text-slate-400" />
            </div>
          </div>

          <button 
            onClick={logout}
            className="flex items-center gap-2 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500/10 rounded border border-transparent hover:border-red-500/20 transition-all"
            title="Terminate Session"
          >
            <LogOut size={14} />
            <span className="hidden md:inline">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;