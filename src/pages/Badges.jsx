import React, { useState, useEffect } from 'react';
import { 
  Search,
  PlusCircle,
  Pencil,
  Trash2,
  Loader2,
  X,
  Check,
  Image as ImageIcon,
  Clock,
  Award
} from 'lucide-react';
import adminService from '../services/adminService';

const Badges = () => {
  const [badges, setBadges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBadge, setEditingBadge] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [formData, setFormData] = useState({
    title: '',
    level: '',
    timeRequired: '',
    badgeImage: null
  });
  const [imagePreview, setImagePreview] = useState(null);

  const fetchBadges = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await adminService.getBadges({ page, limit: 10 });
      if (response && response.data) {
        setBadges(response.data);
        setTotalPages(response.pages || 1);
        setTotalCount(response.total || 0);
      }
    } catch (err) {
      setError('Failed to load badges. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBadges();
  }, [page]);

  const handleOpenModal = (badge = null) => {
    if (badge) {
      setEditingBadge(badge);
      setFormData({
        title: badge.title,
        level: badge.level,
        timeRequired: badge.timeRequired,
        badgeImage: null
      });
      setImagePreview(badge.imageUrl);
    } else {
      setEditingBadge(null);
      setFormData({
        title: '',
        level: '',
        timeRequired: '',
        badgeImage: null
      });
      setImagePreview(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBadge(null);
    setFormData({
      title: '',
      level: '',
      timeRequired: '',
      badgeImage: null
    });
    setImagePreview(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, badgeImage: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    const data = new FormData();
    data.append('title', formData.title);
    data.append('level', formData.level);
    data.append('timeRequired', formData.timeRequired);
    if (formData.badgeImage) {
      data.append('badgeImage', formData.badgeImage);
    }

    try {
      if (editingBadge) {
        await adminService.updateBadge(editingBadge._id, data);
      } else {
        await adminService.createBadge(data);
      }
      handleCloseModal();
      fetchBadges();
    } catch (err) {
      console.error(err);
      alert('Failed to save badge. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this badge?')) return;
    
    setIsDeleting(id);
    try {
      await adminService.deleteBadge(id);
      setBadges(prev => prev.filter(b => b._id !== id));
    } catch (err) {
      console.error(err);
      alert('Failed to delete badge.');
    } finally {
      setIsDeleting(null);
    }
  };

  const filteredBadges = badges.filter(badge => 
    badge.title.toLowerCase().includes(search.toLowerCase()) ||
    badge.level.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-in fade-in duration-500 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[32px] font-bold text-[#1a202c] mb-2 tracking-tight">Badges</h1>
          <p className="text-[15px] text-[#718096] max-w-2xl leading-relaxed">
            Manage achievement badges for participants.
          </p>
        </div>
        
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-[#A16D36] text-white px-6 py-2.5 rounded-full text-[14px] font-bold hover:bg-[#8C5D2B] transition-colors shadow-md shadow-amber-900/20"
        >
          <PlusCircle size={18} />
          Add Badge
        </button>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by title or level..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-black/5 rounded-xl text-sm focus:ring-2 focus:ring-[#A16D36] outline-none transition-all shadow-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-[#FAF8F5]">
                <th className="px-6 py-4 text-[11px] font-bold text-[#A0AEC0] uppercase tracking-wider">BADGE</th>
                <th className="px-6 py-4 text-[11px] font-bold text-[#A0AEC0] uppercase tracking-wider">LEVEL</th>
                <th className="px-6 py-4 text-[11px] font-bold text-[#A0AEC0] uppercase tracking-wider">TIME REQUIRED</th>
                <th className="px-6 py-4 text-[11px] font-bold text-[#A0AEC0] uppercase tracking-wider text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="animate-spin text-[#A16D36]" size={32} />
                      Loading badges...
                    </div>
                  </td>
                </tr>
              ) : filteredBadges.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                    No badges found
                  </td>
                </tr>
              ) : (
                filteredBadges.map((badge) => (
                  <tr key={badge._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        {badge.imageUrl ? (
                          <img src={badge.imageUrl} alt={badge.title} className="w-12 h-12 rounded-lg object-contain bg-gray-50 p-1 border border-black/5" />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                            <ImageIcon size={20} />
                          </div>
                        )}
                        <span className="text-[16px] font-bold text-[#2D3748]">{badge.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
                        <Award size={14} />
                        <span className="text-[11px] font-bold uppercase tracking-wider">{badge.level}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-[#718096]">
                        <Clock size={16} className="text-[#A16D36]" />
                        <span className="text-[14px]">{badge.timeRequired}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleOpenModal(badge)} 
                          className="p-2 text-[#A16D36] hover:bg-amber-50 rounded-lg transition-colors"
                          title="Edit Badge"
                        >
                          <Pencil size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(badge._id)} 
                          disabled={isDeleting === badge._id}
                          className="p-2 text-rose-400 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Delete Badge"
                        >
                          {isDeleting === badge._id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {!isLoading && badges.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 bg-[#FAF8F5] gap-4">
            <span className="text-[13px] text-gray-500 font-medium whitespace-nowrap">
              Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, totalCount)} of {totalCount} badges
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
              <button 
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-4 py-2 text-sm font-bold bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-full border border-gray-200"
              >
                Previous
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button 
                  key={i + 1}
                  onClick={() => setPage(i + 1)}
                  className={`min-w-[36px] h-9 px-2 rounded-full text-sm font-bold transition-all ${
                    page === i + 1 
                      ? 'bg-[#A16D36] text-white shadow-sm' 
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button 
                disabled={page === totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="px-4 py-2 text-sm font-bold bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-full border border-gray-200"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-black/5 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-black/5 flex items-center justify-between bg-[#FAF8F5]">
              <h3 className="text-xl font-bold text-gray-900">{editingBadge ? 'Edit Badge' : 'Add New Badge'}</h3>
              <button 
                onClick={handleCloseModal}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-black/5 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="flex flex-col items-center mb-4">
                <div className="relative w-24 h-24 mb-4">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full rounded-2xl object-contain bg-gray-50 border border-black/5 p-2" />
                  ) : (
                    <div className="w-full h-full rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400">
                      <ImageIcon size={32} />
                      <span className="text-[10px] uppercase font-bold mt-2 tracking-wider">Preview</span>
                    </div>
                  )}
                  <label htmlFor="badgeImage" className="absolute -bottom-2 -right-2 bg-white shadow-lg border border-black/5 p-2 rounded-full cursor-pointer hover:bg-gray-50 transition-colors">
                    <ImageIcon size={16} className="text-[#A16D36]" />
                    <input 
                      type="file" 
                      id="badgeImage" 
                      accept="image/*" 
                      onChange={handleImageChange}
                      className="hidden" 
                    />
                  </label>
                </div>
                <p className="text-[11px] text-[#718096] font-medium tracking-wide">Upload badge icon (Recommended: Square Transparent PNG)</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Badge Title</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. Master of Design"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-5 py-3.5 bg-gray-50 border border-black/5 rounded-2xl text-[15px] focus:ring-2 focus:ring-[#A16D36]/20 focus:border-[#A16D36] outline-none transition-all placeholder:text-gray-300"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Achievement Level</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. Expert Level"
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    className="w-full px-5 py-3.5 bg-gray-50 border border-black/5 rounded-2xl text-[15px] focus:ring-2 focus:ring-[#A16D36]/20 focus:border-[#A16D36] outline-none transition-all placeholder:text-gray-300"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Time Requirement</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. 15 Hours Required"
                    value={formData.timeRequired}
                    onChange={(e) => setFormData({ ...formData, timeRequired: e.target.value })}
                    className="w-full px-5 py-3.5 bg-gray-50 border border-black/5 rounded-2xl text-[15px] focus:ring-2 focus:ring-[#A16D36]/20 focus:border-[#A16D36] outline-none transition-all placeholder:text-gray-300"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-6 py-3.5 border border-black/5 text-gray-600 rounded-2xl text-[15px] font-bold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 px-6 py-3.5 bg-[#A16D36] text-white rounded-2xl text-[15px] font-bold shadow-lg shadow-amber-700/20 hover:bg-[#8C5D2B] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                  <span>{editingBadge ? 'Update Badge' : 'Create Badge'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Badges;
