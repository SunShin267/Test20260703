export async function hashSecret(secret: string, salt: string): Promise<string> {
  const bytes = new TextEncoder().encode(`${salt}:${secret}`)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('')
}

export function createSalt(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(16)), byte => byte.toString(16).padStart(2, '0')).join('')
}

export async function verifySecret(secret: string, salt: string, hash: string): Promise<boolean> {
  return (await hashSecret(secret, salt)) === hash
}
