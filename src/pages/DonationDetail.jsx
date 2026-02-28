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

const DonationDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [donation, setDonation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

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

  const handleUpdateStatus = async (newStatus) => {
    setIsUpdating(true);
    try {
      await adminService.updateDonationStatus(id, { status: newStatus });
      setDonation(prev => ({ ...prev, status: newStatus }));
      alert(`Donation status updated to ${newStatus}.`);
    } catch (err) {
      alert('Failed to update status.');
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
      <button 
        onClick={() => navigate('/donations')} 
        className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-primary transition-colors mb-8"
      >
        <ChevronLeft size={20} />
        <span>Back to Donations</span>
      </button>

      <header className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Transaction #{donation._id?.slice(-8).toUpperCase()}</h1>
          <p className="text-sm text-gray-500">Recorded on {new Date(donation.createdAt).toLocaleString()}</p>
        </div>
        <div className={`px-4 py-2 rounded-xl border font-bold text-sm capitalize flex items-center gap-2 ${getStatusBanner()}`}>
          {donation.status === 'pending' ? <Clock size={16} /> : donation.status === 'success' || donation.status === 'approved' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
          {donation.status}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-2xl shadow-sm border-2 border-primary overflow-hidden">
          <div className="p-6 border-b border-black/5 flex items-center gap-3">
            <Package size={18} className="text-primary" />
            <h2 className="text-base font-bold text-gray-800">Item Details</h2>
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
              <span className="text-sm font-bold text-primary font-mono">{donation.estimatedValue || 'Not specified'}</span>
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
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
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
              <label className="text-sm font-medium text-gray-400">Category</label>
              <span className="text-sm font-bold text-gray-800 capitalize">{donation.itemCategory || 'Uncategorized'}</span>
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
                  <span className="text-xs font-bold text-primary">{donation.locationName || 'Unassigned Facility'}</span>
                </div>
                {donation.pickupAddress?.street ? (
                  <p className="text-xs font-medium text-gray-500 mt-1 truncate">
                    {donation.pickupAddress.street}, {donation.pickupAddress.city} {donation.pickupAddress.zip}
                  </p>
                ) : (
                  <p className="text-xs font-medium text-gray-400 mt-0.5">No external pickup address registered.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
          <div className="p-6 border-b border-black/5 flex items-center gap-3">
            <Briefcase size={18} className="text-primary" />
            <h2 className="text-base font-bold text-gray-800">Storage & Details</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-gray-50">
              <label className="text-sm font-medium text-gray-400">Storage Location</label>
              <span className="text-sm font-bold text-gray-800">
                {donation.storageDetails?.room ? `${donation.storageDetails.room} ${donation.storageDetails.rack || ''} ${donation.storageDetails.shelf || ''}`.trim() : 'Unassigned'}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">DESCRIPTION & NOTES</span>
              <div className="p-4 bg-gray-50 rounded-xl border border-black/5">
                <p className="text-xs font-medium text-gray-600 leading-relaxed">
                  {donation.description || donation.additionalNotes || 'No additional details provided.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-end gap-3 mt-12 pb-10">
        <button 
          onClick={() => handleUpdateStatus('rejected')}
          disabled={isUpdating || donation.status === 'rejected'}
          className="px-8 py-3.5 border-2 border-red-200 text-red-500 rounded-xl font-bold text-sm hover:bg-red-50 transition-colors disabled:opacity-50"
        >
          Reject
        </button>
        <button 
          onClick={() => handleUpdateStatus('pending')}
          disabled={isUpdating || donation.status === 'pending'}
          className="px-8 py-3.5 bg-[#EEE7E1] text-gray-800 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          Mark Pending
        </button>
        <button 
          onClick={() => handleUpdateStatus('approved')}
          disabled={isUpdating || donation.status === 'success' || donation.status === 'approved'}
          className="px-8 py-3.5 bg-primary text-white rounded-xl font-bold text-sm shadow-xl shadow-primary/20 hover:bg-primary-light transition-colors disabled:opacity-50"
        >
          Approve Contribution
        </button>
      </div>
    </div>
  );
};

export default DonationDetail;
