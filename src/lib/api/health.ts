/**
 * Health check API functions to verify backend connectivity
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

/**
 * Check if the backend API is available
 * @returns Promise<boolean> True if the backend is available, false otherwise
 */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    console.log(`Checking backend health with ping at: ${API_URL}/health/ping`);

    // Try to fetch with a timeout to avoid long waits
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

    // First try the ping endpoint which doesn't require DB access
    try {
      const pingResponse = await fetch(`${API_URL}/health/ping`, {
        signal: controller.signal,
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }).finally(() => clearTimeout(timeoutId));

      if (pingResponse.ok) {
        const pingData = await pingResponse.json();
        console.log('Backend ping: OK', pingData);
        // If ping succeeds, try the full health check
        return await checkFullHealth();
      }
    } catch (pingError) {
      console.error('Backend ping failed:', pingError);
      // If ping fails, the server is definitely down
      return false;
    }

    // If we get here, ping failed but didn't throw an error
    return false;
  } catch (error) {
    console.error('Backend health check failed:', error);
    return false;
  }
}

/**
 * Check the full health of the backend including database
 * @returns Promise<boolean> True if the backend is fully healthy, false otherwise
 */
async function checkFullHealth(): Promise<boolean> {
  try {
    console.log(`Checking full backend health at: ${API_URL}/health`);

    // Try to fetch with a timeout to avoid long waits
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

    const response = await fetch(`${API_URL}/health`, {
      signal: controller.signal,
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    }).finally(() => clearTimeout(timeoutId));

    if (response.ok) {
      const data = await response.json();
      console.log('Backend full health check: OK', data);

      // Check if database is healthy
      if (data.database === 'healthy') {
        console.log('Database is healthy');
        return true;
      } else {
        console.warn('Database is unhealthy:', data.database);
        return false;
      }
    }

    console.log(`Backend health check failed with status: ${response.status}`);
    return false;
  } catch (error) {
    console.error('Backend full health check failed:', error);
    return false;
  }
}

/**
 * Global variable to track backend availability
 */
export let isBackendAvailable = false;

/**
 * Start periodic health checks to monitor backend availability
 */
export function startBackendHealthMonitoring() {
  // Check immediately on startup
  checkBackendHealth().then(available => {
    isBackendAvailable = available;
    console.log(`Initial backend availability: ${available ? 'ONLINE' : 'OFFLINE'}`);
  });

  // Then check periodically
  setInterval(async () => {
    const wasAvailable = isBackendAvailable;
    isBackendAvailable = await checkBackendHealth();

    // Log only when status changes
    if (wasAvailable !== isBackendAvailable) {
      console.log(`Backend availability changed: ${isBackendAvailable ? 'ONLINE' : 'OFFLINE'}`);
    }
  }, 30000); // Check every 30 seconds
}
