/**
 * Utility functions for API calls with offline support
 */
import { isBackendAvailable } from './health';
import { toast } from 'sonner';
import { getAccessToken } from '../auth/store';

let hasShownOfflineToast = false;

/**
 * Wrapper for fetch that handles offline mode and provides consistent error handling
 * @param url The URL to fetch
 * @param options Fetch options
 * @param fallbackData Data to return if offline
 * @returns The fetch response or fallback data
 */
export async function safeFetch<T>(
  url: string,
  options: RequestInit = {},
  fallbackData: T
): Promise<T> {
  try {
    // If we already know the backend is offline, don't even try to fetch
    if (!isBackendAvailable) {
      console.log(`Backend is offline, using fallback data for: ${url}`);

      // Show offline toast only once
      if (!hasShownOfflineToast) {
        toast.error('Backend server is offline. Using offline mode.');
        hasShownOfflineToast = true;

        // Reset after 1 minute to allow showing again if still offline
        setTimeout(() => {
          hasShownOfflineToast = false;
        }, 60000);
      }

      return fallbackData;
    }

    // Add timeout to avoid long waits
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...options.headers as Record<string, string>
      }
    }).finally(() => clearTimeout(timeoutId));

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(error.detail || `API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API call failed for ${url}:`, error);

    // If this is the first failure, show a toast
    if (!hasShownOfflineToast) {
      toast.error('Could not connect to the server. Using offline mode.');
      hasShownOfflineToast = true;

      // Reset after 1 minute
      setTimeout(() => {
        hasShownOfflineToast = false;
      }, 60000);
    }

    return fallbackData;
  }
}

/**
 * Fetch with authentication token
 * @param url The URL to fetch
 * @param options Fetch options
 * @param returnRawResponse Whether to return the raw response instead of JSON
 * @returns The fetch response
 */
export async function fetchWithAuth<T = any>(
  url: string,
  options: RequestInit = {},
  returnRawResponse = false
): Promise<T> {
  const token = getAccessToken();

  if (!token) {
    throw new Error('No authentication token found');
  }

  // Determine if we're sending form data
  const isFormData = options.body instanceof FormData;

  // Set up headers
  const headers: HeadersInit = {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json',
    ...options.headers as Record<string, string>
  };

  // Only set Content-Type if not FormData
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    ...options,
    credentials: 'include',
    headers
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || `API error: ${response.status}`);
  }

  if (returnRawResponse) {
    return response as unknown as T;
  }

  return await response.json();
}
