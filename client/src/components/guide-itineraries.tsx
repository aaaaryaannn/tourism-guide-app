import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';

const { user } = useAuth();
const { data: itineraries, isLoading } = useQuery({
    queryKey: ['itineraries', user?.id],
    queryFn: async () => {
      const response = await fetch(`/api/users/${user?.id}/itineraries`);
      if (!response.ok) throw new Error('Failed to fetch itineraries');
      return response.json();
    },
    enabled: !!user?.id
  });