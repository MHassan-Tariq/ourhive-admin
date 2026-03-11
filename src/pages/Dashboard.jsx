 import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Heart, 
  Handshake, 
  FileCheck, 
  Gift, 
  Megaphone,
  TrendingUp,
  TrendingDown,
  Clock,
  Loader2,
  AlertCircle
} from 'lucide-react';
import adminService from '../services/adminService';
import authService from '../services/authService';

const formatRelativeTime = (date) => {
  if (!date) return 'Just now';
  const now = new Date();
  const diffInSeconds = Math.floor((now - new Date(date)) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 87400)}d ago`;
  
  return new Date(date).toLocaleDateString();
};

const StatCard = ({ icon: Icon, label, value, trend, trendValue, color, isLoading }) => {
  const colorMap = {
    orange: 'bg-orange-50 text-orange-700',
    blue: 'bg-blue-50 text-blue-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-black/5 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
          <Icon size={20} />
        </div>
        {!isLoading && trendValue && (
          <div className={`flex items-center text-xs font-bold ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
            {trendValue} 
            {trend === 'up' ? <TrendingUp size={14} className="ml-1" /> : <TrendingDown size={14} className="ml-1" />}
          </div>
        )}
      </div>
      <div>
        <span className="text-[13px] text-gray-500 font-medium">{label}</span>
        {isLoading ? (
          <div className="h-8 w-16 bg-gray-100 animate-pulse rounded mt-1"></div>
        ) : (
          <h2 className="text-2xl font-bold text-gray-800 mt-1">{value}</h2>
        )}
      </div>
    </div>
  );
};

const ActivityItem = ({ icon: Icon, title, description, time, status, actions, color }) => {
  const colorMap = {
    orange: 'bg-orange-50 text-orange-700',
    blue: 'bg-blue-50 text-blue-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    green: 'bg-green-50 text-green-700',
  };

  const statusColorMap = {
    green: 'bg-green-50 text-green-800',
    yellow: 'bg-orange-50 text-primary',
  };

  return (
    <div className="flex gap-4">
      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${colorMap[color]}`}>
        <Icon size={18} />
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-center mb-1">
          <h3 className="text-[15px] font-semibold text-gray-800">{title}</h3>
          <span className="text-[11px] text-gray-400">{time}</span>
        </div>
        <p className="text-[13px] text-gray-600 leading-relaxed mb-3">{description}</p>
        
        {status && (
          <div className="mb-3">
            <span className={`inline-block px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${statusColorMap[color] || 'bg-gray-100'}`}>
              {status}
            </span>
          </div>
        )}

        {actions && (
          <div className="flex gap-2.5">
            {actions.map((action, idx) => (
              <button 
                key={idx} 
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  action.type === 'primary' 
                    ? 'bg-primary text-white hover:bg-primary-light' 
                    : 'bg-[#EEE7E1] text-gray-700 hover:bg-gray-200'
                }`}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [statsData, setStatsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = authService.getCurrentUser();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await adminService.getDashboardStats();
        setStatsData(data.data);
      } catch (err) {
        setError('Failed to load dashboard statistics.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const stats = [
    { label: 'Total Participants', value: statsData?.stats?.totalParticipants || '0', trend: 'up', trendValue: '+5.2%', icon: Users, color: 'orange' },
    { label: 'Total Volunteers', value: statsData?.stats?.totalVolunteers || '0', trend: 'down', trendValue: '-2.1%', icon: Heart, color: 'blue' },
    { label: 'Total Partners', value: statsData?.stats?.totalPartners || '0', trend: 'up', trendValue: '+1.5%', icon: Handshake, color: 'yellow' },
    { label: 'Pending Approvals', value: statsData?.stats?.pendingApprovals || '0', trend: 'up', trendValue: '+4 new', icon: FileCheck, color: 'indigo' },
    { label: 'Pending Donations', value: statsData?.stats?.pendingDonations || '0', trend: 'up', trendValue: '+12%', icon: Gift, color: 'green' },
    { label: 'Active Campaigns', value: statsData?.stats?.activeCampaigns || '0', trend: 'up', trendValue: 'Stable', icon: Megaphone, color: 'red' },
  ];

  const getActivityIcon = (type) => {
    switch (type) {
      case 'New Participant Intake':
      case 'New Registration':
        return { icon: Users, color: 'orange' };
      case 'New Volunteer Interest':
      case 'Volunteer Hours Logged':
        return { icon: Heart, color: 'blue' };
      case 'New Partner Registration':
        return { icon: Handshake, color: 'yellow' };
      case 'Submission Approved':
      case 'Profile Updated':
        return { icon: FileCheck, color: 'green' };
      case 'New In-Kind Donation':
      case 'New Monetary Donation':
        return { icon: Gift, color: 'green' };
      default:
        return { icon: Clock, color: 'blue' };
    }
  };

  const formattedActivities = statsData?.recentActivity?.map(activity => {
    const { icon, color } = getActivityIcon(activity.type);
    return {
      icon,
      color,
      title: activity.type,
      description: activity.content,
      time: formatRelativeTime(activity.createdAt),
      // We could add actions here based on type if needed
    };
  }) || [];

  return (
    <div className="animate-in fade-in duration-500">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Dashboard Overview</h1>
        <p className="text-sm text-gray-500">Welcome back, {user?.name || (user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Admin')}. Here is the latest data for Our Hive today.</p>
      </header>

      {error && (
        <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-700">
          <AlertCircle size={20} />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        {stats.map((stat, idx) => (
          <StatCard key={idx} {...stat} isLoading={isLoading} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-black/5 p-6 h-fit">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-lg font-bold text-gray-800">Recent Activity Feed</h2>
            <button className="text-xs font-bold text-primary hover:text-primary-light">View All</button>
          </div>
          <div className="flex flex-col gap-8">
            {isLoading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="animate-spin text-primary" size={32} />
              </div>
            ) : formattedActivities.length > 0 ? (
              formattedActivities.map((activity, idx) => (
                <ActivityItem key={idx} {...activity} />
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">No recent activity found.</p>
            )}
          </div>
        </section>

        <section className="bg-primary text-white rounded-2xl p-8 relative overflow-hidden shadow-xl shadow-primary/20 flex flex-col h-fit">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-base font-semibold">Active Campaign Goal</h3>
            <TrendingUp size={24} className="opacity-30" />
          </div>
          <span className="text-[10px] font-bold tracking-widest opacity-80 mb-6 uppercase">WINTER WARMTH DRIVE</span>
          <div className="mb-4">
            <span className="text-2xl font-bold block mb-4">$14,250 / $20,000</span>
            <div className="h-2 bg-white/20 rounded-full mb-3">
              <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: '71%' }}></div>
            </div>
            <p className="text-[11px] font-medium opacity-90">71% reached • 8 days remaining</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
