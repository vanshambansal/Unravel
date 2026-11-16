// Only a format preflight. Clerk still verifies all credentials and sessions.
// Reject copied masked values before they reach HTTP headers/handshake requests.
export function clerkKeysHaveValidFormat(publishableKey?: string, secretKey?: string): boolean {
  return Boolean(
    publishableKey &&
    secretKey &&
    /^pk_(test|live)_[A-Za-z0-9+/=_-]+$/.test(publishableKey) &&
    /^sk_(test|live)_[A-Za-z0-9_-]+$/.test(secretKey) &&
    !publishableKey.includes('...') &&
    !secretKey.includes('...') &&
    publishableKey.split('_')[1] === secretKey.split('_')[1],
  );
}
