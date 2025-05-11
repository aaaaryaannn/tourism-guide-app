import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/AuthContext";
import { useToast } from "@/hooks/use-toast";
import GuideBottomNavigation from "@/components/guide/bottom-navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { apiRequest } from "@/lib/queryClient";
import { User, GuideProfile as GuideProfileType, ExtendedUser } from "@/shared/schema";
import { PhoneIcon } from "@heroicons/react/24/outline";

const GuideProfile: React.FC = () => {
  const [_, setLocation] = useLocation();
  const { user: currentUser, isLoading: authLoading, logout } = useAuth();
  const user = currentUser as ExtendedUser | undefined;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    location: "",
    specialties: [] as string[],
    languages: [] as string[],
    experience: 0,
    bio: "",
  });

  // Fetch guide profile
  const { data: profile, isLoading } = useQuery<GuideProfileType>({
    queryKey: ['/api/guide', user?.id, 'profile'],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/guide/${user?.id}/profile`);
      if (!response.ok) throw new Error('Failed to fetch profile');
      return response.json();
    },
    enabled: !!user?.id,
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
      const response = await apiRequest("PATCH", `/api/guide/${user?.id}/profile`, data);
      if (!response.ok) throw new Error('Failed to update profile');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile updated",
        description: "Your guide profile has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/guide', user?.id, 'profile'] });
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

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const userDisplayName: string = user?.name || 'Anonymous';
  const userInitial: string = typeof userDisplayName === 'string' ? userDisplayName.charAt(0) : 'A';
  const userHandle: string = user?.username || user?.email || 'anonymous';

  return (
    <div className="h-full flex flex-col pb-14">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="text-2xl font-bold">Guide Profile</h2>
      </div>

      {/* Profile Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Picture */}
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src={user?.image || ''} alt={userDisplayName} />
              <AvatarFallback>{userInitial}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold">{userDisplayName}</h3>
              <p className="text-sm text-gray-500">@{userHandle}</p>
              {user?.phone && (
                <div className="flex items-center mt-1 text-sm text-gray-600">
                  <PhoneIcon className="w-4 h-4 mr-1" />
                  <span>{user.phone}</span>
                </div>
              )}
            </div>
          </div>

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

      {/* Bottom Navigation */}
      <GuideBottomNavigation />
    </div>
  );
};

export default GuideProfile;
