import nextEnv from "@next/env";
import pg from "pg";

nextEnv.loadEnvConfig(process.cwd(), process.env.NODE_ENV !== "production");
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is missing. Copy .env.example to .env.local and enter your PostgreSQL credentials.");
  process.exit(1);
}
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 5000 });
try {
  await pool.query("SELECT 1");
  console.log("PostgreSQL connection successful.");
} catch (error) {
  const messages = {
    "28P01": "PostgreSQL rejected the credentials. Correct DATABASE_URL in .env.local and URL-encode special characters in the password.",
    "3D000": "The configured database does not exist. Create it in PostgreSQL, then run npm run db:push.",
    ECONNREFUSED: "PostgreSQL is unreachable. Check the server, host and port.",
  };
  console.error(messages[error.code] ?? "Database connection failed. Check PostgreSQL and DATABASE_URL configuration.");
  process.exitCode = 1;
} finally {
  await pool.end();
}
