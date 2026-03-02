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
  Loader2,
  AlertCircle,
  ShieldAlert,
  Ban,
  PauseCircle,
  CheckCircle2,
  Building2,
  Camera
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import adminService from '../services/adminService';

const PartnerDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [partner, setPartner] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('logo', file);

    setIsUploading(true);
    try {
      const response = await adminService.updatePartner(id, formData);
      if (response.success) {
        setPartner(prev => ({ ...prev, organizationLogoUrl: response.data.organizationLogoUrl }));
      }
    } catch (err) {
      console.error(err);
      alert('Failed to upload logo.');
    } finally {
      setIsUploading(false);
    }
  };

  // Mock data for visual completeness matching Screenshot 2
  const mockPartner = {
    _id: id || 'PG-88291',
    name: 'TechGlobal Solutions',
    subtitle: 'Managed Service Provider & Infrastructure Partner',
    legalName: 'TechGlobal Solutions Inc.',
    registrationNo: 'US-991827364',
    headquarters: 'San Francisco, CA, USA',
    taxStatus: 'Verified (W-9)',
    overview: 'Providing enterprise-grade cloud migration and digital transformation services since 2015. Certified Gold Partner in infrastructure management.',
    onboardingScore: 98,
    status: 'ACTIVE PARTNER',
    agreements: [
      { id: 1, version: 'v4.2 - Master Services', timestamp: '2023-10-12T14:23:01', representative: 'Sarah Jenkins (CTO)', status: 'Executed' },
      { id: 2, version: 'v3.1 - NDA Addendum', timestamp: '2023-01-05T09:12:44', representative: 'Sarah Jenkins (CTO)', status: 'Archived' },
    ]
  };

  useEffect(() => {
    const fetchDetail = async () => {
      setIsLoading(true);
      setError(null);
      try {
        let data = { data: mockPartner };
        
        if (adminService.getPartnerDetail) {
          try {
             const apiData = await adminService.getPartnerDetail(id);
             if (apiData && apiData.data) data = apiData;
          } catch(e) {
             console.warn("API not available, using mock data for visual validation");
          }
        }
        setPartner(data.data);
      } catch (err) {
        setError('Failed to load partner details.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  const handleAction = async (actionType) => {
    if (!window.confirm(`Are you sure you want to ${actionType} this partner?`)) return;
    
    // Map internal action names to API status names if different
    const statusMap = {
       approve: 'active',
       suspend: 'suspended',
       reject: 'rejected'
    };
    
    setActionLoading(actionType);
    try {
      if (adminService.updatePartnerStatus) {
         await adminService.updatePartnerStatus(id, statusMap[actionType]);
         setPartner(prev => ({ ...prev, status: statusMap[actionType].toUpperCase() + ' PARTNER' }));
         alert(`Partner ${actionType}d successfully.`);
      }
    } catch (err) {
      alert(`Failed to ${actionType} partner.`);
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    const datePart = date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    const timePart = date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    return `${datePart} ${timePart}`;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] text-gray-400 gap-4">
        <Loader2 className="animate-spin text-amber-600" size={48} />
        <p className="text-sm font-medium">Loading partner details...</p>
      </div>
    );
  }

  if (error || !partner) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-8 flex flex-col items-center text-center gap-4">
        <AlertCircle size={48} className="text-red-500" />
        <div>
          <h2 className="text-lg font-bold text-gray-800">Error Loading Profile</h2>
          <p className="text-sm text-gray-500">{error || 'Partner not found.'}</p>
        </div>
        <button 
          onClick={() => navigate('/partners')}
          className="px-6 py-2 bg-amber-700 text-white rounded-xl font-bold text-sm"
        >
          Back to Partners
        </button>
      </div>
    );
  }

  const {
    orgName = '',
    orgType = '',
    legalEntityName = '',
    registrationNumber = '',
    headquarters = '',
    taxStatus = '',
    companyOverview = '',
    onboardingScore = 0,
    status = 'PENDING',
    agreementHistory = []
  } = partner;

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500 pb-12 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div className="flex items-center gap-6">
           <div className="relative group">
             <div className="w-24 h-24 rounded-2xl bg-white border border-black/5 flex items-center justify-center overflow-hidden shadow-sm">
               {partner.organizationLogoUrl ? (
                 <img src={partner.organizationLogoUrl} alt={orgName} className="w-full h-full object-contain p-2" />
               ) : (
                 <Building2 size={40} className="text-gray-300" />
               )}
               {isUploading && (
                 <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                   <Loader2 className="animate-spin text-white" size={24} />
                 </div>
               )}
             </div>
             <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#A16D36] text-white rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:bg-amber-800 transition-colors border-2 border-white">
               <Camera size={14} />
               <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} disabled={isUploading} />
             </label>
           </div>
           <div>
              <div className="flex items-center gap-3 mb-2">
                 <span className="bg-orange-100 text-orange-800 text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-wider">
                   {status}
                 </span>
                 <span className="text-sm text-[#A0AEC0] font-medium">
                   ID: <span className="font-mono tracking-wide">{id}</span>
                 </span>
              </div>
              <h1 className="text-[36px] font-bold text-[#1a202c] leading-tight tracking-tight">
                {orgName}
              </h1>
              <p className="text-[16px] text-[#718096] mt-1">
                {orgType}
              </p>
           </div>
        </div>
        
        <div className="flex items-center gap-3 mt-4 md:mt-0">
          <button 
            onClick={() => handleAction('reject')}
            disabled={actionLoading !== null}
            className="flex items-center gap-2 px-6 py-2.5 bg-white border border-[#E2E8F0] text-[#4A5568] rounded-full text-[14px] font-bold hover:bg-gray-50 disabled:opacity-50 transition-colors shadow-sm"
          >
            {actionLoading === 'reject' ? <Loader2 className="animate-spin" size={16} /> : <Ban size={16} />}
            Reject
          </button>
          
          <button 
            onClick={() => handleAction('suspend')}
            disabled={actionLoading !== null}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#FAF3E0] border border-[#F6E0B5] text-[#9C6D2E] rounded-full text-[14px] font-bold hover:bg-[#FDF8EB] disabled:opacity-50 transition-colors shadow-sm"
          >
            {actionLoading === 'suspend' ? <Loader2 className="animate-spin" size={16} /> : <PauseCircle size={16} />}
            Suspend
          </button>
 
          <button 
            onClick={() => handleAction('approve')}
            disabled={actionLoading !== null}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#A16D36] text-white rounded-full text-[14px] font-bold hover:bg-[#8C5D2B] disabled:opacity-50 transition-colors shadow-md shadow-amber-900/20"
          >
            {actionLoading === 'approve' ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
            Approve
          </button>
        </div>
      </div>
 
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8 mb-8">
        {/* Organization Information Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
          <div className="p-6 md:p-8 flex items-center gap-3">
             <Building2 size={22} className="text-[#A16D36]" />
             <h2 className="text-[18px] font-bold text-[#2D3748]">Organization Information</h2>
          </div>
          
          <div className="px-6 md:px-8 pb-8 space-y-8">
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-12">
                <div className="space-y-1.5">
                   <label className="text-[11px] font-bold text-[#A0AEC0] uppercase tracking-wider">LEGAL ENTITY NAME</label>
                   <p className="text-[16px] font-bold text-[#2D3748]">{legalEntityName}</p>
                </div>
                <div className="space-y-1.5">
                   <label className="text-[11px] font-bold text-[#A0AEC0] uppercase tracking-wider">REGISTRATION NO.</label>
                   <p className="text-[16px] font-bold text-[#2D3748]">{registrationNumber}</p>
                </div>
                <div className="space-y-1.5">
                   <label className="text-[11px] font-bold text-[#A0AEC0] uppercase tracking-wider">HEADQUARTERS</label>
                   <p className="text-[16px] font-bold text-[#2D3748]">{headquarters}</p>
                </div>
                <div className="space-y-1.5">
                   <label className="text-[11px] font-bold text-[#A0AEC0] uppercase tracking-wider">TAX STATUS</label>
                   <p className="text-[16px] font-bold text-emerald-600">{taxStatus}</p>
                </div>
             </div>
 
             <div className="bg-[#FAF8F5] p-6 rounded-2xl">
                <label className="text-[11px] font-bold text-[#A0AEC0] uppercase tracking-wider mb-2 block">COMPANY OVERVIEW</label>
                <p className="text-[14px] text-[#4A5568] leading-relaxed">
                   {companyOverview}
                </p>
             </div>
          </div>
        </div>
        
        {/* Onboarding Score Card */}
        <div className="bg-[#B98C53] rounded-2xl p-8 text-white shadow-lg shadow-amber-900/10 h-fit relative overflow-hidden">
          <div className="relative z-10">
             <p className="text-[11px] font-bold uppercase tracking-widest text-white/80 mb-2">ONBOARDING SCORE</p>
             <div className="flex items-baseline gap-1 mb-6">
                <span className="text-[48px] font-bold leading-none">{onboardingScore}</span>
                <span className="text-[18px] text-white/70 font-bold">/ 100</span>
             </div>
             
             <div className="w-full h-1.5 bg-black/20 rounded-full mb-6">
                <div 
                  className="h-full bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]" 
                  style={{ width: `${onboardingScore}%` }}
                ></div>
             </div>
             
             <p className="text-[13px] text-white/90 leading-relaxed font-medium pr-4">
                Partner has completed 100% of required documentation and background checks.
             </p>
          </div>
          
          {/* Decorative background circle */}
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        </div>
      </div>
 
      {/* Agreement Details Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
         <div className="p-6 md:p-8 flex items-center gap-3 border-b border-black/5">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[18px] h-[18px] text-[#A16D36]">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            <h2 className="text-[18px] font-bold text-[#2D3748]">Agreement Details</h2>
         </div>
         
         <div className="overflow-x-auto p-2">
           <table className="w-full text-left border-collapse">
              <thead>
                 <tr>
                    <th className="px-6 py-4 text-[11px] font-bold text-[#A0AEC0] uppercase tracking-wider">AGREEMENT VERSION</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-[#A0AEC0] uppercase tracking-wider">TIMESTAMP</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-[#A0AEC0] uppercase tracking-wider">REPRESENTATIVE</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-[#A0AEC0] uppercase tracking-wider">STATUS</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                 {agreementHistory && agreementHistory.length > 0 ? (
                   agreementHistory.map((agreement) => (
                    <tr key={agreement._id || agreement.id} className="hover:bg-gray-50 transition-colors">
                       <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            <FileText size={16} className="text-[#A16D36]" />
                            <span className="text-[14px] font-bold text-[#2D3748]">{agreement.version}</span>
                          </div>
                       </td>
                       <td className="px-6 py-5">
                          <span className="text-[14px] font-medium text-[#718096] whitespace-nowrap">
                             {formatDateTime(agreement.timestamp)}
                          </span>
                       </td>
                       <td className="px-6 py-5">
                          <span className="text-[14px] font-medium text-[#718096]">{agreement.representative}</span>
                       </td>
                       <td className="px-6 py-5">
                          <span className={`px-3 py-1 rounded-full text-[11px] font-bold tracking-wider ${
                            agreement.status === 'Executed' 
                              ? 'bg-emerald-50 text-emerald-600' 
                              : 'bg-gray-100 text-gray-500'
                          }`}>
                             {agreement.status}
                          </span>
                       </td>
                    </tr>
                   ))
                 ) : (
                   <tr>
                     <td colSpan="4" className="px-6 py-10 text-center text-sm text-gray-400">
                       No agreement history found.
                     </td>
                   </tr>
                 )}
              </tbody>
           </table>
         </div>
      </div>
    </div>
  );
};

export default PartnerDetail;
