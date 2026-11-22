import bcrypt from "bcrypt";

const SALT_ROUNDS = 12;

//hashPassword() — hashes a password using bcrypt with cost factor 12.
//comparePassword() — verifies a submitted password against its stored hash.

export const hashPassword = async (
  password: string
): Promise<string> => {
  return await bcrypt.hash(password, SALT_ROUNDS);
};



// Understand each part
// 1. import bcrypt from "bcrypt" — imports the bcrypt library.
// 2. SALT_ROUNDS = 12 — defines our bcrypt cost factor.
// 3. hashPassword — exports a reusable function.
// 4. async — allows us to use asynchronous bcrypt operations.
// 5. password: string — accepts the original password.
// 6. Promise<string> — returns a promise that resolves to the generated hash.
// 7. bcrypt.hash(password, SALT_ROUNDS) — generates the salted password hash.


export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

// Understand the parameters
// Code->	Purpose
// password:string ->	Password entered during login
// hashedPassword:string	-> Hash retrieved from PostgreSQL
// Promise<boolean> ->	Eventually returns true or false
// bcrypt.compare()  -> 	Verifies the password against the stored hash