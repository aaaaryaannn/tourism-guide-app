import { useLocation } from "wouter";
import { Home, Users, AlertCircle, MapPin, MessageSquare, Search } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  isActive: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, onClick, isActive }) => (
  <button
    onClick={onClick}
    className={`flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg ${
      isActive ? 'text-[#DC143C]' : 'text-gray-600'
    }`}
  >
    {icon}
    <span className="text-sm font-medium">{label}</span>
  </button>
);

const Navbar = () => {
  const { user } = useAuth();
  const isAuthenticated = !!user;
  const [location, setLocation] = useLocation();

  const isActive = (path: string) => location === path;

  return (
    <nav className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            {isAuthenticated && (
              <>
                {user?.userType === "guide" ? (
                  <>
                    <NavItem
                      icon={<Home className="h-5 w-5" />}
                      label="Dashboard"
                      onClick={() => setLocation('/guide-dashboard')}
                      isActive={isActive('/guide-dashboard')}
                    />
                    <NavItem
                      icon={<Users className="h-5 w-5" />}
                      label="Connections"
                      onClick={() => setLocation('/guide-connections')}
                      isActive={isActive('/guide-connections')}
                    />
                    <NavItem
                      icon={<AlertCircle className="h-5 w-5" />}
                      label="Requests"
                      onClick={() => setLocation('/guide-requests')}
                      isActive={isActive('/guide-requests')}
                    />
                    <NavItem
                      icon={<MapPin className="h-5 w-5" />}
                      label="Itineraries"
                      onClick={() => setLocation('/guide-itineraries')}
                      isActive={isActive('/guide-itineraries')}
                    />
                    <NavItem
                      icon={<MessageSquare className="h-5 w-5" />}
                      label="Chats"
                      onClick={() => setLocation('/chat')}
                      isActive={isActive('/chat')}
                    />
                  </>
                ) : (
                  <>
                    <NavItem
                      icon={<Search className="h-5 w-5" />}
                      label="Find Guides"
                      onClick={() => setLocation('/search')}
                      isActive={isActive('/search')}
                    />
                    <NavItem
                      icon={<Users className="h-5 w-5" />}
                      label="Connections"
                      onClick={() => setLocation('/connections')}
                      isActive={isActive('/connections')}
                    />
                    <NavItem
                      icon={<MessageSquare className="h-5 w-5" />}
                      label="Chats"
                      onClick={() => setLocation('/chat')}
                      isActive={isActive('/chat')}
                    />
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 