import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "secret";

export function createToken(userId: number) {
  return jwt.sign(
    {
      id: userId,
    },
    SECRET,
    {
      expiresIn: "1d",
    },
  );
}

export function verifyToken(token: string): jwt.JwtPayload | string {
  return jwt.verify(token, SECRET);
}