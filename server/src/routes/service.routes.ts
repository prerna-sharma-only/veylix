import { Router } from "express";
import { createService, getServices } from "../controllers/service.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createServiceSchema } from "../validators/service.validator.js";
import { authenticate } from "../middlewares/auth.middleware.js";


//Router: Creates a modular Express router.
// createService: Controller that will handle valid service creation requests.
// validate: Our reusable validation middleware.
// createServiceSchema: The Zod rules for service creation.

const router = Router();

router.post(
  "/",
  authenticate,
  validate(createServiceSchema),
  createService
);

router.get("/", authenticate, getServices);

export default router;

// authenticate checks whether the user has a valid token.
// validate checks whether the request body is valid.
// createService handles the request.