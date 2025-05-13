import { Switch, Route, useLocation } from "wouter";
import { useEffect, useState } from "react";
import React from "react";
import { API_URL } from '../lib/constants';

// Import components
import WelcomeScreen from "../components/welcome-screen";
import LoginScreen from "../components/login-screen";
import RegisterScreen from "../components/register-screen";

// Import tourist pages
import Dashboard from "./dashboard";
import SearchPage from "./search";
import TransportBooking from "./transport-booking";
import HotelBooking from "./hotel-booking";
import TripPlanner from "./trip-planner";
import Connections from "./connections";
import Profile from "./profile";
import GuideProfile from "./guide-profile";
import NotFound from "./not-found";

// Import guide pages
import GuideDashboard from "./guide-dashboard";
import GuideRequests from "./guide-requests";
import GuideItineraries from "./guide-itineraries";
import GuideConnections from "./guide-connections";

// Define user type
import type { User } from "../shared/schema";

// Authentication context directly in App
function App() {
  const [user, setUser] = useState<(User & { isGuide: boolean }) | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();
  
  // Check if user is already logged in
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser({
          ...parsedUser,
          isGuide: parsedUser.userType === 'guide'
        });
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      localStorage.removeItem("user");
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Login function
  const login = async (username: string, password: string): Promise<User> => {
    setIsLoading(true);
    
    try {
      // Check if username is an email
      const email = username.includes('@') ? username : undefined;
      
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ username, password, email }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Authentication failed" }));
        throw new Error(errorData.message || "Authentication failed");
      }
      
      const data = await response.json();
      
      // Create user object with isGuide property
      const userData = {
        ...data.user,
        token: data.token,
        isGuide: data.user.userType === 'guide',
        userType: data.user.userType,
        username: data.user.username || data.user.email.split('@')[0]
      };
      
      // Update state and localStorage
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", data.token);
      
      return userData;
    } catch (error: any) {
      throw new Error(error.message || "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setLocation("/");
  };
  
  // Export authentication functions and state to window
  // This makes auth state accessible globally for all components
  useEffect(() => {
    console.log("Setting global auth state with user:", user);
    (window as any).auth = { 
      user, 
      login, 
      logout, 
      setUser,
      isAuthenticated: !!user
    };
  }, [user]);
  
  // Redirect users based on their role after login
  useEffect(() => {
    if (!isLoading && user) {
      const currentPath = window.location.pathname;
      
      // If user is at root, login, or register page, redirect to appropriate dashboard
      if (['/', '/login', '/register'].includes(currentPath)) {
        if (user.isGuide) {
          setLocation('/guide-dashboard');
        } else {
          setLocation('/dashboard');
        }
      }
      
      // If guide tries to access tourist pages or tourist tries to access guide pages, redirect
      const guidePaths = ['/guide-dashboard', '/guide-requests', '/guide-itineraries', '/guide-connections', '/guide-profile'];
      const touristPaths = ['/dashboard', '/search', '/transport-booking', '/hotel-booking', '/trip-planner', '/connections', '/profile'];
      
      if (user.isGuide && touristPaths.includes(currentPath)) {
        setLocation('/guide-dashboard');
      } else if (!user.isGuide && guidePaths.includes(currentPath)) {
        setLocation('/dashboard');
      } else if (user.userType !== 'guide' && currentPath.startsWith('/guide-')) {
        setLocation('/dashboard');
      } else if (user.userType === 'guide' && !currentPath.startsWith('/guide-') && !['/', '/login', '/register'].includes(currentPath)) {
        setLocation('/guide-dashboard');
      }
    }
  }, [user, isLoading, setLocation]);

  // Pass login function to login screen through props
  const LoginScreenWithAuth = () => <LoginScreen login={login} />;
  
  // Show loading state
  if (isLoading) {
    return <div className="h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div id="app-container" className="h-screen flex flex-col">
      <Switch>
        {/* Public routes */}
        <Route path="/" component={WelcomeScreen} />
        <Route path="/login" component={LoginScreenWithAuth} />
        <Route path="/register" component={RegisterScreen} />
        
        {/* Protected routes - only accessible when logged in */}
        {user ? (
          <React.Fragment>
            {/* Tourist routes - only show if user is not a guide */}
            {!user.isGuide && (
              <React.Fragment>
                <Route path="/dashboard" component={Dashboard} />
                <Route path="/search" component={SearchPage} />
                <Route path="/transport-booking" component={TransportBooking} />
                <Route path="/hotel-booking" component={HotelBooking} />
                <Route path="/trip-planner" component={TripPlanner} />
                <Route path="/connections" component={Connections} />
                <Route path="/profile" component={() => <Profile user={user} logout={logout} />} />
              </React.Fragment>
            )}
            
            {/* Guide routes - only show if user is a guide */}
            {user.isGuide && (
              <React.Fragment>
                <Route path="/guide-dashboard" component={GuideDashboard} />
                <Route path="/guide-requests" component={GuideRequests} />
                <Route path="/guide-itineraries" component={GuideItineraries} />
                <Route path="/guide-connections" component={GuideConnections} />
                <Route path="/guide-profile" component={GuideProfile} />
              </React.Fragment>
            )}
          </React.Fragment>
        ) : (
          // Redirect to login if trying to access protected routes while not logged in
          <Route path="/:rest*">
            {(params: any) => {
              if (params.rest && !['', 'login', 'register'].includes(params.rest)) {
                setLocation('/login');
                return null;
              }
              return <NotFound />;
            }}
          </Route>
        )}
        
        {/* Fallback to 404 */}
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

export default App;
