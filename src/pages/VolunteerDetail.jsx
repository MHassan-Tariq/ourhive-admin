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
  Plus,
  MapPin,
  Ban
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
  const [selectedEventId, setSelectedEventId] = useState('');
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
        if (matched.joinedOpportunities?.length > 0 && !selectedEventId) {
          const firstEventId = matched.joinedOpportunities[0].opportunityId?._id || matched.joinedOpportunities[0]._id;
          setSelectedEventId(firstEventId);
        }
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
      await adminService.updateVolunteer(id, { backgroundCheckStatus: newStatus });
      setVolunteer(prev => ({ ...prev, backgroundCheckStatus: newStatus }));
    } catch (err) {
      alert('Failed to update background check status.');
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
      const payload = { 
        hours: parseFloat(hoursToAdd),
        description: notes || 'Manual administrative entry',
        opportunityId: selectedEventId || null
      };
      
      const response = await adminService.addVolunteerHours(id, payload);
      
      // Update state locally
      setVolunteer(prev => {
        const matchingOpportunity = prev.joinedOpportunities?.find(o => 
          (o.opportunityId?._id || o._id) === selectedEventId
        );
        
        // Use the actual log returned from the backend if available
        const newLog = response.log ? {
          ...response.log,
          // Ensure opportunityId is populated for the UI if it's just an ID in the log response
          opportunityId: selectedEventId ? {
            _id: selectedEventId,
            title: matchingOpportunity?.opportunityId?.title || matchingOpportunity?.title || 'Event'
          } : null
        } : {
          _id: Date.now().toString(),
          date: new Date().toISOString(),
          hoursLogged: parseFloat(hoursToAdd),
          notes: notes || 'Manual administrative entry',
          opportunityId: selectedEventId ? {
            _id: selectedEventId,
            title: matchingOpportunity?.opportunityId?.title || matchingOpportunity?.title || 'Event'
          } : null,
          category: 'Administrative / Manual Entry',
          status: 'pending'
        };

        return { 
          ...prev, 
          volunteerLogs: [newLog, ...(prev.volunteerLogs || [])]
        };
      });

      setHoursToAdd('');
      setNotes('');
      setSelectedEventId('');
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

  const approvedHours = volunteer.volunteerLogs
    ?.filter(log => log.status === 'approved' || !log.status)
    .reduce((sum, log) => sum + (log.hoursLogged || 0), 0) || 0;
  
  const pendingHours = volunteer.volunteerLogs
    ?.filter(log => log.status === 'pending')
    .reduce((sum, log) => sum + (log.hoursLogged || 0), 0) || 0;

  const rejectedHours = volunteer.volunteerLogs
    ?.filter(log => log.status === 'rejected')
    .reduce((sum, log) => sum + (log.hoursLogged || 0), 0) || 0;

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500 pb-12 max-w-7xl mx-auto">
      <button 
        onClick={() => navigate('/volunteers')} 
        className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-primary transition-colors mb-8"
      >
        <ChevronLeft size={20} />
        <span>Back to Volunteers</span>
      </button>

      <div className="flex flex-col xl:flex-row gap-8">
        <div className="w-full xl:w-[280px] space-y-6 shrink-0">
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
            
            <div className={`flex items-center justify-between transition-opacity duration-300`}>
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
            <button 
              className={`pb-4 text-[15px] font-bold transition-all relative ${activeTab === 'documents' ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}
              onClick={() => setActiveTab('documents')}
            >
              Documents
              {activeTab === 'documents' && <div className="-bottom-px left-0 w-full h-0.5 bg-primary rounded-full animate-in fade-in zoom-in-95 duration-300"></div>}
            </button>
            <button 
              className={`pb-4 text-[15px] font-bold transition-all relative ${activeTab === 'availability' ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}
              onClick={() => setActiveTab('availability')}
            >
              Availability
              {activeTab === 'availability' && <div className="-bottom-px left-0 w-full h-0.5 bg-primary rounded-full animate-in fade-in zoom-in-95 duration-300"></div>}
            </button>
            <button 
              className={`pb-4 text-[15px] font-bold transition-all relative ${activeTab === 'events' ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}
              onClick={() => setActiveTab('events')}
            >
              Events
              {activeTab === 'events' && <div className="-bottom-px left-0 w-full h-0.5 bg-primary rounded-full animate-in fade-in zoom-in-95 duration-300"></div>}
            </button>
          </div>

          <div className="space-y-8">
            {activeTab === 'info' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
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
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Assign to Event</label>
                        <select
                          value={selectedEventId}
                          onChange={(e) => setSelectedEventId(e.target.value)}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-black/5 rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none"
                        >
                          {volunteer.joinedOpportunities?.length > 0 ? (
                            volunteer.joinedOpportunities.map(opp => (
                              <option key={opp.opportunityId?._id || opp._id} value={opp.opportunityId?._id || opp._id}>
                                {opp.opportunityId?.title || opp.title || 'Untitled Event'}
                              </option>
                            ))
                          ) : (
                            <option value="">No events joined</option>
                          )}
                        </select>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Reason / Description</label>
                      <div className="flex flex-col sm:flex-row gap-4">
                        <input 
                          type="text" 
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="e.g. Community Kitchen support"
                          className="flex-1 px-4 py-2.5 bg-gray-50 border border-black/5 rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none"
                        />
                        <button 
                          type="submit"
                          disabled={isAddingHours}
                          className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-primary-light transition-colors shadow-lg shadow-primary/20 disabled:opacity-50"
                        >
                          {isAddingHours ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
                          Log Hours
                        </button>
                      </div>
                    </div>
                  </form>
                </section>

                <section className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden mb-8">
                  <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">Service Hours History</h3>
                      <p className="text-xs text-gray-400 mt-0.5">Historical record of all verified contributions</p>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[700px]">
                      <thead>
                        <tr className="bg-gray-50/50">
                          <th className="px-6 py-4 text-[9px] font-bold text-gray-400 uppercase tracking-widest w-[110px]">DATE</th>
                          <th className="px-6 py-4 text-[9px] font-bold text-gray-400 uppercase tracking-widest w-[90px]">DURATION</th>
                          <th className="px-6 py-4 text-[9px] font-bold text-gray-400 uppercase tracking-widest w-[90px]">STATUS</th>
                          <th className="px-6 py-4 text-[9px] font-bold text-gray-400 uppercase tracking-widest">ASSIGNED EVENT</th>
                          <th className="px-6 py-4 text-[9px] font-bold text-gray-400 uppercase tracking-widest">NOTES</th>
                          <th className="px-6 py-4 text-[9px] font-bold text-gray-400 uppercase tracking-widest text-right w-[140px]">ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {volunteer.volunteerLogs?.length > 0 ? (
                          volunteer.volunteerLogs.map((log) => (
                            <tr key={log._id} className="hover:bg-gray-50/30 transition-colors">
                              <td className="px-6 py-4">
                                <span className="text-xs font-bold text-gray-700">{new Date(log.date).toLocaleDateString()}</span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="px-2.5 py-1 bg-green-50 text-green-600 rounded-lg text-xs font-bold whitespace-nowrap">
                                  {log.hoursLogged} hrs
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase ${
                                  log.status === 'pending' ? 'bg-orange-50 text-orange-600' :
                                  log.status === 'rejected' ? 'bg-red-50 text-red-600' : 
                                  'bg-green-50 text-green-600'
                                }`}>
                                  {log.status || 'Approved'}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2 max-w-[120px]">
                                  <Calendar size={13} className="text-gray-300 shrink-0" />
                                  <span className="text-xs font-medium text-gray-600 truncate" title={log.opportunityId?.title || 'General Activity'}>
                                    {log.opportunityId?.title || 'General Activity'}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <p className="text-xs text-gray-400 truncate max-w-[120px]" title={log.notes}>
                                  {log.notes || '—'}
                                </p>
                              </td>
                              <td className="px-6 py-4 text-right">
                                {log.status === 'pending' && (
                                  <div className="flex items-center justify-end gap-2">
                                    <button
                                      onClick={async () => {
                                        if (window.confirm('Approve these hours?')) {
                                          try {
                                            await adminService.approveVolunteerHours(log._id, 'approved');
                                            setVolunteer(prev => ({
                                              ...prev,
                                              totalHours: (prev.totalHours || 0) + log.hoursLogged,
                                              volunteerLogs: prev.volunteerLogs.map(l => l._id === log._id ? { ...l, status: 'approved' } : l)
                                            }));
                                          } catch (err) {
                                            console.error('Approval error:', err);
                                            alert(`Failed to approve hours: ${err.response?.data?.message || err.message}`);
                                          }
                                        }
                                      }}
                                      className="px-3 py-1 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg text-xs font-bold transition-colors"
                                    >
                                      Approve
                                    </button>
                                    <button
                                      onClick={async () => {
                                        if (window.confirm('Reject these hours?')) {
                                          try {
                                            await adminService.approveVolunteerHours(log._id, 'rejected');
                                            setVolunteer(prev => ({
                                              ...prev,
                                              volunteerLogs: prev.volunteerLogs.map(l => l._id === log._id ? { ...l, status: 'rejected' } : l)
                                            }));
                                          } catch (err) {
                                            console.error('Rejection error:', err);
                                            alert(`Failed to reject hours: ${err.response?.data?.message || err.message}`);
                                          }
                                        }
                                      }}
                                      className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold transition-colors"
                                    >
                                      Reject
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="6" className="px-6 py-12 text-center">
                              <div className="flex flex-col items-center gap-2">
                                <Clock size={24} className="text-gray-200" />
                                <span className="text-sm font-medium text-gray-400">No hours logged yet</span>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
                  <div className="bg-white rounded-2xl border border-black/5 p-6 border-b-4 border-b-green-500 shadow-xl shadow-green-500/5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 block">APPROVED HOURS</label>
                    <div className="flex items-baseline gap-3">
                      <span className="text-3xl font-bold text-green-600">{approvedHours}</span>
                      <span className="text-[11px] font-bold text-green-500 flex items-center gap-1">
                        <TrendingUp size={14} />
                        Active
                      </span>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl border border-black/5 p-6 border-b-4 border-b-orange-400 shadow-xl shadow-orange-400/5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 block">PENDING HOURS</label>
                    <div className="flex items-baseline gap-3">
                      <span className="text-3xl font-bold text-orange-500">{pendingHours}</span>
                      <span className="text-[11px] font-bold text-orange-400 flex items-center gap-1">
                        <Clock size={14} />
                        Review
                      </span>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl border border-black/5 p-6 border-b-4 border-b-red-400 shadow-xl shadow-red-400/5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 block">REJECTED HOURS</label>
                    <div className="flex items-baseline gap-3">
                      <span className="text-3xl font-bold text-red-500">{rejectedHours}</span>
                      <span className="text-[11px] font-bold text-red-400 flex items-center gap-1">
                        <Ban size={14} />
                        Denied
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
                </div>
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <section className="bg-white rounded-2xl shadow-sm border border-black/5 p-6 md:p-8">
                  <h2 className="text-xl font-bold text-gray-800 mb-6">Uploaded Documents</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 bg-gray-50 rounded-2xl border border-black/5">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                          <FileText size={24} />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-800">Government ID</h4>
                          <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">Primary Identification</p>
                        </div>
                      </div>
                      {volunteer.governmentIdUrl ? (
                        <a 
                          href={volunteer.governmentIdUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-full py-3 bg-white border border-black/5 text-gray-700 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors"
                        >
                          View Document
                        </a>
                      ) : (
                        <div className="w-full py-3 bg-gray-100 text-gray-400 rounded-xl text-sm font-bold flex items-center justify-center italic">
                          Not Provided
                        </div>
                      )}
                    </div>

                    <div className="p-6 bg-gray-50 rounded-2xl border border-black/5">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                          <UserCheck size={24} />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-800">Driving License</h4>
                          <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">Secondary Credential</p>
                        </div>
                      </div>
                      {volunteer.drivingLicenseUrl ? (
                        <a 
                          href={volunteer.drivingLicenseUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-full py-3 bg-white border border-black/5 text-gray-700 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors"
                        >
                          View Document
                        </a>
                      ) : (
                        <div className="w-full py-3 bg-gray-100 text-gray-400 rounded-xl text-sm font-bold flex items-center justify-center italic">
                          Not Provided
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'availability' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <section className="bg-white rounded-2xl shadow-sm border border-black/5 p-6 md:p-8">
                  <h2 className="text-xl font-bold text-gray-800 mb-6">General Availability</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { key: 'morning', label: 'Morning' },
                      { key: 'afternoon', label: 'Afternoon' },
                      { key: 'evenings', label: 'Evenings' },
                      { key: 'weekend', label: 'Weekends' }
                    ].map((slot) => {
                      const isAvailable = volunteer.availability?.[slot.key];
                      return (
                        <div 
                          key={slot.key}
                          className={`p-4 rounded-2xl border flex flex-col items-center gap-3 text-center transition-all ${
                            isAvailable 
                              ? 'bg-green-50 border-green-100 text-green-700' 
                              : 'bg-gray-50 border-black/5 text-gray-400 opacity-60'
                          }`}
                        >
                          <div className={`p-3 rounded-xl ${isAvailable ? 'bg-green-100' : 'bg-gray-100'}`}>
                            {isAvailable ? <CheckCircle2 size={24} /> : <Clock size={24} />}
                          </div>
                          <span className="text-sm font-bold">{slot.label}</span>
                          <span className="text-[10px] font-bold uppercase tracking-widest">
                            {isAvailable ? 'Available' : 'Unavailable'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'events' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <section className="bg-white rounded-2xl shadow-sm border border-black/5 p-6 md:p-8">
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <h2 className="text-xl font-bold text-gray-800 mb-1">Collaborations & Events</h2>
                      <p className="text-sm text-gray-400">List of events this volunteer has joined</p>
                    </div>
                  </div>

                  {volunteer.joinedOpportunities?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {volunteer.joinedOpportunities.map((event) => (
                        <div key={event._id} className="bg-gray-50 rounded-2xl border border-black/5 p-5 flex flex-col gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-200 shrink-0">
                              {event.imageurl ? (
                                <img src={event.imageurl} alt={event.title} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                  <Calendar size={24} />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-gray-800 truncate">{event.title}</h4>
                              <p className="text-xs text-primary font-bold uppercase tracking-wider truncate">
                                {event.partnerId?.orgName || event.partnerId?.organizationName || 'Organizer'}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                                  event.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                }`}>
                                  {event.status}
                                </span>
                                <span className="text-[10px] text-gray-400 font-medium">
                                  {new Date(event.date).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                      
                          <div className="space-y-2 pt-2 border-t border-black/5">
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              <MapPin size={14} className="text-gray-400" />
                              <span className="truncate">{event.location || 'Remote / Online'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              <FileText size={14} className="text-gray-400" />
                              <span>{event.category || 'General'}</span>
                            </div>
                          </div>

                          <button 
                            onClick={() => navigate(`/events/${event._id}`)}
                            className="w-full py-2.5 bg-white border border-black/5 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-100 transition-colors mt-auto"
                          >
                            View Event Details
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center bg-gray-50 rounded-2xl border border-dashed border-black/10">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-gray-300 mb-4 shadow-sm">
                        <Calendar size={32} />
                      </div>
                      <h3 className="text-base font-bold text-gray-700">No events yet</h3>
                      <p className="text-sm text-gray-400 max-w-[240px] mt-1">This volunteer hasn't joined any events or opportunities yet.</p>
                    </div>
                  )}
                </section>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VolunteerDetail;
