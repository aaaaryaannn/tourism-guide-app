import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../lib/AuthContext";
import { useToast } from "../hooks/use-toast";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Card } from "../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { apiRequest } from "../lib/queryClient";
import { Layout } from "../components/layout";
import { LogOut, Mail, Phone } from "lucide-react";
import { User, GuideProfile as GuideProfileType } from "@shared/schema";

interface ExtendedUser extends User {
  username?: string;
  phone?: string;
  isGuide?: boolean;
}

const GuideProfile = () => {
  const [_, setLocation] = useLocation();
  const { user: authUser, isLoading: authLoading, logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Authentication check with loading state
  useEffect(() => {
    if (!authLoading) {
      // First try to get user from context
      let currentUser = authUser as ExtendedUser | null;
      
      // If no user in context, check window.auth as fallback
      if (!currentUser && (window as any).auth?.user) {
        console.log("Using window.auth fallback:", (window as any).auth.user);
        currentUser = (window as any).auth.user as ExtendedUser;
      }
      
      if (!currentUser) {
        console.log("No user found, redirecting to login");
        toast({
          title: "Authentication required",
          description: "Please login to access guide profile",
          variant: "destructive",
        });
        setLocation('/login');
        return;
      }
      
      if (!currentUser.isGuide) {
        console.log("User is not a guide, redirecting to dashboard");
        toast({
          title: "Access denied",
          description: "This page is only for guides",
          variant: "destructive",
        });
        setLocation('/dashboard');
        return;
      }
    }
  }, [authUser, authLoading, setLocation, toast]);

  const [formData, setFormData] = useState({
    location: "",
    specialties: [] as string[],
    languages: [] as string[],
    experience: 0,
    bio: "",
  });

  // Fetch guide profile
  const { data: profile, isLoading } = useQuery<GuideProfileType>({
    queryKey: ['/api/guide', authUser?.id, 'profile'],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/guide/${authUser?.id}/profile`);
      if (!response.ok) throw new Error('Failed to fetch profile');
      return response.json();
    },
    enabled: !!authUser?.id,
  });

  // Update form data when profile is loaded
  useEffect(() => {
    if (profile) {
      setFormData({
        location: profile.location || "",
        specialties: profile.specialties || [],
        languages: profile.languages || [],
        experience: profile.experience || 0,
        bio: profile.bio || "",
      });
    }
  }, [profile]);

  // Update profile mutation
  const updateProfile = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await apiRequest("PATCH", `/api/guide/${authUser?.id}/profile`, data);
      if (!response.ok) throw new Error('Failed to update profile');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile updated",
        description: "Your guide profile has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/guide', authUser?.id, 'profile'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate(formData);
  };

  const handleLogout = () => {
    logout();
    setLocation('/login');
  };

  if (authLoading || isLoading) {
    return (
      <Layout>
        <div className="h-full flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </Layout>
    );
  }

  const user = authUser as ExtendedUser;

  return (
    <Layout>
      <div className="h-full flex flex-col pb-14">
        {/* Header */}
        <div className="p-4 border-b">
          <h2 className="text-2xl font-bold">Guide Profile</h2>
        </div>

        {/* Profile Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* User Info Card */}
          <Card className="mb-6">
            <div className="p-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`} />
                  <AvatarFallback>
                    {user?.name ? user.name.charAt(0) : (user?.username ? user.username.charAt(0) : 'U')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{user?.name || 'User'}</h3>
                  <p className="text-sm text-gray-500">@{user?.username || user?.email}</p>
                  <div className="flex items-center mt-1 text-sm text-gray-600">
                    <Mail className="w-4 h-4 mr-1" />
                    {user?.email}
                  </div>
                  {user?.phone && (
                    <div className="flex items-center mt-1 text-sm text-gray-600">
                      <Phone className="w-4 h-4 mr-2" />
                      <span>{String(user.phone)}</span>
                    </div>
                  )}
                </div>
                <Button 
                  variant="outline" 
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </Card>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Enter your location"
              />
            </div>

            {/* Experience */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Years of Experience
              </label>
              <Input
                type="number"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: parseInt(e.target.value) })}
                placeholder="Enter years of experience"
              />
            </div>

            {/* Specialties */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Specialties (comma-separated)
              </label>
              <Input
                value={formData.specialties.join(", ")}
                onChange={(e) => setFormData({
                  ...formData,
                  specialties: e.target.value.split(",").map(s => s.trim()).filter(Boolean)
                })}
                placeholder="e.g., Historical Tours, Adventure Tours, Cultural Tours"
              />
            </div>

            {/* Languages */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Languages (comma-separated)
              </label>
              <Input
                value={formData.languages.join(", ")}
                onChange={(e) => setFormData({
                  ...formData,
                  languages: e.target.value.split(",").map(s => s.trim()).filter(Boolean)
                })}
                placeholder="e.g., English, Hindi, Marathi"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bio
              </label>
              <Textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell us about yourself and your guiding experience"
                rows={4}
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-[#DC143C] hover:bg-[#B01030]"
              disabled={updateProfile.isLoading}
            >
              {updateProfile.isLoading ? "Updating..." : "Update Profile"}
            </Button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default GuideProfile;
