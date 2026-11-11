import { ClerkProvider } from '@clerk/nextjs';
import { authConfigured } from '@/server/auth';
import { WorkspaceMotion } from './WorkspaceMotion';
import './workspace.css';
import './product-v2.css';
import './compositions.css';
import './product-materials.css';
import './workspace-shell.css';

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const content = <div className="unravel-workspace"><WorkspaceMotion>{children}</WorkspaceMotion></div>;
  if (!authConfigured()) return content;
  return <ClerkProvider signInUrl="/sign-in" signUpUrl="/sign-up" afterSignOutUrl="/sign-in"
    localization={{ signIn: { start: { title: 'Welcome back', subtitle: 'Sign in to your developer workspace.' } }, signUp: { start: { title: 'Create your account', subtitle: 'Start investigating with Unravel.' } } }}
    signInFallbackRedirectUrl="/app/projects" signUpFallbackRedirectUrl="/app/projects"
    appearance={{ variables: { colorPrimary: '#f3f2ee', colorPrimaryForeground: '#0c0d10', colorBackground: '#111318', colorForeground: '#f3f2ee', colorMutedForeground: '#b4b1bd', colorInput: '#111318', colorInputForeground: '#f3f2ee', colorDanger: '#ff8087', colorBorder: '#363640', fontFamily: 'Unravel Product Inter, Arial, sans-serif', borderRadius: '8px', fontSize: '15px' }, elements: { rootBox: 'auth-root', cardBox: 'auth-card-box', card: 'auth-card', formButtonPrimary: 'auth-primary', header: 'auth-provider-header', headerTitle: 'auth-provider-heading', headerSubtitle: 'auth-provider-subtitle', formFieldInput: 'auth-input', socialButtonsBlockButton: 'auth-social' } }}>
    {content}
  </ClerkProvider>;
}
