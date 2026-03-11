import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  MapPin, 
  User, 
  Briefcase, 
  Heart, 
  FileText, 
  Download, 
  MoreVertical,
  Edit2,
  CheckCircle2,
  Loader2,
  AlertCircle,
  ShieldAlert
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import adminService from '../services/adminService';

const ParticipantDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [participant, setParticipant] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isApprovingDetailed, setIsApprovingDetailed] = useState(false);
  const [isRevokingDetailed, setIsRevokingDetailed] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await adminService.getParticipantDetail(id);
        setParticipant(data.data);
      } catch (err) {
        setError('Failed to load participant details.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  const handleDeactivate = async () => {
    if (!window.confirm('Are you sure you want to deactivate this participant?')) return;
    
    setIsDeactivating(true);
    try {
      await adminService.deactivateParticipant(id);
      setParticipant(prev => ({ 
        ...prev, 
        accountStatus: 'INACTIVE',
        userId: { ...prev.userId, isApproved: false },
        intakeStatus: { ...prev.intakeStatus, status: 'Action Required' }
      }));
      alert('Participant deactivated successfully.');
    } catch (err) {
      alert('Failed to deactivate participant.');
      console.error(err);
    } finally {
      setIsDeactivating(false);
    }
  };

  const handleApproveAccount = async () => {
    setIsApproving(true);
    try {
      await adminService.approveParticipant(id, true);
      setParticipant(prev => ({ 
        ...prev, 
        userId: { ...prev.userId, isApproved: true },
        accountStatus: 'PENDING'
      }));
      alert('Participant account approved successfully.');
    } catch (err) {
      alert('Failed to approve participant account.');
      console.error(err);
    } finally {
      setIsApproving(false);
    }
  };

  const handleApproveDetailed = async () => {
    setIsApprovingDetailed(true);
    try {
      await adminService.approveDetailedIntake(id);
      setParticipant(prev => ({ 
        ...prev, 
        intakeStatus: { ...prev.intakeStatus, status: 'Completed' },
        accountStatus: 'ACTIVE'
      }));
      alert('Detailed intake approved successfully.');
    } catch (err) {
      alert('Failed to approve detailed intake.');
      console.error(err);
    } finally {
      setIsApprovingDetailed(false);
    }
  };

  const handleRevokeDetailed = async () => {
    if (!window.confirm('Are you sure you want to revoke detailed approval?')) return;
    setIsRevokingDetailed(true);
    try {
      await adminService.revokeDetailedIntake(id);
      setParticipant(prev => ({ 
        ...prev, 
        intakeStatus: { ...prev.intakeStatus, status: 'Action Required' },
        accountStatus: 'PENDING'
      }));
      alert('Detailed intake approval revoked.');
    } catch (err) {
      alert('Failed to revoke detailed intake approval.');
      console.error(err);
    } finally {
      setIsRevokingDetailed(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] text-gray-400 gap-4">
        <Loader2 className="animate-spin text-primary" size={48} />
        <p className="text-sm font-medium">Loading profile details...</p>
      </div>
    );
  }

  if (error || !participant) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-8 flex flex-col items-center text-center gap-4">
        <AlertCircle size={48} className="text-red-500" />
        <div>
          <h2 className="text-lg font-bold text-gray-800">Error Loading Profile</h2>
          <p className="text-sm text-gray-500">{error || 'Participant not found.'}</p>
        </div>
        <button 
          onClick={() => navigate('/participants')}
          className="px-6 py-2 bg-primary text-white rounded-xl font-bold text-sm"
        >
          Back to Participants
        </button>
      </div>
    );
  }

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <button 
          onClick={() => navigate('/participants')} 
          className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-primary transition-colors"
        >
          <ChevronLeft size={20} />
          <span>Back to Participants</span>
        </button>
        <div className="flex flex-wrap gap-3 w-full md:w-auto justify-end">
          {participant.userId?.isApproved ? (
            <button 
              onClick={handleDeactivate}
              disabled={isDeactivating}
              className="flex-1 md:flex-none px-6 py-2.5 bg-red-500 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20 disabled:opacity-50"
            >
              {isDeactivating ? <Loader2 className="animate-spin" size={16} /> : <ShieldAlert size={16} />}
              Deactivate Account
            </button>
          ) : (
            <button 
              onClick={handleApproveAccount}
              disabled={isApproving}
              className="flex-1 md:flex-none px-6 py-2.5 bg-green-500 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-green-600 transition-colors shadow-lg shadow-green-500/20 disabled:opacity-50"
            >
              {isApproving ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
              Approve Participant
            </button>
          )}

          {participant.intakeStatus?.status === 'Completed' ? (
            <button 
              onClick={handleRevokeDetailed}
              disabled={isRevokingDetailed}
              className="flex-1 md:flex-none px-6 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20 disabled:opacity-50"
            >
              {isRevokingDetailed ? <Loader2 className="animate-spin" size={16} /> : <ShieldAlert size={16} />}
              Revoke Intake Approval
            </button>
          ) : (
            <button 
              onClick={handleApproveDetailed}
              disabled={isApprovingDetailed}
              className="flex-1 md:flex-none px-6 py-2.5 bg-blue-500 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-50"
            >
              {isApprovingDetailed ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
              Approve Intake
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6 md:p-8 mb-8">
        <div className="flex flex-col md:flex-row justify-start items-center gap-6">
          <div className="flex items-center gap-6 w-full">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center font-bold text-2xl border-4 border-white shadow-lg overflow-hidden shrink-0">
              {participant.userId?.profilePictureUrl ? (
                <img src={participant.userId.profilePictureUrl} alt={participant.userId?.firstName || 'User'} className="w-full h-full object-cover" />
              ) : (
                `${participant.userId?.firstName?.[0] || 'U'}${participant.userId?.lastName?.[0] || ''}`
              )}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                  {participant.privacyMaskedName || (participant.userId ? `${participant.userId.firstName || ''} ${participant.userId.lastName || ''}`.trim() : 'Unknown User')}
                </h1>
                {(() => {
                  const status = (participant.accountStatus || 'IN PROGRESS').toUpperCase();
                  const styles = {
                    'ACTIVE': 'bg-green-100 text-green-700 border-green-200',
                    'STABLE': 'bg-blue-100 text-blue-700 border-blue-200',
                    'IN PROGRESS': 'bg-orange-100 text-orange-700 border-orange-200',
                    'PENDING': 'bg-orange-100 text-orange-700 border-orange-200',
                    'URGENT': 'bg-red-100 text-red-700 border-red-200',
                    'INACTIVE': 'bg-gray-100 text-gray-700 border-gray-200',
                    'DEACTIVATED': 'bg-gray-100 text-gray-700 border-gray-200',
                  };
                  return (
                    <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${styles[status] || styles['IN PROGRESS']}`}>
                      {status}
                    </span>
                  );
                })()}
              </div>
              <p className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <MapPin size={16} className="text-primary" />
                {participant.residenceArea || 'Unknown Location'} • ID: {participant._id.slice(-6).toUpperCase()}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
          <div className="p-6 border-b border-black/5 flex items-center gap-3">
            <User size={18} className="text-primary" />
            <h2 className="text-base font-bold text-gray-800">Basic Information</h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-x-4 gap-y-6">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Date of Birth</label>
                <p className="text-sm font-bold text-gray-700">{participant.dateOfBirth ? new Date(participant.dateOfBirth).toLocaleDateString() : 'N/A'}</p>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Gender</label>
                <p className="text-sm font-bold text-gray-700">{participant.gender || 'N/A'}</p>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Ethnicity</label>
                <p className="text-sm font-bold text-gray-700">{participant.ethnicity || 'N/A'}</p>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Primary Phone</label>
                <p className="text-sm font-bold text-gray-700">{participant.userId?.phone || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
          <div className="p-6 border-b border-black/5 flex items-center gap-3">
            <MapPin size={18} className="text-primary" />
            <h2 className="text-base font-bold text-gray-800">Program Details</h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Residence Area</label>
              <p className="text-sm font-bold text-gray-700">{participant.residenceArea || 'N/A'}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Housing Status</label>
                <p className="text-sm font-bold text-gray-700">{participant.housingStatus || 'Unknown'}</p>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Intake Step</label>
                <p className="text-sm font-bold text-gray-700">{participant.intakeStep || 1} of 5</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
          <div className="p-6 border-b border-black/5 flex items-center gap-3">
            <FileText size={18} className="text-primary" />
            <h2 className="text-base font-bold text-gray-800">Interests & Needs</h2>
          </div>
          <div className="p-6">
            <div className="flex flex-wrap gap-2">
              {participant.interests?.length > 0 ? (
                participant.interests.map((interest, idx) => (
                  <span key={idx} className="px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg text-xs font-bold border border-black/5">
                    {interest}
                  </span>
                ))
              ) : (
                <p className="text-sm text-gray-400 italic">No interests specified</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
          <div className="p-6 border-b border-black/5 flex items-center gap-3">
            <FileText size={18} className="text-primary" />
            <h2 className="text-base font-bold text-gray-800">Documents</h2>
          </div>
          <div className="p-0">
            {participant.documents?.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {participant.documents.map((doc, idx) => (
                  <div key={idx} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-orange-50 text-primary flex items-center justify-center">
                        <FileText size={20} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-800 text-left">{doc.documentType || 'Document'}</h4>
                        <span className="text-[11px] text-gray-400 font-medium">Uploaded: {new Date(doc.uploadedAt || participant.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <a 
                      href={doc.fileUrl?.startsWith('http') ? doc.fileUrl : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${doc.fileUrl}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="p-2 text-gray-400 hover:text-primary transition-colors"
                      download
                    >
                      <Download size={18} />
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-400">
                <p className="text-sm font-medium italic">No documents uploaded yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParticipantDetail;
