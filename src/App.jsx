import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Topbar from './components/layout/Topbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Participants from './pages/Participants';
import ParticipantDetail from './pages/ParticipantDetail';
import Volunteers from './pages/Volunteers';
import VolunteerDetail from './pages/VolunteerDetail';
import Sponsors from './pages/Sponsors';
import SponsorDetail from './pages/SponsorDetail';
import Partners from './pages/Partners';
import PartnerDetail from './pages/PartnerDetail';
import Events from './pages/Events';
import CreateEvent from './pages/CreateEvent';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import Donations from './pages/Donations';
import DonationDetail from './pages/DonationDetail';
import SocialLinks from './pages/SocialLinks';
import authService from './services/authService';
import adminService from './services/adminService';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = authService.isAuthenticated();
  const user = authService.getCurrentUser();
  const location = useLocation();

  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

const AppContent = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState(authService.getCurrentUser());
  const location = useLocation();
  const navigate = useNavigate();
  const isLoginPage = location.pathname === '/login';

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  useEffect(() => {
    const isAuthenticated = authService.isAuthenticated();
    
    if (isLoginPage && isAuthenticated && user?.role === 'admin') {
      navigate('/');
    }

    // Fetch latest profile data to keep state in sync
    if (isAuthenticated && !isLoginPage) {
      adminService.getAdminProfile()
        .then(res => {
          const userData = res.data || res;
          if (userData) {
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
          }
        })
        .catch(err => {
          console.warn("Failed to sync profile:", err);
        });
    }
  }, [isLoginPage, navigate, !!user]); 

  if (isLoginPage) {
    return <Login />;
  }

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-main-bg overflow-hidden">
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
          user={user}
        />
        
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Topbar 
            onMenuClick={toggleSidebar} 
            user={user}
          />
          
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-10 relative">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/participants" element={<Participants />} />
              <Route path="/participants/:id" element={<ParticipantDetail />} />
              <Route path="/volunteers" element={<Volunteers />} />
              <Route path="/volunteers/:id" element={<VolunteerDetail />} />
              <Route path="/sponsors" element={<Sponsors />} />
              <Route path="/sponsors/:id" element={<SponsorDetail />} />
              <Route path="/partners" element={<Partners />} />
              <Route path="/partners/:id" element={<PartnerDetail />} />
              <Route path="/events" element={<Events />} />
              <Route path="/events/new" element={<CreateEvent />} />
              <Route path="/events/:id" element={<CreateEvent />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/profile" element={<Profile onUpdate={setUser} />} />
              <Route path="/donations" element={<Donations />} />
              <Route path="/donations/:id" element={<DonationDetail />} />
              <Route path="/social-links" element={<SocialLinks />} />
            </Routes>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
