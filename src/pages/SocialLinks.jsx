import React, { useState, useEffect } from 'react';
import { 
  Share2, 
  Facebook, 
  Instagram, 
  Twitter, 
  Linkedin, 
  Youtube, 
  Music2, 
  Loader2,
  Save,
  Info
} from 'lucide-react';
import adminService from '../services/adminService';

const SocialLinks = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [socialLinks, setSocialLinks] = useState({
    facebook: '',
    instagram: '',
    twitter: '',
    linkedin: '',
    youtube: '',
    tiktok: '',
  });

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      try {
        const res = await adminService.getSettings();
        if (res?.data?.socialLinks) {
          setSocialLinks({
            facebook: res.data.socialLinks.facebook || '',
            instagram: res.data.socialLinks.instagram || '',
            twitter: res.data.socialLinks.twitter || '',
            linkedin: res.data.socialLinks.linkedin || '',
            youtube: res.data.socialLinks.youtube || '',
            tiktok: res.data.socialLinks.tiktok || '',
          });
        }
      } catch (err) {
        console.error("Failed to fetch social links:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSocialLinks(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await adminService.updateSettings({
        socialLinks: socialLinks
      });
      alert('Social links updated successfully!');
    } catch (err) {
      console.error("Failed to update social links:", err);
      alert('Failed to update social links.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] text-gray-400 gap-4">
        <Loader2 className="animate-spin text-amber-600" size={48} />
        <p className="text-sm font-medium">Loading social links...</p>
      </div>
    );
  }

  const platforms = [
    { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'text-blue-600', placeholder: 'https://facebook.com/yourpage' },
    { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'text-pink-600', placeholder: 'https://instagram.com/yourprofile' },
    { id: 'twitter', name: 'Twitter / X', icon: Twitter, color: 'text-sky-500', placeholder: 'https://twitter.com/yourhandle' },
    { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'text-blue-700', placeholder: 'https://linkedin.com/company/yourcompany' },
    { id: 'youtube', name: 'YouTube', icon: Youtube, color: 'text-red-600', placeholder: 'https://youtube.com/@yourchannel' },
    { id: 'tiktok', name: 'TikTok', icon: Music2, color: 'text-slate-800', placeholder: 'https://tiktok.com/@yourprofile' },
  ];

  return (
    <div className="animate-in fade-in duration-500 max-w-4xl mx-auto pb-24">
      <div className="mb-8">
        <h1 className="text-[32px] font-bold text-[#1a202c] mb-2 tracking-tight">Social Links</h1>
        <p className="text-[15px] text-[#718096]">
          Configure the social media profiles for Our Hive. These links will appear dynamically across the platform.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-sm border border-black/5">
        <div className="flex items-center gap-3 mb-8">
          <Share2 size={24} className="text-[#A16D36]" />
          <h2 className="text-[20px] font-bold text-[#2D3748]">Management Console</h2>
        </div>

        <div className="space-y-8">
          {platforms.map((platform) => (
            <div key={platform.id} className="group">
              <label className="flex items-center gap-2 text-sm font-bold text-[#4A5568] mb-3 uppercase tracking-wider">
                <platform.icon size={18} className={platform.color} />
                {platform.name}
              </label>
              <div className="relative group-focus-within:scale-[1.01] transition-transform">
                <input 
                  type="url"
                  name={platform.id}
                  value={socialLinks[platform.id]}
                  onChange={handleChange}
                  placeholder={platform.placeholder}
                  className="w-full px-5 py-4 bg-[#FAF8F5] border border-[#E2E8F0] rounded-2xl text-[15px] text-[#2D3748] focus:outline-none focus:ring-2 focus:ring-[#A16D36]/20 focus:border-[#A16D36] transition-all"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 p-5 bg-[#FFFFF0] border border-[#FEFCBF] rounded-2xl flex gap-4">
          <Info size={20} className="text-[#D69E2E] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-[14px] text-[#9C6D2E] font-bold">Dynamic Implementation</p>
            <p className="text-[13px] text-[#9C6D2E] leading-relaxed">
              When you save these links, they will be updated across the entire ecosystem, including the mobile app footer, email templates, and registration confirmations.
            </p>
          </div>
        </div>

        <div className="mt-10 flex justify-end">
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="px-10 py-4 bg-[#A16D36] text-white rounded-2xl text-[16px] font-bold shadow-xl shadow-[#A16D36]/20 hover:bg-[#8e6030] disabled:opacity-50 transition-all flex items-center gap-3"
          >
            {isSaving ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Save size={20} />
            )}
            Save Social Links
          </button>
        </div>
      </div>
    </div>
  );
};

export default SocialLinks;
