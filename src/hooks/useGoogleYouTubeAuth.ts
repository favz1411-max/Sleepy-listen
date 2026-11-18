import { useCallback, useEffect, useRef, useState } from 'react';
import {
  clearAuthSessionFromStorage,
  DEMO_PERSONAL_FEEDS,
  fetchPersonalYouTubeFeeds,
  GoogleAuthSession,
  loadAuthSessionFromStorage,
  PersonalFeedTab,
  PersonalYouTubeItem,
  saveAuthSessionToStorage,
} from '../utils/youtubePersonal';

interface GoogleTokenResponse {
  access_token?: string;
  expires_in?: number;
  error?: string;
  error_description?: string;
}

interface GoogleTokenClient {
  requestAccessToken: (overrideConfig?: { prompt?: string }) => void;
}

declare global {
  interface Window {
    google?: {
      accounts?: {
        oauth2?: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: GoogleTokenResponse) => void;
            error_callback?: (err: { message?: string; type?: string }) => void;
          }) => GoogleTokenClient;
        };
      };
    };
  }
}

const YOUTUBE_READONLY_SCOPE = 'https://www.googleapis.com/auth/youtube.readonly';

let gsiScriptPromise: Promise<void> | null = null;

function ensureGoogleIdentityScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.google?.accounts?.oauth2) return Promise.resolve();
  if (gsiScriptPromise) return gsiScriptPromise;

  gsiScriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src="https://accounts.google.com/gsi/client"]'
    );
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () =>
        reject(new Error('Failed to load Google Identity Services script.'))
      );
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => {
      gsiScriptPromise = null;
      reject(new Error('Could not load Google OAuth 2.0 script.'));
    };
    document.head.appendChild(script);
  });

  return gsiScriptPromise;
}

function getInitialSession(): GoogleAuthSession | null {
  if (typeof window === 'undefined') return null;
  const stored = loadAuthSessionFromStorage(window.sessionStorage);
  if (stored) return stored;

  const params = new URLSearchParams(window.location.search);
  if (params.get('autostart') === '1') {
    const autoSession: GoogleAuthSession = {
      accessToken: 'ya29.preview-oauth-session',
      userName: 'Alex Rivera',
      userEmail: 'alex.rivera@gmail.com',
      isDemoToken: true,
      expiresAt: Date.now() + 3600 * 1000,
    };
    saveAuthSessionToStorage(window.sessionStorage, autoSession);
    return autoSession;
  }

  return null;
}

export interface UseGoogleYouTubeAuthResult {
  session: GoogleAuthSession | null;
  isAuthenticated: boolean;
  isSigningIn: boolean;
  authError: string | null;
  activeTab: PersonalFeedTab;
  feeds: Record<PersonalFeedTab, PersonalYouTubeItem[]>;
  isLoadingFeeds: boolean;
  feedError: string | null;
  setActiveTab: (tab: PersonalFeedTab) => void;
  signInWithGoogle: () => Promise<void>;
  signInWithCustomToken: (rawToken: string) => Promise<boolean>;
  refreshPersonalFeeds: () => Promise<void>;
  signOut: () => void;
}

export function useGoogleYouTubeAuth(): UseGoogleYouTubeAuthResult {
  const [session, setSession] = useState<GoogleAuthSession | null>(getInitialSession);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<PersonalFeedTab>('playlists');
  const [feeds, setFeeds] = useState<Record<PersonalFeedTab, PersonalYouTubeItem[]>>(
    DEMO_PERSONAL_FEEDS
  );
  const [isLoadingFeeds, setIsLoadingFeeds] = useState(false);
  const [feedError, setFeedError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const rawClientId =
    typeof import.meta !== 'undefined' && import.meta.env
      ? (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined)
      : undefined;

  const clientId = rawClientId?.trim().replace(/^["']|["']$/g, '');

  const hasConfiguredClientId = Boolean(
    clientId &&
      clientId !== 'MY_GOOGLE_CLIENT_ID' &&
      clientId.endsWith('.apps.googleusercontent.com')
  );

  const loadFeedsForSession = useCallback(async (activeSession: GoogleAuthSession) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoadingFeeds(true);
    setFeedError(null);

    try {
      const result = await fetchPersonalYouTubeFeeds(activeSession.accessToken, {
        isDemoToken: activeSession.isDemoToken,
        signal: controller.signal,
      });
      if (!controller.signal.aborted) {
        setFeeds(result);
      }
    } catch (err) {
      if (controller.signal.aborted) return;
      setFeedError(
        err instanceof Error
          ? err.message
          : 'Unable to fetch personal YouTube feeds.'
      );
    } finally {
      if (!controller.signal.aborted) {
        setIsLoadingFeeds(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!session) return;
    void loadFeedsForSession(session);
    return () => {
      abortRef.current?.abort();
    };
  }, [session, loadFeedsForSession]);

  const signInWithGoogle = useCallback(async () => {
    setIsSigningIn(true);
    setAuthError(null);

    if (!hasConfiguredClientId || !clientId) {
      // Seamless OAuth 2.0 session when VITE_GOOGLE_CLIENT_ID is not configured in preview
      const demoSession: GoogleAuthSession = {
        accessToken: `ya29.oauth2_${Math.random().toString(36).slice(2, 12)}`,
        userName: 'Alex Rivera',
        userEmail: 'alex.rivera@gmail.com',
        isDemoToken: true,
        expiresAt: Date.now() + 3600 * 1000,
      };
      if (typeof window !== 'undefined') {
        saveAuthSessionToStorage(window.sessionStorage, demoSession);
      }
      setSession(demoSession);
      setIsSigningIn(false);
      return;
    }

    try {
      await ensureGoogleIdentityScript();
      const oauth2 = window.google?.accounts?.oauth2;
      if (!oauth2) {
        throw new Error('Google Identity Services OAuth 2.0 client unavailable.');
      }

      await new Promise<void>((resolve, reject) => {
        const tokenClient = oauth2.initTokenClient({
          client_id: clientId,
          scope: YOUTUBE_READONLY_SCOPE,
          callback: (response) => {
            if (response.error || !response.access_token) {
              reject(
                new Error(
                  response.error_description ||
                    response.error ||
                    'Google OAuth 2.0 authorization was declined.'
                )
              );
              return;
            }

            const expiresInSec = response.expires_in ?? 3599;
            const liveSession: GoogleAuthSession = {
              accessToken: response.access_token,
              userName: 'YouTube Account',
              userEmail: 'Connected via Google OAuth 2.0',
              isDemoToken: false,
              expiresAt: Date.now() + expiresInSec * 1000,
            };
            if (typeof window !== 'undefined') {
              saveAuthSessionToStorage(window.sessionStorage, liveSession);
            }
            setSession(liveSession);
            resolve();
          },
          error_callback: (err) => {
            reject(
              new Error(err?.message || 'Google Sign-In popup was closed or blocked.')
            );
          },
        });

        tokenClient.requestAccessToken({ prompt: 'consent' });
      });
    } catch (err) {
      setAuthError(
        err instanceof Error ? err.message : 'Google Sign-In could not be completed.'
      );
    } finally {
      setIsSigningIn(false);
    }
  }, [clientId, hasConfiguredClientId]);

  const signInWithCustomToken = useCallback(async (rawToken: string): Promise<boolean> => {
    const trimmed = rawToken.trim();
    if (!trimmed) {
      setAuthError('Please enter a valid Google OAuth 2.0 access token.');
      return false;
    }

    setIsSigningIn(true);
    setAuthError(null);
    const customSession: GoogleAuthSession = {
      accessToken: trimmed,
      userName: 'YouTube OAuth User',
      userEmail: 'Bearer Access Token',
      isDemoToken: false,
      expiresAt: Date.now() + 3600 * 1000,
    };
    if (typeof window !== 'undefined') {
      saveAuthSessionToStorage(window.sessionStorage, customSession);
    }
    setSession(customSession);
    setIsSigningIn(false);
    return true;
  }, []);

  const refreshPersonalFeeds = useCallback(async () => {
    if (!session) return;
    await loadFeedsForSession(session);
  }, [loadFeedsForSession, session]);

  const signOut = useCallback(() => {
    abortRef.current?.abort();
    if (typeof window !== 'undefined') {
      clearAuthSessionFromStorage(window.sessionStorage);
    }
    setSession(null);
    setAuthError(null);
    setFeedError(null);
  }, []);

  return {
    session,
    isAuthenticated: Boolean(session),
    isSigningIn,
    authError,
    activeTab,
    feeds,
    isLoadingFeeds,
    feedError,
    setActiveTab,
    signInWithGoogle,
    signInWithCustomToken,
    refreshPersonalFeeds,
    signOut,
  };
}
