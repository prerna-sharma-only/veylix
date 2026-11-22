import type { Request, Response, NextFunction } from "express";
import { pool } from "../config/db.js";
import { hashPassword, comparePassword } from "../utils/password.js";
import type { RegisterInput, LoginInput } from "../validators/auth.validator.js";
import { generateToken } from "../utils/token.js";

// Why these imports?
// Request, Response	-> Express request and response types
// pool	-> Reuse our PostgreSQL connection pool
// hashPassword	-> Hash the original password
// RegisterInput  ->  Type-safe registration data

//REGISTER________________________
export const registerUser = async (
    req: Request<{}, {}, RegisterInput>,
    res: Response,
    next: NextFunction
): Promise<void> => {

    try {
        // Existing registration logic goes here.
        const { name, email, password } = req.body; //we extract the three properties into individual variables.Because we used RegisterInput, TypeScript knows their expected types.

        const existingUser = await pool.query(
            "SELECT id FROM users WHERE email = $1",
            [email]
        );
        if (existingUser.rows.length > 0) {
            res.status(409).json({
                success: false,
                message: "Email is already registered",
            });
            return; //The return is important: it stops the controller from continuing to password hashing and insertion.
        }

        //Hash the password
        const passwordHash = await hashPassword(password);

        //Insert the user into PostgreSQL 
        const result = await pool.query(
            `INSERT INTO users (name, email, password_hash)
        VALUES ($1, $2, $3)
        RETURNING id, name, email, created_at`,
            [name, email, passwordHash]
        );
        //why returning ? -> PostgreSQL automatically generates the user's UUID and creation timestamp. We don't need to generate those ourselves. RETURNING gives us those values after insertion.

        //Send the registration response
        const newUser = result.rows[0]; //result: PostgreSQL query result. rows: array containing returned records. [0]: first record, which is the newly created user.

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: newUser,
        });

    } catch (error) {
        //Handle PostgreSQL error 23505

        if (
            typeof error === "object" && //Checks whether the caught value is an object
            error !== null && //JavaScript considers null an object, so we explicitly exclude it.
            "code" in error && //Checks whether the error object contains a code property.
            error.code === "23505" //Checks whether PostgreSQL reported a unique constraint violation
        ) {
            res.status(409).json({  //Returns HTTP 409 Conflict for duplicate registration.
                success: false,
                message: "Email is already registered",
            });
            return;
        }

        next(error); //If the error is something else, we forward it to our existing global Express error handler rather than hiding it.
    }


};
// registerUser: our controller function.
// async: allows us to perform asynchronous operations.
// Request<{}, {}, RegisterInput>: tells TypeScript that the request body follows our registration input type.
// Response: represents the Express response.
// Promise<void>: the asynchronous function doesn't return a meaningful value to its caller.
//Destructuring of name, email, and password.
// Parameterized SQL using $1.
// Passing [email] separately from the SQL query.
// Checking existingUser.rows.length > 0.
// Returning 409 Conflict and stopping execution with return.


//LOGIN ___________________
export const loginUser = async (
    req: Request<{}, {}, LoginInput>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { email, password } = req.body;

        const result = await pool.query(
            `SELECT id, name, email, password_hash
            FROM users
            WHERE email = $1`,
            [email]
        );

        const user = result.rows[0];

        //missing user check
        if (!user) {
            res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
            return;
        }

        //Compare the passwords
        const isPasswordValid = await comparePassword(
            password,
            user.password_hash
        );

        if (!isPasswordValid) {
            res.status(401).json({ //401 Invalid email or password does not reveal whether the email exists-> This prevents account enumeration because an attacker cannot distinguish between an unknown email and an incorrect password from the response.
                success: false,
                message: "Invalid email or password",
            });
            return;
        }

        //generate jwt token
        const token = generateToken(user.id); //Why here? We generate a token only after the user has successfully passed password verification. Invalid credentials must never receive a token.

        //Send the successful login response
        res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                token,
            },
        });

    } catch (error) {
        next(error); //unnexpected errors
    }
};
//LoginInput: ensures the request body follows our login schema.
//const { email, password }: extracts the submitted credentials.
//pool.query(): asks PostgreSQL to find the account.
//$1: parameter placeholder; the email is passed separately.
//result.rows: contains the matching database records, if any.