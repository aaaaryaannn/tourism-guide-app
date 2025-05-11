import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { API_URL } from './constants'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function api(endpoint: string, options: RequestInit = {}) {
  // Ensure endpoint starts with /api
  const apiUrl = `${API_URL}${endpoint.startsWith('/api') ? endpoint : `/api${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`}`;
  
  console.log('Making API request to:', apiUrl);
  
  const response = await fetch(apiUrl, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
  
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text);
  }
  
  return response.json();
}
