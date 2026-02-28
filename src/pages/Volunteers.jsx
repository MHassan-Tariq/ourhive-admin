import React, { useState, useEffect } from 'react';
import { 
  Download, 
  MoreVertical, 
  CheckCircle2, 
  Clock,
  ChevronLeft,
  ChevronRight,
  Search,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import adminService from '../services/adminService';

const Volunteers = () => {
  const navigate = useNavigate();
  const [volunteers, setVolunteers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchVolunteers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminService.getVolunteers({
        search,
        page,
        limit: 10
      });
      
      setVolunteers(data.data || []);
      setTotalPages(data.pagination?.pages || 1);
      setTotalCount(data.pagination?.total || 0);
    } catch (err) {
      setError('Failed to load volunteers. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchVolunteers();
    }, 500); // Debounce search

    return () => clearTimeout(timer);
  }, [search, page]);

  const getBadgeStyle = (hours) => {
    const h = parseInt(hours) || 0;
    if (h >= 200) return { label: 'Platinum', style: 'bg-purple-50 text-purple-700' };
    if (h >= 100) return { label: 'Gold', style: 'bg-orange-50 text-orange-700' };
    if (h >= 40) return { label: 'Silver', style: 'bg-gray-100 text-gray-500' };
    return { label: 'Bronze', style: 'bg-orange-50 text-orange-900' };
  };

  const handleExport = () => {
    if (volunteers.length === 0) {
       alert("No volunteers to export.");
       return;
    }

    const headers = ["Name", "Email", "Total Hours", "Screening Status"];
    const csvContent = [
      headers.join(","),
      ...volunteers.map(v => {
        const name = `"${v.firstName || ''} ${v.lastName || ''}"`.trim();
        const email = `"${v.userId?.email || 'N/A'}"`;
        const hours = v.approvedHours || 0;
        const status = `"${v.screeningStatus || 'Pending'}"`;
        return [name, email, hours, status].join(",");
      })
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `volunteers_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Volunteers</h1>
          <p className="text-sm text-gray-500">Manage and track all program volunteer records and hours.</p>
        </div>
        <button 
          onClick={handleExport}
          className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary-light transition-colors self-start md:self-auto"
        >
          <Download size={18} />
          <span>Export CSV</span>
        </button>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name or email..."
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
              <Loader2 className="animate-spin" size={40} />
              <p className="text-sm font-medium">Loading volunteers...</p>
            </div>
          ) : volunteers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[400px] text-gray-400 gap-2">
              <p className="text-sm font-medium">No volunteers found matching your criteria.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">NAME</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">TOTAL HOURS</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">BADGE LEVEL</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">BACKGROUND CHECK</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {volunteers.map((v) => {
                  const badge = getBadgeStyle(v.approvedHours);
                  return (
                    <tr key={v._id} onClick={() => navigate(`/volunteers/${v._id}`)} className="group hover:bg-gray-50 cursor-pointer transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm mr-3">
                            {v.firstName?.[0] || ''}{v.lastName?.[0] || ''}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-800">{v.firstName} {v.lastName}</span>
                            <span className="text-xs text-gray-400">{v.userId?.email || 'N/A'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-700">{v.approvedHours || 0} hrs</td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${badge.style}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`flex items-center gap-2 text-sm font-bold ${v.screeningStatus === 'cleared' ? 'text-green-600' : 'text-orange-500'}`}>
                          {v.screeningStatus === 'cleared' ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                          <span className="capitalize">{v.screeningStatus || 'Pending'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={(e) => { e.stopPropagation(); }} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                          <MoreVertical size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        
        {!isLoading && volunteers.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-gray-100 gap-4">
            <span className="text-xs text-gray-500 font-medium italic">Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, totalCount)} of {totalCount} volunteers</span>
            <div className="flex items-center gap-1.5">
              <button 
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-3 py-1.5 text-xs font-bold text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
              >
                <ChevronLeft size={14} />
                Previous
              </button>
              
              {[...Array(totalPages)].map((_, i) => (
                <button 
                  key={i + 1}
                  onClick={() => setPage(i + 1)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                    page === i + 1 
                      ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              
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

export default Volunteers;
