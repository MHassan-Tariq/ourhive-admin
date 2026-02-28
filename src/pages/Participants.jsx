import React, { useState, useEffect } from 'react';
import { 
  Download, 
  MoreVertical, 
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import adminService from '../services/adminService';

const Participants = () => {
  const navigate = useNavigate();
  const [participants, setParticipants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [housingFilter, setHousingFilter] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const fetchParticipants = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminService.getParticipants({
        search,
        page,
        limit: 10,
        housingStatus: housingFilter
      });
      setParticipants(data.data);
      setTotalPages(data.pages || 1);
      setTotalCount(data.total || 0);
    } catch (err) {
      setError('Failed to load participants. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchParticipants();
    }, 500); // Debounce search

    return () => clearTimeout(timer);
  }, [search, page, housingFilter]);

  const getHousingBadge = (type) => {
    const styles = {
      Waitlisted: 'bg-orange-100 text-orange-700 border-orange-200',
      Placed: 'bg-blue-100 text-blue-700 border-blue-200',
      Urgent: 'bg-red-100 text-red-700 border-red-200',
    };
    return `px-3 py-1 rounded-full text-xs font-bold border ${styles[type] || 'bg-gray-100 text-gray-700 border-gray-200'}`;
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-500',
      stable: 'bg-blue-500',
      urgent: 'bg-red-500',
      pending: 'bg-orange-500',
    };
    return colors[status?.toLowerCase()] || 'bg-gray-400';
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      setError(null);
      const blob = await adminService.exportParticipants();
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'text/csv' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `participants_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Export failed:', err);
      setError('Failed to export participants. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Participants</h1>
          <p className="text-sm text-gray-500">Manage and track all program participant records.</p>
        </div>
        <button 
          onClick={handleExport}
          disabled={isExporting}
          className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary-light transition-colors self-start md:self-auto disabled:opacity-50 disabled:cursor-wait"
        >
          {isExporting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
          <span>{isExporting ? 'Exporting...' : 'Export CSV'}</span>
        </button>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-12 pr-4 py-3 bg-white border border-black/5 rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm"
          />
        </div>
        <select 
          value={housingFilter}
          onChange={(e) => { setHousingFilter(e.target.value); setPage(1); }}
          className="px-4 py-3 bg-white border border-black/5 rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm min-w-[160px]"
        >
          <option value="">All Housing</option>
          <option value="Placed">Placed</option>
          <option value="Waitlisted">Waitlisted</option>
          <option value="Urgent">Urgent</option>
        </select>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-700">
          <AlertCircle size={20} />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
        <div className="overflow-x-auto min-h-[400px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-[400px] text-gray-400 gap-4">
              <Loader2 className="animate-spin" size={40} />
              <p className="text-sm font-medium">Loading participants...</p>
            </div>
          ) : participants.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[400px] text-gray-400 gap-2">
              <p className="text-sm font-medium">No participants found matching your criteria.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider border-bottom border-black/5">NAME</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">HOUSING STATUS</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">LOCATION</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">INTAKE COMPLETION</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">OVERALL STATUS</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {participants.map((person) => (
                  <tr key={person._id} onClick={() => navigate(`/participants/${person._id}`)} className="group hover:bg-gray-50 cursor-pointer transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center font-bold text-sm mr-3">
                          {person.userId?.firstName?.[0] || 'U'}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-800">
                            {person.privacyMaskedName || (person.userId ? `${person.userId.firstName || ''} ${person.userId.lastName || ''}`.trim() : 'Unknown User')}
                          </span>
                          <span className="text-xs text-gray-400">{person.userId?.email || 'N/A'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={getHousingBadge(person.housingStatus)}>
                        {person.housingStatus || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600 font-medium">{person.residenceArea || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 max-w-[100px] h-1.5 bg-gray-100 rounded-full">
                          <div 
                            className="h-full bg-primary rounded-full transition-all duration-500" 
                            style={{ width: `${(person.intakeStep || 1) * 20}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-bold text-gray-700">{(person.intakeStep || 1) * 20}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${getStatusColor(person.accountStatus)}`}></span>
                        <span className="text-sm font-bold text-gray-700 capitalize">{person.accountStatus || 'Pending'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={(e) => { e.stopPropagation(); }} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                        <MoreVertical size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        
        {!isLoading && participants.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-gray-100 gap-4">
            <span className="text-xs text-gray-500 font-medium italic">Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, totalCount)} of {totalCount} participants</span>
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
                      ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              
              <button 
                disabled={page === totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 text-xs font-bold text-gray-600 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
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

export default Participants;
