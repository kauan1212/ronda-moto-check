
interface CachedProfile {
  data: any;
  timestamp: number;
  expiry: number;
}

const CACHE_KEY = 'auth_profile_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const authCache = {
  set: (userId: string, profile: any) => {
    try {
      const cache = {
        data: profile,
        timestamp: Date.now(),
        expiry: Date.now() + CACHE_DURATION
      };
      localStorage.setItem(`${CACHE_KEY}_${userId}`, JSON.stringify(cache));
      console.log('💾 Auth cache: Profile cached for user:', userId);
    } catch (error) {
      console.warn('⚠️ Auth cache: Failed to cache profile:', error);
    }
  },

  get: (userId: string): any | null => {
    try {
      const cached = localStorage.getItem(`${CACHE_KEY}_${userId}`);
      if (!cached) return null;

      const cache: CachedProfile = JSON.parse(cached);
      
      if (Date.now() > cache.expiry) {
        console.log('⏰ Auth cache: Cache expired for user:', userId);
        authCache.clear(userId);
        return null;
      }

      console.log('✅ Auth cache: Using cached profile for user:', userId);
      return cache.data;
    } catch (error) {
      console.warn('⚠️ Auth cache: Failed to read cache:', error);
      return null;
    }
  },

  clear: (userId?: string) => {
    try {
      if (userId) {
        localStorage.removeItem(`${CACHE_KEY}_${userId}`);
        console.log('🧹 Auth cache: Cleared cache for user:', userId);
      } else {
        // Clear all auth caches
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.startsWith(CACHE_KEY)) {
            localStorage.removeItem(key);
          }
        });
        console.log('🧹 Auth cache: Cleared all auth caches');
      }
    } catch (error) {
      console.warn('⚠️ Auth cache: Failed to clear cache:', error);
    }
  },

  isValid: (userId: string): boolean => {
    const profile = authCache.get(userId);
    return profile !== null;
  }
};
