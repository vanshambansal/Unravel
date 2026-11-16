'use client';
import { SignOutButton, UserButton } from '@clerk/nextjs';
const accountVariables = {
  colorPrimary: '#f3f2ee',
  colorPrimaryForeground: '#111318',
  colorBackground: '#1b1e26',
  colorForeground: '#f3f2ee',
  colorNeutral: '#f3f2ee',
  colorMutedForeground: '#bbc0cb',
  colorInput: '#11151d',
  colorInputForeground: '#f3f2ee',
  colorBorder: '#3b414e',
  colorDanger: '#ff969d',
  fontFamily: 'Unravel Product Inter, Arial, sans-serif',
};
export function AccountMenu() {
  return (
    <div className="product-account">
      <UserButton
        appearance={{
          variables: accountVariables,
          elements: {
            rootBox: 'workspace-account-root',
            userButtonPopoverCard: {
              backgroundColor: '#1b1e26',
              color: '#f3f2ee',
              border: '1px solid #3b414e',
            },
            userButtonPopoverActionButton: { color: '#f3f2ee' },
            userButtonPopoverActionButtonText: { color: 'inherit' },
            userButtonPopoverActionButtonIcon: { color: '#bbc0cb' },
            userButtonPopoverFooter: { backgroundColor: '#151820' },
          },
        }}
        userProfileProps={{
          appearance: {
            variables: accountVariables,
            elements: {
              rootBox: 'workspace-profile-root',
              cardBox: 'workspace-profile-card',
              card: { backgroundColor: '#1b1e26', color: '#f3f2ee' },
              navbar: { backgroundColor: '#151820' },
              pageScrollBox: { backgroundColor: '#1b1e26' },
              badge: { color: '#cbd0db', backgroundColor: '#ffffff0c' },
              menuButton: { color: '#cbd0db' },
            },
          },
        }}
      />
      <div className="product-account-details">
        <span>Personal workspace</span>
        <SignOutButton redirectUrl="/sign-in">
          <button type="button" className="product-text-link">
            Sign out
          </button>
        </SignOutButton>
      </div>
    </div>
  );
}
