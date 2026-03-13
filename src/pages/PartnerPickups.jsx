import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Package, 
  CheckCircle2, 
  Clock,
  XCircle,
  Truck,
  Search,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import adminService from '../services/adminService';

const PartnerPickups = () => {
  const navigate = useNavigate();
  const [donations, setDonations] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isExporting, setIsExporting] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await adminService.getPartnerPickups({ search, page, limit: 10 });
      setDonations(response.data);
      setTotalPages(response.pagination.pages);
      setTotalCount(response.pagination.total);
      setStats(response.stats);
    } catch (err) {
      setError('Failed to load partner pickups data.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 500);
    return () => clearTimeout(timer);
  }, [search, page]);

  const getStatusStyle = (status) => {
    const s = status?.toLowerCase();
    const styles = {
      pending: 'bg-orange-50 text-orange-700',
      approved: 'bg-green-50 text-green-700',
      scheduled: 'bg-blue-50 text-blue-700',
      completed: 'bg-green-50 text-green-700',
      rejected: 'bg-red-50 text-red-600',
    };
    return `flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest ${styles[s] || 'text-gray-500'}`;
  };

  return (
    <div className="animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Community Partner Pickups</h1>
          <p className="text-sm text-gray-500">Manage pickup and distribution requests from community partners.</p>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by item or partner name..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-12 pr-4 py-3 border border-black/5 rounded-full text-sm focus:ring-2 focus:ring-[#A16D36] outline-none transition-all shadow-sm bg-[#FAF8F5]"
          />
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-700">
          <AlertCircle size={20} />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border-2 border-primary overflow-hidden mb-8">
        <div className="overflow-x-auto min-h-[400px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-[400px] text-gray-400 gap-4">
              <Loader2 className="animate-spin text-primary" size={40} />
              <p className="text-sm font-medium">Loading pickups...</p>
            </div>
          ) : donations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[400px] text-gray-400 gap-2">
              <p className="text-sm font-medium">No pickup requests found.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-[#FAF8F5] border-b border-gray-100">
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">IMAGE</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">PARTNER NAME</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">ITEM NAME</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">QUANTITY</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">DATE REQUESTED</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-right">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {donations.map((d) => (
                  <tr key={d._id} onClick={() => navigate(`/donations/${d._id}`)} className="group hover:bg-gray-50 cursor-pointer transition-colors bg-white">
                    <td className="px-6 py-6">
                      <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden border border-black/5 group-hover:border-primary/20 transition-all">
                        {d.image ? (
                          <img src={d.image} alt={d.itemName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-gray-400">
                              <Package size={20} />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-6 text-sm font-bold text-gray-800">
                      {d.donorId?.firstName ? `${d.donorId?.firstName} ${d.donorId?.lastName}` : d.donorName || 'Partner'}
                    </td>
                    <td className="px-6 py-6 text-sm font-medium text-gray-500 max-w-[150px] truncate">{d.itemName}</td>
                    <td className="px-6 py-6 text-sm font-medium text-gray-500">{d.quantity || '-'}</td>
                    <td className="px-6 py-6 text-sm font-medium text-gray-500">{new Date(d.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-6 text-right">
                      <div className={`inline-flex justify-end ${getStatusStyle(d.status)}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          d.status === 'pending' ? 'bg-orange-500' : d.status === 'scheduled' ? 'bg-blue-500' : (d.status === 'completed' || d.status === 'approved') ? 'bg-green-500' : 'bg-red-500'
                        }`}></span>
                        <span>{d.status}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        
        {!isLoading && donations.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 bg-[#FAF8F5] gap-4">
            <span className="text-[13px] text-gray-500 font-medium">Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, totalCount)} of {totalCount} records</span>
            <div className="flex items-center gap-1.5">
              <button 
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-4 py-2 text-sm font-bold bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-full border border-gray-200"
              >
                Previous
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button 
                  key={i + 1}
                  onClick={() => setPage(i + 1)}
                  className={`w-9 h-9 rounded-full text-sm font-bold transition-all ${
                    page === i + 1 
                      ? 'bg-[#A16D36] text-white shadow-sm' 
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button 
                disabled={page === totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="px-4 py-2 text-sm font-bold bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-full border border-gray-200"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6 flex items-center gap-5">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
            <Clock size={22} />
          </div>
          <div className="flex flex-col">
            <span className="text-[12px] font-bold text-gray-400 capitalize mb-0.5">Pending Approval</span>
            <span className="text-2xl font-bold text-gray-800">{stats?.pendingCount || '0'} Requests</span>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6 flex items-center gap-5">
          <div className="w-12 h-12 rounded-full border border-blue-100 bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
            <Truck size={24} />
          </div>
          <div className="flex flex-col">
            <span className="text-[12px] font-bold text-gray-400 capitalize mb-0.5">Scheduled Pickups</span>
            <span className="text-2xl font-bold text-gray-800">{stats?.scheduledCount || '0'} Items</span>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6 flex items-center gap-5">
          <div className="w-12 h-12 rounded-full border border-green-100 bg-green-50 text-green-500 flex items-center justify-center shrink-0">
            <CheckCircle2 size={24} />
          </div>
          <div className="flex flex-col">
            <span className="text-[12px] font-bold text-gray-400 capitalize mb-0.5">Completed Today</span>
            <span className="text-2xl font-bold text-gray-800">{stats?.completedCount || '0'} Pickups</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerPickups;
