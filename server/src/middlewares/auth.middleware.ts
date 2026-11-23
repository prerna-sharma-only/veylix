import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/jwt.js";

export const authenticate = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        res.status(401).json({
            success: false,
            message: "Authorization header is missing",
        });
        return;
    }

    //separate Bearer from the actual token
    const parts = authHeader.split(" "); //split is separating string wherever it finds space
    if (
        parts.length !== 2 ||
        parts[0] !== "Bearer" ||
        !parts[1]
    ) {   //if incorrect bearer format return 401
        res.status(401).json({
            success: false,
            message: "Invalid authorization format",
        });
        return;
    }
    const token = parts[1]; //our main token

    //Verify the JWT
    //jwt.verify() - Whether the token's signature is valid, Whether the token has expired, Whether the token can be decoded into a valid JWT payload.
    try {
        const decoded = jwt.verify(token, JWT_SECRET); //Verifies the token using our private secret. If verification fails or the token expires, it throws an error.

        if (
            typeof decoded === "string" ||
            typeof decoded.sub !== "string"  //sub is the JWT subject claim. We're using it to identify the user.
        ) {
            res.status(401).json({
                success: false,
                message: "Invalid token payload",
            });
            return;
        }

        // Store the verified user ID for later middleware/controllers.
        res.locals.userId = decoded.sub; //Express provides res.locals to store request-specific information that later middleware and controllers can access.

        next();  //Allows the request to continue only after successful verification

    } catch (error) {  //Handles invalid, tampered, and expired tokens.
        res.status(401).json({
            success: false,
            message: "Invalid or expired token",
        });
        return;
    }
}


