import { Router } from "express";
import { createService } from "../controllers/service.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createServiceSchema } from "../validators/service.validator.js";

//Router: Creates a modular Express router.
// createService: Controller that will handle valid service creation requests.
// validate: Our reusable validation middleware.
// createServiceSchema: The Zod rules for service creation.

const router = Router();

router.post(
  "/",
  validate(createServiceSchema),
  createService
);

export default router;