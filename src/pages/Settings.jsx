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
  AlertCircle
} from 'lucide-react';
import adminService from '../services/adminService';

const Settings = () => {
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
    version: 'v2.4.0 (Sept 2023)',
    lastUpdated: 'Sept 2023'
  });

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      try {
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
            version: config.agreementVersion || 'v2.4.0 (Sept 2023)',
            lastUpdated: config.agreementUpdatedDate || 'Sept 2023'
          });
        }
      } catch (err) {
        console.warn("Failed to fetch settings, using defaults:", err);
        // Error handling if needed
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
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
        await adminService.updateAgreement(formData);
        alert('Agreement updated successfully!');
        // Refresh version info if API returns it
     } catch (err) {
        console.error(err);
        alert('Failed to upload agreement.');
     } finally {
        setIsSaving(false);
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

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 mb-8 flex-1">
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
              <div className="flex items-center justify-between">
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

           <button className="w-full py-3.5 bg-white border border-[#D69E2E] text-[#D69E2E] rounded-xl text-[15px] font-bold hover:bg-[#FAF8F5] transition-colors">
              View Change Log
           </button>
        </div>
      </div>

      {/* Zeffy Link Management Card */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-black/5 w-full">
         <div className="flex items-center gap-3 mb-2">
            <LinkIcon size={20} className="text-[#A16D36]" />
            <h2 className="text-[20px] font-bold text-[#2D3748]">Zeffy Link Management</h2>
         </div>
         <p className="text-[14px] text-[#718096] mb-8">Configure your ticketing and donation platform links.</p>

         <div className="space-y-6 max-w-4xl">
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
