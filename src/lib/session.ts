import "server-only"
import { JWTPayload, SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"

const secretKey = process.env.SESSION_SECRET
const encodedKey = new TextEncoder().encode(secretKey)

export async function encrypt(payload: JWTPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("3d")
    .sign(encodedKey)
}

export async function decrypt(session: string | undefined = "") {
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ["HS256"],
    })
    return payload
  } catch (error) {
    console.log("Failed to verify session")
  }
}

export async function createSession(userId: string, role: string) {
  const expiresAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
  const session = await encrypt({ userId, role, expiresAt })
  ;(await cookies()).set("session", session, {
    httpOnly: true,
    secure: true,
    expires: expiresAt,
    sameSite: "strict",
    path: "/",
  })
}

export async function updateSession() {
  const session = (await cookies()).get("session")?.value
  const payload = await decrypt(session)

  if (!session || !payload) {
    return null
  }

  const expires = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
  ;(await cookies()).set("session", session, {
    httpOnly: true,
    secure: true,
    expires: expires,
    sameSite: "strict",
    path: "/",
  })
}

export async function deleteSession() {
  ;(await cookies()).delete("session")
}
