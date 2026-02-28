import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import { 
  LayoutDashboard, 
  Users, 
  Heart, 
  UsersRound, 
  Package, 
  Handshake, 
  UserCog,
  CircleDollarSign,
  Megaphone,
  CalendarDays,
  UserCheck,
  ClipboardList,
  Bell,
  Settings,
  LogOut,
  X
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose, user }) => {
  const menuGroups = [
    {
      title: 'USER MANAGEMENT',
      items: [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'Participants', path: '/participants', icon: Users },
        { name: 'Volunteers', path: '/volunteers', icon: Heart },
        { name: 'Sponsors', path: '/sponsors', icon: Handshake },
        { name: 'In-Kind Donors', path: '/donations', icon: Package },
        { name: 'Community Partners', path: '/partners', icon: UsersRound },
        { name: 'Events', path: '/events', icon: CalendarDays },
      ]
    }
  ];

  // Removed stale authService call, using prop from App.jsx
  const navigate = useNavigate();

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
  };

  const sidebarClasses = `
    fixed inset-y-0 left-0 z-50 w-64 bg-sidebar-bg border-r border-black/5 transform transition-transform duration-300 ease-in-out
    lg:translate-x-0 lg:relative lg:h-full flex flex-col
    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
  `;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        ></div>
      )}

      <aside className={sidebarClasses}>
        <div className="flex items-center justify-between p-6 mb-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-primary text-white rounded-lg flex items-center justify-center font-bold text-2xl mr-3">
              H
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-bold text-[#333]">Our Hive</h1>
              <span className="text-[10px] tracking-widest text-primary font-semibold uppercase">Admin Portal</span>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-gray-500">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3">
          {menuGroups.map((group, idx) => (
            <div key={idx} className="mb-6">
              <span className="block text-[10px] font-bold text-gray-400 tracking-wider px-3 mb-2 uppercase">
                {group.title}
              </span>
              {group.items.map(item => (
                <NavLink 
                  key={item.path} 
                  to={item.path} 
                  onClick={() => window.innerWidth < 1024 && onClose()}
                  className={({ isActive }) => `
                    flex items-center px-3 py-2.5 rounded-xl transition-all mb-0.5 text-sm font-medium
                    ${isActive 
                      ? 'bg-primary text-white shadow-lg shadow-primary/30' 
                      : 'text-gray-600 hover:bg-primary/5 hover:text-primary'
                    }
                  `}
                >
                  <item.icon size={18} className="mr-3 shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="mt-auto px-3 py-6 border-t border-black/5">
          <NavLink to="/settings" className="flex items-center px-3 py-2.5 rounded-xl text-gray-600 hover:bg-primary/5 hover:text-primary transition-all text-sm font-medium mb-1">
            <Settings size={18} className="mr-3" />
            <span>Settings</span>
          </NavLink>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-2.5 text-red-600 rounded-xl hover:bg-red-50 transition-all text-sm font-medium"
          >
            <LogOut size={18} className="mr-3" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
