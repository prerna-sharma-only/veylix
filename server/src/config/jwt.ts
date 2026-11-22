//Read the secret from environment variables.
//Check that the secret exists.
//Export the configuration for token generation and verification.

import "dotenv/config";

const secret = process.env.JWT_SECRET;

if (!secret) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}

export const JWT_SECRET: string = secret;

// process.env.JWT_SECRET reads the secret from .env.
// if (!JWT_SECRET) prevents the application from starting without the required secret.
// throw new Error() stops execution rather than allowing insecure token generation.
// export makes the secret available to other backend modules.