import React, { useState } from 'react';
import { 
  Info, 
  MapPin, 
  Image as ImageIcon, 
  CloudUpload,
  Clock,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Users,
  AlertTriangle
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
    time: '',
    endTime: '',
    status: 'Active',
    requiredVolunteers: 1,
    physicalRequirements: '',
    dressCode: '',
    orientation: '',
    impactStatement: ''
  });
  const [currentVolunteersCount, setCurrentVolunteersCount] = useState(0);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = React.useRef(null);
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
              time: res.data.time ? convertTo24h(res.data.time) : '',
              endTime: res.data.endTime ? convertTo24h(res.data.endTime) : '',
              status: res.data.status || 'Pending',
              requiredVolunteers: res.data.requiredVolunteers || 1,
              physicalRequirements: res.data.physicalRequirements || '',
              dressCode: res.data.dressCode || '',
              orientation: res.data.orientation || '',
              impactStatement: res.data.impactStatement || ''
            });
            setCurrentVolunteersCount(res.data.attendees?.length || 0);
            if (res.data.flyerUrl) {
              setPreviewUrl(res.data.flyerUrl);
            }
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

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();

    if (file && file.size > 4.5 * 1024 * 1024) {
      alert('Image is too large. Please select an image smaller than 4.5MB.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const data = new FormData();
      
      // Only send fields that are editable and not objects
      const editableFields = [
        'title', 'description', 'location', 'date', 'time', 
        'endTime', 'category', 'requiredVolunteers', 'type', 'status',
        'impactStatement', 'physicalRequirements', 'dressCode', 'orientation'
      ];

      editableFields.forEach(key => {
        if (formData[key] !== undefined && formData[key] !== null && formData[key] !== '') {
          let value = formData[key];
          if (key === 'time' || key === 'endTime') {
            value = convertTo12h(value);
          }
          data.append(key, value);
        }
      });

      if (file) {
        data.append('flyer', file);
      }

      if (id && id !== 'new') {
        await adminService.updateEvent(id, data);
        alert('Event updated successfully!');
      } else {
        await adminService.createEvent(data);
        alert('Event created successfully!');
      }
      navigate('/events');
    } catch (err) {
      let message = err.response?.data?.message || err.message || 'Failed to save event.';
      if (err.message === 'Network Error') {
        message = 'Network Error: The request was blocked or timed out. Please check your connection and ensure the image is not too large.';
      }
      alert(message);
      console.error('Submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const convertTo24h = (time12h) => {
    if (!time12h) return '';
    try {
      const [time, modifier] = time12h.split(' ');
      let [hours, minutes] = time.split(':');
      hours = parseInt(hours, 10);
      if (modifier === 'PM' && hours < 12) hours += 12;
      if (modifier === 'AM' && hours === 12) hours = 0;
      return `${hours.toString().padStart(2, '0')}:${minutes || '00'}`;
    } catch (e) {
      return '';
    }
  };

  const convertTo12h = (time24h) => {
    if (!time24h) return '';
    try {
      let [hours, minutes] = time24h.split(':');
      hours = parseInt(hours, 10);
      const modifier = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      return `${hours}:${minutes} ${modifier}`;
    } catch (e) {
      return '';
    }
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
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                   <div>
                      <label className="block text-[14px] font-bold text-[#2D3748] mb-2">Event Date</label>
                      <div className="relative">
                         <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A0AEC0]">
                            <CalendarIcon size={18} />
                         </div>
                         <input 
                           type="date"
                           name="date"
                           value={formData.date}
                           onChange={handleChange}
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
                           type="time"
                           name="time"
                           value={formData.time}
                           onChange={handleChange}
                           className="w-full pl-11 pr-4 py-3.5 bg-white border border-[#E2E8F0] rounded-xl text-[15px] focus:outline-none focus:ring-2 focus:ring-[#A16D36]/20 focus:border-[#A16D36] transition-all placeholder-[#A0AEC0]"
                         />
                      </div>
                   </div>
                   <div>
                      <label className="block text-[14px] font-bold text-[#2D3748] mb-2">End Time</label>
                      <div className="relative">
                         <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A0AEC0]">
                            <Clock size={18} />
                         </div>
                         <input 
                           type="time"
                           name="endTime"
                           value={formData.endTime}
                           onChange={handleChange}
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
              
               <input 
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
               />
               
               <div 
                 onClick={() => fileInputRef.current.click()}
                 className="border-2 border-dashed border-pink-200 bg-pink-50/50 rounded-2xl flex flex-col items-center justify-center p-8 mb-4 hover:bg-pink-50 transition-colors cursor-pointer overflow-hidden"
               >
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="max-h-40 w-auto rounded-lg shadow-sm" />
                  ) : (
                    <>
                      <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-[#A16D36] mb-4">
                         <CloudUpload size={24} />
                      </div>
                      <h3 className="text-[16px] font-bold text-[#2D3748] mb-1">Upload event image</h3>
                      <p className="text-[12px] font-medium text-[#A0AEC0] uppercase tracking-wider">JPG, PNG OR GIF (MAX 5MB)</p>
                    </>
                  )}
               </div>
               
               <div className="bg-[#F7FAFC] rounded-2xl border border-[#E2E8F0] p-4 flex flex-col items-center justify-center text-[#A0AEC0]">
                  <p className="text-[13px] font-medium">
                    {file ? `File: ${file.name}` : (previewUrl ? 'Current image preview' : 'No image selected')}
                  </p>
               </div>
           </div>
           
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
                     {[29, 30, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((day, idx) => {
                        const isMarch = idx >= 2;
                        const dateStr = `2024-03-${day.toString().padStart(2, '0')}`;
                        const isSelected = formData.date === dateStr;
                        
                        return (
                           <div key={idx} className="flex justify-center">
                              <span 
                                 onClick={() => setFormData(prev => ({ ...prev, date: dateStr }))}
                                 className={`w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer transition-all ${
                                    isSelected 
                                    ? 'bg-[#A16D36] text-white font-bold shadow-md shadow-amber-900/20' 
                                    : !isMarch ? 'text-[#CBD5E0]' : 'text-[#4A5568] font-medium hover:bg-gray-50'
                                 }`}
                              >
                                 {day}
                              </span>
                           </div>
                        );
                     })}
                  </div>
               </div>
            </div>
            
            {/* Volunteer Requirements & Warning */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-black/5 mt-8">
               <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                     <Users size={20} />
                  </div>
                  <div>
                     <h3 className="text-lg font-bold text-[#2D3748]">Volunteer Requirements</h3>
                     <p className="text-sm text-[#718096]">Set volunteer limits and view recruitment status</p>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                     <label className="text-sm font-semibold text-[#4A5568] flex items-center gap-2">
                        Volunteer Limit
                        <div className="group relative">
                           <Info size={14} className="text-[#A0AEC0] cursor-help" />
                           <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-gray-800 text-white text-[10px] rounded lg:hidden group-hover:block z-10">
                              Maximum number of volunteers allowed for this event
                           </div>
                        </div>
                     </label>
                     <input
                        type="number"
                        name="requiredVolunteers"
                        value={formData.requiredVolunteers}
                        onChange={handleChange}
                        min="1"
                        className="w-full px-4 py-3 bg-[#F7FAFC] border border-black/5 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                        placeholder="e.g. 10"
                     />
                  </div>

                  <div className="space-y-2">
                     <label className="text-sm font-semibold text-[#4A5568]">Current Recruitment</label>
                     <div className="flex items-center gap-3 px-4 py-3 bg-[#F7FAFC] border border-black/5 rounded-xl">
                        <div className={`w-2 h-2 rounded-full ${currentVolunteersCount > formData.requiredVolunteers ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></div>
                        <span className="text-sm font-medium text-[#2D3748]">
                           {currentVolunteersCount} Volunteers Joined
                        </span>
                     </div>
                  </div>
               </div>

               {currentVolunteersCount > formData.requiredVolunteers && (
                  <div className="mt-6 flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl">
                     <AlertTriangle className="text-red-600 shrink-0 mt-0.5" size={18} />
                     <div>
                        <h4 className="text-sm font-bold text-red-800 uppercase tracking-wider">Capacity Alert</h4>
                        <p className="text-sm text-red-700 mt-1">
                           Warning: This event has exceeded its volunteer limit! (Joined: {currentVolunteersCount} / Limit: {formData.requiredVolunteers})
                        </p>
                     </div>
                  </div>
               )}

               <div className="mt-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="text-sm font-semibold text-[#4A5568]">Physical Requirements</label>
                        <textarea
                           name="physicalRequirements"
                           value={formData.physicalRequirements}
                           onChange={handleChange}
                           rows="3"
                           className="w-full px-4 py-3 bg-[#F7FAFC] border border-black/5 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none transition-all resize-none"
                           placeholder="e.g. Must be able to lift 20 lbs..."
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-sm font-semibold text-[#4A5568]">Dress Code</label>
                        <textarea
                           name="dressCode"
                           value={formData.dressCode}
                           onChange={handleChange}
                           rows="3"
                           className="w-full px-4 py-3 bg-[#F7FAFC] border border-black/5 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none transition-all resize-none"
                           placeholder="e.g. Closed-toe shoes required..."
                        />
                     </div>
                  </div>
               </div>
            </div>

            {/* Status & Visibility Card */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-black/5 mt-8">
               <div className="flex items-center gap-3 mb-6">
                  <ShieldCheck size={20} className="text-[#A16D36]" />
                  <h2 className="text-[18px] font-bold text-[#2D3748]">Status & Visibility</h2>
               </div>
               
               <div className="space-y-4">
                  <div>
                     <label className="block text-[13px] font-bold text-[#718096] mb-2 uppercase tracking-wide">Event Status</label>
                     <select 
                       name="status"
                       value={formData.status}
                       onChange={handleChange}
                       className="w-full px-4 py-3 bg-[#F7FAFC] border border-[#E2E8F0] rounded-xl text-[15px] font-medium focus:outline-none focus:ring-2 focus:ring-[#A16D36]/20 focus:border-[#A16D36] transition-all"
                     >
                        <option value="Active">Active</option>
                        <option value="Pending">Pending Confirmation</option>
                        <option value="Inactive">Inactive</option>
                        <option value="Suspended">Suspended</option>
                        <option value="Draft">Draft</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Cancelled">Cancelled</option>
                        <option value="Completed">Completed</option>
                        <option value="Rejected">Rejected</option>
                     </select>
                     <p className="mt-2 text-[12px] text-[#A0AEC0]">
                        {formData.status === 'Active' && 'This event is visible to all users and open for registration.'}
                        {formData.status === 'Pending' && 'Waiting for admin confirmation. Not visible to the public yet.'}
                        {formData.status === 'Inactive' && 'Hidden from the public. Existing registrations are preserved.'}
                        {formData.status === 'Suspended' && 'Temporarily disabled. Displays a warning to registrants.'}
                        {formData.status === 'Rejected' && 'Event has been rejected and will not be published.'}
                     </p>
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
