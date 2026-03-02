import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  Mail, 
  Smartphone, 
  CheckCircle2, 
  Clock,
  TrendingUp,
  MoreVertical,
  Calendar,
  FileText,
  UserCheck,
  Loader2,
  AlertCircle,
  Plus
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import adminService from '../services/adminService';

const VolunteerDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [volunteer, setVolunteer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('info');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isAddingHours, setIsAddingHours] = useState(false);
  const [hoursToAdd, setHoursToAdd] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const fetchDetail = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await adminService.getVolunteerDetail(id);
        const matched = res.data || res;
        if (!matched) throw new Error("Volunteer not found");
        
        setVolunteer(matched);
      } catch (err) {
        setError('Failed to load volunteer details.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  const handleUpdateStatus = async (newStatus) => {
    setIsUpdatingStatus(true);
    try {
      await adminService.updateVolunteer(id, { screeningStatus: newStatus });
      setVolunteer(prev => ({ ...prev, screeningStatus: newStatus }));
    } catch (err) {
      alert('Failed to update screening status.');
      console.error(err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleAddHours = async (e) => {
    e.preventDefault();
    if (!hoursToAdd || isNaN(hoursToAdd)) {
      alert('Please enter a valid number of hours.');
      return;
    }

    setIsAddingHours(true);
    try {
      await adminService.addVolunteerHours(id, { 
        hours: parseFloat(hoursToAdd),
        description: notes || 'Manual administrative entry'
      });
      setVolunteer(prev => ({ 
        ...prev, 
        totalHours: (prev.totalHours || 0) + parseFloat(hoursToAdd) 
      }));
      setHoursToAdd('');
      setNotes('');
      alert('Hours added successfully.');
    } catch (err) {
      alert('Failed to add hours.');
      console.error(err);
    } finally {
      setIsAddingHours(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] text-gray-400 gap-4">
        <Loader2 className="animate-spin text-primary" size={48} />
        <p className="text-sm font-medium">Loading volunteer profile...</p>
      </div>
    );
  }

  if (error || !volunteer) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-8 flex flex-col items-center text-center gap-4">
        <AlertCircle size={48} className="text-red-500" />
        <div>
          <h2 className="text-lg font-bold text-gray-800">Error Loading Profile</h2>
          <p className="text-sm text-gray-500">{error || 'Volunteer not found.'}</p>
        </div>
        <button 
          onClick={() => navigate('/volunteers')}
          className="px-6 py-2 bg-primary text-white rounded-xl font-bold text-sm"
        >
          Back to Volunteers
        </button>
      </div>
    );
  }

  const logs = [
    { event: 'Volunteer Joined', date: new Date(volunteer.createdAt).toLocaleDateString(), hours: '0 hrs', status: 'System', statusType: 'approved' },
  ];

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500 pb-12">
      <button 
        onClick={() => navigate('/volunteers')} 
        className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-primary transition-colors mb-8"
      >
        <ChevronLeft size={20} />
        <span>Back to Volunteers</span>
      </button>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-[320px] space-y-6 shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-8 text-center">
            <div className="relative w-24 h-24 mx-auto mb-6">
              {volunteer.userId?.profilePictureUrl || volunteer.profilePictureUrl ? (
                <img 
                  src={volunteer.userId?.profilePictureUrl || volunteer.profilePictureUrl} 
                  alt={`${volunteer.userId?.firstName || ''} ${volunteer.userId?.lastName || ''}`}
                  className="w-full h-full rounded-full object-cover border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-2xl border-4 border-white shadow-lg">
                  {volunteer.userId?.firstName?.[0] || ''}{volunteer.userId?.lastName?.[0] || ''}
                </div>
              )}
              {volunteer.backgroundCheckStatus === 'Verified' && (
                <div className="absolute -bottom-px right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
              )}
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-1">{volunteer.userId?.firstName || ''} {volunteer.userId?.lastName || ''}</h2>
            <span className="text-xs font-bold text-primary uppercase tracking-wider mb-6 block">Joined {new Date(volunteer.createdAt).toLocaleDateString()}</span>
            
            <div className="pt-6 border-t border-gray-50 space-y-4 text-left">
              <div className="flex items-center gap-3 text-sm font-medium text-gray-600">
                <Mail size={16} className="text-primary/60" />
                <span className="truncate">{volunteer.userId?.email || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm font-medium text-gray-600">
                <Smartphone size={16} className="text-primary/60" />
                <span>{volunteer.userId?.phone || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">BACKGROUND CHECK</h3>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">Current Status</label>
            <div className={`${
              volunteer.backgroundCheckStatus === 'Verified' ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'
            } px-4 py-3 rounded-xl flex items-center gap-3 font-bold text-sm mb-6`}>
              {volunteer.backgroundCheckStatus === 'Verified' ? <CheckCircle2 size={18} /> : <Clock size={18} />}
              <span className="capitalize">{volunteer.backgroundCheckStatus || 'Pending'}</span>
            </div>
            
            <div className="flex items-center justify-between mb-8">
              <span className="text-sm font-bold text-gray-700">Account Approved</span>
              <button 
                onClick={async () => {
                  setIsUpdatingStatus(true);
                  try {
                    const newStatus = !volunteer.userId?.isApproved;
                    await adminService.approveVolunteer(id, newStatus);
                    setVolunteer(prev => ({ 
                      ...prev, 
                      userId: { ...prev.userId, isApproved: newStatus },
                      backgroundCheckStatus: newStatus ? 'Verified' : prev.backgroundCheckStatus
                    }));
                  } catch (err) {
                    alert('Failed to update approval status.');
                  } finally {
                    setIsUpdatingStatus(false);
                  }
                }}
                disabled={isUpdatingStatus}
                className={`w-11 h-6 rounded-full relative transition-colors ${volunteer.userId?.isApproved ? 'bg-primary' : 'bg-gray-200'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${volunteer.userId?.isApproved ? 'translate-x-6' : 'translate-x-1'}`}></div>
              </button>
            </div>

            <div className="flex items-center justify-between mb-8">
              <span className="text-sm font-bold text-gray-700">Mark as Verified</span>
              <button 
                onClick={() => handleUpdateStatus(volunteer.backgroundCheckStatus === 'Verified' ? 'Pending' : 'Verified')}
                disabled={isUpdatingStatus}
                className={`w-11 h-6 rounded-full relative transition-colors ${volunteer.backgroundCheckStatus === 'Verified' ? 'bg-primary' : 'bg-gray-200'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${volunteer.backgroundCheckStatus === 'Verified' ? 'translate-x-6' : 'translate-x-1'}`}></div>
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="flex gap-8 border-b border-gray-100 mb-8">
            <button 
              className={`pb-4 text-[15px] font-bold transition-all relative ${activeTab === 'info' ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}
              onClick={() => setActiveTab('info')}
            >
              Info & Activity
              {activeTab === 'info' && <div className="-bottom-px left-0 w-full h-0.5 bg-primary rounded-full animate-in fade-in zoom-in-95 duration-300"></div>}
            </button>
            <button className="pb-4 text-[15px] font-bold text-gray-400 hover:text-gray-600 cursor-not-allowed">Documents</button>
            <button className="pb-4 text-[15px] font-bold text-gray-400 hover:text-gray-600 cursor-not-allowed">Availability</button>
          </div>

          <div className="space-y-8">
            <section className="bg-white rounded-2xl shadow-sm border border-black/5 p-6 md:p-8">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-1">Add Volunteer Hours</h2>
                  <p className="text-sm text-gray-400">Log new verified service hours for this volunteer</p>
                </div>
              </div>

              <form onSubmit={handleAddHours} className="space-y-4 max-w-lg">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Number of Hours</label>
                    <input 
                      type="number" 
                      step="0.5"
                      value={hoursToAdd}
                      onChange={(e) => setHoursToAdd(e.target.value)}
                      placeholder="e.g. 4.5"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-black/5 rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>
                  <div className="flex items-end">
                    <button 
                      type="submit"
                      disabled={isAddingHours}
                      className="w-full px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-primary-light transition-colors shadow-lg shadow-primary/20 disabled:opacity-50"
                    >
                      {isAddingHours ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
                      Log Hours
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Reason / Description</label>
                  <input 
                    type="text" 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Community Kitchen support"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-black/5 rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
              </form>
            </section>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl border border-black/5 p-6 border-b-4 border-b-primary shadow-xl shadow-primary/5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 block">TOTAL HOURS</label>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-primary">{volunteer.totalHours || 0}</span>
                  <span className="text-[11px] font-bold text-green-500 flex items-center gap-1">
                    <TrendingUp size={14} />
                    Active
                  </span>
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 block">MEMBER SINCE</label>
                <div className="flex flex-col">
                  <span className="text-xl font-bold text-gray-800">{new Date(volunteer.createdAt).getFullYear()}</span>
                  <span className="text-[11px] font-medium text-gray-400 mt-1">{new Date(volunteer.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 block">PARTICIPANT ROLE</label>
                <div className="flex items-center gap-6">
                  <span className="text-xl font-bold text-gray-800 capitalize">{volunteer.userId?.role || 'Volunteer'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VolunteerDetail;
