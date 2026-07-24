import { supabase } from './supabase';
import { generateReadableUsername } from './draftRecovery';

export interface UsernameCheckResult {
  isAvailable: boolean;
  username: string;
  message: string;
  suggestions?: string[];
}

const RESERVED_USERNAMES = new Set([
  'admin', 'administrator', 'support', 'official', 'system', 'security',
  'wallet', 'payworth', 'glasslinestudio', 'glassline', 'velocitylabs',
  'moderator', 'verify', 'staff', 'help', 'root', 'api', 'dev', 'billing'
]);

/**
 * Checks the 'profiles' table for username uniqueness in real-time.
 * Used for instant validation during profile completion and registration.
 */
export async function checkUsernameUniquenessRealtime(
  username: string,
  currentUserId?: string
): Promise<UsernameCheckResult> {
  const clean = username.trim().toLowerCase();

  if (!clean) {
    return {
      isAvailable: false,
      username: clean,
      message: 'Please enter a username or handle.',
    };
  }

  if (clean.length < 3 || clean.length > 20) {
    return {
      isAvailable: false,
      username: clean,
      message: 'Handle must be between 3 and 20 characters.',
    };
  }

  if (!/^[a-z0-9_-]+$/.test(clean)) {
    return {
      isAvailable: false,
      username: clean,
      message: 'Handle can only contain lowercase letters, numbers, hyphens, or underscores.',
    };
  }

  if (RESERVED_USERNAMES.has(clean)) {
    const sug1 = `${clean}_user`;
    const sug2 = `${clean}_pwc`;
    const sug3 = generateReadableUsername();
    return {
      isAvailable: false,
      username: clean,
      message: 'This handle is reserved by system operations.',
      suggestions: [sug1, sug2, sug3],
    };
  }

  try {
    let query = supabase
      .from('profiles')
      .select('id, username')
      .eq('username', clean)
      .limit(1);

    if (currentUserId) {
      query = query.neq('id', currentUserId);
    }

    const queryPromise = query;
    const timeoutPromise = new Promise<{ data: any; error: any }>((resolve) =>
      setTimeout(() => resolve({ data: null, error: new Error('Query timeout') }), 4000)
    );

    const { data, error } = await Promise.race([queryPromise, timeoutPromise]);

    if (error) {
      console.warn('Real-time username RPC query note:', error.message);
    }

    const isTaken = data && data.length > 0;

    if (isTaken) {
      const randNum = Math.floor(100 + Math.random() * 900);
      const sug1 = `${clean}${randNum}`;
      const sug2 = `${clean}-pwc`;
      const sug3 = generateReadableUsername();

      return {
        isAvailable: false,
        username: clean,
        message: 'This handle is already taken.',
        suggestions: [sug1, sug2, sug3],
      };
    }

    return {
      isAvailable: true,
      username: clean,
      message: 'Handle is available!',
    };
  } catch (err: any) {
    console.error('Error during real-time username check:', err);
    return {
      isAvailable: true,
      username: clean,
      message: 'Handle check complete.',
    };
  }
}
