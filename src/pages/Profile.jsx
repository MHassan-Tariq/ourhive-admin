import React, { useState, useEffect } from 'react';
import { User, Shield, Check, Loader2, AlertCircle, Camera } from 'lucide-react';
import authService from '../services/authService';
import adminService from '../services/adminService';

const Profile = ({ onUpdate }) => {
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
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [currentPhoto, setCurrentPhoto] = useState(null);

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
          setCurrentPhoto(user.profilePictureUrl || null);
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handlePersonalSave = async (e) => {
    e.preventDefault();
    setIsSavingPersonal(true);
    try {
      const formData = new FormData();
      formData.append('firstName', personalForm.firstName);
      formData.append('lastName', personalForm.lastName);
      formData.append('phone', personalForm.phone);
      
      if (imageFile) {
        formData.append('profilePicture', imageFile);
      }

      const response = await adminService.updateAdminProfile(formData);
      
      // Update local storage so Topbar reflects changes
      const resData = response.data || response;
      const userData = resData && typeof resData === 'object' && 'firstName' in resData ? resData : (resData?.data || resData);
      
      if (userData) {
        localStorage.setItem('user', JSON.stringify(userData));
        setCurrentPhoto(userData.profilePictureUrl);
        setImageFile(null);
        setImagePreview(null);
        
        if (onUpdate) onUpdate(userData);
      }
      
      alert("Profile settings saved successfully");
      // Optional: force reload if Topbar doesn't update
      // window.location.reload(); 
    } catch (err) {
      console.error(err);
      const errorData = err.response?.data;
      const msg = errorData?.message || err.message || "Failed to save profile settings";
      alert(`Error: ${msg}${errorData?.error ? `\nDetails: ${errorData.error}` : ''}`);
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
           
           {/* Profile Photo Section */}
           <div className="mb-8 flex flex-col items-center sm:flex-row sm:items-center gap-6 pb-6 border-b border-gray-100">
              <div className="relative group">
                 <div className="w-24 h-24 rounded-full overflow-hidden bg-pink-100 flex items-center justify-center border-4 border-white shadow-sm">
                    {imagePreview || currentPhoto ? (
                       <img 
                         src={imagePreview || currentPhoto} 
                         alt="Profile" 
                         className="w-full h-full object-cover" 
                       />
                    ) : (
                       <span className="text-2xl font-bold text-pink-600">
                          {personalForm.firstName?.[0]}{personalForm.lastName?.[0]}
                       </span>
                    )}
                 </div>
                 <label className="absolute bottom-0 right-0 p-2 bg-[#A16D36] text-white rounded-full cursor-pointer shadow-lg transform transition-transform hover:scale-110">
                    <Camera size={16} />
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                 </label>
              </div>
              <div>
                 <h3 className="text-[16px] font-bold text-[#2D3748]">Profile Picture</h3>
                 <p className="text-[14px] text-[#718096] mt-1">
                    PNG, JPG or GIF. Max size of 2MB.
                 </p>
                 {imageFile && (
                    <button 
                      type="button"
                      onClick={() => { setImageFile(null); setImagePreview(null); }}
                      className="text-[12px] text-rose-500 font-bold mt-2 hover:underline"
                    >
                       Remove selection
                    </button>
                 )}
              </div>
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
