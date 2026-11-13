import { ClerkProvider } from '@clerk/nextjs';
import type { CSSProperties } from 'react';
import { authConfigured } from '@/server/auth';
import { WorkspaceMotion } from './WorkspaceMotion';
import './workspace.css';
import './product-v2.css';
import './compositions.css';
import './product-materials.css';
import './workspace-shell.css';

export function WorkspaceProvider({ children, artwork }: { children: React.ReactNode; artwork?: string }) {
  const content = <div className="unravel-workspace" style={artwork?{'--workspace-artwork':`url("${artwork}")`} as CSSProperties:undefined}><WorkspaceMotion>{children}</WorkspaceMotion></div>;
  if (!authConfigured()) return content;
  return <ClerkProvider signInUrl="/sign-in" signUpUrl="/sign-up" afterSignOutUrl="/sign-in"
    localization={{ signIn: { start: { title: 'Welcome back', subtitle: 'Sign in to your developer workspace.' } }, signUp: { start: { title: 'Create your account', subtitle: 'Start investigating with Unravel.' } } }}
    signInFallbackRedirectUrl="/app/projects" signUpFallbackRedirectUrl="/app/projects"
    appearance={{ variables: { colorPrimary: '#ffffff', colorPrimaryForeground: '#0a0a0c', colorBackground: 'rgba(18, 20, 26, 0.78)', colorForeground: '#ffffff', colorMutedForeground: 'rgba(255, 255, 255, 0.55)', colorInput: 'rgba(10, 12, 16, 0.72)', colorInputForeground: '#f6f2ec', colorDanger: '#ff8087', colorBorder: 'rgba(255, 255, 255, 0.08)', fontFamily: 'Unravel Product Inter, Arial, sans-serif', borderRadius: '8px', fontSize: '14px' }, elements: { rootBox: 'auth-root', cardBox: 'auth-card-box', card: 'auth-card', formButtonPrimary: 'auth-primary', header: 'auth-provider-header', headerTitle: 'auth-provider-heading', headerSubtitle: 'auth-provider-subtitle', formFieldInput: 'auth-input', socialButtonsBlockButton: 'auth-social' } }}>
    {content}
  </ClerkProvider>;
}
