import type { Request, Response, NextFunction } from "express";
import { pool } from "../config/db.js";
import type { CreateServiceInput } from "../validators/service.validator.js";

export const createService = async (
  req: Request<{}, {}, CreateServiceInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = res.locals.userId;
    const { name, url, intervalSeconds } = req.body;

    const result = await pool.query(
      `INSERT INTO services (user_id, name, url, interval_seconds)
       VALUES ($1, $2, $3, $4)
       RETURNING id, user_id, name, url, interval_seconds, is_active, created_at`,
      [userId, name, url, intervalSeconds]
    );
    
    //$1, $2, $3, $4 are parameter placeholders, helping prevent SQL injection

    res.status(201).json({
      success: true,
      message: "Service created successfully",
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};


export const getServices = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = res.locals.userId; //gets the authenticated user's ID from our JWT middleware

    const result = await pool.query(
      `SELECT id, name, url, interval_seconds, is_active, created_at
       FROM services
       WHERE user_id = $1
       ORDER BY created_at DESC`, //displays the newest services first
      [userId]
    );

    res.status(200).json({
      success: true,
      message: "Services retrieved successfully",
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
};
