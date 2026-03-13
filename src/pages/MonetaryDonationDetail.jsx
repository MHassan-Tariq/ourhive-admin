import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  DollarSign, 
  Tag, 
  CheckCircle2, 
  Clock,
  Loader2,
  AlertCircle,
  Hash,
  Activity
} from 'lucide-react';
import adminService from '../services/adminService';

const MonetaryDonationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [donation, setDonation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isApproving, setIsApproving] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const response = await adminService.getMonetaryDonationDetail(id);
        setDonation(response.data);
      } catch (err) {
        setError('Failed to load donation details.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const handleApprove = async () => {
    if (!window.confirm('Are you sure you want to approve this donation?')) return;
    
    setIsApproving(true);
    try {
      await adminService.approveMonetaryDonation(id);
      // Refresh details
      const response = await adminService.getMonetaryDonationDetail(id);
      setDonation(response.data);
    } catch (err) {
      console.error(err);
      alert('Failed to approve donation.');
    } finally {
      setIsApproving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500 gap-4">
        <Loader2 className="animate-spin text-primary" size={40} />
        <p className="font-medium">Loading donation details...</p>
      </div>
    );
  }

  if (error || !donation) {
    return (
      <div className="p-10 text-center">
        <div className="bg-red-50 text-red-700 p-6 rounded-2xl inline-block">
          <AlertCircle className="mx-auto mb-4" size={40} />
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>{error || 'Donation not found.'}</p>
          <button 
            onClick={() => navigate('/donations/monetary')}
            className="mt-6 px-6 py-2 bg-red-600 text-white rounded-full font-bold hover:bg-red-700 transition-all shadow-md"
          >
            Back to List
          </button>
        </div>
      </div>
    );
  }

  const getStatusStyle = (status) => {
    const s = status?.toLowerCase();
    const styles = {
      pending: 'bg-orange-50 text-primary border-orange-100',
      completed: 'bg-green-50 text-green-700 border-green-100',
      failed: 'bg-red-50 text-red-600 border-red-100',
    };
    return `inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-bold uppercase tracking-widest ${styles[s] || 'bg-gray-50 text-gray-500 border-gray-100'}`;
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12 max-w-5xl mx-auto">
      <button 
        onClick={() => navigate('/donations/monetary')}
        className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors font-bold text-sm mb-6 group"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        Back to Monetary Donations
      </button>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 bg-white p-8 rounded-3xl shadow-sm border border-black/5">
        <div className="flex items-center gap-5">
           <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center text-primary shadow-inner">
             <DollarSign size={32} />
           </div>
           <div>
             <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
               Donation #{donation._id.substring(donation._id.length - 8).toUpperCase()}
             </h1>
             <div className="flex items-center gap-3 mt-1.5">
               <span className={getStatusStyle(donation.status)}>
                 <span className={`w-1.5 h-1.5 rounded-full ${
                   donation.status === 'pending' ? 'bg-orange-500' : donation.status === 'completed' ? 'bg-green-500' : 'bg-red-500'
                 }`}></span>
                 {donation.status}
               </span>
               <span className="text-[13px] text-gray-400 font-medium">
                 Logged on {new Date(donation.createdAt).toLocaleDateString()}
               </span>
             </div>
           </div>
        </div>

        {donation.status === 'pending' && (
          <button 
            onClick={handleApprove}
            disabled={isApproving}
            className="px-8 py-3.5 bg-primary text-white font-bold rounded-2xl hover:bg-primary-light transition-all shadow-lg shadow-orange-900/20 disabled:opacity-50 flex items-center gap-2"
          >
            {isApproving ? <Loader2 size={20} className="animate-spin" /> : <CheckCircle2 size={20} />}
            Approve Donation
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Donation & Project Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Donation Summary */}
          <section className="bg-white p-8 rounded-3xl shadow-sm border border-black/5">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Activity size={20} className="text-primary" />
              Donation Summary
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-1">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Amount</p>
                <p className="text-2xl font-bold text-primary">${donation.amount?.toLocaleString()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Transaction Status</p>
                <p className="text-[15px] font-bold text-gray-700 capitalize">{donation.status}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Transaction ID</p>
                <div className="flex items-center gap-2">
                  <Hash size={16} className="text-gray-400" />
                  <p className="text-[15px] font-medium text-gray-600">{donation.transactionId || 'Not Assigned'}</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Payment Method</p>
                <p className="text-[15px] font-medium text-gray-600 capitalize">{donation.paymentMethod || 'Credit/Debit'}</p>
              </div>
            </div>
            {donation.notes && (
              <div className="mt-8 pt-8 border-t border-gray-50">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Donor Notes</p>
                <p className="text-[15px] text-gray-600 leading-relaxed italic border-l-4 border-orange-100 pl-4">{donation.notes}</p>
              </div>
            )}
          </section>

          {/* Project / Event Context */}
          <section className="bg-white p-8 rounded-3xl shadow-sm border border-black/5">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Tag size={20} className="text-primary" />
              Allocated To
            </h3>
            {donation.eventId ? (
              <div className="space-y-4">
                <h4 className="text-xl font-bold text-[#A16D36]">{donation.eventId.title}</h4>
                <p className="text-[#718096] leading-relaxed">{donation.eventId.description}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                  <div className="flex items-center gap-3 bg-[#FAF8F5] p-4 rounded-2xl">
                    <Calendar size={18} className="text-[#A16D36]" />
                    <span className="text-sm font-bold text-gray-700">
                      {new Date(donation.eventId.date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 bg-[#FAF8F5] p-4 rounded-2xl">
                    <Tag size={18} className="text-[#A16D36]" />
                    <span className="text-sm font-bold text-gray-700 capitalize">
                      {donation.eventId.category}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <div className="w-12 h-12 bg-orange-50 text-primary rounded-full flex items-center justify-center mb-3">
                  <DollarSign size={24} />
                </div>
                <h4 className="font-bold text-gray-700">{donation.projectTitle || 'General Our Hive Fund'}</h4>
                <p className="text-sm text-gray-400 mt-1">This donation will be used where it is most needed.</p>
              </div>
            )}
          </section>
        </div>

        {/* Right Column: Donor Information */}
        <div className="space-y-8">
          <section className="bg-white p-8 rounded-3xl shadow-sm border border-black/5">
            <h3 className="text-xl font-bold text-gray-800 mb-8 flex items-center gap-2">
              <User size={20} className="text-primary" />
              Donor Info
            </h3>
            
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-24 h-24 rounded-full bg-orange-50 border-4 border-white shadow-xl flex items-center justify-center text-primary mb-4 overflow-hidden">
                {donation.sponsorId?.profilePictureUrl ? (
                  <img src={donation.sponsorId.profilePictureUrl} alt="Donor" className="w-full h-full object-cover" />
                ) : (
                  <User size={40} />
                )}
              </div>
              <h4 className="text-xl font-bold text-gray-800">
                {donation.sponsorId ? `${donation.sponsorId.firstName} ${donation.sponsorId.lastName}` : (donation.donorName || 'Guest Donor')}
              </h4>
              <p className="text-[13px] text-[#A16D36] font-bold uppercase tracking-widest mt-1">
                {donation.sponsorId ? 'Registered Sponsor' : 'One-time Donor'}
              </p>
            </div>

            <div className="space-y-5">
              <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl group border border-transparent hover:border-orange-100 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-primary shadow-sm">
                  <Mail size={18} />
                </div>
                <div className="flex flex-col overflow-hidden">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Email Address</p>
                  <p className="text-sm font-bold text-gray-700 truncate">{donation.sponsorId?.email || donation.donorEmail || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl group border border-transparent hover:border-orange-100 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-primary shadow-sm">
                  <Phone size={18} />
                </div>
                <div className="flex flex-col">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Phone Number</p>
                  <p className="text-sm font-bold text-gray-700">{donation.sponsorId?.phone || donation.donorPhone || 'N/A'}</p>
                </div>
              </div>
            </div>

            {donation.sponsorId && (
              <button 
                onClick={() => navigate(`/sponsors/${donation.sponsorId._id}`)}
                className="w-full mt-8 py-3 px-4 border-2 border-primary text-primary font-bold rounded-2xl hover:bg-orange-50 transition-all flex items-center justify-center gap-2"
              >
                View Full Sponsor Profile
              </button>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default MonetaryDonationDetail;
