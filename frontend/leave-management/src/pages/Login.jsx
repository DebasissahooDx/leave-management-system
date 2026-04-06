import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios';
import { Link } from 'react-router-dom';
import { ShieldCheck, User, Lock, Mail } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // CHANGED: Defaulting to 'employee' to match backend standards
  const [activeRole, setActiveRole] = useState('employee'); 
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.post('/auth/login', { email, password });
      
      // Normalize both to lowercase to avoid "Employee" vs "employee" errors
      const backendRole = data.role.toLowerCase();
      const selectedRole = activeRole.toLowerCase();

      if (backendRole !== selectedRole) {
        alert(`Access Denied: Your account is a ${data.role}. Please select the correct button above.`);
        return;
      }

      login({ name: data.name, role: data.role }, data.token);
    } catch (err) {
      alert(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] bg-gradient-to-br from-slate-900 via-orange-950/20 to-slate-900 p-6">
      
      {/* GLASS CONTAINER */}
      <div className="w-full max-w-md backdrop-blur-2xl bg-white/5 border border-white/10 p-10 rounded-[2.5rem] shadow-2xl">
        
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black tracking-tighter uppercase text-white">
            HY<span className="text-orange-500">SCALER</span>
          </h1>
          <div className="h-1 w-12 bg-orange-500 mx-auto mt-2 rounded-full"></div>
        </div>

        {/* ROLE SWITCHER */}
        <div className="flex p-1 bg-white/5 backdrop-blur-md rounded-2xl mb-8 border border-white/5">
          <button
            type="button"
            onClick={() => setActiveRole('employee')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase transition-all duration-300 ${
              activeRole === 'employee' 
              ? 'bg-orange-500 text-white shadow-lg' 
              : 'text-slate-400 hover:text-white'
            }`}
          >
            <User size={14} /> Employee
          </button>
          <button
            type="button"
            onClick={() => setActiveRole('manager')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase transition-all duration-300 ${
              activeRole === 'manager' 
              ? 'bg-white text-slate-900 shadow-lg' 
              : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck size={14} /> Manager
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative group">
            <Mail className="absolute left-4 top-4 text-slate-500 group-focus-within:text-orange-500 transition-colors" size={18} />
            <input 
              type="email" placeholder="Work Email" required
              className="w-full bg-white/5 border border-white/10 p-4 pl-12 rounded-2xl outline-none focus:border-orange-500/50 focus:bg-white/10 transition-all font-medium text-white placeholder:text-slate-500"
              value={email} onChange={(e) => setEmail(e.target.value)} 
            />
          </div>

          <div className="relative group">
            <Lock className="absolute left-4 top-4 text-slate-500 group-focus-within:text-orange-500 transition-colors" size={18} />
            <input 
              type="password" placeholder="Password" required
              className="w-full bg-white/5 border border-white/10 p-4 pl-12 rounded-2xl outline-none focus:border-orange-500/50 focus:bg-white/10 transition-all font-medium text-white placeholder:text-slate-500"
              value={password} onChange={(e) => setPassword(e.target.value)} 
            />
          </div>

          <button 
            type="submit" 
            className="w-full py-5 rounded-2xl bg-white text-slate-900 font-black uppercase text-xs tracking-widest hover:bg-orange-500 hover:text-white transition-all shadow-xl active:scale-95 mt-4"
          >
            Enter Dashboard
          </button>
        </form>

        <div className="mt-10 text-center">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            New to Hyscaler? <Link to="/register" className="text-orange-500 ml-1 hover:text-white transition-colors">Create Account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;