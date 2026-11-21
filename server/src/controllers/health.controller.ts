//Handles the health response

import type { Request, Response } from "express";
//Express provides TypeScript types for HTTP requests and responses.
// - Request describes incoming request information.
// - Response describes the response we send back.

export const getHealth = (_req: Request, res: Response): void => {  //: Request and : Response tell TypeScript what types those parameters have.
  res.status(200).json({
    success: true,
    message: "Veylix API is running",
    timestamp: new Date().toISOString(),
  });
};