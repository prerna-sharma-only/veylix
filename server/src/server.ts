import app from "./app.js";
import { testDatabaseConnection } from "./config/db.js";

const PORT = 3000;

const startServer = async (): Promise<void> => {
  try {
    await testDatabaseConnection();

    app.listen(PORT, () => {
      console.log(`Veylix API is running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed because the database is unavailable.");
    process.exit(1);
  }
};

startServer();








































// import express from "express"; //Imports the Express framework so our application can use it.
// import { testDatabaseConnection } from "./config/db.js";   // TypeScript source files use .ts, but the compiled JavaScript imports use .js extensions.

// const app = express(); //Creates an Express application. We use app to define routes and configure server behavior.
// const PORT = 3000; //Defines the port on which the server will listen.

// app.get("/api/health", (_req, res) => { //_req represents the incoming request. We aren't using it yet, so its name starts with an underscore.
//   res.status(200).json({
//     success: true, //success indicates that the endpoint responded successfully.
//     message: "Veylix API is running",
//     timestamp: new Date().toISOString(), //records the current time in ISO 8601 format
//   });
// });

// const startServer = async (): Promise<void> => {
//   try {
//     await testDatabaseConnection();   // It makes sure the database test finishes before Express starts listening for requests.
//     //If the connection fails, process.exit(1) stops the application with a failure exit code.

//     app.listen(PORT, () => {   // We want Express to start listening only after PostgreSQL has connected successfully.
//       console.log(`Veylix API is running at http://localhost:${PORT}`);
//     });
//   } catch (error) {
//     console.error("Server startup failed because the database is unavailable.");
//     process.exit(1);
//   }
// };

// startServer();
