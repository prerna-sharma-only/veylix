import express from "express";
import healthRoutes from "./routes/health.routes.js";
import { requestLogger } from "./middlewares/request-logger.middleware.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { notFoundHandler } from "./middlewares/not-found.middleware.js";

const app = express();

// Register request logging middleware.
app.use(requestLogger);

// Register application routes.
app.use("/api/health", healthRoutes); //app.use() mounts the router at the specified base path. The router handles /, but Express combines it with the mounting path.

app.use(notFoundHandler);

// Centralized error handler must come after routes.
app.use(errorHandler);

export default app; //This exports the configured Express application so another file can import and use it

// - app.ts configures the application.
// - server.ts starts the server.
// - Tests can import app.ts without automatically starting a listening server.
// This is called separation of concerns.