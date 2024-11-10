import { JWTPayload, jwtVerify, SignJWT } from "jose";

const secretKey = process.env.MANAGE_RESERVATION_SECRET_KEY;
const encodedKey = new TextEncoder().encode(secretKey);

export async function createUniqueLink(payload: JWTPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1d")
    .sign(encodedKey);
}

export async function verifyUniqueLink(token: string | null): Promise<{
  valid: boolean;
  email: string | null;
  message: string;
}> {
  try {
    if (!token) throw new Error("No token provided");
    const { payload } = await jwtVerify(token, encodedKey, {
      algorithms: ["HS256"],
    });
    const { email } = payload as { email?: string };
    if (!email) throw new Error("Invalid token");
    return {
      valid: true,
      email,
      message: "Valid token",
    };
  } catch (error: any) {
    return {
      valid: false,
      email: null,
      message: error.message,
    };
  }
}
