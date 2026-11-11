'use client';
import { SignOutButton, UserButton } from '@clerk/nextjs';
export function AccountMenu() {
  return <div className="product-account"><UserButton /><div className="product-account-details"><span>Personal workspace</span><SignOutButton redirectUrl="/sign-in"><button type="button" className="product-text-link">Sign out</button></SignOutButton></div></div>;
}
