import jwt from "jsonwebtoken";
import { JWT_SECRET} from "../config/jwt.js";

export const generateToken = (userId: string): string => {
  return jwt.sign(
    { sub: userId },
    JWT_SECRET,
    { expiresIn: "1h"}
  );
};

// import jwt: gives us access to the JWT library.
// JWT_SECRET: our private signing key from the environment.
// generateToken(userId: string): accepts the user's ID.
// { sub: userId }: places the user ID in the JWT payload.
// jwt.sign(): signs the payload using our secret.
// { expiresIn: "1h" }: makes the token expire after one hour.
// : string: tells TypeScript that this function returns a string.

// jwt.sign() creates a JWT by:
// 1. Taking the payload (the information we want inside the token).
// 2. Using our secret key to sign it.
// 3. Applying token options such as expiration.
// 4. Returning the signed token as a string.