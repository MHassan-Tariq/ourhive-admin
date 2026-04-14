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
  Plus,
  DollarSign,
  User,
  X,
  Calendar,
  Trash2,
  CreditCard
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import adminService from '../services/adminService';

const Donations = () => {
  const navigate = useNavigate();
  const [donations, setDonations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isExporting, setIsExporting] = useState(false);

  // Manual Creation State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [sponsors, setSponsors] = useState([]);
  const [newDonation, setNewDonation] = useState({
    sponsorId: '',
    finalAmount: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Deletion State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [donationToDelete, setDonationToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Filter for completed/success status to show the ledger
      const response = await adminService.getDonations({ 
        search, 
        page, 
        limit: 10,
        status: 'completed' 
      });
      setDonations(response.data);
      setTotalPages(response.pagination.pages);
      setTotalCount(response.pagination.total);
    } catch (err) {
      setError('Failed to load contributions ledger.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSponsors = async () => {
    try {
      const response = await adminService.getSponsors({ limit: 100 });
      setSponsors(response.data);
    } catch (err) {
      console.error('Failed to fetch sponsors:', err);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 500);
    return () => clearTimeout(timer);
  }, [search, page]);

  useEffect(() => {
    fetchSponsors();
  }, []);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const blob = await adminService.exportDonations();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'contributions_ledger.csv');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      console.error('Failed to export ledger:', err);
      alert('Failed to export ledger. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleSaveManual = async (e) => {
    e.preventDefault();
    if (!newDonation.sponsorId || !newDonation.finalAmount) return;

    setIsSaving(true);
    try {
      await adminService.createManualDonation({
        sponsorId: newDonation.sponsorId,
        finalAmount: newDonation.finalAmount,
        date: newDonation.date
      });
      setIsModalOpen(false);
      setNewDonation({
        sponsorId: '',
        finalAmount: '',
        date: new Date().toISOString().split('T')[0]
      });
      fetchData(); // Refresh list
    } catch (err) {
      console.error('Failed to create manual donation:', err);
      alert('Failed to record contribution.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!donationToDelete) return;

    setIsDeleting(true);
    try {
      await adminService.deleteDonation(donationToDelete._id);
      setIsDeleteModalOpen(false);
      setDonationToDelete(null);
      fetchData(); // Refresh list
    } catch (err) {
      console.error('Failed to delete donation:', err);
      alert('Failed to delete record.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Contributions Ledger</h1>
          <p className="text-sm text-gray-500 font-medium">Recorded sponsor payments and successful contributions history.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 bg-white text-gray-600 border border-black/5 px-5 py-2.5 rounded-2xl font-bold text-sm shadow-sm hover:bg-gray-50 transition-all disabled:opacity-50"
          >
            {isExporting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
            <span>Export</span>
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-[#A16D36] text-white px-6 py-2.5 rounded-2xl font-bold text-sm shadow-lg shadow-[#A16D36]/20 hover:bg-[#8B5D2E] transition-all active:scale-95"
          >
            <Plus size={18} />
            <span>Add Manual Contribution</span>
          </button>
        </div>
      </div>



      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by sponsor or donor name..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-12 pr-4 py-3.5 border border-black/5 rounded-2xl text-sm focus:ring-2 focus:ring-[#A16D36]/20 outline-none transition-all shadow-sm bg-white"
          />
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-700">
          <AlertCircle size={20} />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-sm border border-black/5 overflow-hidden mb-8">
        <div className="overflow-x-auto min-h-[400px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-[400px] text-gray-400 gap-4">
              <Loader2 className="animate-spin text-primary" size={40} />
              <p className="text-sm font-bold uppercase tracking-widest animate-pulse">Loading Ledger...</p>
            </div>
          ) : donations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[400px] text-gray-400 gap-2">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-2">
                <Package size={30} className="text-gray-200" />
              </div>
              <p className="text-sm font-bold text-gray-300 uppercase tracking-widest">No contributions recorded yet.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-[#FAF8F5] border-b border-black/5">
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[2px]">Date Recorded</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[2px]">Sponsor / Donor</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[2px]">Category</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[2px]">Amount Received</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[2px]">Status</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[2px] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {donations.map((d) => {
                  return (
                    <tr key={d._id} onClick={() => navigate(`/donations/${d._id}`)} className="group hover:bg-gray-50 cursor-pointer transition-colors bg-white">
                      <td className="px-8 py-6">
                        <span className="text-sm font-bold text-gray-800">{new Date(d.createdAt).toLocaleDateString()}</span>
                        <p className="text-[10px] text-gray-400 font-medium uppercase mt-0.5">{new Date(d.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#A16D36]/10 flex items-center justify-center text-[#A16D36] font-bold text-xs">
                            {(d.sponsorId?.orgName || d.donorId?.firstName || 'A')[0]}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-800">
                              {d.sponsorId?.orgName || (d.donorId?.firstName ? `${d.donorId?.firstName} ${d.donorId?.lastName}` : d.donorName || 'Anonymous')}
                            </p>
                            <p className="text-[10px] text-gray-400 font-medium">{d.sponsorId?.email || d.donorId?.email || 'Manual Entry'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                         <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-[10px] font-black uppercase tracking-wider border border-black/5">
                           {d.itemCategory || 'Contribution'}
                         </span>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-base font-bold text-[#A16D36] flex items-center gap-1">
                          <DollarSign size={14} />
                          {d.finalAmount ? d.finalAmount.toLocaleString() : '0'}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-xl border border-green-100 text-[10px] font-black uppercase tracking-[1px]">
                          <CheckCircle2 size={14} />
                          <span>{d.status === 'completed' ? 'SUCCESSFUL' : d.status}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDonationToDelete(d);
                            setIsDeleteModalOpen(true);
                          }}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete Record"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
        
        {!isLoading && donations.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between px-8 py-6 bg-[#FAF8F5] border-t border-black/5 gap-4">
            <span className="text-[13px] text-gray-400 font-bold">PAGE {page} OF {totalPages} ({totalCount} TOTAL RECORDS)</span>
            <div className="flex items-center gap-2">
              <button 
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="p-2 bg-white text-gray-600 border border-black/5 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-all font-bold text-sm flex items-center gap-2"
              >
                <ChevronLeft size={18} />
              </button>
              <div className="flex items-center gap-1">
                {[...Array(totalPages)].map((_, i) => (
                  <button 
                    key={i + 1}
                    onClick={() => setPage(i + 1)}
                    className={`w-10 h-10 rounded-xl text-sm font-black transition-all ${
                      page === i + 1 
                        ? 'bg-[#A16D36] text-white shadow-md shadow-[#A16D36]/20' 
                        : 'bg-white text-gray-400 border border-black/5 hover:border-[#A16D36]/30'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button 
                disabled={page === totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="p-2 bg-white text-gray-600 border border-black/5 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-all font-bold text-sm"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Manual Contribution Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl border border-white/20 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-black/5 flex items-center justify-between bg-[#FAF8F5]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#A16D36] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-[#A16D36]/30">
                  <CreditCard size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900">Add Contribution</h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Record a manual sponsor payment</p>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-black/5 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSaveManual} className="p-10 space-y-8">
              <div className="space-y-2.5">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <User size={14} className="text-[#A16D36]" />
                  Select Sponsor
                </label>
                <div className="relative">
                  <select
                    required
                    value={newDonation.sponsorId}
                    onChange={(e) => setNewDonation(prev => ({ ...prev, sponsorId: e.target.value }))}
                    className="w-full pl-5 pr-10 py-4 rounded-2xl bg-gray-50 border border-black/5 text-[15px] font-bold text-gray-800 focus:outline-none focus:ring-4 focus:ring-[#A16D36]/10 transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Search and select sponsor...</option>
                    {sponsors.map(s => {
                      const displayName = s.organizationName || (s.userId?.firstName ? `${s.userId.firstName} ${s.userId.lastName}` : 'Anonymous Sponsor');
                      return (
                        <option key={s._id} value={s.userId?._id || s.userId}>
                          {displayName} ({s.userId?.email || 'No Email'})
                        </option>
                      );
                    })}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <ChevronLeft className="rotate-[-90deg]" size={20} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2.5">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <DollarSign size={14} className="text-[#A16D36]" />
                    Amount ($)
                  </label>
                  <input 
                    type="number"
                    required
                    placeholder="0.00"
                    value={newDonation.finalAmount}
                    onChange={(e) => setNewDonation(prev => ({ ...prev, finalAmount: e.target.value }))}
                    className="w-full px-5 py-4 bg-gray-50 border border-black/5 rounded-2xl text-[15px] font-mono font-black text-gray-800 focus:outline-none focus:ring-4 focus:ring-[#A16D36]/10 transition-all"
                  />
                </div>
                <div className="space-y-2.5">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Calendar size={14} className="text-[#A16D36]" />
                    Record Date
                  </label>
                  <input 
                    type="date"
                    required
                    value={newDonation.date}
                    onChange={(e) => setNewDonation(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-5 py-4 bg-gray-50 border border-black/5 rounded-2xl text-[15px] font-bold text-gray-800 focus:outline-none focus:ring-4 focus:ring-[#A16D36]/10 transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-8 py-4 bg-gray-100 text-gray-600 rounded-2xl text-sm font-black hover:bg-gray-200 transition-all uppercase tracking-widest"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 px-8 py-4 bg-[#A16D36] text-white rounded-2xl text-sm font-black shadow-xl shadow-[#A16D36]/20 hover:bg-[#8B5D2E] transition-all disabled:opacity-50 flex items-center justify-center gap-3 uppercase tracking-widest whitespace-nowrap"
                >
                  {isSaving ? <Loader2 size={20} className="animate-spin" /> : <CheckCircle2 size={20} />}
                  <span>Save Record</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[32px] w-full max-w-md shadow-2xl border border-white/20 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 space-y-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center">
                  <Trash2 size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900">Delete Record?</h3>
                  <p className="text-sm font-medium text-gray-500 mt-2">
                    Are you sure you want to permanently delete this contribution record? This action cannot be undone.
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-2xl border border-black/5 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400 font-bold uppercase">Sponsor</span>
                  <span className="text-gray-800 font-bold">{donationToDelete?.sponsorId?.orgName || donationToDelete?.donorName}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400 font-bold uppercase">Amount</span>
                  <span className="text-gray-800 font-bold">${donationToDelete?.finalAmount?.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 px-6 py-4 bg-gray-100 text-gray-600 rounded-2xl text-sm font-black hover:bg-gray-200 transition-all uppercase tracking-widest"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 px-6 py-4 bg-red-600 text-white rounded-2xl text-sm font-black shadow-xl shadow-red-600/20 hover:bg-red-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-widest"
                >
                  {isDeleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Donations;
