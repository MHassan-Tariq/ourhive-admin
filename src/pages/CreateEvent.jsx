import React, { useState } from 'react';
import { 
  Info, 
  MapPin, 
  Image as ImageIcon, 
  CloudUpload,
  Clock,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import adminService from '../services/adminService';

const CreateEvent = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    date: '',
    time: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    if (id && id !== 'new') {
      const fetchDetail = async () => {
        setIsLoading(true);
        try {
          const res = await adminService.getEventDetail(id);
          if (res?.data) {
            setFormData({
              title: res.data.title || '',
              description: res.data.description || '',
              location: res.data.location || '',
              date: res.data.date ? new Date(res.data.date).toISOString().split('T')[0] : '',
              time: res.data.time || ''
            });
          }
        } catch (err) {
          console.error("Failed to fetch event detail:", err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchDetail();
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setIsSubmitting(true);
    try {
      if (id && id !== 'new') {
        await adminService.updateEvent(id, formData);
        alert('Event updated successfully!');
      } else {
        await adminService.createEvent(formData);
        alert('Event created successfully!');
      }
      navigate('/events');
    } catch (err) {
      alert('Failed to save event.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A16D36]"></div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500 max-w-7xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-[32px] font-bold text-[#1a202c] mb-2 tracking-tight">
          {id && id !== 'new' ? 'Event Details' : 'Create New Event'}
        </h1>
        <p className="text-[15px] text-[#718096]">
          Fill in the details to publish a new event to the community.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
        <div className="space-y-8">
          {/* Event Information Card */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-black/5">
             <div className="flex items-center gap-3 mb-6">
                <Info size={20} className="text-[#A16D36]" />
                <h2 className="text-[20px] font-bold text-[#2D3748]">Event Information</h2>
             </div>
             
             <div className="space-y-6">
                <div>
                   <label className="block text-[14px] font-bold text-[#2D3748] mb-2">Event Title</label>
                   <input 
                     type="text"
                     name="title"
                     value={formData.title}
                     onChange={handleChange}
                     placeholder="e.g. Summer Music Festival 2024"
                     className="w-full px-4 py-3.5 bg-white border border-[#E2E8F0] rounded-xl text-[15px] focus:outline-none focus:ring-2 focus:ring-[#A16D36]/20 focus:border-[#A16D36] transition-all placeholder-[#A0AEC0]"
                   />
                </div>
                
                <div>
                   <label className="block text-[14px] font-bold text-[#2D3748] mb-2">Description</label>
                   <textarea 
                     name="description"
                     value={formData.description}
                     onChange={handleChange}
                     placeholder="Describe your event..."
                     rows={5}
                     className="w-full px-4 py-3.5 bg-white border border-[#E2E8F0] rounded-xl text-[15px] focus:outline-none focus:ring-2 focus:ring-[#A16D36]/20 focus:border-[#A16D36] transition-all placeholder-[#A0AEC0] resize-none"
                   ></textarea>
                </div>
             </div>
          </div>

          {/* Location & Details Card */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-black/5">
             <div className="flex items-center gap-3 mb-6">
                <MapPin size={20} className="text-[#A16D36]" />
                <h2 className="text-[20px] font-bold text-[#2D3748]">Location & Details</h2>
             </div>
             
             <div className="space-y-6">
                <div>
                   <label className="block text-[14px] font-bold text-[#2D3748] mb-2">Location Name / Address</label>
                   <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A0AEC0]">
                         <MapPin size={18} />
                      </div>
                      <input 
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="Venue Name, City, Country"
                        className="w-full pl-11 pr-4 py-3.5 bg-white border border-[#E2E8F0] rounded-xl text-[15px] focus:outline-none focus:ring-2 focus:ring-[#A16D36]/20 focus:border-[#A16D36] transition-all placeholder-[#A0AEC0]"
                      />
                   </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <div>
                      <label className="block text-[14px] font-bold text-[#2D3748] mb-2">Event Date</label>
                      <div className="relative">
                         <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A0AEC0]">
                            <CalendarIcon size={18} />
                         </div>
                         <input 
                           type="text"
                           name="date"
                           value={formData.date}
                           onChange={handleChange}
                           placeholder="mm/dd/yyyy"
                           className="w-full pl-11 pr-4 py-3.5 bg-white border border-[#E2E8F0] rounded-xl text-[15px] focus:outline-none focus:ring-2 focus:ring-[#A16D36]/20 focus:border-[#A16D36] transition-all placeholder-[#A0AEC0]"
                         />
                      </div>
                   </div>
                   <div>
                      <label className="block text-[14px] font-bold text-[#2D3748] mb-2">Start Time</label>
                      <div className="relative">
                         <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A0AEC0]">
                            <Clock size={18} />
                         </div>
                         <input 
                           type="text"
                           name="time"
                           value={formData.time}
                           onChange={handleChange}
                           placeholder="-- : -- --"
                           className="w-full pl-11 pr-4 py-3.5 bg-white border border-[#E2E8F0] rounded-xl text-[15px] focus:outline-none focus:ring-2 focus:ring-[#A16D36]/20 focus:border-[#A16D36] transition-all placeholder-[#A0AEC0]"
                         />
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>

        <div className="space-y-8">
           {/* Event Flyer Uploader */}
           <div className="bg-white rounded-3xl p-6 shadow-sm border border-black/5">
              <div className="flex items-center gap-3 mb-6">
                 <ImageIcon size={20} className="text-[#A16D36]" />
                 <h2 className="text-[18px] font-bold text-[#2D3748]">Event Flyer</h2>
              </div>
              
              <div className="border-2 border-dashed border-pink-200 bg-pink-50/50 rounded-2xl flex flex-col items-center justify-center p-8 mb-4 hover:bg-pink-50 transition-colors cursor-pointer">
                 <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-[#A16D36] mb-4">
                    <CloudUpload size={24} />
                 </div>
                 <h3 className="text-[16px] font-bold text-[#2D3748] mb-1">Upload event image</h3>
                 <p className="text-[12px] font-medium text-[#A0AEC0] uppercase tracking-wider">JPG, PNG OR GIF (MAX 5MB)</p>
              </div>
              
              <div className="bg-[#F7FAFC] rounded-2xl border border-[#E2E8F0] h-32 flex flex-col items-center justify-center text-[#A0AEC0]">
                 <ImageIcon size={24} className="mb-2 opacity-50" />
                 <p className="text-[13px] font-medium">Preview will appear here</p>
              </div>
           </div>
           
           {/* Quick Select Date Calendar component mock */}
           <div className="bg-white rounded-3xl p-6 shadow-sm border border-black/5 pb-10">
              <div className="flex flex-col mb-4">
                 <div className="flex justify-between items-center mb-4">
                    <h2 className="text-[16px] font-bold text-[#2D3748]">Quick Select Date</h2>
                    <div className="flex gap-2 text-[#A0AEC0]">
                       <ChevronLeft size={16} className="cursor-pointer hover:text-[#4A5568]" />
                       <ChevronRight size={16} className="cursor-pointer hover:text-[#4A5568]" />
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-7 text-center mb-4">
                    {['S','M','T','W','T','F','S'].map(d => (
                       <span key={d} className="text-[12px] font-bold text-[#A0AEC0]">{d}</span>
                    ))}
                 </div>
                 
                 <div className="grid grid-cols-7 gap-y-4 text-center text-[14px]">
                    <span className="text-[#CBD5E0]">29</span>
                    <span className="text-[#CBD5E0]">30</span>
                    <span className="text-[#4A5568] font-medium hover:bg-gray-50 rounded-full cursor-pointer">1</span>
                    <span className="text-[#4A5568] font-medium hover:bg-gray-50 rounded-full cursor-pointer">2</span>
                    <span className="text-[#4A5568] font-medium hover:bg-gray-50 rounded-full cursor-pointer">3</span>
                    <span className="text-[#4A5568] font-medium hover:bg-gray-50 rounded-full cursor-pointer">4</span>
                    <div className="flex justify-center">
                       <span className="w-8 h-8 flex items-center justify-center bg-[#A16D36] text-white font-bold rounded-lg shadow-md shadow-amber-900/20">5</span>
                    </div>
                    
                    <span className="text-[#4A5568] font-medium hover:bg-gray-50 rounded-full cursor-pointer mt-2">6</span>
                    <span className="text-[#4A5568] font-medium hover:bg-gray-50 rounded-full cursor-pointer mt-2">7</span>
                    <span className="text-[#4A5568] font-medium hover:bg-gray-50 rounded-full cursor-pointer mt-2">8</span>
                    <span className="text-[#4A5568] font-medium hover:bg-gray-50 rounded-full cursor-pointer mt-2">9</span>
                    <span className="text-[#4A5568] font-medium hover:bg-gray-50 rounded-full cursor-pointer mt-2">10</span>
                    <span className="text-[#4A5568] font-medium hover:bg-gray-50 rounded-full cursor-pointer mt-2">11</span>
                    <span className="text-[#4A5568] font-medium hover:bg-gray-50 rounded-full cursor-pointer mt-2">12</span>
                 </div>
              </div>
           </div>

           {/* Actions */}
           <div className="flex justify-end gap-4 mt-8">
              <button 
                onClick={() => navigate('/events')}
                className="px-6 py-3 text-[15px] font-bold text-[#4A5568] hover:text-[#1a202c] transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-8 py-3 bg-[#A16D36] text-white rounded-full text-[15px] font-bold shadow-lg shadow-[#A16D36]/30 hover:bg-[#8e6030] disabled:opacity-50 transition-all"
              >
                {isSubmitting ? 'Publishing...' : 'Publish Event'}
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default CreateEvent;
