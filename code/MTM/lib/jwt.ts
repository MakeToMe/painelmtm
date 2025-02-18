import { SignJWT, jwtVerify } from 'jose'

// Chave secreta compartilhada entre frontend e backend
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-256-bit-secret'
)

export async function signJWT(payload: any) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET)

  return token
}

export async function verifyJWT(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload
  } catch (error) {
    return null
  }
}
