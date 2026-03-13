import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  Package, 
  CreditCard, 
  Calendar, 
  User, 
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
  DollarSign,
  Briefcase,
  Truck
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import adminService from '../services/adminService';
import { toast } from 'react-hot-toast';

const DonationDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [donation, setDonation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionModal, setShowRejectionModal] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await adminService.getDonationDetail(id);
        setDonation(data.data);
      } catch (err) {
        setError('Failed to load donation details.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  const [storageData, setStorageData] = useState({
    room: '',
    rack: '',
    shelf: '',
    floor: '',
    locationName: '',
    additionalNotes: ''
  });

  useEffect(() => {
    if (donation) {
      setStorageData({
        room: donation.storageDetails?.room || '',
        rack: donation.storageDetails?.rack || '',
        shelf: donation.storageDetails?.shelf || '',
        floor: donation.storageDetails?.floor || '',
        locationName: donation.locationName || '',
        additionalNotes: donation.additionalNotes || donation.description || ''
      });
    }
  }, [donation]);

  const handleStatusUpdate = async (newStatus, reason = '') => {
    setIsUpdating(true);
    try {
      await adminService.updateDonationStatus(id, { status: newStatus, rejectionReason: reason });
      setDonation(prev => ({ ...prev, status: newStatus, rejectionReason: reason }));
      toast.success(`Donation marked as ${newStatus}`);
      setShowRejectionModal(false);
      setRejectionReason('');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  const onRejectClick = () => {
    setShowRejectionModal(true);
  };

  const handleSaveDetails = async () => {
    setIsUpdating(true);
    try {
      await adminService.updateDonationStatus(id, {
        locationName: storageData.locationName,
        additionalNotes: storageData.additionalNotes,
        storageRoom: storageData.room,
        storageRack: storageData.rack,
        storageShelf: storageData.shelf,
        storageFloor: storageData.floor
      });
      setDonation(prev => ({
        ...prev,
        locationName: storageData.locationName,
        additionalNotes: storageData.additionalNotes,
        storageDetails: {
          room: storageData.room,
          rack: storageData.rack,
          shelf: storageData.shelf,
          floor: storageData.floor
        }
      }));
      alert('Successfully saved storage details.');
    } catch (err) {
      alert('Failed to save details.');
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] text-gray-400 gap-4">
        <Loader2 className="animate-spin text-primary" size={48} />
        <p className="text-sm font-medium">Loading transaction details...</p>
      </div>
    );
  }

  if (error || !donation) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-8 flex flex-col items-center text-center gap-4">
        <AlertCircle size={48} className="text-red-500" />
        <div>
          <h2 className="text-lg font-bold text-gray-800">Error Loading Transaction</h2>
          <p className="text-sm text-gray-500">{error || 'Donation record not found.'}</p>
        </div>
        <button
          onClick={() => navigate('/donations')}
          className="px-6 py-2 bg-primary text-white rounded-xl font-bold text-sm"
        >
          Back to Donations
        </button>
      </div>
    );
  }

  const getStatusBanner = () => {
    const s = donation.status?.toLowerCase();
    if (s === 'success' || s === 'approved') return 'bg-green-50 text-green-700 border-green-100';
    if (s === 'pending') return 'bg-orange-50 text-orange-700 border-orange-100';
    return 'bg-red-50 text-red-700 border-red-100';
  };

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/donations')}
          className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-primary transition-colors"
        >
          <ChevronLeft size={20} />
          <span>Back to Donations</span>
        </button>

        <div className="flex flex-wrap gap-3">
              <button
                onClick={onRejectClick}
                disabled={isUpdating}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full border border-red-100 text-red-600 hover:bg-red-50 font-bold text-sm transition-all disabled:opacity-50"
              >
                <XCircle size={18} />
                Reject
              </button>
          <button
            onClick={() => handleStatusUpdate('pending')}
            disabled={isUpdating || donation.status === 'pending'}
            className="px-6 py-2 bg-[#EEE7E1] text-gray-800 rounded-xl font-bold text-xs hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Mark Pending
          </button>
          <button
            onClick={() => handleStatusUpdate('approved')}
            disabled={isUpdating || donation.status === 'success' || donation.status === 'approved'}
            className="px-6 py-2 bg-primary text-white rounded-xl font-bold text-xs shadow-lg shadow-primary/20 hover:bg-primary-light transition-colors disabled:opacity-50"
          >
            Approve Contribution
          </button>
        </div>
      </div>

      <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-4 py-6 bg-white rounded-2xl border border-black/5 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Transaction #{donation._id?.slice(-8).toUpperCase()}</h1>
          <p className="text-xs text-gray-500 font-medium tracking-wide uppercase">Recorded on {new Date(donation.createdAt).toLocaleString()}</p>
        </div>
        <div className={`px-4 py-2 rounded-xl border font-bold text-sm capitalize flex items-center gap-2 ${getStatusBanner()}`}>
          {donation.status === 'pending' ? <Clock size={16} /> : donation.status === 'success' || donation.status === 'approved' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
          {donation.status}
        </div>
      </header>

      {donation.status === 'rejected' && donation.rejectionReason && (
        <div className="mb-8 p-6 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-4">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center text-red-600 shrink-0 mt-1">
            <AlertCircle size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-red-800 mb-1">Rejection Reason</h3>
            <p className="text-sm text-red-700 leading-relaxed italic">"{donation.rejectionReason}"</p>
          </div>
        </div>
      )}

      {/* Storage & Details Section (At the top) */}
      <div className="bg-white rounded-2xl shadow-sm border-2 border-primary/20 overflow-hidden mb-8">
        <div className="p-6 border-b border-black/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
              <Package size={20} />
            </div>
            <h2 className="text-base font-bold text-gray-800">Storage & Details</h2>
          </div>
          <button
            onClick={handleSaveDetails}
            disabled={isUpdating}
            className="px-6 py-2 bg-primary text-white rounded-xl font-bold text-xs shadow-md hover:bg-primary-light transition-all active:scale-95 flex items-center gap-2"
          >
            {isUpdating && <Loader2 size={14} className="animate-spin" />}
            Save Information
          </button>
        </div>

        <div className="px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Location Name</label>
              <input
                type="text"
                placeholder="Warehouse A"
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-black/5 text-sm font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                value={storageData.locationName}
                onChange={(e) => setStorageData(prev => ({ ...prev, locationName: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Room</label>
              <input
                type="text"
                placeholder="R-101"
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-black/5 text-sm font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                value={storageData.room}
                onChange={(e) => setStorageData(prev => ({ ...prev, room: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Rack</label>
              <input
                type="text"
                placeholder="RK-05"
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-black/5 text-sm font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                value={storageData.rack}
                onChange={(e) => setStorageData(prev => ({ ...prev, rack: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Shelf</label>
              <input 
                type="text"
                placeholder="SH-03"
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-black/5 text-sm font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                value={storageData.shelf}
                onChange={(e) => setStorageData(prev => ({ ...prev, shelf: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Floor</label>
              <input 
                type="text"
                placeholder="L2"
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-black/5 text-sm font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                value={storageData.floor}
                onChange={(e) => setStorageData(prev => ({ ...prev, floor: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Description & Additional Notes</label>
            <textarea 
              rows={4}
              placeholder="Add specific storage notes or item descriptions here..."
              className="w-full px-4 py-4 rounded-xl bg-gray-50 border border-black/5 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none leading-relaxed"
              value={storageData.additionalNotes}
              onChange={(e) => setStorageData(prev => ({ ...prev, additionalNotes: e.target.value }))}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {donation.image && (
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
            <div className="p-6 border-b border-black/5 flex items-center gap-3">
              <Package size={18} className="text-primary" />
              <h2 className="text-base font-bold text-gray-800">Product Image</h2>
            </div>
            <div className="p-6 bg-gray-50 flex justify-center">
              <div className="max-w-2xl w-full h-[400px] rounded-xl shadow-lg border-4 border-white overflow-hidden">
                <img src={donation.image} alt={donation.itemName} className="w-full h-full object-contain bg-black/5" />
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
          <div className="p-6 border-b border-black/5 flex items-center gap-3">
            <Package size={18} className="text-primary" />
            <h2 className="text-base font-bold text-gray-800">Item Specifications</h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-gray-400">Item Name</label>
              <span className="text-lg font-bold text-gray-800">{donation.itemName}</span>
            </div>
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-gray-400">Quantity</label>
              <span className="text-sm font-bold text-gray-800">{donation.quantity || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-gray-400">Estimated Value</label>
              <span className="text-sm font-bold text-primary font-mono bg-primary/5 px-2 py-1 rounded-lg border border-primary/10">{donation.estimatedValue || 'Not specified'}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
          <div className="p-6 border-b border-black/5 flex items-center gap-3">
            <User size={18} className="text-primary" />
            <h2 className="text-base font-bold text-gray-800">Donor Information</h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg border-2 border-white shadow-sm">
                {donation.donorId?.firstName?.[0] || donation.donorName?.[0] || 'A'}
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-800">
                   {donation.donorId?.firstName ? `${donation.donorId?.firstName} ${donation.donorId?.lastName}` : donation.donorName || 'Anonymous'}
                </h4>
                <p className="text-xs font-medium text-gray-400">{donation.donorId?.email || 'No email provided'}</p>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-50 flex justify-between items-center">
              <label className="text-sm font-medium text-gray-400">Category Tag</label>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-black/5">{donation.itemCategory || 'Uncategorized'}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
          <div className="p-6 border-b border-black/5 flex items-center gap-3">
            <Truck size={18} className="text-primary" />
            <h2 className="text-base font-bold text-gray-800">Logistics</h2>
          </div>
          <div className="p-6">
            <div className="bg-[#FAF8F5] p-5 rounded-2xl flex items-center gap-5 border border-black/5">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm border border-[#A16D36]">
                <MapPin size={22} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <h4 className="text-sm font-bold text-gray-800 capitalize">{donation.deliveryMethod || 'Drop-off'}</h4>
                </div>
                {donation.pickupAddress && typeof donation.pickupAddress === 'string' ? (
                  <p className="text-xs font-medium text-gray-500 mt-1 leading-relaxed italic">
                    {donation.pickupAddress}
                  </p>
                ) : donation.pickupAddress?.street ? (
                  <p className="text-xs font-medium text-gray-500 mt-1 leading-relaxed italic">
                    {donation.pickupAddress.street}, {donation.pickupAddress.city} {donation.pickupAddress.zip}
                  </p>
                ) : (
                  <p className="text-xs font-medium text-gray-400 mt-0.5">No external pickup address registered.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rejection Modal */}
      {showRejectionModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-black/5 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-black/5 flex items-center justify-between bg-[#FAF8F5]">
              <h3 className="text-xl font-bold text-gray-900">Reason for Rejection</h3>
              <button 
                onClick={() => setShowRejectionModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-black/5 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Write your reason</label>
                <textarea 
                  required
                  placeholder="Explain why this request is being rejected..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-5 py-3.5 bg-gray-50 border border-black/5 rounded-2xl text-[15px] focus:ring-2 focus:ring-[#A16D36]/20 focus:border-[#A16D36] outline-none transition-all placeholder:text-gray-300 min-h-[120px] resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button 
                  type="button"
                  onClick={() => setShowRejectionModal(false)}
                  className="flex-1 px-6 py-3.5 border border-black/5 text-gray-600 rounded-2xl text-[15px] font-bold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleStatusUpdate('rejected', rejectionReason)}
                  disabled={isUpdating || !rejectionReason.trim()}
                  className="flex-1 px-6 py-3.5 bg-red-600 text-white rounded-2xl text-[15px] font-bold shadow-lg shadow-red-700/20 hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isUpdating ? <Loader2 size={18} className="animate-spin" /> : <XCircle size={18} />}
                  <span>Reject</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonationDetail;
