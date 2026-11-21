import type { Request, Response } from "express";

export const createService = (
  req: Request,
  res: Response
): void => {
  res.status(201).json({
    success: true,
    message: "Service data validated successfully",
    data: req.body,
  });
};