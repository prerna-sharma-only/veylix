// First, understand the route's responsibilities:
// 1. Receive a POST request.
// 2. Validate the request body using our existing Zod middleware.
// 3. Call registerUser only if validation succeeds.

import { Router } from "express";
import { registerUser, loginUser } from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { registerSchema , loginSchema,} from "../validators/auth.validator.js";

const router = Router();

//register route
router.post("/register", validate(registerSchema), registerUser); //validation runs before the controller.

//login route
router.post("/login", validate(loginSchema), loginUser);

export default router;