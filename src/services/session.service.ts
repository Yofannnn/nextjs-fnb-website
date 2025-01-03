import "server-only";
import { JWTPayload, SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { UserRole } from "@/types/user.type";

// Constants
const SESSION_SECRET = process.env.SESSION_SECRET;
if (!SESSION_SECRET) {
  throw new Error("SESSION_SECRET is not defined in environment variables.");
}
const ENCODED_SECRET_KEY = new TextEncoder().encode(SESSION_SECRET);
const SESSION_COOKIE_NAME = "session";
const COOKIE_MAX_AGE = 24 * 60 * 60 * 1000; // 1 day

// Types
export interface SessionCookiePayload {
  email: string;
  role: UserRole.Admin | UserRole.Member | UserRole.Guest;
}

/**
 * Generates a signed JWT token for user authentication.
 *
 * @async
 * @function generateToken
 * @param {JWTPayload} payload - The data to encode in the JWT, typically includes user information.
 * @returns {Promise<string>} The generated JWT string.
 *
 * @example
 * const token = await generateToken({ userId: "123", role: "member" });
 */
export async function generateToken(payload: JWTPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1d")
    .sign(ENCODED_SECRET_KEY);
}

/**
 * Verifies and decodes a JWT token.
 *
 * @async
 * @function verifyToken
 * @param {string} [token=""] - The JWT string to verify and decode.
 * @returns {Promise<JWTPayload|null>} Decoded payload if valid, otherwise `null`.
 *
 * @example
 * const payload = await verifyToken(token);
 * if (!payload) {
 *   console.error("Invalid token");
 * }
 */
export async function verifyToken(token: string = ""): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, ENCODED_SECRET_KEY, {
      algorithms: ["HS256"],
    });
    return payload;
  } catch {
    return null;
  }
}

/**
 * Creates and sets a session cookie for the authenticated user.
 *
 * @async
 * @function createSessionCookie
 * @param {string} userId - Unique identifier for the user.
 * @param {UserRole} role - Role of the user (admin, member, or guest).
 *
 * @returns {Promise<void>}
 *
 * @example
 * await createSessionCookie("12345", "member");
 */
export async function createSessionCookie({ email, role }: SessionCookiePayload): Promise<void> {
  const expiresAt = new Date(Date.now() + COOKIE_MAX_AGE);
  const token = await generateToken({ email, role });

  (await cookies()).set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    expires: expiresAt,
    sameSite: "strict",
    path: "/",
  });
}

/**
 * Refreshes the expiration date of an existing session cookie.
 *
 * @async
 * @function refreshSessionCookie
 * @returns {Promise<JWTPayload|null>} Updated payload if the session is valid, otherwise `null`.
 *
 * @example
 * const updatedPayload = await refreshSessionCookie();
 * if (!updatedPayload) {
 *   console.log("Session is invalid or expired.");
 * }
 */
export async function refreshSessionCookie(): Promise<JWTPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const payload = await verifyToken(token);

  if (!token || !payload) {
    return null;
  }

  const expiresAt = new Date(Date.now() + COOKIE_MAX_AGE);
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    expires: expiresAt,
    sameSite: "strict",
    path: "/",
  });

  return payload;
}

/**
 * Deletes the session cookie to log the user out.
 *
 * @async
 * @function clearSessionCookie
 * @returns {Promise<void>}
 *
 * @example
 * await clearSessionCookie();
 * console.log("Session cleared.");
 */
export async function clearSessionCookie(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE_NAME);
}
