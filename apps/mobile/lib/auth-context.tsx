import { createContext, useContext } from 'react';
import type { Session } from '@supabase/supabase-js';

interface AuthContextValue {
  session: Session | null;
  userId: string | null;
  displayName: string | null;
}

export const AuthContext = createContext<AuthContextValue>({
  session: null,
  userId: null,
  displayName: null,
});

export const useAuth = () => useContext(AuthContext);
