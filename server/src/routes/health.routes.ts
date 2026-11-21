//Defines the health endpoint

import { Router } from "express";  //We import the named Router export from Express
import { getHealth } from "../controllers/health.controller.js";

const router = Router();  //This creates a separate router that can hold related endpoints.

router.get("/", getHealth); //Instead of writing the entire response logic here, we pass the controller function to the route.

//Notice we use /, not /api/health. -> Why? Because we'll attach the router to /api/health in app.ts.
//Final URL
// GET-> /api/health
// Mount path + router path
// /api/health + / = /api/health    //called as "Modular Routing"

export default router; //This allows app.ts to import and register the router.