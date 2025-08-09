// This is a likely structure for your useAuth.ts.
// The key is to add and export the clearToken function.

const TOKEN_KEY = 'token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

// ✅ ADD AND EXPORT THIS FUNCTION
export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// Your existing useAuth hook logic would remain here...
