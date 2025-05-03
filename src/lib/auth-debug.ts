/**
 * Utility to help debug authentication state issues
 * This can be used to view the current auth state in the browser console
 */

// Helper to safely get the auth store from localStorage
export const getAuthStore = () => {
  if (typeof window === 'undefined') return null;
  
  try {
    // Find the Supabase auth key
    let authKey = null;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('supabase.auth.token')) {
        authKey = key;
        break;
      }
    }
    
    if (!authKey) return null;
    
    // Get and parse the auth store
    const authStoreJson = localStorage.getItem(authKey);
    if (!authStoreJson) return null;
    
    return JSON.parse(authStoreJson);
  } catch (error) {
    console.error('Error parsing auth store', error);
    return null;
  }
};

// Debug the current authentication state
export const debugAuth = () => {
  if (typeof window === 'undefined') return;
  
  const authStore = getAuthStore();
  
  console.group('🔐 Auth Debug Information');
  console.log('Auth Store:', authStore);
  
  // Check if session exists and is valid
  if (authStore?.currentSession) {
    const { expires_at, created_at } = authStore.currentSession;
    
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = expires_at;
    const createdAt = created_at;
    
    const isExpired = now > expiresAt;
    const sessionAge = now - createdAt;
    const timeToExpiry = expiresAt - now;
    
    console.log('Session Status:', isExpired ? '❌ EXPIRED' : '✅ VALID');
    console.log('Session Age:', formatSeconds(sessionAge));
    console.log('Time to Expiry:', isExpired ? 'EXPIRED' : formatSeconds(timeToExpiry));
    console.log('User ID:', authStore.currentSession?.user?.id);
    console.log('User Email:', authStore.currentSession?.user?.email);
  } else {
    console.log('Session Status: ❌ NO SESSION');
  }
  
  // List all auth-related localStorage items
  console.group('localStorage Auth Items:');
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.startsWith('supabase') || key.includes('auth'))) {
      console.log(`${key}: ${localStorage.getItem(key)?.substring(0, 50)}...`);
    }
  }
  console.groupEnd();
  
  console.groupEnd();
  
  return authStore;
};

// Format seconds into a readable duration
const formatSeconds = (seconds: number) => {
  if (seconds < 60) return `${seconds} seconds`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes, ${seconds % 60} seconds`;
  return `${Math.floor(seconds / 3600)} hours, ${Math.floor((seconds % 3600) / 60)} minutes`;
};

// Add it to the window object for easy console access
if (typeof window !== 'undefined') {
  (window as any).debugAuth = debugAuth;
  console.log('Auth debug utility loaded. Run window.debugAuth() in console to debug auth state.');
}

export default debugAuth; 