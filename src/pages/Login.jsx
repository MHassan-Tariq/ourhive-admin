import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import authService from '../services/authService';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const data = await authService.login(email, password);
      
      if (data.user.role === 'admin') {
        navigate('/');
      } else {
        setError('Access denied. Admin role required.');
        authService.logout();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-accent relative overflow-hidden font-sans">
      {/* Decorative Shapes */}
      <div className="absolute top-[-200px] right-[-100px] w-[600px] h-[600px] bg-primary rounded-full z-1"></div>
      <div className="absolute bottom-[-150px] left-[-100px] w-[400px] h-[400px] bg-[#F5D59E] rounded-full z-1"></div>
      <div className="absolute bottom-[50px] right-[-50px] w-[300px] h-[300px] bg-[#8D541E] rounded-full z-1"></div>
      
      <div className="w-full max-w-[500px] mx-4 bg-white p-8 md:p-14 rounded-xl shadow-2xl relative z-10 text-center">
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Portal Login</h1>
          <p className="text-sm text-gray-500">Secure access for organization manager</p>
        </header>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm text-left">
            {error}
          </div>
        )}
        
        <form className="text-left" onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-600 mb-3">Email address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@ourhive.com" 
              className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-accent transition-all"
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-600 mb-3">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="******" 
                className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-accent transition-all"
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <a href="#" className="block text-right text-sm text-gray-400 mt-3 hover:text-primary transition-colors">Forget Password!</a>
          </div>
          
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-4 bg-accent text-gray-800 font-bold text-lg rounded-lg hover:bg-[#E5A600] disabled:bg-gray-200 disabled:text-gray-400 transition-all mt-5 shadow-lg shadow-accent/20 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={24} />
            ) : (
              'Log In'
            )}
          </button>
        </form>
        
        <footer className="mt-10 text-xs text-primary font-semibold">
          Powered by Mrs'Bs Table
        </footer>
      </div>
    </div>
  );
};

export default Login;
