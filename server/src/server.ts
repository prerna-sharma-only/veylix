import express from "express"; //Imports the Express framework so our application can use it.

const app = express(); //Creates an Express application. We use app to define routes and configure server behavior.
const PORT = 3000; //Defines the port on which the server will listen.

app.get("/api/health", (_req, res) => { //_req represents the incoming request. We aren't using it yet, so its name starts with an underscore.
  res.status(200).json({
    success: true, //success indicates that the endpoint responded successfully.
    message: "Veylix API is running",
    timestamp: new Date().toISOString(), //records the current time in ISO 8601 format
  });
});

app.listen(PORT, () => {
  console.log(`Veylix API is running at http://localhost:${PORT}`);
});