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

export async function verifyUniqueLink(
  token: string = ""
): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, encodedKey, {
      algorithms: ["HS256"],
    });
    const { id } = payload as { id?: string };
    return id || null;
  } catch (error) {
    return null;
  }
}
