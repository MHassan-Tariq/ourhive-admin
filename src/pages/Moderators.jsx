import React, { useState, useEffect } from 'react';
import { 
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  ShieldCheck,
  UserX
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import adminService from '../services/adminService';

const Moderators = () => {
  const navigate = useNavigate();
  const [moderators, setModerators] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchModerators = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminService.getAllUsers({
        search,
        page,
        limit: 10,
        role: 'moderator'
      });
      console.log('DEBUG: Moderators page fetch result:', data);
      setModerators(data.data || []);
      setTotalPages(data.pages || 1);
      setTotalCount(data.total || data.count || 0);
    } catch (err) {
      setError('Failed to load moderators. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchModerators();
    }, 500); // Debounce search

    return () => clearTimeout(timer);
  }, [search, page]);

  const handleRevokeRole = async (userId) => {
    if (!window.confirm('Are you sure you want to revoke moderator permissions for this user?')) return;
    
    try {
      await adminService.updateUserRole(userId, 'donor');
      setModerators(prev => prev.filter(m => m._id !== userId));
      setTotalCount(prev => prev - 1);
      alert('Moderator permissions revoked successfully.');
    } catch (err) {
      alert('Failed to revoke permissions.');
      console.error(err);
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Moderators</h1>
          <p className="text-sm text-gray-500">Manage and track all moderator accounts.</p>
        </div>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search moderators by name or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-12 pr-4 py-3 bg-white border border-black/5 rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm"
          />
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-700">
          <AlertCircle size={20} />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
        <div className="overflow-x-auto min-h-[400px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-[400px] text-gray-400 gap-4">
              <Loader2 className="animate-spin text-primary" size={40} />
              <p className="text-sm font-medium">Loading moderators...</p>
            </div>
          ) : moderators.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[400px] text-gray-400 gap-2">
              <p className="text-sm font-medium">No moderators found matching your criteria.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider border-bottom border-black/5">NAME</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">EMAIL</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">JOINED</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {moderators.map((user) => (
                  <tr key={user._id} className="group hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-sm mr-3">
                          {user.firstName?.[0] || 'U'}
                        </div>
                        <span className="text-sm font-bold text-gray-800">
                          {user.firstName} {user.lastName}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600 font-medium">{user.email}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleRevokeRole(user._id)} 
                          className="flex items-center gap-2 px-3 py-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg text-xs font-bold transition-colors"
                          title="Revoke Moderator Role"
                        >
                          <UserX size={14} />
                          <span>Revoke Moderator</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        
        {!isLoading && moderators.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-gray-100 gap-4">
            <span className="text-xs text-gray-500 font-medium italic">Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, totalCount)} of {totalCount} moderators</span>
            <div className="flex items-center gap-1.5">
              <button 
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-3 py-1.5 text-xs font-bold text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
              >
                <ChevronLeft size={14} />
                Previous
              </button>
              
              <button 
                disabled={page === totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 text-xs font-bold text-gray-600 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
              >
                Next
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Moderators;
