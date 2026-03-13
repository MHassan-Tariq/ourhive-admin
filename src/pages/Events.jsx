import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  PlusCircle,
  MapPin,
  Pencil,
  Trash2,
  Check,
  X as CloseIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import adminService from '../services/adminService';
import toast from 'react-hot-toast';

const Events = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  // Rejection Modal State
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectingEventId, setRejectingEventId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Initial mock data removed to focus on live data
  const mockEvents = [];

  const fetchEvents = async () => {
    setIsLoading(true);
    setError(null);
    try {
      let filteredMocks = mockEvents;
      if (search) {
         const lowerSearch = search.toLowerCase();
         filteredMocks = filteredMocks.filter(e => 
           e.title.toLowerCase().includes(lowerSearch) || 
           e.location.toLowerCase().includes(lowerSearch)
         );
      }
      const totalMocks = filteredMocks.length;
      const paginatedMocks = filteredMocks.slice((page - 1) * 5, page * 5);

      let data = { data: paginatedMocks, pages: Math.ceil(totalMocks / 5) || 1, total: totalMocks };

      if (adminService.getEvents) {
        try {
          const apiData = await adminService.getEvents({
            search,
            page,
            limit: 5,
          });
          if (apiData && apiData.data) {
             const colors = ['bg-pink-400', 'bg-indigo-500', 'bg-emerald-500', 'bg-orange-400', 'bg-blue-500', 'bg-purple-500'];
             // Map backend fields to frontend UI expectations
             const mappedData = apiData.data.map((e, idx) => ({
               ...e,
               title: e.title,
               date: new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
               time: e.time,
               location: e.location || 'TBD',
               status: e.status ? e.status.charAt(0).toUpperCase() + e.status.slice(1) : 'Pending',
               imageurl: e.imageurl || e.flyerUrl,
               color: colors[idx % colors.length]
             }));
             data = { ...apiData, data: mappedData };
          }
        } catch (e) {
          console.warn("API Error:", e);
        }
      }
      
      setEvents(data.data || paginatedMocks);
      setTotalPages(data.pages || 1);
      setTotalCount(data.total || totalMocks);
    } catch (err) {
      setError('Failed to load events. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEvents();
    }, 500);

    return () => clearTimeout(timer);
  }, [search, page]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      try {
        await adminService.deleteEvent(id);
        toast.success('Event deleted successfully');
        fetchEvents(); // Refresh the list
      } catch (err) {
        toast.error('Failed to delete event');
        console.error(err);
      }
    }
  };

  const handleStatusUpdate = async (id, status, reason = '') => {
    setIsProcessing(true);
    try {
      await adminService.updateEventStatus(id, status, reason);
      toast.success(`Event ${status === 'Confirmed' ? 'approved' : 'rejected'} successfully`);
      setIsRejectModalOpen(false);
      setRejectionReason('');
      fetchEvents();
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to update event status`);
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusIndicator = (status) => {
    let dotColor = 'bg-emerald-500';
    let textColor = 'text-emerald-700';
    let bgColor = 'bg-emerald-100';

    switch (status) {
      case 'Pending':
        dotColor = 'bg-amber-500'; textColor = 'text-amber-800'; bgColor = 'bg-amber-100'; break;
      case 'Draft':
      case 'Inactive':
        dotColor = 'bg-gray-400'; textColor = 'text-gray-700'; bgColor = 'bg-gray-100'; break;
      case 'Suspended':
      case 'Rejected':
      case 'Cancelled':
        dotColor = 'bg-rose-500'; textColor = 'text-rose-800'; bgColor = 'bg-rose-100'; break;
      case 'Active':
      case 'Confirmed':
        dotColor = 'bg-emerald-500'; textColor = 'text-emerald-700'; bgColor = 'bg-emerald-100'; break;
      case 'Completed':
        dotColor = 'bg-blue-500'; textColor = 'text-blue-800'; bgColor = 'bg-blue-100'; break;
      default:
        dotColor = 'bg-gray-300'; textColor = 'text-gray-600'; bgColor = 'bg-gray-50';
    }

    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${bgColor}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>
        <span className={`text-[11px] font-bold tracking-wider ${textColor}`}>{status === 'Active' ? 'Approved' : (status || 'Unknown')}</span>
      </div>
    );
  };

  return (
    <div className="animate-in fade-in duration-500 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[32px] font-bold text-[#1a202c] mb-2 tracking-tight">Events</h1>
          <p className="text-[15px] text-[#718096] max-w-2xl leading-relaxed">
            Manage and monitor all scheduled events across your organization.
          </p>
        </div>
        
        <button 
          onClick={() => navigate('/events/new')}
          className="flex items-center gap-2 bg-[#A16D36] text-white px-6 py-2.5 rounded-full text-[14px] font-bold hover:bg-[#8C5D2B] transition-colors shadow-md shadow-amber-900/20"
        >
          <PlusCircle size={18} />
          Create Event
        </button>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by title or location..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-12 pr-4 py-3 bg-white border border-black/5 rounded-xl text-sm focus:ring-2 focus:ring-[#A16D36] outline-none transition-all shadow-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-[#FAF8F5]">
                <th className="px-6 py-4 text-[11px] font-bold text-[#A0AEC0] uppercase tracking-wider">EVENT TITLE</th>
                <th className="px-6 py-4 text-[11px] font-bold text-[#A0AEC0] uppercase tracking-wider">DATE</th>
                <th className="px-6 py-4 text-[11px] font-bold text-[#A0AEC0] uppercase tracking-wider">LOCATION</th>
                <th className="px-6 py-4 text-[11px] font-bold text-[#A0AEC0] uppercase tracking-wider">STATUS</th>
                <th className="px-6 py-4 text-[11px] font-bold text-[#A0AEC0] uppercase tracking-wider text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="animate-spin text-[#A16D36]" size={32} />
                      Loading events...
                    </div>
                  </td>
                </tr>
              ) : events.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    No events found
                  </td>
                </tr>
              ) : (
                events.map((event, idx) => (
                  <tr key={event._id || idx} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      {event.imageurl ? (
                        <img src={event.imageurl} alt={event.title} className="w-12 h-12 rounded-full object-cover shadow-sm" />
                      ) : (
                        <div className={`w-12 h-12 rounded-full ${event.color || 'bg-gray-200'} shrink-0 shadow-sm flex items-center justify-center text-white font-bold`}>
                          {event.title.charAt(0)}
                        </div>
                      )}
                      <span className="text-[16px] font-bold text-[#2D3748]">{event.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="text-[15px] font-medium text-[#2D3748]">{event.date}</span>
                      <span className="text-[13px] text-[#A0AEC0]">
                        {event.time}{event.endTime ? ` - ${event.endTime}` : ''}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-[#718096]">
                       <MapPin size={16} className="text-[#A16D36]" />
                       <span className="text-[14px]">{event.location}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    {getStatusIndicator(event.status)}
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => navigate(`/events/${event._id}`)} 
                        className="text-[#A0AEC0] hover:text-[#4A5568] transition-colors p-2"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                      <button 
                        onClick={() => navigate(`/events/${event._id}`)} 
                        className="text-[#A16D36] hover:text-[#8C5D2B] transition-colors p-2"
                        title="Edit Event"
                      >
                        <Pencil size={18} />
                      </button>
                      {event.status === 'Pending' && (
                        <>
                          <button 
                            onClick={() => handleStatusUpdate(event._id, 'Confirmed')}
                            className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors px-3 py-1 rounded-lg text-xs font-bold"
                            title="Approve Event"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => {
                              setRejectingEventId(event._id);
                              setIsRejectModalOpen(true);
                            }}
                            className="bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors px-3 py-1 rounded-lg text-xs font-bold"
                            title="Reject Event"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      <button 
                        onClick={() => handleDelete(event._id)} 
                        className="text-rose-400 hover:text-rose-600 transition-colors p-2"
                        title="Delete Event"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Rejection Modal */}
        {isRejectModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl border border-black/5 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-800">Reject Event</h3>
                <button 
                  onClick={() => setIsRejectModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400"
                >
                  <CloseIcon size={20} />
                </button>
              </div>
              <div className="p-6">
                <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                  Please provide a reason for rejecting this event. This will be shared with the organizer.
                </p>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Missing required details, inappropriate content, etc."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all resize-none min-h-[120px]"
                ></textarea>
              </div>
              <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
                <button
                  onClick={() => setIsRejectModalOpen(false)}
                  className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleStatusUpdate(rejectingEventId, 'Rejected', rejectionReason)}
                  disabled={!rejectionReason.trim() || isProcessing}
                  className="px-6 py-2 bg-rose-500 text-white rounded-xl text-sm font-bold hover:bg-rose-600 disabled:opacity-50 transition-all shadow-lg shadow-rose-500/20"
                >
                  {isProcessing ? <Loader2 size={18} className="animate-spin" /> : 'Reject Event'}
                </button>
              </div>
            </div>
          </div>
        )}
        
        {!isLoading && events.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 bg-[#FAF8F5] border-t border-gray-100 gap-4">
            <span className="text-[13px] text-[#A0AEC0] font-medium italic">Showing {(page - 1) * 5 + 1} to {Math.min(page * 5, totalCount)} of {totalCount} events</span>
            <div className="flex items-center gap-1.5">
              <button 
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-3 py-1.5 text-xs font-bold text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
              >
                <ChevronLeft size={14} />
                Previous
              </button>
              
              {[...Array(totalPages)].map((_, i) => (
                <button 
                  key={i + 1}
                  onClick={() => setPage(i + 1)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                    page === i + 1 
                      ? 'bg-[#A16D36] text-white shadow-lg shadow-[#A16D36]/20' 
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              
              <button 
                disabled={page === totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 text-xs font-bold text-gray-600 hover:text-[#A16D36] disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
              >
                Next
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;
