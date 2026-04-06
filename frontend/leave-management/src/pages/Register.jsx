import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';
import { UserPlus, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee' 
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic Client-side Validation
    if (formData.password.length < 6) {
      return alert("Security Key must be at least 6 characters long.");
    }

    setIsSubmitting(true);

    try {
      // Ensure the endpoint matches your Backend route (e.g., /api/auth/register)
      // If your axios base URL already includes /api, '/auth/register' is correct.
      await API.post('/auth/register', formData);
      
      alert('Account Initialized Successfully!');
      navigate('/login');
    } catch (err) {
      // Detailed error logging to help you debug the CONNECTION_REFUSED
      console.error("Registration Error Detail:", err);
      
      const errorMessage = err.response?.data?.message 
        || (err.message === "Network Error" ? "Backend Server is offline (Port 5000)" : "Registration failed");
      
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#f8fafc]">
      <div className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-2xl border border-slate-100">
        
        {/* BRANDING & HEADER */}
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="bg-orange-50 p-4 rounded-2xl mb-4 text-orange-600 ring-4 ring-orange-50/50">
            <UserPlus size={32} strokeWidth={2.5} />
          </div>
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">
            Join <span className="text-orange-600">HyScaler</span>
          </h2>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2">
            Create your workspace account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* FULL NAME */}
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Full Name</label>
            <input 
              type="text" 
              required
              placeholder="Enter your full name"
              value={formData.name}
              disabled={isSubmitting}
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-orange-600 outline-none transition-all placeholder:text-slate-300 disabled:opacity-60"
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          {/* EMAIL */}
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Work Email</label>
            <input 
              type="email" 
              required
              placeholder="name@hyscaler.com"
              value={formData.email}
              disabled={isSubmitting}
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-orange-600 outline-none transition-all placeholder:text-slate-300 disabled:opacity-60"
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Security Key (Min. 6 chars)</label>
            <input 
              type="password" 
              required
              placeholder="••••••••"
              value={formData.password}
              disabled={isSubmitting}
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-orange-600 outline-none transition-all placeholder:text-slate-300 disabled:opacity-60"
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          {/* ROLE SELECT */}
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Access Level</label>
            <div className="relative">
              <select 
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black uppercase focus:ring-2 focus:ring-orange-600 outline-none appearance-none cursor-pointer disabled:opacity-60"
                value={formData.role}
                disabled={isSubmitting}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
              >
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <ShieldCheck size={18} />
              </div>
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] hover:bg-orange-600 transition-all duration-300 shadow-xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Initializing...
              </>
            ) : (
              <>
                Create Account
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* FOOTER LINK */}
        <p className="mt-8 text-center text-slate-400 text-[11px] font-bold uppercase tracking-widest">
          Already verified? <Link to="/login" className="text-orange-600 hover:text-slate-900 transition-colors">Sign In Here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;