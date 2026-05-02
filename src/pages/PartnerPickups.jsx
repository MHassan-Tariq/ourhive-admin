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
  X,
  Image as ImageIcon,
  MapPin
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
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    itemName: '',
    itemCategory: 'General',
    quantity: '',
    description: '',
    pickupAddress: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await adminService.getPartnerPickups({ 
        search, 
        page, 
        limit: 10,
        status: statusFilter === 'all' ? '' : statusFilter
      });
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
  }, [search, page, statusFilter]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleCreatePickup = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    setError(null);

    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
      });
      if (selectedFile) {
        data.append('image', selectedFile);
      }

      await adminService.createPartnerPickup(data);
      setIsModalOpen(false);
      setFormData({
        itemName: '',
        itemCategory: 'General',
        quantity: '',
        description: '',
        pickupAddress: ''
      });
      setSelectedFile(null);
      setPreviewUrl(null);
      fetchData(); // Refresh list
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create partner pickup.');
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  const getStatusStyle = (status) => {
    const s = status?.toLowerCase();
    const styles = {
      pending: 'bg-orange-50 text-orange-700',
      approved: 'bg-green-50 text-green-700',
      scheduled: 'bg-blue-50 text-blue-700',
      completed: 'bg-gray-100 text-gray-600',
      offered: 'bg-yellow-50 text-yellow-700',
      claimed: 'bg-yellow-50 text-yellow-700',
      'app claimed': 'bg-yellow-50 text-yellow-700',
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
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-[#A16D36] text-white rounded-full text-sm font-bold hover:bg-[#8B5A2B] transition-all shadow-md active:scale-95"
        >
          <Plus size={18} />
          <span>Create Pickup</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-8">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by item or partner name..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-12 pr-4 py-3 border border-black/5 rounded-full text-sm focus:ring-2 focus:ring-[#A16D36] outline-none transition-all shadow-sm bg-[#FAF8F5]"
          />
        </div>

        <div className="flex items-center gap-2 p-1.5 bg-gray-50 rounded-2xl border border-black/5 shrink-0">
          {[
            { id: 'all', label: 'All', icon: Package },
            { id: 'offered', label: 'Offered', icon: Package },
            { id: 'claimed', label: 'Claimed', icon: Clock },
            { id: 'pending', label: 'Pending', icon: Clock },
            { id: 'scheduled', label: 'Scheduled', icon: Truck },
            { id: 'completed', label: 'Completed', icon: CheckCircle2 }
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => { setStatusFilter(filter.id); setPage(1); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                statusFilter === filter.id 
                  ? 'bg-white text-gray-800 shadow-sm border border-black/5' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <filter.icon size={14} />
              <span>{filter.label}</span>
            </button>
          ))}
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
                      {d.recipientId 
                        ? `${d.recipientId.firstName || ''} ${d.recipientId.lastName || ''}`.trim() || d.recipientId.email || 'Partner'
                        : (d.status?.toLowerCase() === 'offered' ? 'Initiated by Admin' : (d.donorId?.firstName ? `${d.donorId.firstName} ${d.donorId.lastName}` : d.donorName || 'Partner'))}
                    </td>
                    <td className="px-6 py-6 text-sm font-medium text-gray-500 max-w-[150px] truncate">{d.itemName}</td>
                    <td className="px-6 py-6 text-sm font-medium text-gray-500">{d.quantity || '-'}</td>
                    <td className="px-6 py-6 text-sm font-medium text-gray-500">{new Date(d.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-6 text-right">
                      <div className={`inline-flex justify-end ${getStatusStyle(d.displayStatus || d.status)}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          d.status === 'pending' 
                            ? 'bg-orange-500' 
                            : (d.status === 'claimed' || d.displayStatus?.toLowerCase() === 'app claimed') 
                                ? 'bg-yellow-500' 
                                : d.status === 'scheduled' 
                                    ? 'bg-blue-500' 
                                    : d.status === 'completed' 
                                        ? 'bg-gray-500'
                                        : d.status === 'approved'
                                            ? 'bg-green-500'
                                            : d.status === 'offered' 
                                                ? 'bg-[#A16D36]' 
                                                : 'bg-red-500'
                        }`}></span>
                        <span className="capitalize">{d.displayStatus || d.status}</span>
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
        <button 
          onClick={() => { setStatusFilter('claimed'); setPage(1); }}
          className={`bg-white rounded-2xl shadow-sm border p-6 flex items-center gap-5 transition-all text-left group active:scale-95 ${statusFilter === 'claimed' ? 'border-amber-500 ring-4 ring-amber-500/5' : 'border-black/5 hover:border-amber-200'}`}
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <Clock size={22} />
          </div>
          <div className="flex flex-col">
            <span className="text-[12px] font-bold text-gray-400 capitalize mb-0.5">Claimed (Pending Approval)</span>
            <span className="text-2xl font-bold text-gray-800">{(stats?.claimedCount || 0) + (stats?.appClaimedCount || 0)} Items</span>
            {stats?.appClaimedCount > 0 && (
                <span className="text-[10px] font-bold text-purple-500 mt-1 uppercase tracking-wider">{stats.appClaimedCount} from Mobile App</span>
            )}
          </div>
        </button>
        <button 
          onClick={() => { setStatusFilter('scheduled'); setPage(1); }}
          className={`bg-white rounded-2xl shadow-sm border p-6 flex items-center gap-5 transition-all text-left group active:scale-95 ${statusFilter === 'scheduled' ? 'border-blue-500 ring-4 ring-blue-500/5' : 'border-black/5 hover:border-blue-200'}`}
        >
          <div className="w-12 h-12 rounded-full border border-blue-100 bg-blue-50 text-blue-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <Truck size={24} />
          </div>
          <div className="flex flex-col">
            <span className="text-[12px] font-bold text-gray-400 capitalize mb-0.5">Scheduled Pickups</span>
            <span className="text-2xl font-bold text-gray-800">{stats?.scheduledCount || '0'} Items</span>
          </div>
        </button>
        <button 
          onClick={() => { setStatusFilter('completed'); setPage(1); }}
          className={`bg-white rounded-2xl shadow-sm border p-6 flex items-center gap-5 transition-all text-left group active:scale-95 ${statusFilter === 'completed' ? 'border-green-500 ring-4 ring-green-500/5' : 'border-black/5 hover:border-green-200'}`}
        >
          <div className="w-12 h-12 rounded-full border border-green-100 bg-green-50 text-green-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <CheckCircle2 size={24} />
          </div>
          <div className="flex flex-col">
            <span className="text-[12px] font-bold text-gray-400 capitalize mb-0.5">Completed Today</span>
            <span className="text-2xl font-bold text-gray-800">{stats?.completedCount || '0'} Pickups</span>
          </div>
        </button>
      </div>

      {/* Create Pickup Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-[#FAF8F5]">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Create New Partner Pickup</h2>
                <p className="text-xs text-gray-500 mt-0.5">Enter details for the available pickup item.</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreatePickup} className="p-8 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Item Name</label>
                  <input 
                    required
                    type="text"
                    value={formData.itemName}
                    onChange={(e) => setFormData({...formData, itemName: e.target.value})}
                    placeholder="e.g. 50 Cases of Water"
                    className="px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-[#A16D36] outline-none transition-all font-medium"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Quantity</label>
                  <input 
                    required
                    type="text"
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                    placeholder="e.g. 50 Cases"
                    className="px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-[#A16D36] outline-none transition-all font-medium"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2 mb-6">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Pickup Address</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    required
                    type="text"
                    value={formData.pickupAddress}
                    onChange={(e) => setFormData({...formData, pickupAddress: e.target.value})}
                    placeholder="Enter full pickup location address"
                    className="w-full pl-12 pr-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-[#A16D36] outline-none transition-all font-medium"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2 mb-6">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Description</label>
                <textarea 
                  required
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Details about the items, storage info, etc."
                  className="px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-[#A16D36] outline-none transition-all font-medium resize-none"
                ></textarea>
              </div>

              <div className="flex flex-col gap-2 mb-8">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Item Image (Optional)</label>
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden shrink-0">
                    {previewUrl ? (
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="text-gray-300" size={32} />
                    )}
                  </div>
                  <div className="flex-1">
                    <input 
                      type="file"
                      id="pickup-image"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label 
                      htmlFor="pickup-image"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer transition-all shadow-sm mb-2"
                    >
                      <Plus size={14} />
                      Choose Image
                    </label>
                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-tight">JPG, PNG or WEBP. Max 5MB.</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 rounded-2xl text-sm font-bold text-gray-500 hover:bg-gray-50 transition-all border border-transparent"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isCreating}
                  className="flex-[2] py-4 bg-[#A16D36] text-white rounded-2xl text-sm font-bold hover:bg-[#8B5A2B] transition-all shadow-lg shadow-amber-900/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <span>Create Available Pickup</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartnerPickups;
