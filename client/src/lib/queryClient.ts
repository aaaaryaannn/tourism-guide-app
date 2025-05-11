import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { API_URL } from './constants';

type UnauthorizedBehavior = "throw" | "returnNull";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || `HTTP error! status: ${res.status}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Get the token from localStorage
  const token = localStorage.getItem('token');
  
  // Prepare headers
  const headers: Record<string, string> = {
    'Accept': 'application/json'
  };
  
  // Add Content-Type header if there's data
  if (data) {
    headers['Content-Type'] = 'application/json';
  }
  
  // Add Authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // Make sure the URL starts with /api and use the correct base URL
  const apiUrl = `${API_URL}/api${url.startsWith('/') ? url : `/${url}`}`;
  
  console.log('Making request to:', apiUrl);
  
  const res = await fetch(apiUrl, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined
  });

  await throwIfResNotOk(res);
  return res;
}

export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Get the token from localStorage
    const token = localStorage.getItem('token');
    
    // Prepare headers
    const headers: Record<string, string> = {
      'Accept': 'application/json'
    };
    
    // Add Authorization header if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Make sure the URL starts with /api and use the correct base URL
    const url = queryKey[0] as string;
    const apiUrl = `${API_URL}/api${url.startsWith('/') ? url : `/${url}`}`;
    
    console.log('Making query to:', apiUrl);
    
    const res = await fetch(apiUrl, {
      headers
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
