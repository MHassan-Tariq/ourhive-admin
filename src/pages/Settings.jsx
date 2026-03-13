import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  FileText, 
  Link as LinkIcon, 
  Upload, 
  Copy, 
  Info,
  Check,
  Loader2,
  AlertCircle,
  UserCog,
  Search
} from 'lucide-react';
import adminService from '../services/adminService';

const Settings = () => {
  // Route PDF viewing through backend proxy to bypass Cloudinary access restrictions
  const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5001/api' : 'https://our-hive.vercel.app/api';
  
  const fixPdfUrl = (url) => {
    if (!url) return url;
    const token = localStorage.getItem('token');
    return `${API_BASE}/admin/settings/agreement/view?url=${encodeURIComponent(url)}&token=${token}`;
  };

  const [copiedDonation, setCopiedDonation] = useState(false);
  const [copiedMembership, setCopiedMembership] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  
  const [emailForm, setEmailForm] = useState({
    primary: 'admin@ourhive.com',
    secondary: 'backup-admin@ourhive.com'
  });

  const [linksForm, setLinksForm] = useState({
    donation: 'https://zeffy.com/our-hive/donate',
    membership: 'https://zeffy.com/our-hive/membership'
  });

  const [agreementInfo, setAgreementInfo] = useState({
    version: 'Loading...',
    url: null
  });

  const [agreementHistory, setAgreementHistory] = useState([]);
  const [historyPage, setHistoryPage] = useState(1);
  const [totalHistoryPages, setTotalHistoryPages] = useState(1);
  const [showHistory, setShowHistory] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);


  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [foundUsers, setFoundUsers] = useState([]);
  const [moderators, setModerators] = useState([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const [isLoadingModerators, setIsLoadingModerators] = useState(false);
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        // Fetch Settings
        const res = await adminService.getSettings();
        if (res?.data) {
          const config = res.data;
          setEmailForm({
            primary: config.adminEmail || config.primaryEmail || 'admin@ourhive.com',
            secondary: config.secondaryEmail || 'backup-admin@ourhive.com'
          });
          setLinksForm({
            donation: config.zeffyDonationLink || 'https://zeffy.com/our-hive/donate',
            membership: config.zeffyMembershipLink || 'https://zeffy.com/our-hive/membership'
          });
          setAgreementInfo({
            version: config.activeAgreementVersion || 'v1.0.0 (Initial)',
            url: config.agreementUrl
          });
        }

        // Fetch Moderators Record
        const modRes = await adminService.getAllUsers({ role: 'moderator' });
        setModerators(modRes?.data || []);
      } catch (err) {
        console.warn("Failed to fetch initial data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'donation') {
      setCopiedDonation(true);
      setTimeout(() => setCopiedDonation(false), 2000);
    } else {
      setCopiedMembership(true);
      setTimeout(() => setCopiedMembership(false), 2000);
    }
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    setError(null);
    try {
      await adminService.updateSettings({
        adminEmail: emailForm.primary,
        secondaryEmail: emailForm.secondary,
        zeffyDonationLink: linksForm.donation,
        zeffyMembershipLink: linksForm.membership
      });
      alert('Settings updated successfully!');
    } catch (err) {
      console.error(err);
      setError('Failed to update settings.');
      alert('Failed to update settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const fetchHistory = async (page = 1) => {
     setIsLoadingHistory(true);
     try {
        console.log("DEBUG: Fetching agreement history starting...");
        const res = await adminService.getAgreementHistory({ page, limit: 5 });
        console.log("DEBUG: Agreement history response:", res);
        if (res?.success) {
           setAgreementHistory(res.data);
           setTotalHistoryPages(res.pages);
           setHistoryPage(res.page);
        } else {
           setError('Failed to load agreement history logs.');
        }
     } catch (err) {
        console.error("DEBUG: Failed to fetch history error:", err);
        setError('Connection error while fetching logs.');
     } finally {
        setIsLoadingHistory(false);
     }
  };

  useEffect(() => {
     if (showHistory) {
        fetchHistory(1);
     }
  }, [showHistory]);
  const handleFileUpload = async (e) => {
     const file = e.target.files?.[0];
     if (!file) return;
     
     if (file.type !== 'application/pdf') {
        alert("Please upload a PDF file.");
        return;
     }

     const formData = new FormData();
     formData.append('agreement', file);

     setIsSaving(true);
     try {
        const res = await adminService.updateAgreement(formData);
        if (res?.data) {
           setAgreementInfo({
              version: res.data.activeAgreementVersion,
              url: res.data.agreementUrl
           });
           // Refresh history if visible
           if (showHistory) fetchHistory(1);
        }
        alert('Agreement updated successfully!');
     } catch (err) {
        console.error(err);
        alert(`Failed to upload agreement: ${err.response?.data?.message || err.message}`);
     } finally {
        setIsSaving(false);
     }
  };


  const handleUserSearch = async (val) => {
    setUserSearchTerm(val);
    
    if (searchTimeout) clearTimeout(searchTimeout);
    
    if (!val.trim()) {
      setFoundUsers([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setIsSearchingUsers(true);
      try {
        const res = await adminService.getAllUsers({ search: val });
        setFoundUsers(res?.data || []);
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setIsSearchingUsers(false);
      }
    }, 500);
    
    setSearchTimeout(timeout);
  };

  const handleUpdateRole = async (userId, newRole) => {
    setIsUpdatingRole(true);
    try {
      await adminService.updateUserRole(userId, newRole);
      
      // Refresh moderators record
      const modRes = await adminService.getAllUsers({ role: 'moderator' });
      setModerators(modRes?.data || []);

      // Refresh search results if active
      if (userSearchTerm.trim()) {
        const res = await adminService.getAllUsers({ search: userSearchTerm });
        setFoundUsers(res?.data || []);
      }
      
      alert('User role updated successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to update user role.');
    } finally {
      setIsUpdatingRole(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] text-gray-400 gap-4">
        <Loader2 className="animate-spin text-amber-600" size={48} />
        <p className="text-sm font-medium">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500 max-w-7xl mx-auto pb-24 relative min-h-[calc(100vh-100px)] flex flex-col">
      <div className="mb-8">
        <h1 className="text-[32px] font-bold text-[#1a202c] mb-2 tracking-tight">Settings</h1>
        <p className="text-[15px] text-[#718096]">
          Manage your community platform configurations, logos, and third-party integrations.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 mb-8 flex-1">
        {/* Admin Notification Email Card */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-black/5 h-fit">
           <div className="flex items-center gap-3 mb-8">
              <Mail size={20} className="text-[#A16D36]" />
              <h2 className="text-[20px] font-bold text-[#2D3748]">Admin Notification Email</h2>
           </div>
           
           <div className="space-y-6">
              <div>
                 <label className="block text-[14px] font-bold text-[#2D3748] mb-2">Primary Admin Email</label>
                 <input 
                   type="email"
                   value={emailForm.primary}
                   onChange={(e) => setEmailForm({...emailForm, primary: e.target.value})}
                   className="w-full px-4 py-3.5 bg-[#FAF8F5] border border-[#E2E8F0] rounded-xl text-[15px] text-[#4A5568] focus:outline-none focus:ring-2 focus:ring-[#A16D36]/20 focus:border-[#A16D36] transition-all"
                 />
              </div>
              
              <div>
                 <label className="block text-[14px] font-bold text-[#2D3748] mb-2">Secondary Notifications</label>
                 <input 
                   type="email"
                   value={emailForm.secondary}
                   onChange={(e) => setEmailForm({...emailForm, secondary: e.target.value})}
                   className="w-full px-4 py-3.5 bg-[#FAF8F5] border border-[#E2E8F0] rounded-xl text-[15px] text-[#4A5568] focus:outline-none focus:ring-2 focus:ring-[#A16D36]/20 focus:border-[#A16D36] transition-all"
                 />
              </div>

              <button 
                onClick={handleSaveAll}
                disabled={isSaving}
                className="px-6 py-2.5 bg-[#A16D36] text-white rounded-xl text-[15px] font-bold shadow-md shadow-[#A16D36]/20 hover:bg-[#8e6030] transition-colors mt-2 flex items-center gap-2"
              >
                 {isSaving && <Loader2 size={16} className="animate-spin" />}
                 Save Changes
              </button>
           </div>
        </div>

         {/* Agreement Version Control Card */}
         <div className="bg-white rounded-3xl p-8 shadow-sm border border-black/5 h-fit">
            <div className="flex items-center gap-3 mb-8">
               <FileText size={20} className="text-[#A16D36]" />
               <h2 className="text-[20px] font-bold text-[#2D3748]">Agreement Version Control</h2>
            </div>
            
            <div className="bg-[#FFF5F7] rounded-2xl p-6 mb-8 group transition-colors">
               <p className="text-[13px] text-[#718096] mb-1">Current Active Version</p>
               <div className="flex items-center justify-between mb-4">
                  <span className="text-[18px] font-bold text-[#2D3748]">{agreementInfo.version}</span>
                  <span className="bg-pink-100 text-pink-600 text-[10px] font-bold px-3 py-1 rounded uppercase tracking-wider">LIVE</span>
               </div>
            </div>

            <div className="mb-6">
               <p className="text-[14px] font-bold text-[#2D3748] mb-3">Upload New Agreement (PDF)</p>
               <label className="border-2 border-dashed border-[#E2E8F0] bg-[#FAF8F5] rounded-2xl flex flex-col items-center justify-center p-8 hover:bg-gray-50 transition-colors cursor-pointer">
                  <Upload size={24} className="text-[#A0AEC0] mb-3" />
                  <p className="text-[14px] font-medium text-[#718096]">Click to upload or drag and drop</p>
                  <input type="file" className="hidden" accept=".pdf" onChange={handleFileUpload} />
               </label>
            </div>

            <button 
              onClick={() => setShowHistory(!showHistory)}
              className="w-full py-3.5 bg-white border border-[#D69E2E] text-[#D69E2E] rounded-xl text-[15px] font-bold hover:bg-[#FAF8F5] transition-colors flex items-center justify-center gap-2"
            >
               {showHistory ? 'Hide Change Log' : 'View Change Log'}
            </button>

            {showHistory && (
               <div className="mt-8 border-t border-[#E2E8F0] pt-8 animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="flex items-center justify-between mb-6">
                     <div className="flex items-center gap-2">
                        <FileText size={18} className="text-[#A16D36]" />
                        <h3 className="text-[14px] font-bold text-[#4A5568] uppercase tracking-wider">Agreement Change Log</h3>
                     </div>
                     {isLoadingHistory && <Loader2 size={16} className="animate-spin text-[#A16D36]" />}
                  </div>

                  <div className="overflow-hidden border border-[#E2E8F0] rounded-2xl bg-white shadow-sm">
                     <table className="w-full text-left border-collapse">
                        <thead>
                           <tr className="bg-[#FAF8F5] border-bottom border-[#E2E8F0]">
                              <th className="px-6 py-4 text-[12px] font-bold text-[#718096] uppercase tracking-wider">Version</th>
                              <th className="px-6 py-4 text-[12px] font-bold text-[#718096] uppercase tracking-wider">Uploaded On</th>
                              <th className="px-6 py-4 text-[12px] font-bold text-[#718096] uppercase tracking-wider">By</th>

                           </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E2E8F0]">
                           {agreementHistory.map((item) => (
                              <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                                 <td className="px-6 py-4 text-[14px] font-bold text-[#2D3748]">{item.version}</td>
                                 <td className="px-6 py-4 text-[14px] text-[#718096]">{new Date(item.createdAt).toLocaleDateString()}</td>
                                 <td className="px-6 py-4 text-[14px] text-[#718096]">{item.uploadedBy?.firstName} {item.uploadedBy?.lastName}</td>

                              </tr>
                           ))}
                           {agreementHistory.length === 0 && !isLoadingHistory && (
                              <tr>
                                 <td colSpan="3" className="px-6 py-8 text-center">
                                    <div className="flex flex-col items-center gap-2">
                                       <Info size={24} className="text-[#A16D36] opacity-50" />
                                       <span className="text-[#718096] text-[14px]">No history records found in database.</span>
                                    </div>
                                 </td>
                              </tr>
                           )}
                        </tbody>
                     </table>
                  </div>

                  {totalHistoryPages > 1 && (
                     <div className="flex items-center justify-between mt-6">
                        <button 
                          disabled={historyPage === 1 || isLoadingHistory}
                          onClick={() => fetchHistory(historyPage - 1)}
                          className="px-4 py-2 text-[13px] font-medium text-[#718096] border border-[#E2E8F0] rounded-lg hover:bg-white transition-colors disabled:opacity-50"
                        >
                           Previous
                        </button>
                        <span className="text-[13px] text-[#718096]">Page {historyPage} of {totalHistoryPages}</span>
                        <button 
                          disabled={historyPage === totalHistoryPages || isLoadingHistory}
                          onClick={() => fetchHistory(historyPage + 1)}
                          className="px-4 py-2 text-[13px] font-medium text-[#718096] border border-[#E2E8F0] rounded-lg hover:bg-white transition-colors disabled:opacity-50"
                        >
                           Next
                        </button>
                     </div>
                  )}
               </div>
            )}
         </div>
      </div>

      {/* Moderator Role Management Card */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-black/5 w-full mb-8">
         <div className="flex items-center gap-3 mb-2">
            <UserCog size={20} className="text-[#A16D36]" />
            <h2 className="text-[20px] font-bold text-[#2D3748]">Moderator Role Management</h2>
         </div>
         <p className="text-[14px] text-[#718096] mb-8">Search for users and assign moderator roles for community management.</p>

         <div>
            <div className="relative mb-6">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A0AEC0]" size={18} />
               <input 
                 type="text"
                 placeholder="Search users by name or email..."
                 value={userSearchTerm}
                 onChange={(e) => handleUserSearch(e.target.value)}
                 className="w-full pl-12 pr-4 py-3.5 bg-[#FAF8F5] border border-[#E2E8F0] rounded-xl text-[15px] text-[#4A5568] focus:outline-none focus:ring-2 focus:ring-[#A16D36]/20 focus:border-[#A16D36]"
               />
               {isSearchingUsers && (
                 <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-[#A16D36]" size={18} />
               )}
            </div>

            {userSearchTerm.trim() ? (
               // Search Results
               foundUsers.length > 0 ? (
                  <div className="space-y-3">
                     {foundUsers.map(u => (
                        <div key={u._id} className="flex items-center justify-between p-4 bg-[#FAF8F5] rounded-xl border border-[#E2E8F0] hover:border-[#A16D36]/30 transition-all">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-[#A16D36]/10 flex items-center justify-center text-[#A16D36] font-bold text-sm">
                                 {u.firstName?.[0]}{u.lastName?.[0]}
                              </div>
                              <div>
                                 <p className="text-[14px] font-bold text-[#2D3748]">{u.firstName} {u.lastName}</p>
                                 <p className="text-[12px] text-[#718096]">{u.email} • <span className="capitalize">{u.role}</span></p>
                              </div>
                           </div>
                           <div className="flex gap-2">
                              {u.role !== 'moderator' ? (
                                <button
                                  onClick={() => handleUpdateRole(u._id, 'moderator')}
                                  disabled={isUpdatingRole}
                                  className="px-4 py-1.5 bg-[#A16D36] text-white rounded-lg text-[12px] font-bold shadow-sm hover:bg-[#8e6030] transition-colors disabled:opacity-50"
                                >
                                  Assign Moderator
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleUpdateRole(u._id, 'donor')}
                                  disabled={isUpdatingRole}
                                  className="px-4 py-1.5 bg-white border border-[#E2E8F0] text-[#718096] rounded-lg text-[12px] font-bold hover:bg-white transition-colors disabled:opacity-50"
                                >
                                  Revoke Moderator
                                </button>
                              )}
                           </div>
                        </div>
                     ))}
                  </div>
               ) : !isSearchingUsers ? (
                  <div className="text-center py-8 bg-[#FAF8F5] rounded-xl border border-dashed border-[#E2E8F0]">
                     <p className="text-[14px] text-[#718096]">No users found matching "{userSearchTerm}"</p>
                  </div>
               ) : null
            ) : (
               // Default Display: Active Moderators Record
               <div>
                  <div className="flex items-center justify-between mb-4">
                     <h3 className="text-[14px] font-bold text-[#4A5568] uppercase tracking-wider">Active Moderators Record</h3>
                     <span className="text-[12px] text-[#718096] font-medium">{moderators.length} active</span>
                  </div>
                  
                  {moderators.length > 0 ? (
                     <div className="space-y-3">
                        {moderators.map(u => (
                           <div key={u._id} className="flex items-center justify-between p-4 bg-[#FFFBF5] rounded-xl border border-[#A16D36]/10 hover:border-[#A16D36]/30 transition-all">
                              <div className="flex items-center gap-3">
                                 <div className="w-10 h-10 rounded-full bg-[#A16D36]/10 flex items-center justify-center text-[#A16D36] font-bold text-sm">
                                    {u.firstName?.[0]}{u.lastName?.[0]}
                                 </div>
                                 <div>
                                    <p className="text-[14px] font-bold text-[#2D3748]">{u.firstName} {u.lastName}</p>
                                    <p className="text-[12px] text-[#718096]">{u.email} • <span className="text-amber-700 font-medium">Moderator</span></p>
                                 </div>
                              </div>
                              <button
                                onClick={() => handleUpdateRole(u._id, 'donor')}
                                disabled={isUpdatingRole}
                                className="px-4 py-1.5 bg-white border border-rose-200 text-rose-600 rounded-lg text-[12px] font-bold hover:bg-rose-50 hover:border-rose-300 transition-all disabled:opacity-50"
                              >
                                Revoke Moderator
                              </button>
                           </div>
                        ))}
                     </div>
                  ) : (
                     <div className="text-center py-12 bg-[#FAF8F5] rounded-xl border border-dashed border-[#E2E8F0]">
                        <p className="text-[14px] text-[#718096]">No active moderators assigned yet.</p>
                     </div>
                  )}
               </div>
            )}
         </div>
      </div>

      {/* Zeffy Link Management Card */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-black/5 w-full">
         <div className="flex items-center gap-3 mb-2">
            <LinkIcon size={20} className="text-[#A16D36]" />
            <h2 className="text-[20px] font-bold text-[#2D3748]">Zeffy Link Management</h2>
         </div>
         <p className="text-[14px] text-[#718096] mb-8">Configure your ticketing and donation platform links.</p>

         <div className="space-y-6">
            <div>
               <label className="block text-[11px] font-bold text-[#A0AEC0] uppercase tracking-wider mb-2">DONATION PAGE</label>
               <div className="flex items-center gap-3">
                  <input 
                    type="text"
                    value={linksForm.donation}
                    onChange={(e) => setLinksForm({...linksForm, donation: e.target.value})}
                    className="flex-1 px-4 py-3.5 bg-[#FAF8F5] border border-[#E2E8F0] rounded-xl text-[15px] text-[#4A5568] focus:outline-none focus:ring-2 focus:ring-[#A16D36]/20 focus:border-[#A16D36]"
                  />
                  <button 
                    onClick={() => handleCopy(linksForm.donation, 'donation')}
                    className="w-12 h-12 bg-[#EDF2F7] rounded-xl flex items-center justify-center text-[#4A5568] hover:bg-[#E2E8F0] transition-colors shrink-0"
                  >
                     {copiedDonation ? <Check size={20} className="text-emerald-500" /> : <Copy size={20} />}
                  </button>
               </div>
            </div>

            <div>
               <label className="block text-[11px] font-bold text-[#A0AEC0] uppercase tracking-wider mb-2">MEMBERSHIP FEE LINK</label>
               <div className="flex items-center gap-3">
                  <input 
                    type="text"
                    value={linksForm.membership}
                    onChange={(e) => setLinksForm({...linksForm, membership: e.target.value})}
                    className="flex-1 px-4 py-3.5 bg-[#FAF8F5] border border-[#E2E8F0] rounded-xl text-[15px] text-[#4A5568] focus:outline-none focus:ring-2 focus:ring-[#A16D36]/20 focus:border-[#A16D36]"
                  />
                  <button 
                    onClick={() => handleCopy(linksForm.membership, 'membership')}
                    className="w-12 h-12 bg-[#EDF2F7] rounded-xl flex items-center justify-center text-[#4A5568] hover:bg-[#E2E8F0] transition-colors shrink-0"
                  >
                     {copiedMembership ? <Check size={20} className="text-emerald-500" /> : <Copy size={20} />}
                  </button>
               </div>
            </div>

            <div className="bg-[#FFFFF0] border border-[#FEFCBF] p-4 rounded-xl flex gap-3 mt-4">
               <Info size={16} className="text-[#D69E2E] shrink-0 mt-0.5" />
               <p className="text-[13px] text-[#9C6D2E] font-medium leading-relaxed">
                  Updating these links will immediately reflect on the public member portal and automated emails.
               </p>
            </div>
         </div>
      </div>

      {/* Global Actions Footer */}
      <div className="absolute bottom-0 right-0 left-0 pt-8 mt-auto flex justify-end items-center gap-6">
         <button 
           onClick={() => window.location.reload()}
           className="text-[15px] font-bold text-[#4A5568] hover:text-[#1a202c] transition-colors"
         >
            Discard Changes
         </button>
         <button 
           onClick={handleSaveAll}
           disabled={isSaving}
           className="px-8 py-3.5 bg-[#A16D36] text-white rounded-xl text-[15px] font-bold shadow-lg shadow-[#A16D36]/20 hover:bg-[#8e6030] transition-colors flex items-center gap-2"
         >
            {isSaving && <Loader2 size={16} className="animate-spin" />}
            Update All Settings
         </button>
      </div>
    </div>
  );
};

export default Settings;
