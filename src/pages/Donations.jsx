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
  ChevronRight,
  TrendingUp,
  CreditCard
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import adminService from '../services/adminService';

const Donations = () => {
  const navigate = useNavigate();
  const [donations, setDonations] = useState([]);
  const [financials, setFinancials] = useState(null);
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
      const response = await adminService.getDonations({ search, page, limit: 10 });
      setDonations(response.data);
      setTotalPages(response.pagination.pages);
      setTotalCount(response.pagination.total);
      setFinancials(response.stats);
    } catch (err) {
      setError('Failed to load donations data.');
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
      pending: 'bg-orange-50 text-primary',
      approved: 'bg-green-50 text-green-700',
      rejected: 'bg-red-50 text-red-600',
      success: 'bg-green-50 text-green-700',
    };
    return `flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest ${styles[s] || 'text-gray-500'}`;
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const blob = await adminService.exportDonations();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'donations.csv');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      console.error('Failed to export donations:', err);
      alert('Failed to export donations. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const getPetExposurePill = (petInfo) => {
    const hasCat = petInfo?.hasCat;
    const hasDog = petInfo?.hasDog;
    
    if (hasCat && hasDog) {
      return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-pink-50 text-pink-600 uppercase">Both</span>;
    } else if (hasCat) {
      return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 uppercase">Cat</span>;
    } else if (hasDog) {
      return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-50 text-orange-600 uppercase">Dog</span>;
    } else {
      return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-500 uppercase">None</span>;
    }
  };

  return (
    <div className="animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">In-Kind Donations</h1>
          <p className="text-sm text-gray-500">Review and manage incoming physical item donations for all shelter locations.</p>
        </div>
        <button 
          onClick={handleExport}
          disabled={isExporting}
          className="flex items-center gap-2 bg-[#FAF8F5] text-[#A16D36] border border-[#A16D36] px-5 py-2.5 rounded-full font-bold text-sm shadow-sm hover:bg-orange-50 transition-colors self-start md:self-auto disabled:opacity-50"
        >
          {isExporting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
          <span>{isExporting ? 'Exporting...' : 'Export CSV'}</span>
        </button>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by donor name..."
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
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">DONOR NAME</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">ITEM NAME</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">QUANTITY</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">PET EXPOSURE</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">METHOD</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">DESTINATION</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">STORAGE</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-right">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {donations.map((d) => {
                  const storage = d.storageDetails ? [d.storageDetails.room, d.storageDetails.rack, d.storageDetails.shelf].filter(Boolean).join(', ') : '-';
                  return (
                    <tr key={d._id} onClick={() => navigate(`/donations/${d._id}`)} className="group hover:bg-gray-50 cursor-pointer transition-colors bg-white">
                      <td className="px-6 py-6 text-sm font-bold text-gray-800">
                        {d.donorId?.firstName ? `${d.donorId?.firstName} ${d.donorId?.lastName}` : d.donorName || 'Anonymous'}
                      </td>
                      <td className="px-6 py-6 text-sm font-medium text-gray-500 max-w-[150px] truncate">{d.itemName}</td>
                      <td className="px-6 py-6 text-sm font-medium text-gray-500">{d.quantity || '-'}</td>
                      <td className="px-6 py-6 text-sm">
                        {getPetExposurePill(d.petInfo)}
                      </td>
                      <td className="px-6 py-6 text-sm font-medium text-gray-500 capitalize">{d.deliveryMethod || 'Drop-off'}</td>
                      <td className="px-6 py-6 text-sm font-medium text-gray-500 truncate max-w-[120px]">{d.locationName || '-'}</td>
                      <td className="px-6 py-6 text-sm font-medium text-gray-500 truncate max-w-[120px]">{storage || '-'}</td>
                      <td className="px-6 py-6 text-right">
                        <div className={`inline-flex justify-end ${getStatusStyle(d.status)}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            d.status === 'pending' ? 'bg-orange-500' : d.status === 'success' || d.status === 'approved' ? 'bg-green-500' : 'bg-red-500'
                          }`}></span>
                          <span>{d.status}</span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
        
        {!isLoading && donations.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 bg-[#FAF8F5] gap-4">
            <span className="text-[13px] text-gray-500 font-medium">Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, totalCount)} of {totalCount} participants</span>
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
          <div className="w-12 h-12 rounded-2xl bg-pink-50 text-pink-500 flex items-center justify-center shrink-0">
            <Package size={22} />
          </div>
          <div className="flex flex-col">
            <span className="text-[12px] font-bold text-gray-400 capitalize mb-0.5">Pending Review</span>
            <span className="text-2xl font-bold text-gray-800">{financials?.pendingReviewCount || '0'} Items</span>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6 flex items-center gap-5">
          <div className="w-12 h-12 rounded-full border border-green-100 bg-green-50 text-green-500 flex items-center justify-center shrink-0">
            <CheckCircle2 size={24} />
          </div>
          <div className="flex flex-col">
            <span className="text-[12px] font-bold text-gray-400 capitalize mb-0.5">Approved This Week</span>
            <span className="text-2xl font-bold text-gray-800">{financials?.approvedThisWeekCount || '0'} Items</span>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6 flex items-center gap-5">
          <div className="w-12 h-12 rounded-full border border-blue-100 bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
            <Truck size={24} />
          </div>
          <div className="flex flex-col">
            <span className="text-[12px] font-bold text-gray-400 capitalize mb-0.5">Scheduled Pickups</span>
            <span className="text-2xl font-bold text-gray-800">{financials?.scheduledPickupsTodayCount || '0'} Today</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Donations;
