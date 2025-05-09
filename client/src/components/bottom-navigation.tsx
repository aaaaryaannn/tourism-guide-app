import { useLocation } from "wouter";
import { cn } from "@/lib/utils";

interface BottomNavigationProps {
  className?: string;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ className }) => {
  const [location, setLocation] = useLocation();

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <div className={cn(
      "flex justify-around items-center bg-white py-2 border-t border-gray-200 fixed bottom-0 left-0 right-0 z-30 bottom-navigation",
      className
    )}>
      <button
        onClick={() => setLocation('/dashboard')}
        className="flex flex-col items-center p-1"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke={isActive('/dashboard') ? "#DC143C" : "currentColor"}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5"
        >
          <circle cx="12" cy="12" r="10" />
          <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
        </svg>
        <span className={`text-xs mt-1 ${isActive('/dashboard') ? 'text-[#DC143C]' : 'text-gray-600'}`}>
          Explore
        </span>
      </button>
      
      <button
        onClick={() => setLocation('/search')}
        className="flex flex-col items-center p-1"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke={isActive('/search') ? "#DC143C" : "currentColor"}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <span className={`text-xs mt-1 ${isActive('/search') ? 'text-[#DC143C]' : 'text-gray-600'}`}>
          Search
        </span>
      </button>
      
      <button
        onClick={() => setLocation('/trip-planner')}
        className="flex flex-col items-center p-1"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke={isActive('/trip-planner') ? "#DC143C" : "currentColor"}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5"
        >
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
        <span className={`text-xs mt-1 ${isActive('/trip-planner') ? 'text-[#DC143C]' : 'text-gray-600'}`}>
          Trip Planner
        </span>
      </button>
      
      <button
        onClick={() => setLocation('/connections')}
        className="flex flex-col items-center p-1"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke={isActive('/connections') ? "#DC143C" : "currentColor"}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5"
        >
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
        <span className={`text-xs mt-1 ${isActive('/connections') ? 'text-[#DC143C]' : 'text-gray-600'}`}>
          Connections
        </span>
      </button>
      
      <button
        onClick={() => setLocation('/profile')}
        className="flex flex-col items-center p-1"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke={isActive('/profile') ? "#DC143C" : "currentColor"}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5"
        >
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        <span className={`text-xs mt-1 ${isActive('/profile') ? 'text-[#DC143C]' : 'text-gray-600'}`}>
          Profile
        </span>
      </button>
    </div>
  );
};

export default BottomNavigation;
