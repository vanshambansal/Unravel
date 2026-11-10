import { ClerkProvider } from '@clerk/nextjs';
import { authConfigured } from '@/server/auth';
import './workspace.css';

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const content = <div className="unravel-workspace">{children}</div>;
  if (!authConfigured()) return content;
  return <ClerkProvider signInUrl="/sign-in" signUpUrl="/sign-up" afterSignOutUrl="/sign-in"
    signInFallbackRedirectUrl="/app/projects" signUpFallbackRedirectUrl="/app/projects"
    appearance={{ variables: { colorPrimary: '#f3f2ee', colorPrimaryForeground: '#0c0d10', colorBackground: '#111318', colorForeground: '#f3f2ee', colorMutedForeground: '#a6aab3', colorInput: '#191c23', colorInputForeground: '#f3f2ee', colorDanger: '#ff8087', colorBorder: '#30343e', fontFamily: 'Unravel Product Inter, Arial, sans-serif', borderRadius: '8px', fontSize: '16px' }, elements: { cardBox: 'auth-card-box', card: 'auth-card', formButtonPrimary: 'auth-primary', headerTitle: 'auth-provider-heading', socialButtonsBlockButton: 'auth-social' } }}>
    {content}
  </ClerkProvider>;
}
