import "dotenv/config";     //Loads .env values into process.env
import { Pool } from "pg";   //	Imports PostgreSQL connection pool

export const pool = new Pool({      //	Creates a reusable connection pool
  host: process.env.DB_HOST,    //PostgreSQL server address
  port: Number(process.env.DB_PORT),   //	PostgreSQL server port
  //NOTE : Number(process.env.DB_PORT) converts the port from a string into a number.
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
 
  max: 10,                     //Maximum 10 connections
  //NOTE: Creating the pool does not immediately establish all 10 connections. Connections are generally established on demand.
  idleTimeoutMillis: 30000,   //Closes idle connections after 30 seconds
  connectionTimeoutMillis: 5000,  // Waits up to 5 seconds to establish a connection
});


//NOTE : Why export? Because we want other backend modules to reuse this same connection pool.


export const testDatabaseConnection = async (): Promise<void> => {
  try {
    const result = await pool.query("SELECT $1 AS project_name",["Veylix"]);

    console.log("PostgreSQL connected successfully!");
    console.log(result.rows[0].project_name);
    // console.log("Database time:", result.rows[0].now);
  } catch (error) {
    console.error("PostgreSQL connection failed:", error);
    throw error;   // Why throw error? -- It allows the calling function to know that the database test failed. Later, this will help us prevent the Express server from starting when its required database connection is unavailable.
  }
};

// - async: Allows the function to perform asynchronous operations.
// - Promise<void>: The function returns a Promise and doesn't return a meaningful value.
// - pool.query(): Sends an SQL query through our connection pool.
// - result.rows: Contains the rows returned by PostgreSQL.
// - try/catch: Handles connection or query errors.