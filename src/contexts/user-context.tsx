'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@/types/user';
import { authClient } from '@/lib/auth/client';
import { logger } from '@/lib/default-logger';
import { paths } from '@/paths';

export interface UserContextValue {
  user: User | null;
  error: string | null;
  isLoading: boolean;
  checkSession?: () => Promise<void>;
}

export const UserContext = React.createContext<UserContextValue | undefined>(undefined);

export interface UserProviderProps {
  children: React.ReactNode;
}

export function UserProvider({ children }: UserProviderProps): React.JSX.Element {
  const IDLE_TIMEOUT = 60000; // 10 minutes in milliseconds
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);
  const [isSessionExpired, setIsSessionExpired] = React.useState(false);
  const router = useRouter();
  const [state, setState] = React.useState<{ user: User | null; error: string | null; isLoading: boolean}>({
    user: null,
    error: null,
    isLoading: true,
  });

  const checkSession = React.useCallback(async (): Promise<void> => {
    try {
      const { data, error } = await authClient.getUser();

      if (error) {
        logger.error(error);
        setState((prev) => ({ ...prev, user: null, error: 'Something went wrong', isLoading: false }));
        return;
      }

      setState((prev) => ({ ...prev, user: data ?? null, error: null, isLoading: false }));
    } catch (err) {
      logger.error(err);
      setState((prev) => ({ ...prev, user: null, error: 'Something went wrong', isLoading: false }));
    }
  }, []);

  // Function to reset idle timer
  const resetIdleTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current); // Clear existing timer
    }

    // Set a new timeout to expire the session after the defined idle time
    timerRef.current = setTimeout(() => {
      setIsSessionExpired(true); // Set session as expired after timeout
      setState((prev) => ({ ...prev, user: null, error: 'Session Time Out, login again', isLoading: false}));
      localStorage.removeItem('custom-auth-token'); // Optionally remove the token
      router.replace(paths.auth.signIn);
      // Trigger any necessary logout logic, like redirecting the user
      //router.push(paths.auth.signIn); // Redirect to login or another appropriate action
    }, IDLE_TIMEOUT);
  };

  React.useEffect(() => {
    const events = ['mousemove', 'keydown', 'click', 'scroll'];
    events.forEach((event) => {
      window.addEventListener(event, resetIdleTimer);
    });

    checkSession().catch((err: unknown) => {
      logger.error(err);
      // noop
    });
    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, resetIdleTimer);
      });

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Expected
  }, []);

  return <UserContext.Provider value={{ ...state, checkSession }}>{children}</UserContext.Provider>;
}

export const UserConsumer = UserContext.Consumer;
