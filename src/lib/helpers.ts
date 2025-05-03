import { cookies } from 'next/headers';

/**
 * Safely get cookies in Next.js middleware/server components
 * This handles the async nature of cookies() in Next.js
 */
export async function getCookiesSafely() {
  try {
    const cookieStore = cookies();
    return cookieStore;
  } catch (error) {
    console.error('Error accessing cookies:', error);
    return null;
  }
}

/**
 * Get a specific cookie value safely
 * @param name The name of the cookie to retrieve
 * @returns The cookie value or null if not found/error
 */
export async function getCookieValue(name: string): Promise<string | null> {
  try {
    const cookieStore = await getCookiesSafely();
    if (!cookieStore) return null;
    
    return cookieStore.get(name)?.value || null;
  } catch (error) {
    console.error(`Error getting cookie ${name}:`, error);
    return null;
  }
}

/**
 * Safely handle cookie access in middleware
 * @param req The NextRequest object from middleware
 * @returns An object containing cookie functions
 */
export function getMiddlewareCookies(req: Request) {
  const cookieHeader = req.headers.get('cookie') || '';
  
  const getCookie = (name: string): string | undefined => {
    const match = cookieHeader.match(new RegExp(`(^| )${name}=([^;]+)`));
    return match ? match[2] : undefined;
  };
  
  return { getCookie };
} 