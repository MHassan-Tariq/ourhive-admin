import React, { useState, useEffect } from 'react';
import { User, Shield, Check, Loader2, AlertCircle } from 'lucide-react';
import authService from '../services/authService';
import adminService from '../services/adminService';

const Profile = () => {
  const [personalForm, setPersonalForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });

  const [securityForm, setSecurityForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSavingPersonal, setIsSavingPersonal] = useState(false);
  const [isSavingSecurity, setIsSavingSecurity] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const res = await adminService.getAdminProfile();
        const user = res.data || res;
        if (user) {
          setPersonalForm({
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email || '',
            phone: user.phone || ''
          });
        }
      } catch (err) {
        console.warn("Failed to fetch admin profile, using auth service data:", err);
        const currentUser = authService.getCurrentUser() || {};
        setPersonalForm({
          firstName: currentUser.firstName || '',
          lastName: currentUser.lastName || '',
          email: currentUser.email || '',
          phone: currentUser.phone || ''
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);
  
  const handlePersonalSave = async (e) => {
    e.preventDefault();
    setIsSavingPersonal(true);
    try {
      await adminService.updateAdminProfile({
        firstName: personalForm.firstName,
        lastName: personalForm.lastName,
        phone: personalForm.phone
      });
      alert("Profile settings saved successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to save profile settings");
    } finally {
      setIsSavingPersonal(false);
    }
  };

  const handleSecuritySave = async (e) => {
    e.preventDefault();
    if (securityForm.newPassword !== securityForm.confirmPassword) {
       alert("New passwords do not match.");
       return;
    }
    setIsSavingSecurity(true);
    try {
      await adminService.updateAdminPassword({
        currentPassword: securityForm.currentPassword,
        newPassword: securityForm.newPassword
      });
      alert("Password updated successfully");
      setSecurityForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to update password");
    } finally {
      setIsSavingSecurity(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] text-gray-400 gap-4">
        <Loader2 className="animate-spin text-amber-600" size={48} />
        <p className="text-sm font-medium">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500 max-w-4xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-[32px] font-bold text-[#1a202c] mb-2 tracking-tight">Profile Settings</h1>
        <p className="text-[15px] text-[#718096]">
          Manage your account details and password properties.
        </p>
      </div>

      <div className="space-y-8">
        {/* Personal Information Card */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-black/5">
           <div className="flex items-center gap-3 mb-6">
              <User size={20} className="text-[#A16D36]" />
              <h2 className="text-[20px] font-bold text-[#2D3748]">Personal Information</h2>
           </div>
           
           <form onSubmit={handlePersonalSave} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 <div>
                    <label className="block text-[14px] font-bold text-[#2D3748] mb-2">First Name</label>
                    <input 
                      type="text"
                      value={personalForm.firstName}
                      onChange={(e) => setPersonalForm({...personalForm, firstName: e.target.value})}
                      className="w-full px-4 py-3.5 bg-[#FAF8F5] border border-[#E2E8F0] rounded-xl text-[15px] text-[#4A5568] focus:outline-none focus:ring-2 focus:ring-[#A16D36]/20 focus:border-[#A16D36] transition-all"
                    />
                 </div>
                 <div>
                    <label className="block text-[14px] font-bold text-[#2D3748] mb-2">Last Name</label>
                    <input 
                      type="text"
                      value={personalForm.lastName}
                      onChange={(e) => setPersonalForm({...personalForm, lastName: e.target.value})}
                      className="w-full px-4 py-3.5 bg-[#FAF8F5] border border-[#E2E8F0] rounded-xl text-[15px] text-[#4A5568] focus:outline-none focus:ring-2 focus:ring-[#A16D36]/20 focus:border-[#A16D36] transition-all"
                    />
                 </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 <div>
                    <label className="block text-[14px] font-bold text-[#2D3748] mb-2">Email Address</label>
                    <input 
                      type="email"
                      value={personalForm.email}
                      disabled
                      className="w-full px-4 py-3.5 bg-gray-100 border border-[#E2E8F0] rounded-xl text-[15px] text-gray-500 cursor-not-allowed"
                    />
                    <p className="text-[12px] text-[#A0AEC0] mt-2 font-medium">Email address cannot be changed.</p>
                 </div>
                 <div>
                    <label className="block text-[14px] font-bold text-[#2D3748] mb-2">Phone Number</label>
                    <input 
                      type="tel"
                      value={personalForm.phone}
                      onChange={(e) => setPersonalForm({...personalForm, phone: e.target.value})}
                      placeholder="+1 (555) 000-0000"
                      className="w-full px-4 py-3.5 bg-[#FAF8F5] border border-[#E2E8F0] rounded-xl text-[15px] text-[#4A5568] focus:outline-none focus:ring-2 focus:ring-[#A16D36]/20 focus:border-[#A16D36] transition-all"
                    />
                 </div>
              </div>

              <div className="flex justify-end pt-4">
                 <button 
                   type="submit"
                   disabled={isSavingPersonal}
                   className="px-8 py-3 bg-[#A16D36] text-white rounded-xl text-[15px] font-bold shadow-md shadow-[#A16D36]/20 hover:bg-[#8e6030] disabled:opacity-50 transition-colors flex items-center gap-2"
                 >
                    {isSavingPersonal ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                    {isSavingPersonal ? 'Saving...' : 'Save Changes'}
                 </button>
              </div>
           </form>
        </div>

        {/* Security / Password Card */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-black/5">
           <div className="flex items-center gap-3 mb-6">
              <Shield size={20} className="text-[#A16D36]" />
              <h2 className="text-[20px] font-bold text-[#2D3748]">Security</h2>
           </div>
           
           <form onSubmit={handleSecuritySave} className="space-y-6">
              <div>
                 <label className="block text-[14px] font-bold text-[#2D3748] mb-2">Current Password</label>
                 <input 
                   type="password"
                   value={securityForm.currentPassword}
                   onChange={(e) => setSecurityForm({...securityForm, currentPassword: e.target.value})}
                   required
                   className="w-full sm:w-1/2 px-4 py-3.5 bg-[#FAF8F5] border border-[#E2E8F0] rounded-xl text-[15px] text-[#4A5568] focus:outline-none focus:ring-2 focus:ring-[#A16D36]/20 focus:border-[#A16D36] transition-all"
                 />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                 <div>
                    <label className="block text-[14px] font-bold text-[#2D3748] mb-2">New Password</label>
                    <input 
                      type="password"
                      value={securityForm.newPassword}
                      onChange={(e) => setSecurityForm({...securityForm, newPassword: e.target.value})}
                      required
                      className="w-full px-4 py-3.5 bg-[#FAF8F5] border border-[#E2E8F0] rounded-xl text-[15px] text-[#4A5568] focus:outline-none focus:ring-2 focus:ring-[#A16D36]/20 focus:border-[#A16D36] transition-all"
                    />
                 </div>
                 <div>
                    <label className="block text-[14px] font-bold text-[#2D3748] mb-2">Confirm New Password</label>
                    <input 
                      type="password"
                      value={securityForm.confirmPassword}
                      onChange={(e) => setSecurityForm({...securityForm, confirmPassword: e.target.value})}
                      required
                      className="w-full px-4 py-3.5 bg-[#FAF8F5] border border-[#E2E8F0] rounded-xl text-[15px] text-[#4A5568] focus:outline-none focus:ring-2 focus:ring-[#A16D36]/20 focus:border-[#A16D36] transition-all"
                    />
                 </div>
              </div>

              <div className="flex justify-end pt-4">
                 <button 
                   type="submit"
                   disabled={isSavingSecurity}
                   className="px-8 py-3 bg-white border border-[#E2E8F0] text-[#2D3748] rounded-xl text-[15px] font-bold hover:bg-gray-50 disabled:opacity-50 transition-colors flex items-center gap-2"
                 >
                    {isSavingSecurity ? <Loader2 size={16} className="animate-spin" /> : null}
                    {isSavingSecurity ? 'Updating...' : 'Update Password'}
                 </button>
              </div>
           </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
