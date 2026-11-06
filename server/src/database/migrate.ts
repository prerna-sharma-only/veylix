import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pool } from "../config/db.js";

// Resolve the current file and migrations directory.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const migrationsDirectory = path.join(__dirname, "migrations");

const bootstrapFile = "000_create_schema_migrations.sql";

// Reusable function to execute one migration safely.
const applyMigration = async (file: string): Promise<void> => {
  const filePath = path.join(migrationsDirectory, file);
  const sql = await fs.readFile(filePath, "utf-8");

  const version = file.split("_")[0];
  const name = file.replace(".sql", "");

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Execute the SQL contained in the migration file.
    await client.query(sql);

    // Record the migration in the tracking table.
    await client.query(
      `INSERT INTO schema_migrations (version, name)
       VALUES ($1, $2)`,
      [version, name]
    );

    await client.query("COMMIT");

    console.log(`Migration ${file} applied successfully.`);
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch (rollbackError) {
      console.error("Rollback failed:", rollbackError);
    }

    console.error(`Migration ${file} failed:`, error);
    throw error;
  } finally {
    client.release();
  }
};

// Main migration runner.
const main = async (): Promise<void> => {
  try {
    const migrationFiles = await fs.readdir(migrationsDirectory);

    const sqlFiles = migrationFiles
      .filter((file) => file.endsWith(".sql"))
      .sort();

    // Check whether the migration tracking table exists.
    const tableResult = await pool.query(
      "SELECT to_regclass('public.schema_migrations') AS table_name"
    );

    const trackingTableExists =
      tableResult.rows[0].table_name !== null;

    if (!trackingTableExists) {
      console.log("Creating migration tracking table...");
      await applyMigration(bootstrapFile);
    } else {
      // Check whether the initial migration has been recorded.
      const bootstrapResult = await pool.query(
        "SELECT version FROM schema_migrations WHERE version = $1",
        ["000"]
      );

      if (bootstrapResult.rows.length === 0) {
        console.log("Recording initial migration...");
        await applyMigration(bootstrapFile);
      }
    }

    // Fetch all successfully applied migration versions.
    const result = await pool.query(
      "SELECT version FROM schema_migrations"
    );

    const appliedMigrations = result.rows.map(
      (row) => row.version
    );

    // Find migrations that have not been applied yet.
    const pendingMigrations = sqlFiles.filter((file) => {
      const version = file.split("_")[0];

      return (
        file !== bootstrapFile &&
        !appliedMigrations.includes(version)
      );
    });

    console.log("Pending migrations:", pendingMigrations);

    // Apply pending migrations one by one.
    for (const file of pendingMigrations) {
      await applyMigration(file);
    }

    console.log("Migration process completed.");
  } finally {
    // Close the pool so this script can exit cleanly.
    await pool.end();
  }
};

// Start the migration runner.
main().catch((error) => {
  console.error("Migration runner failed:", error);
  process.exitCode = 1;
});







































// import fs from "node:fs/promises";   //Reads files and lists directory contents.
// import path from "node:path";       //Helps construct paths to files.
// import { fileURLToPath } from "node:url";  //Converts an ES module URL into a normal filesystem path.
// import { pool } from "../config/db.js";   //Gives our migration runner access to PostgreSQL.
// //we're using .js in the import path because your TypeScript project uses Node.js ES modules with NodeNext.

// //Node.js provides import.meta.url, which represents the URL of the current TypeScript module
// //We can convert it into a normal filesystem path using fileURLToPath().
// const __filename = fileURLToPath(import.meta.url); //Gets the current file's absolute path.
// const __dirname = path.dirname(__filename); //Gets the directory containing migrate.ts.

// const migrationsDirectory = path.join(__dirname, "migrations"); //Constructs the path to the migrations folder inside database.

// //Read migration filenames _________________
// const migrationFiles = await fs.readdir(migrationsDirectory);

// const sqlFiles = migrationFiles
//   .filter((file) => file.endsWith(".sql"))
//   .sort();
// // sqlFiles: all migration filenames found in the folder.
// // fs.readdir() reads the filenames in the migrations folder.
// // .filter() keeps only SQL files.
// // .sort() sorts them alphabetically, so numbered migrations run in order.

// //Find already-executed migrations____________________
// const result = await pool.query(
//   "SELECT version FROM schema_migrations"
// );

// const appliedMigrations = result.rows.map(
//   (row) => row.version
// );   //appliedMigrations: versions already recorded in the database.

// //pool.query() asks PostgreSQL for the versions already recorded.
// // result.rows contains the returned database rows.
// // .map() extracts only the version from each row.
// // appliedMigrations becomes an array, something like: ["001", "002", "003", "004", "005"]

// //Identify pending migrations_____________________________
// const pendingMigrations = sqlFiles.filter((file) => {
//   const version = file.split("_")[0];  //file.split("_")[0] extracts the version from the filename.

//   return !appliedMigrations.includes(version); //includes(version) checks whether that version already exists in the applied migrations array
//   //! means NOT. So we retain only versions that haven't been applied.
// });

// //Verify pending migrations___________________________
// console.log("Pending migrations:", pendingMigrations);

// //fs.readdir() gives us the filenames inside a directory.
// //fs.readFile() reads the actual contents of a particular file.

// //Read the pending SQL file____________________
// for (const file of pendingMigrations) {
//   const filePath = path.join(migrationsDirectory, file);
//   const sql = await fs.readFile(filePath, "utf-8");

//   const version = file.split("_")[0];
//   const name = file.replace(".sql", "");

//   const client = await pool.connect(); //pool.connect() to get a dedicated database connection.

//   try {
//     await client.query("BEGIN"); //BEGIN to start the transaction

//     await client.query(sql); //client.query(sql) to execute the migration.

//     await client.query(
//       `INSERT INTO schema_migrations (version, name)   
//        VALUES ($1, $2)`,   
//       [version, name] 
//     ); //A parameterized INSERT to record the migration.

//     await client.query("COMMIT");   //COMMIT to save both operations.

//     console.log(`Migration ${file} applied successfully.`);
//   } catch (error) {
//     await client.query("ROLLBACK");  // ROLLBACK to undo changes if something fails
//     console.error(`Migration ${file} failed:`, error);
//     throw error;
//   } finally {
//     client.release();  //client.release() in finally to return the connection to the pool.
//   }
// }

// //1. for...of
// // // It iterates through each item in an array. Since we currently have one pending migration, the loop runs once.

// // 2. path.join()
// // Combines the directory path and filename into a valid file path.

// // 3. fs.readFile()
// // Reads the SQL file as text. The "utf-8" encoding ensures we get a readable string instead of a Buffer.

// // 4. await
// // Waits for the file-reading operation to finish before moving to the next line.