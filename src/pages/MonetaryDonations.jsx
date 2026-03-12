import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Loader2, 
  AlertCircle, 
  ChevronLeft, 
  ChevronRight,
  CheckCircle2,
  Clock,
  DollarSign,
  User,
  Calendar
} from 'lucide-react';
import adminService from '../services/adminService';

const MonetaryDonations = () => {
  const [donations, setDonations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [approvingId, setApprovingId] = useState(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await adminService.getMonetaryDonations({ search, page, limit: 10 });
      setDonations(response.data);
      setTotalPages(response.pages);
      setTotalCount(response.total);
    } catch (err) {
      setError('Failed to load monetary donations.');
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

  const handleApprove = async (id) => {
    if (!window.confirm('Are you sure you want to approve this donation?')) return;
    
    console.log('Attempting to approve donation:', id);
    setApprovingId(id);
    try {
      const response = await adminService.approveMonetaryDonation(id);
      console.log('Approve donation response:', response);
      // Refresh data after approval
      fetchData();
    } catch (err) {
      console.error('Approve donation error:', err);
      alert(`Failed to approve donation: ${err.response?.data?.message || err.message}`);
    } finally {
      setApprovingId(null);
    }
  };

  const getStatusStyle = (status) => {
    const s = status?.toLowerCase();
    const styles = {
      pending: 'bg-orange-50 text-primary',
      completed: 'bg-green-50 text-green-700',
      failed: 'bg-red-50 text-red-600',
    };
    return `flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${styles[s] || 'text-gray-500'}`;
  };

  return (
    <div className="animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Monetary Donations</h1>
          <p className="text-sm text-gray-500">Review and approve monetary donation pledges and transaction history.</p>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by project or transaction ID..."
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
              <p className="text-sm font-medium">Loading donations...</p>
            </div>
          ) : donations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[400px] text-gray-400 gap-2">
              <p className="text-sm font-medium">No donations found.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-[#FAF8F5] border-b border-gray-100">
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">DONOR</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">AMOUNT</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">PROJECT / EVENT</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">DATE</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-right">STATUS</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {donations.map((d) => (
                  <tr key={d._id} className="group hover:bg-gray-50 transition-colors bg-white">
                    <td className="px-6 py-6 text-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-primary">
                          <User size={14} />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-800">
                            {d.sponsorId ? `${d.sponsorId.firstName} ${d.sponsorId.lastName}` : 'Guest Donor'}
                          </span>
                          <span className="text-[11px] text-gray-400 font-medium">{d.sponsorId?.email || 'N/A'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-sm font-bold text-primary">
                      ${d.amount?.toLocaleString()}
                    </td>
                    <td className="px-6 py-6 text-sm font-medium text-gray-500 max-w-[200px] truncate">
                      {d.eventId?.title || d.projectTitle || 'General Donation'}
                    </td>
                    <td className="px-6 py-6 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-gray-400" />
                        <span>{new Date(d.createdAt).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-right">
                      <div className={`inline-flex justify-end ${getStatusStyle(d.status)}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          d.status === 'pending' ? 'bg-orange-500' : d.status === 'completed' ? 'bg-green-500' : 'bg-red-500'
                        }`}></span>
                        <span>{d.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-right">
                      {d.status === 'pending' && (
                        <button 
                          onClick={() => handleApprove(d._id)}
                          disabled={approvingId === d._id}
                          className="px-4 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary-light transition-all disabled:opacity-50 flex items-center gap-2 ml-auto"
                        >
                          {approvingId === d._id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                          Approve
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        
        {!isLoading && donations.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 bg-[#FAF8F5] gap-4">
            <span className="text-[13px] text-gray-500 font-medium">Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, totalCount)} of {totalCount} donations</span>
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
    </div>
  );
};

export default MonetaryDonations;
