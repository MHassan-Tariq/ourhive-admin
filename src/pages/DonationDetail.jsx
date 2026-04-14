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
  Truck,
  X,
  Search,
  Check
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
  const [sponsors, setSponsors] = useState([]);
  const [isSponsorsLoading, setIsSponsorsLoading] = useState(false);
  const [paymentData, setPaymentData] = useState({
    sponsorId: '',
    amount: ''
  });

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

  useEffect(() => {
    const fetchSponsors = async () => {
      setIsSponsorsLoading(true);
      try {
        const response = await adminService.getSponsors();
        setSponsors(response.data || []);
      } catch (err) {
        console.error('Failed to fetch sponsors:', err);
      } finally {
        setIsSponsorsLoading(false);
      }
    };
    fetchSponsors();
  }, []);

  useEffect(() => {
    if (donation) {
      setPaymentData({
        sponsorId: donation.sponsorId?._id || donation.sponsorId || '',
        amount: donation.finalAmount || ''
      });
    }
  }, [donation]);

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

  const handleSavePayment = async () => {
    if (!paymentData.sponsorId) {
      toast.error('Please select a sponsor');
      return;
    }
    if (!paymentData.amount || isNaN(paymentData.amount)) {
      toast.error('Please enter a valid amount');
      return;
    }

    setIsUpdating(true);
    try {
      const response = await adminService.updateDonationStatus(id, {
        sponsorId: paymentData.sponsorId,
        finalAmount: Number(paymentData.amount)
      });
      
      setDonation(response.data.data);
      toast.success('Payment record saved successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save payment record');
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
      </div>

      <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-4 py-6 bg-white rounded-2xl border border-black/5 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Transaction #{donation._id?.slice(-8).toUpperCase()}</h1>
          <p className="text-xs text-gray-500 font-medium tracking-wide uppercase">Recorded on {new Date(donation.createdAt).toLocaleString()}</p>
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

      {/* Monetary Contribution Recording Section */}
      <div className="bg-white rounded-3xl shadow-sm border-2 border-[#A16D36]/10 overflow-hidden mb-8">
        <div className="p-6 border-b border-black/5 flex items-center justify-between bg-[#FAF8F5]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#A16D36]/10 rounded-2xl flex items-center justify-center text-[#A16D36]">
              <DollarSign size={22} />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-800">Record Sponsor Payment</h2>
              <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mt-0.5">Manual accounting from Zeffy records</p>
            </div>
          </div>
          <button
            onClick={handleSavePayment}
            disabled={isUpdating}
            className="px-8 py-3 bg-[#A16D36] text-white rounded-2xl font-bold text-sm shadow-lg shadow-[#A16D36]/20 hover:bg-[#8B5D2E] transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50"
          >
            {isUpdating ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
            Save Payment Record
          </button>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Select Sponsor (Search by Email)</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <select
                  value={paymentData.sponsorId}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, sponsorId: e.target.value }))}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 border border-black/5 text-[15px] font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#A16D36]/20 transition-all appearance-none cursor-pointer"
                >
                  <option value="">Select a sponsor...</option>
                  {sponsors.map(s => (
                    <option key={s._id} value={s.userId?._id || s.userId}>
                      {s.organizationName || (s.userId?.firstName ? `${s.userId.firstName} ${s.userId.lastName}` : 'Sponsor')} ({s.userId?.email || 'No Email'})
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <ChevronLeft className="rotate-[-90deg]" size={16} />
                </div>
              </div>
              {isSponsorsLoading && <p className="text-[10px] text-primary flex items-center gap-1.5 font-bold animate-pulse mt-1 ml-1"><Loader2 size={12} className="animate-spin" /> Loading sponsors list...</p>}
            </div>

            <div className="space-y-2.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Received Amount ($)</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</div>
                <input
                  type="number"
                  placeholder="0.00"
                  className="w-full pl-10 pr-4 py-4 rounded-2xl bg-gray-50 border border-black/5 text-[15px] font-mono font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#A16D36]/20 transition-all"
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, amount: e.target.value }))}
                />
              </div>
              <p className="text-[10px] text-gray-400 font-medium tracking-wide mt-1 ml-1 italic">Enter the final amount exactly as it appears in your accounting account.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden max-w-2xl">
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
            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Received Amount</span>
            <span className="text-lg font-black text-[#A16D36]">${donation.finalAmount?.toLocaleString() || '0.00'}</span>
          </div>
          <div className="pt-4 border-t border-gray-50 flex justify-between items-center">
            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Category Tag</span>
            <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-[10px] font-black uppercase tracking-wider">
              {donation.itemCategory || 'In-Kind'}
            </span>
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
