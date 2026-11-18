import { FormEvent, useState } from 'react';
import { KeyRound, Loader2, Moon, ShieldCheck } from 'lucide-react';

interface LoginScreenProps {
  isSigningIn: boolean;
  authError: string | null;
  onSignInWithGoogle: () => void;
  onSignInWithToken: (token: string) => void;
}

export function LoginScreen({
  isSigningIn,
  authError,
  onSignInWithGoogle,
  onSignInWithToken,
}: LoginScreenProps) {
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [tokenInput, setTokenInput] = useState('');

  const handleTokenSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSignInWithToken(tokenInput);
  };

  return (
    <div className="min-h-screen bg-[#07090d] text-[#f5efe6] flex flex-col justify-between px-4 sm:px-6 py-8 sm:py-12">
      {/* Top Minimal Brand Header */}
      <header className="w-full max-w-5xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Moon className="w-5 h-5 text-[#e5a95c]" aria-hidden="true" />
          <span className="font-display text-lg font-semibold tracking-tight text-[#f5efe6]">
            Sleep Player
          </span>
        </div>
        <span className="text-xs text-[#c8bfb0]/70">
          YouTube Data API v3 · Bedside Edition
        </span>
      </header>

      {/* Center Login Card with Generous Negative Space */}
      <main className="w-full max-w-md mx-auto my-12">
        <section
          aria-labelledby="login-heading"
          className="bg-[#0e1219] border border-white/[0.08] rounded-3xl p-7 sm:p-10 space-y-8 shadow-2xl"
        >
          <div className="space-y-3 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#141a24] border border-[#e5a95c]/30 flex items-center justify-center mx-auto">
              <Moon className="w-7 h-7 text-[#e5a95c]" aria-hidden="true" />
            </div>
            <h1
              id="login-heading"
              className="font-display text-2xl sm:text-3xl font-semibold text-[#f5efe6] tracking-tight text-balance"
            >
              Sign in to your night sanctuary
            </h1>
            <p className="text-sm text-[#c8bfb0]/80 leading-relaxed">
              Connect with Google OAuth 2.0 to load your personal YouTube playlists, channel subscriptions, and liked sleep videos with ad-free bedside playback.
            </p>
          </div>

          {authError && (
            <div
              role="alert"
              className="rounded-xl bg-[#241215] border border-[#f87171]/30 px-4 py-3 text-sm text-[#fca5a5]"
            >
              {authError}
            </div>
          )}

          <div className="space-y-4">
            {/* Primary Gold-Accented Sign in with Google Button */}
            <button
              type="button"
              onClick={onSignInWithGoogle}
              disabled={isSigningIn}
              className="w-full min-h-[54px] px-6 py-3.5 rounded-xl bg-[#e5a95c] hover:bg-[#eeb973] active:scale-[0.99] disabled:opacity-60 text-[#090c11] font-semibold text-base flex items-center justify-center gap-3 transition-colors border border-[#f3c47d]/40 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e5a95c] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0e1219]"
            >
              {isSigningIn ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-[#090c11]" aria-hidden="true" />
                  <span>Connecting to Google...</span>
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5 shrink-0"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                    />
                    <path
                      fill="#34A853"
                      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                    />
                  </svg>
                  <span>Sign in with Google</span>
                </>
              )}
            </button>

            {/* Optional OAuth Bearer Token Input Disclosure */}
            <div className="pt-2 border-t border-white/[0.06]">
              <button
                type="button"
                aria-expanded={showTokenInput}
                onClick={() => setShowTokenInput((prev) => !prev)}
                className="w-full min-h-[40px] py-2 text-xs font-medium text-[#c8bfb0]/75 hover:text-[#f5efe6] flex items-center justify-center gap-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e5a95c] rounded-lg"
              >
                <KeyRound className="w-3.5 h-3.5 text-[#e5a95c]" aria-hidden="true" />
                <span>
                  {showTokenInput
                    ? 'Hide OAuth 2.0 access token input'
                    : 'Have a Google OAuth 2.0 access token?'}
                </span>
              </button>

              {showTokenInput && (
                <form onSubmit={handleTokenSubmit} noValidate className="mt-3 space-y-2.5">
                  <label htmlFor="oauth-access-token-input" className="sr-only">
                    Google OAuth 2.0 Access Token
                  </label>
                  <input
                    id="oauth-access-token-input"
                    type="password"
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    placeholder="Paste ya29... OAuth 2.0 Bearer token"
                    className="w-full min-h-[46px] px-3.5 py-2 rounded-xl bg-[#07090d] border border-white/[0.09] text-sm text-[#f5efe6] placeholder:text-[#c8bfb0]/45 focus:outline-none focus:border-[#e5a95c]/75"
                  />
                  <button
                    type="submit"
                    className="w-full min-h-[44px] px-4 py-2 rounded-xl bg-[#161d29] hover:bg-[#1e2738] border border-[#e5a95c]/35 text-xs font-medium text-[#f5efe6] transition-colors"
                  >
                    Continue with Access Token
                  </button>
                </form>
              )}
            </div>
          </div>

          <div className="pt-2 flex items-start gap-2.5 text-xs text-[#c8bfb0]/65 leading-relaxed">
            <ShieldCheck className="w-4 h-4 text-[#e5a95c] shrink-0 mt-0.5" aria-hidden="true" />
            <p>
              Requests read-only YouTube permission (<code className="text-[#f5efe6]">youtube.readonly</code>) to load your Saved Playlists, Channel Subscriptions, and Liked Videos.
            </p>
          </div>
        </section>
      </main>

      {/* Quiet Footer */}
      <footer className="w-full max-w-5xl mx-auto text-center text-xs text-[#c8bfb0]/50">
        Low-brightness sleep audio · Official YouTube IFrame Player API
      </footer>
    </div>
  );
}
